import { NextRequest, NextResponse } from "next/server";
import { guard, body, failure } from "@/lib/api";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(r: NextRequest) {
  try {
    const { db } = await guard(r, true);
    const q = r.nextUrl.searchParams;
    const off = Number(q.get("offset") || 0);
    if (!Number.isInteger(off) || off < 0 || off > 10000)
      return failure("Página inválida.");
    const { data, error } = await db
      .from("prosul_members")
      .select("*")
      .order("created_at", { ascending: false })
      .order("id")
      .range(off, off + 49);
    if (error) throw Error("Consulta indisponível.");
    return NextResponse.json(
      { rows: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return failure("Acesso restrito.", 403);
  }
}
export async function POST(r: NextRequest) {
  try {
    const { db } = await guard(r, true);
    const p = z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "active", "suspended"]),
        role: z.enum(["member", "editor", "academy", "operations", "admin"]),
      })
      .parse(await body(r));
    const { error } = await db.rpc("prosul_member_update", {
      p_id: p.id,
      p_status: p.status,
      p_role: p.role,
    });
    return error
      ? failure("Alteração não permitida.", 403)
      : NextResponse.json({ ok: true });
  } catch {
    return failure("Pedido não permitido.", 403);
  }
}
