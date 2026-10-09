import { NextRequest, NextResponse } from "next/server";
import { guard, failure } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(r: NextRequest) {
  try {
    const { db } = await guard(r, true);
    const off = Number(r.nextUrl.searchParams.get("offset") || 0);
    if (!Number.isInteger(off) || off < 0 || off > 10000)
      return failure("Página inválida.");
    const { data, error } = await db
      .from("prosul_audit")
      .select("*")
      .order("id", { ascending: false })
      .range(off, off + 49);
    if (error) throw error;
    return NextResponse.json(
      { rows: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return failure("Acesso restrito.", 403);
  }
}
