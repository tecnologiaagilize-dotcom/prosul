"use client";
import { useState } from "react";
import { safeUrl } from "@/lib/catalog";

/** Só incorpora provedores conhecidos; outros links continuam disponíveis. */
export function VideoPlayer({ url, title }: { url: string; title: string }) {
  const [enabled, setEnabled] = useState(false);
  if (!safeUrl(url)) return null;
  const u = new URL(url);
  let embed = "";
  if (["youtube.com", "www.youtube.com", "youtu.be"].includes(u.hostname)) {
    const id =
      u.hostname === "youtu.be"
        ? u.pathname.slice(1)
        : u.searchParams.get("v") ||
          u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1];
    if (id && /^[\w-]{11}$/.test(id))
      embed = "https://www.youtube-nocookie.com/embed/" + id;
  }
  if (
    ["vimeo.com", "www.vimeo.com"].includes(u.hostname) &&
    /^\/\d+$/.test(u.pathname)
  )
    embed = "https://player.vimeo.com/video" + u.pathname;
  return (
    <div style={{ margin: "24px 0" }}>
      {embed ? (
        enabled ? (
          <iframe
            title={title}
            src={embed}
            style={{ width: "100%", aspectRatio: "16/9", border: 0 }}
            allow="fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="card">
            <p>
              Reproduza o vídeo aqui. Ao carregar, seu navegador acessará o
              provedor externo.
            </p>
            <button onClick={() => setEnabled(true)}>Carregar vídeo</button>
          </div>
        )
      ) : null}
      <a href={url} target="_blank" rel="noopener noreferrer">
        Abrir vídeo ou material na origem ↗
      </a>
    </div>
  );
}
