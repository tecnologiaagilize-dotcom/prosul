"use client";
import { useState } from "react";
import { safeUrl } from "@/lib/catalog";
import { mediaEmbed } from "@/lib/media";
export function VideoPlayer({
  url,
  title,
  cover,
}: {
  url: string;
  title: string;
  cover?: string;
}) {
  const [enabled, setEnabled] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  if (!safeUrl(url)) return null;
  const embed = mediaEmbed(url);
  // Capa: a informada no admin tem prioridade; senão a automática do YouTube.
  const coverSrc =
    !coverFailed && cover && safeUrl(cover) ? cover : embed?.thumb;
  // Instagram sem capa manual: exibe a publicação incorporada (já mostra a capa).
  const showFrame = embed && (enabled || (embed.instagram && !coverSrc));
  return (
    <div className="video-block">
      {embed &&
        (showFrame ? (
          <iframe
            className="video-frame"
            title={title}
            src={embed.src}
            loading="lazy"
            style={{
              height: embed.instagram ? 620 : undefined,
              aspectRatio: embed.instagram ? undefined : "16/9",
            }}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : coverSrc ? (
          <button
            type="button"
            className={"video-cover" + (embed.instagram ? " instagram" : "")}
            onClick={() => setEnabled(true)}
            aria-label={"Reproduzir: " + title}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverSrc}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setCoverFailed(true)}
            />
            <span className="play">
              <span aria-hidden="true">▶</span>
            </span>
            <span className="badge">
              {embed.instagram
                ? "Instagram"
                : embed.src.includes("vimeo")
                  ? "Vimeo"
                  : "YouTube"}
            </span>
          </button>
        ) : (
          <div className="card">
            <p>Vídeo</p>
            <button onClick={() => setEnabled(true)}>Carregar vídeo</button>
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
