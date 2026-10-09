import { XMLParser } from "fast-xml-parser";
import { createHash } from "node:crypto";
// Adaptação do transporte limitado e da verificação de fonte do IBFC.
export type Source = "camara" | "senado" | "camara-news" | "senado-news";
const hosts = [
  "dadosabertos.camara.leg.br",
  "legis.senado.leg.br",
  "www.camara.leg.br",
  "www12.senado.leg.br",
];
export async function officialText(url: string, request: typeof fetch = fetch) {
  const u = new URL(url);
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    !hosts.includes(u.hostname)
  )
    throw Error("Fonte não autorizada.");
  const r = await request(url, {
    headers: { Accept: "application/json, application/rss+xml, text/xml" },
    redirect: "error",
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!r.ok) throw Error("Fonte oficial respondeu HTTP " + r.status);
  if (!r.body) throw Error("Fonte sem conteúdo.");
  const reader = r.body.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 8000000) {
      await reader.cancel();
      throw Error("Resposta excede 8 MB. Reduza o período.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
const clean = (s: unknown, max = 1000) =>
  String(s ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
const normalized = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export async function collect(
  source: Source,
  term: string,
  page = 1,
  request: typeof fetch = fetch,
) {
  const today = new Date().toISOString().slice(0, 10),
    start = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
  let url: string;
  if (source === "camara")
    url =
      "https://dadosabertos.camara.leg.br/api/v2/proposicoes?" +
      new URLSearchParams({
        keywords: term,
        dataApresentacaoInicio: start,
        dataApresentacaoFim: today,
        pagina: String(page),
        itens: "20",
        ordem: "DESC",
        ordenarPor: "id",
      });
  else if (source === "senado")
    url =
      "https://legis.senado.leg.br/dadosabertos/processo?" +
      new URLSearchParams({
        termo: term,
        dataInicioApresentacao: start,
        dataFimApresentacao: today,
      });
  else
    url =
      source === "camara-news"
        ? "https://www.camara.leg.br/noticias/rss/dinamico/RELACOES-EXTERIORES"
        : "https://www12.senado.leg.br/noticias/rss.xml";
  const raw = await officialText(url, request),
    hash = createHash("sha256").update(raw).digest("hex"),
    provider = source.startsWith("camara") ? "camara" : "senado";
  let rows: any[];
  let hasMore = false;
  if (source.endsWith("news")) {
    if (/<!DOCTYPE|<!ENTITY/i.test(raw)) throw Error("XML não permitido.");
    const p = new XMLParser({
      ignoreAttributes: true,
      processEntities: false,
    }).parse(raw);
    if (!p.rss?.channel) throw Error("Formato RSS incompatível.");
    const items = p.rss.channel.item ?? [];
    rows = (Array.isArray(items) ? items : [items])
      .filter((x) =>
        normalized(clean(x.title) + " " + clean(x.description)).includes(
          normalized(term),
        ),
      )
      .map((x) => ({
        title: clean(x.title, 250),
        summary: clean(x.description, 800),
        data: {
          provider,
          source: clean(x.link, 2000),
          external_id: clean(x.guid || x.link, 2000),
          stage: "Notícia; verificar situação na fonte",
          fetched_at: new Date().toISOString(),
          source_hash: hash,
        },
      }));
  } else {
    const p = JSON.parse(raw);
    const items = source === "camara" ? p.dados : p;
    if (!Array.isArray(items)) throw Error("Formato oficial incompatível.");
    hasMore =
      source === "camara"
        ? Array.isArray(p.links) && p.links.some((l: any) => l.rel === "next")
        : items.length > 50;
    rows = items.map((x: any) => ({
      title: clean(
        source === "camara"
          ? `${x.siglaTipo} ${x.numero}/${x.ano}`
          : x.identificacao,
        250,
      ),
      summary: clean(x.ementa, 1000),
      data: {
        provider,
        external_id: String(x.id ?? ""),
        source:
          source === "camara"
            ? `https://www.camara.leg.br/propostas-legislativas/${x.id}`
            : `https://legis.senado.leg.br/dadosabertos/processo?idProcesso=${x.id}`,
        stage: clean(x.situacaoAtual || "Consultar tramitação na fonte"),
        fetched_at: new Date().toISOString(),
        source_hash: hash,
      },
    }));
  }
  rows = rows.filter((r) => {
    try {
      const u = new URL(r.data.source);
      return (
        u.protocol === "https:" &&
        !u.username &&
        !u.password &&
        /(^|\.)(camara|senado)\.leg\.br$/.test(u.hostname)
      );
    } catch {
      return false;
    }
  });
  return {
    rows: rows.slice(0, 50),
    hasMore,
    source: url,
    notice: source.endsWith("news")
      ? "Consulta ao feed recente com filtro textual local. Não representa o acervo completo de notícias."
      : `Consulta de proposições apresentadas entre ${start} e ${today}. ${hasMore ? "Há mais resultados na fonte." : "Resultado limitado ao período e à pesquisa realizada."} Confirme relevância, país e situação antes de publicar.`,
  };
}
