"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client-api";
import { kinds, type Kind, type Resource } from "@/lib/catalog";
export function ContentList({ kind, title }: { kind: Kind; title?: string }) {
  const [rows, setRows] = useState<Resource[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [query, setQuery] = useState(""),
    [term, setTerm] = useState(""),
    [offset, setOffset] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api(
      "/api/resources?kind=" +
        kind +
        "&q=" +
        encodeURIComponent(term) +
        "&offset=" +
        offset,
    )
      .then((d) => {
        if (!cancelled) setRows(d.rows);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind, term, offset]);
  return (
    <section className="wrap">
      <div className="section-heading">
        <div>
          <span className="eyebrow" style={{ color: "#008339" }}>
            CONHECIMENTO E COOPERAÇÃO
          </span>
          <h1>{title || kinds[kind].label}</h1>
        </div>
      </div>
      <form
        className="actions"
        onSubmit={(e) => {
          e.preventDefault();
          setOffset(0);
          setTerm(query);
        }}
      >
        <input
          style={{ maxWidth: 500 }}
          aria-label="Pesquisar por título, tema ou código de país"
          placeholder="Pesquisar por título, tema ou país (BR, PE…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button>Pesquisar</button>
      </form>
      {loading ? (
        <p role="status">Carregando…</p>
      ) : error ? (
        <p role="alert" className="notice error">
          {error}
        </p>
      ) : rows.length ? (
        <div className="grid">
          {rows.map((r) => (
            <article className="card" key={r.id}>
              <span className="tag">
                {r.country || r.theme || kinds[kind].label}
              </span>
              <h3>
                <Link
                  href={
                    kind === "course" ? "/academy/" + r.id : "/conteudo/" + r.id
                  }
                >
                  {r.title}
                </Link>
              </h3>
              <p className="muted">{r.summary}</p>
              <Link
                href={
                  kind === "course" ? "/academy/" + r.id : "/conteudo/" + r.id
                }
              >
                Conhecer →
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty">Nenhum conteúdo publicado para esta consulta.</p>
      )}
      <div className="actions">
        <button
          className="secondary"
          disabled={offset === 0 || loading}
          onClick={() => setOffset(Math.max(0, offset - 50))}
        >
          Anterior
        </button>
        <button
          className="secondary"
          disabled={rows.length < 50 || loading}
          onClick={() => setOffset(offset + 50)}
        >
          Próxima página
        </button>
      </div>
    </section>
  );
}
