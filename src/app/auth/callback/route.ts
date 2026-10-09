import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(r: NextRequest) {
  const code = r.nextUrl.searchParams.get("code");
  const next =
    r.nextUrl.searchParams.get("next") === "/nova-senha"
      ? "/nova-senha"
      : "/painel";
  if (code) {
    const db = await createClient();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, r.url));
  }
  return NextResponse.redirect(new URL("/entrar?erro=link", r.url));
}
