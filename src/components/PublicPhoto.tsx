"use client";
import { useState } from "react";
import { safeUrl, type Resource } from "@/lib/catalog";
export function PublicPhoto({ row }: { row: Resource }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="public-photo">
      {safeUrl(row.data.url || "") && !failed ? (
        <a
          href={row.data.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={"Ampliar: " + row.title}
        >
          <img
            src={row.data.url}
            alt={row.data.alt || row.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
        </a>
      ) : (
        <p className="notice">Imagem indisponível.</p>
      )}
      <figcaption>
        <strong>{row.title}</strong>
        {row.summary && <p>{row.summary}</p>}
        {row.data.credit && <small>Foto: {row.data.credit}</small>}
        {row.data.album && <p className="muted">{row.data.album}</p>}
      </figcaption>
    </figure>
  );
}
