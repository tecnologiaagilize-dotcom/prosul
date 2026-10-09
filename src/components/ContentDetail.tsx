"use client";
import { PublicPhoto } from "./PublicPhoto";
import { VideoPlayer } from "./VideoPlayer";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { safeUrl, kinds, type Resource } from "@/lib/catalog";
export function ContentDetail({ id }: { id: string }) {
  const [row, setRow] = useState<Resource | null>(null),
    [message, setMessage] = useState("");
  useEffect(() => {
    api("/api/resources?id=" + id)
      .then((d) => {
        setRow(d.rows[0] || null);
        if (!d.rows.length)
          setMessage("Conteúdo não publicado ou indisponível para seu acesso.");
      })
      .catch((e) => setMessage(e.message));
  }, [id]);
  async function register(cancel = false) {
    try {
      await api("/api/learning", {
        action: cancel ? "cancel" : "register",
        id,
      });
      setMessage(cancel ? "Inscrição cancelada." : "Inscrição registrada.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <article className="wrap">
      {row ? (
        <>
          <span className="tag">
            {kinds[row.kind].label} {row.country}
          </span>
          <h1>{row.title}</h1>
          <p className="muted">{row.summary}</p>
          <div className="prose">{row.body}</div>
          {row.kind === "photo" && <PublicPhoto key={row.id} row={row} />}
          {row.kind === "video" && (
            <VideoPlayer
              key={row.id}
              url={row.data.url || ""}
              cover={row.data.cover}
              title={row.title}
            />
          )}
          <div className="card" style={{ marginTop: 30 }}>
            {Object.entries(row.data)
              .filter(
                ([key]) =>
                  ![
                    "external_id",
                    "fetched_at",
                    "fx",
                    "fy",
                    "zoom",
                    "cover",
                    "flag",
                  ].includes(key),
              )
              .map(
                ([key, value]) =>
                  value && (
                    <p key={key}>
                      <b>
                        {(
                          kinds[row.kind].fields as {
                            key: string;
                            label: string;
                          }[]
                        ).find((x) => x.key === key)?.label || key}
                        :{" "}
                      </b>
                      {safeUrl(value) ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Abrir fonte ↗
                        </a>
                      ) : (
                        value
                      )}
                    </p>
                  ),
              )}
          </div>
          {row.kind === "event" && (
            <div className="actions">
              <button onClick={() => register()}>Inscrever-me</button>
              <button className="secondary" onClick={() => register(true)}>
                Cancelar inscrição
              </button>
            </div>
          )}
          <p className="muted">
            Atualização: {new Date(row.updated_at).toLocaleDateString("pt-BR")}
          </p>
        </>
      ) : (
        !message && <p>Carregando…</p>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </article>
  );
}
