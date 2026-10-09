import { NextRequest, NextResponse } from "next/server";
import { createClient } from "./supabase/server";
export function failure(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
export async function identity() {
  const db = await createClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) return { db, user: null, profile: null };
  const { data: profile } = await db
    .from("prosul_members")
    .select("*")
    .eq("id", user.id)
    .single();
  return { db, user, profile };
}
export async function guard(req?: NextRequest, staff = false) {
  if (
    req &&
    req.method !== "GET" &&
    req.headers.get("origin") !== req.nextUrl.origin
  )
    throw new Error("Origem inválida.");
  const c = await identity();
  if (!c.user || !c.user.email_confirmed_at)
    throw new Error("Entre com e-mail confirmado.");
  if (staff) {
    const { data, error } = await c.db.rpc("prosul_staff");
    if (error || !data)
      throw new Error("Acesso administrativo com MFA necessário.");
  }
  return c;
}
export async function body(req: NextRequest) {
  const text = await req.text();
  if (text.length > 150000) throw Error("Pedido excede o limite.");
  return JSON.parse(text);
}
