import { test } from "node:test";
import assert from "node:assert/strict";
import { resourceSchema, safeUrl, kindKeys } from "../src/lib/catalog";
import { collect, officialText } from "../src/lib/observatory";
test("URLs executáveis, credenciais e HTTP são recusados", () => {
  for (const u of [
    "javascript:alert(1)",
    "http://example.org",
    "https://a:b@example.org",
  ])
    assert.equal(safeUrl(u), false);
  assert.ok(safeUrl("https://example.org"));
});
test("recorte exclui eleições e células", () => {
  for (const k of ["candidate", "cell", "bible", "sermon", "vote"])
    assert.ok(!kindKeys.includes(k as never));
});
test("lição exige módulo e evento exige fuso válido", () => {
  assert.equal(
    resourceSchema.safeParse({ kind: "lesson", title: "Lição" }).success,
    false,
  );
  assert.equal(
    resourceSchema.safeParse({
      kind: "event",
      title: "Evento",
      data: { starts: "2026-10-01", timezone: "XYZ" },
    }).success,
    false,
  );
});
test("incentivo exige situação e fonte; rejeita números negativos", () => {
  assert.equal(
    resourceSchema.safeParse({
      kind: "opportunity",
      title: "Crédito",
      data: { stage: "disponivel", source: "https://example.org" },
    }).success,
    true,
  );
  assert.equal(
    resourceSchema.safeParse({
      kind: "course",
      title: "Curso",
      data: { hours: "-1" },
    }).success,
    false,
  );
});
test("transporte recusa hosts externos antes de acesso à rede", async () => {
  await assert.rejects(() => officialText("https://example.com"), /autorizada/);
});
test("coleta temática da Câmara não usa vínculo parlamentar", async () => {
  let target = "";
  const result = await collect("camara", "Peru", 1, async (u: any) => {
    target = String(u);
    return new Response(
      JSON.stringify({
        dados: [
          {
            id: 1,
            siglaTipo: "PL",
            numero: 2,
            ano: 2026,
            ementa: "Cooperação",
          },
        ],
        links: [],
      }),
    );
  });
  assert.ok(target.includes("keywords=Peru"));
  assert.ok(!target.includes("Deputado"));
  assert.equal(result.rows[0].data.external_id, "1");
});
test("RSS filtra tema e recusa XML com entidades", async () => {
  await assert.rejects(
    () =>
      collect(
        "senado-news",
        "Peru",
        1,
        async () => new Response("<!DOCTYPE rss><rss/>"),
      ),
    /XML/,
  );
  const r = await collect(
    "senado-news",
    "Peru",
    1,
    async () =>
      new Response(
        "<rss><channel><item><title>Acordo com Peru</title><link>https://www12.senado.leg.br/noticias/a</link></item><item><title>Outro assunto</title><link>https://www12.senado.leg.br/noticias/b</link></item></channel></rss>",
      ),
  );
  assert.equal(r.rows.length, 1);
});
