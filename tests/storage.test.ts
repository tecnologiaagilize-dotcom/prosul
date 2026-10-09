import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { titleFromFile, checkImage } from "../src/lib/upload";
test("bucket de fotos: só admin/editor envia; migração reexecutável", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.uid',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql stable as $$select jsonb_build_object('aal',current_setting('request.aal',true))$$;grant usage on schema public,auth to anon,authenticated;grant execute on all functions in schema auth to anon,authenticated;
      create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated;grant select,insert,update,delete on storage.objects to authenticated;`,
    );
    for (const f of [
      "001_prosul",
      "002_public_media",
      "003_storage_fotos",
      "003_storage_fotos",
    ])
      await db.exec(readFileSync(`supabase/migrations/${f}.sql`, "utf8"));
    const b = (await db.query<any>("select * from storage.buckets")).rows[0];
    assert.equal(b.public, true);
    const admin = "00000000-0000-4000-8000-000000000001",
      member = "00000000-0000-4000-8000-000000000002";
    for (const id of [admin, member])
      await db.query("insert into auth.users values($1,$2,$3)", [
        id,
        id + "@x.test",
        {},
      ]);
    await db.exec(
      `update prosul_members set role='admin',status='active' where id='${admin}';update prosul_members set status='active' where id='${member}';set role authenticated;set request.aal='aal2';`,
    );
    await db.exec(`set request.uid='${admin}'`);
    await db.exec(
      `insert into storage.objects(bucket_id,name) values('prosul-fotos','galeria/a.jpg')`,
    );
    await db.exec(`set request.uid='${member}'`);
    await assert.rejects(
      db.exec(
        `insert into storage.objects(bucket_id,name) values('prosul-fotos','galeria/b.jpg')`,
      ),
    );
  } finally {
    await db.close();
  }
});
test("validação de arquivo e título", () => {
  assert.equal(
    titleFromFile("reuniao_plenaria-2026.jpg"),
    "reuniao plenaria 2026",
  );
  assert.equal(titleFromFile("a.png"), "Foto a");
  assert.equal(
    checkImage({ type: "application/pdf", size: 10 } as File),
    "Use JPG, PNG ou WebP.",
  );
  assert.equal(checkImage({ type: "image/jpeg", size: 10 } as File), null);
});
