"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client-api";
import { checkImage, titleFromFile, uploadImage } from "@/lib/upload";

type Item = {
  key: string;
  file: File;
  preview: string;
  title: string;
  state: "pronto" | "enviando" | "ok" | "erro";
  error?: string;
};

/** Aba "Enviar imagens": envia várias fotos e já cria os registros da galeria. */
export function PhotoUploader({ onDone }: { onDone: () => void }) {
  const [items, setItems] = useState<Item[]>([]),
    [album, setAlbum] = useState(""),
    [credit, setCredit] = useState(""),
    [alt, setAlt] = useState(""),
    [publish, setPublish] = useState(true),
    [busy, setBusy] = useState(false),
    [drag, setDrag] = useState(false),
    [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => items.forEach((i) => URL.revokeObjectURL(i.preview)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function add(list: FileList | null) {
    if (!list) return;
    const next: Item[] = [];
    const rejected: string[] = [];
    Array.from(list).forEach((file) => {
      const problem = checkImage(file);
      if (problem) rejected.push(`${file.name}: ${problem}`);
      else
        next.push({
          key: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          title: titleFromFile(file.name),
          state: "pronto",
        });
    });
    setItems((cur) => [...cur, ...next]);
    setMessage(rejected.length ? "Ignorados — " + rejected.join("; ") : "");
  }

  const patch = (key: string, p: Partial<Item>) =>
    setItems((cur) => cur.map((i) => (i.key === key ? { ...i, ...p } : i)));

  function remove(key: string) {
    setItems((cur) => {
      const it = cur.find((i) => i.key === key);
      if (it) URL.revokeObjectURL(it.preview);
      return cur.filter((i) => i.key !== key);
    });
  }

  async function send() {
    setBusy(true);
    setMessage("");
    let ok = 0;
    for (const it of items.filter((i) => i.state !== "ok")) {
      patch(it.key, { state: "enviando", error: undefined });
      try {
        const url = await uploadImage(it.file);
        const title =
          it.title.trim().length >= 3
            ? it.title.trim()
            : titleFromFile(it.file.name);
        await api("/api/resources", {
          kind: "photo",
          title,
          summary: "",
          body: "",
          country: "",
          theme: "",
          parent_id: null,
          position: 0,
          status: publish ? "published" : "draft",
          data: {
            url,
            alt: (alt.trim() || album.trim() || title).slice(0, 10000),
            ...(credit.trim() && { credit: credit.trim() }),
            ...(album.trim() && { album: album.trim() }),
          },
        });
        patch(it.key, { state: "ok" });
        ok++;
      } catch (e) {
        patch(it.key, { state: "erro", error: (e as Error).message });
      }
    }
    setBusy(false);
    if (ok) {
      setMessage(
        `${ok} foto(s) enviada(s)${publish ? " e publicada(s)" : " como rascunho"}.`,
      );
      onDone();
    }
  }

  const pending = items.filter((i) => i.state !== "ok").length;

  return (
    <div className="card form uploader">
      <h2>Enviar imagens</h2>
      <p className="muted">
        JPG, PNG ou WebP. Fotos grandes são otimizadas automaticamente (até
        2000px). Cada imagem vira um item da galeria.
      </p>

      <div
        className={"dropzone" + (drag ? " over" : "")}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          add(e.dataTransfer.files);
        }}
        onClick={() => input.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && input.current?.click()
        }
      >
        <strong>Arraste as fotos aqui</strong>
        <span>ou clique para selecionar do computador / celular</span>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div className="split">
        <div>
          <label htmlFor="up-album">Álbum / evento (para todas)</label>
          <input
            id="up-album"
            value={album}
            maxLength={200}
            onChange={(e) => setAlbum(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="up-credit">Crédito da fotografia</label>
          <input
            id="up-credit"
            value={credit}
            maxLength={200}
            onChange={(e) => setCredit(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="up-alt">
          Descrição para acessibilidade (se vazio, usa o álbum ou o título)
        </label>
        <input
          id="up-alt"
          value={alt}
          maxLength={500}
          onChange={(e) => setAlt(e.target.value)}
        />
      </div>
      <label className="check">
        <input
          type="checkbox"
          checked={publish}
          onChange={(e) => setPublish(e.target.checked)}
        />{" "}
        Publicar imediatamente (aparece na página inicial e na galeria)
      </label>

      {items.length > 0 && (
        <ul className="upload-list">
          {items.map((it) => (
            <li key={it.key} className={"upload-item " + it.state}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.preview} alt="" />
              <input
                aria-label="Título da foto"
                value={it.title}
                maxLength={250}
                disabled={it.state === "ok" || busy}
                onChange={(e) => patch(it.key, { title: e.target.value })}
              />
              <small>
                {it.state === "pronto" &&
                  (it.file.size / 1024 / 1024).toFixed(1) + " MB"}
                {it.state === "enviando" && "Enviando…"}
                {it.state === "ok" && "✓ Enviada"}
                {it.state === "erro" && "Erro: " + it.error}
              </small>
              {it.state !== "ok" && !busy && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => remove(it.key)}
                  aria-label="Remover da lista"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}

      <div className="actions">
        <button type="button" disabled={busy || !pending} onClick={send}>
          {busy ? "Enviando…" : `Enviar ${pending || ""} foto(s)`}
        </button>
        {items.some((i) => i.state === "ok") && !busy && (
          <button
            type="button"
            className="secondary"
            onClick={() => {
              items.forEach((i) => URL.revokeObjectURL(i.preview));
              setItems([]);
              setMessage("");
            }}
          >
            Limpar lista
          </button>
        )}
      </div>
    </div>
  );
}
