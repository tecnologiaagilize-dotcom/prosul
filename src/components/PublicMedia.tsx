"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client-api";
import type { Resource } from "@/lib/catalog";
import { PublicPhoto } from "./PublicPhoto";
import { VideoPlayer } from "./VideoPlayer";
export function PublicMedia({
  kind,
  preview = false,
}: {
  kind: "photo" | "video" | "about";
  preview?: boolean;
}) {
  const [rows, setRows] = useState<Resource[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [offset, setOffset] = useState(0),
    [hasMore, setHasMore] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api("/api/resources?kind=" + kind + "&offset=" + offset)
      .then((d) => {
        if (active) {
          setRows(preview ? d.rows.slice(0, 6) : d.rows);
          setHasMore(d.rows.length === 50);
        }
      })
      .catch(() => {
        if (active)
          setError(
            "Não foi possível carregar os conteúdos agora. Tente novamente mais tarde.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [kind, preview, offset]);
  const title =
    kind === "photo"
      ? "Galeria de fotos"
      : kind === "video"
        ? "Vídeos · Instagram e YouTube"
        : "Conheça a Frente Parlamentar Mista PROSUL";
  return (
    <section className={preview ? "home-media" : "wrap"}>
      <div className="section-heading">
        {preview ? <h2>{title}</h2> : <h1>{title}</h1>}
        {preview && (
          <Link href={kind === "photo" ? "/galeria" : "/conteudos/video"}>
            Ver todos →
          </Link>
        )}
      </div>
      {loading ? (
        <p role="status">Carregando…</p>
      ) : error ? (
        <p role="status" className="notice">
          {error}
        </p>
      ) : !rows.length ? (
        <p className="empty">
          {kind === "about"
            ? "As informações institucionais serão publicadas em breve."
            : "Novos registros serão publicados em breve."}
        </p>
      ) : (
        <div className={kind === "about" ? "about-sections" : "grid"}>
          {rows.map((r) =>
            kind === "photo" ? (
              <article className="card" key={r.id}>
                <PublicPhoto row={r} />
              </article>
            ) : kind === "video" ? (
              <article className="card" key={r.id}>
                <h3>
                  <Link href={"/conteudo/" + r.id}>{r.title}</Link>
                </h3>
                <p>{r.summary}</p>
                <VideoPlayer url={r.data.url || ""} title={r.title} />
              </article>
            ) : (
              <article className="card" key={r.id}>
                <h2>{r.title}</h2>
                <p>{r.summary}</p>
                <div className="prose">{r.body}</div>
              </article>
            ),
          )}
        </div>
      )}
      {!preview && (offset > 0 || hasMore) && (
        <div className="actions">
          <button
            disabled={loading || offset === 0}
            onClick={() => setOffset(Math.max(0, offset - 50))}
          >
            Anterior
          </button>
          <button
            disabled={loading || !hasMore}
            onClick={() => setOffset(offset + 50)}
          >
            Próxima
          </button>
        </div>
      )}
    </section>
  );
}
