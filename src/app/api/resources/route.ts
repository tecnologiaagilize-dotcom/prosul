import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { guard, body, failure } from "@/lib/api";
import { resourceSchema, kindKeys } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export async function GET(r: NextRequest) {
  try {
    const q = r.nextUrl.searchParams;
    const kind = q.get("kind");
    if (kind && !kindKeys.includes(kind as never))
      return failure("Tipo inválido.");
    if (q.get("admin") === "true") {
      const { db } = await guard(r, true);
      const offset = Number(q.get("offset") || 0);
      if (!Number.isInteger(offset) || offset < 0 || offset > 10000)
        return failure("Página inválida.");
      let query = db
        .from("prosul_resources")
        .select("*")
        .order("updated_at", { ascending: false })
        .order("id")
        .range(offset, offset + 49);
      if (kind) query = query.eq("kind", kind);
      const { data, error } = await query;
      if (error) throw Error("Não foi possível consultar os registros.");
      return NextResponse.json(
        { rows: data },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const db = await createClient();
    const { data, error } = await db.rpc("prosul_feed", {
      p_kind: kind,
      p_id: q.get("id") || null,
      p_query: q.get("q") || "",
      p_offset: Number(q.get("offset") || 0),
    });
    if (error) throw Error("Conteúdo indisponível.");
    return NextResponse.json(
      { rows: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Falha de consulta.", 503);
  }
}
export async function POST(r: NextRequest) {
  try {
    const { db } = await guard(r, true);
    const result = resourceSchema.safeParse(await body(r));
    if (!result.success)
      return failure(result.error.issues.map((x) => x.message).join(" "), 422);
    const { data, error } = await db.rpc("prosul_save", { p: result.data });
    if (error)
      return failure(
        "Não foi possível salvar. Confira permissão, vínculos, versão e se a fonte já foi importada; recarregue antes de tentar novamente.",
        409,
      );
    return NextResponse.json({ id: data });
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Pedido inválido.", 403);
  }
}
export async function DELETE(r: NextRequest) {
  try {
    const { db } = await guard(r, true);
    const id = r.nextUrl.searchParams.get("id") || "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) return failure("Registro inválido.");
    const { data, error } = await db.rpc("prosul_delete", { p_id: id });
    if (error)
      return failure(
        /vinculados/.test(error.message)
          ? "Há registros vinculados a este item. Exclua ou arquive os vinculados primeiro."
          : /Permissão/.test(error.message)
            ? "Sem permissão para excluir este item."
            : "Não foi possível excluir. Se o item tiver inscrições ou progresso, use Arquivar.",
        409,
      );
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Pedido inválido.", 403);
  }
}
