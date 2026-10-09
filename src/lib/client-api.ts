export async function api<T = any>(url: string, payload?: unknown): Promise<T> {
  const r = await fetch(
    url,
    payload === undefined
      ? { cache: "no-store" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
  );
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Não foi possível concluir.");
  return d;
}
