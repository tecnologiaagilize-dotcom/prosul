import { NextResponse } from "next/server";
import { identity } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const { db, user, profile } = await identity();
    if (!user) return NextResponse.json({ profile: null }, { status: 401 });
    const { data: staff } = await db.rpc("prosul_staff");
    return NextResponse.json(
      { profile, staff: !!staff },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Acesso indisponível." },
      { status: 503 },
    );
  }
}
