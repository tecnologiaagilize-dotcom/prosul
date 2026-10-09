import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
test("migração, isolamento, MFA, publicação e formação", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.uid',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql stable as $$select jsonb_build_object('aal',current_setting('request.aal',true))$$;grant usage on schema public,auth to anon,authenticated;grant execute on all functions in schema auth to anon,authenticated;`,
    );
    await db.exec(readFileSync("supabase/migrations/001_prosul.sql", "utf8"));
    const admin = "00000000-0000-4000-8000-000000000001",
      member = "00000000-0000-4000-8000-000000000002",
      other = "00000000-0000-4000-8000-000000000003";
    for (const id of [admin, member, other])
      await db.query("insert into auth.users values($1,$2,$3)", [
        id,
        id + "@example.test",
        { name: "Teste", role: "admin" },
      ]);
    assert.equal(
      (
        await db.query<any>("select role from prosul_members where id=$1", [
          member,
        ])
      ).rows[0].role,
      "member",
    );
    await db.exec(
      `update prosul_members set role='admin',status='active' where id='${admin}';update prosul_members set status='active' where id='${member}';set role authenticated;set request.uid='${admin}';set request.aal='aal1';`,
    );
    assert.equal(
      (await db.query<any>("select prosul_staff() as ok")).rows[0].ok,
      false,
    );
    await assert.rejects(() =>
      db.query("select prosul_save($1)", [{ kind: "news", title: "Rascunho" }]),
    );
    await db.exec("set request.aal='aal2'");
    const save = async (p: any) =>
      (await db.query<any>("select prosul_save($1) as id", [p])).rows[0].id;
    const id = await save({
      kind: "news",
      title: "Texto público",
      status: "published",
    });
    await save({
      id,
      version: 1,
      kind: "news",
      title: "Rascunho secreto",
      status: "draft",
    });
    await assert.rejects(() =>
      save({ id, kind: "news", title: "Sem versão", status: "draft" }),
    );
    await assert.rejects(() =>
      save({
        id,
        version: 1,
        kind: "news",
        title: "Versão antiga",
        status: "draft",
      }),
    );
    const imported = {
      kind: "legislative",
      title: "Projeto de teste",
      status: "review",
      data: {
        source: "https://www.camara.leg.br/propostas-legislativas/123",
        provider: "camara",
      },
    };
    await save(imported);
    await assert.rejects(() => save(imported));
    const asset = await save({
      kind: "asset",
      title: "Bem privado",
      status: "published",
    });
    await db.exec("set role anon");
    const feed = await db.query<any>("select * from prosul_feed()");
    assert.equal(feed.rows.length, 1);
    assert.equal(
      (Object.values(feed.rows[0])[0] as any).title,
      "Texto público",
    );
    await assert.rejects(() => db.query("select * from prosul_resources"));
    await db.exec(
      `set role authenticated;set request.uid='${member}';set request.aal='aal1'`,
    );
    assert.equal(
      (await db.query("select * from prosul_resources")).rows.length,
      0,
    );
    await assert.rejects(() => save({ kind: "news", title: "Invasão" }));
    await db.query("insert into prosul_notes(user_id,body) values($1,$2)", [
      member,
      "Nota privada",
    ]);
    await db.exec(`set request.uid='${other}'`);
    assert.equal((await db.query("select * from prosul_notes")).rows.length, 0);
    await assert.rejects(() =>
      db.query("insert into prosul_notes(user_id,body) values($1,$2)", [
        member,
        "Invasão",
      ]),
    );
    await db.exec(`set request.uid='${admin}';set request.aal='aal2'`);
    const course = await save({
        kind: "course",
        title: "Curso teste",
        status: "published",
        data: { hours: "2" },
      }),
      module = await save({
        kind: "module",
        title: "Módulo teste",
        parent_id: course,
        status: "published",
      }),
      lesson = await save({
        kind: "lesson",
        title: "Lição teste",
        parent_id: module,
        status: "draft",
      });
    await db.query("select prosul_question_save($1,$2,$3,$4)", [
      lesson,
      "Qual opção?",
      ["A", "B"],
      1,
    ]);
    await save({
      id: lesson,
      version: 1,
      kind: "lesson",
      title: "Lição teste",
      parent_id: module,
      status: "published",
    });
    await db.exec(`set request.uid='${member}';set request.aal='aal1'`);
    await assert.rejects(() =>
      db.query("select prosul_complete($1)", [lesson]),
    );
    await db.query("select prosul_enroll($1)", [course]);
    const qs = (
      await db.query<any>("select * from prosul_questions($1)", [lesson])
    ).rows;
    assert.equal(qs[0].answer, undefined);
    await assert.rejects(() => db.query("select * from prosul_questions"));
    assert.equal(
      (
        await db.query<any>("select prosul_complete($1,$2) as score", [
          lesson,
          { [qs[0].id]: 0 },
        ])
      ).rows[0].score,
      0,
    );
    await assert.rejects(() =>
      db.query("select prosul_certificate($1)", [course]),
    );
    assert.equal(
      (
        await db.query<any>("select prosul_complete($1,$2) as score", [
          lesson,
          { [qs[0].id]: 1 },
        ])
      ).rows[0].score,
      100,
    );
    const cert = (
      await db.query<any>("select prosul_certificate($1) as code", [course])
    ).rows[0].code;
    assert.ok(cert);
    await db.exec("set role anon");
    assert.equal(
      (await db.query("select * from prosul_certificate_verify($1)", [cert]))
        .rows.length,
      1,
    );
  } finally {
    await db.close();
  }
});
