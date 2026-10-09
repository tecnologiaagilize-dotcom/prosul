"use client";
import { useState } from "react";
import { safeUrl } from "@/lib/catalog";
import { mediaEmbed } from "@/lib/media";
export function VideoPlayer({ url, title }: { url: string; title: string }) {
  const [enabled, setEnabled] = useState(false);
  if (!safeUrl(url)) return null;
  const embed = mediaEmbed(url);
  return (
    <div className="video-block">
      {embed &&
        (enabled ? (
          <iframe
            title={title}
            src={embed.src}
            loading="lazy"
            style={{
              width: "100%",
              height: embed.instagram ? 560 : undefined,
              aspectRatio: embed.instagram ? undefined : "16/9",
              border: 0,
            }}
            allow="fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="card">
            <p>{embed.instagram ? "Publicação do Instagram" : "Vídeo"}</p>
            <p className="muted">
              Ao carregar, seu navegador acessará o provedor externo.
            </p>
            <button onClick={() => setEnabled(true)}>
              Carregar {embed.instagram ? "publicação" : "vídeo"}
            </button>
          </div>
        ))}
      {embed?.instagram && (
        <p className="muted">
          Se a publicação não carregar, abra no Instagram. O conteúdo precisa
          ser público e permitir incorporação.
        </p>
      )}
      <a href={url} target="_blank" rel="noopener noreferrer">
        Abrir{" "}
        {embed?.instagram ? "no Instagram" : "vídeo ou material na origem"} ↗
      </a>
    </div>
  );
}
