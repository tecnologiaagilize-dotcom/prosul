import { NextRequest, NextResponse } from "next/server";
import { guard, body, failure } from "@/lib/api";
import { z } from "zod";
import { collect } from "@/lib/observatory";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export async function POST(r: NextRequest) {
  try {
    const { db } = await guard(r, true);
    const { data: allowed } = await db.rpc("prosul_can", { k: "legislative" });
    if (!allowed) return failure("Permissão insuficiente.", 403);
    const p = z
      .object({
        source: z.enum(["camara", "senado", "camara-news", "senado-news"]),
        term: z.string().trim().min(3).max(100),
        page: z.number().int().min(1).max(100).default(1),
      })
      .parse(await body(r));
    return NextResponse.json(await collect(p.source, p.term, p.page), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return failure(
      e instanceof Error ? e.message : "Coleta indisponível.",
      502,
    );
  }
}
