"use client";
import { supabase } from "@/lib/supabase/client";

export const PHOTO_BUCKET = "prosul-fotos";
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT = 25 * 1024 * 1024; // arquivo original até 25 MB
const MAX_SIDE = 2000; // maior lado após otimização

/** Reduz fotos grandes para no máximo 2000px (JPEG 85%). PNG pequeno é mantido. */
async function optimize(file: File): Promise<Blob> {
  if (file.size < 1.5 * 1024 * 1024 && file.type !== "image/jpeg") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const out = await new Promise<Blob | null>((ok) =>
      canvas.toBlob(ok, "image/jpeg", 0.85),
    );
    return out && out.size < file.size ? out : file;
  } catch {
    return file;
  }
}

export function checkImage(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return "Use JPG, PNG ou WebP.";
  if (file.size > MAX_INPUT) return "Arquivo acima de 25 MB.";
  return null;
}

/** Envia a imagem ao Supabase Storage e devolve o link público HTTPS. */
export async function uploadImage(file: File, folder = "galeria") {
  const problem = checkImage(file);
  if (problem) throw Error(problem);
  const blob = await optimize(file);
  const type = blob.type || file.type;
  const ext =
    type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const d = new Date();
  const path = `${folder}/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, blob, { contentType: type, cacheControl: "31536000" });
  if (error)
    throw Error(
      /row-level|policy|unauthorized|403/i.test(error.message)
        ? "Sem permissão para enviar. Entre como administrador ou editor."
        : /bucket/i.test(error.message)
          ? "Armazenamento não configurado. Rode 003_storage_fotos.sql no Supabase."
          : "Falha no envio: " + error.message,
    );
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Título legível a partir do nome do arquivo. */
export function titleFromFile(name: string) {
  const t = name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.length >= 3 ? t.slice(0, 250) : "Foto " + (t || "PROSUL");
}

/** Remove do Storage um arquivo do bucket da PROSUL (ignora links externos). */
export async function removeUploaded(url?: string) {
  const mark = `/storage/v1/object/public/${PHOTO_BUCKET}/`;
  if (!url || !url.includes(mark)) return;
  const path = decodeURIComponent(url.split(mark)[1].split("?")[0]);
  await supabase.storage.from(PHOTO_BUCKET).remove([path]);
}
