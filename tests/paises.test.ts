import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { resourceSchema } from "../src/lib/catalog";
import { framing } from "../src/lib/framing";
import { atlasId } from "../src/lib/countries";

test("004: país participante, exclusão com auditoria e permissão", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.uid',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql stable as $$select jsonb_build_object('aal',current_setting('request.aal',true))$$;grant usage on schema public,auth to anon,authenticated;grant execute on all functions in schema auth to anon,authenticated;
      create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);`,
    );
    for (const f of [
      "001_prosul",
      "002_public_media",
      "003_storage_fotos",
      "004_excluir_paises",
      "004_excluir_paises",
    ])
      await db.exec(readFileSync(`supabase/migrations/${f}.sql`, "utf8"));
    const admin = "00000000-0000-4000-8000-000000000001",
      member = "00000000-0000-4000-8000-000000000002";
    for (const id of [admin, member])
      await db.query("insert into auth.users values($1,$2,$3)", [
        id,
        id + "@x.test",
        {},
      ]);
    await db.exec(
      `update prosul_members set role='admin',status='active' where id='${admin}';update prosul_members set status='active' where id='${member}';`,
    );
    // seed opcional
    await db.exec(
      readFileSync("supabase/admin/paises_america_do_sul.sql", "utf8"),
    );
    await db.exec(
      readFileSync("supabase/admin/paises_america_do_sul.sql", "utf8"),
    );
    await db.exec(
      `set role authenticated;set request.aal='aal1';set request.uid='${admin}'`,
    );
    // sem MFA, admin é staff
    assert.equal(
      (await db.query<any>("select prosul_staff() ok")).rows[0].ok,
      true,
    );
    const feed = (await db.query<any>("select prosul_feed('country') r")).rows;
    assert.equal(feed.length, 12);
    const id = (
      await db.query<any>("select prosul_save($1::jsonb) id", [
        {
          kind: "photo",
          title: "Foto teste",
          status: "published",
          data: {
            url: "https://x.test/a.jpg",
            alt: "a",
            fx: "20",
            fy: "80",
            zoom: "1.5",
          },
        },
      ])
    ).rows[0].id;
    await db.exec(`set request.uid='${member}'`);
    await assert.rejects(db.query("select prosul_delete($1)", [id]));
    await db.exec(`set request.uid='${admin}'`);
    await db.query("select prosul_delete($1)", [id]);
    assert.equal(
      (await db.query<any>("select prosul_feed('photo') r")).rows.length,
      0,
    );
    assert.equal(
      (
        await db.query<any>(
          "select count(*)::int n from prosul_audit where action='resource.deleted'",
        )
      ).rows[0].n,
      1,
    );
  } finally {
    await db.close();
  }
});

test("validação de país, enquadramento e mapa", () => {
  assert.equal(
    resourceSchema.safeParse({
      kind: "country",
      title: "Brasil",
      data: { code: "BR", representative: "Fulano" },
    }).success,
    true,
  );
  assert.equal(
    resourceSchema.safeParse({
      kind: "country",
      title: "Xis",
      data: { code: "XX" },
    }).success,
    false,
  );
  assert.deepEqual(framing({ fx: "150", fy: "-3", zoom: "9" }), {
    fx: 100,
    fy: 0,
    zoom: 3,
  });
  assert.deepEqual(framing({}), { fx: 50, fy: 50, zoom: 1 });
  assert.equal(atlasId("BR"), "076");
});
