import { NextRequest, NextResponse } from "next/server";
import { guard, body, failure } from "@/lib/api";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(r: NextRequest) {
  try {
    const { db, user } = await guard(r);
    const lesson = r.nextUrl.searchParams.get("lesson");
    if (lesson) {
      const { data, error } = await db.rpc("prosul_questions", {
        p_lesson: z.string().uuid().parse(lesson),
      });
      if (error) throw error;
      return NextResponse.json(
        { questions: data },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const results = await Promise.all(
      ["enrollments", "progress", "notes", "certificates", "registrations"].map(
        (t) =>
          db
            .from("prosul_" + t)
            .select("*")
            .eq("user_id", user!.id)
            .limit(1000),
      ),
    );
    if (results.some((x) => x.error)) throw Error();
    return NextResponse.json(
      Object.fromEntries(
        [
          "enrollments",
          "progress",
          "notes",
          "certificates",
          "registrations",
        ].map((n, i) => [n, results[i].data]),
      ),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return failure("Dados de aprendizagem indisponíveis.", 403);
  }
}
export async function POST(r: NextRequest) {
  try {
    const c = await guard(r);
    if (c.profile?.status !== "active")
      return failure("Cadastro aguardando aprovação.", 403);
    const p = z
      .object({
        action: z.enum([
          "enroll",
          "complete",
          "certificate",
          "note",
          "delete-note",
          "register",
          "cancel",
          "question",
        ]),
        id: z.string().uuid(),
        text: z.string().max(10000).optional(),
        answers: z.record(z.number().int().min(0).max(5)).optional(),
        options: z.array(z.string().min(1).max(500)).min(2).max(6).optional(),
        answer: z.number().int().min(0).max(5).optional(),
      })
      .parse(await body(r));
    let result;
    if (p.action === "note")
      result = await c.db
        .from("prosul_notes")
        .insert({ user_id: c.user!.id, resource_id: p.id, body: p.text });
    else if (p.action === "delete-note")
      result = await c.db
        .from("prosul_notes")
        .delete()
        .eq("id", p.id)
        .eq("user_id", c.user!.id);
    else if (p.action === "question") {
      await guard(r, true);
      if (
        !p.options ||
        p.answer === undefined ||
        p.answer >= p.options.length ||
        !p.text?.trim()
      )
        return failure("Questão inválida.");
      result = await c.db.rpc("prosul_question_save", {
        p_lesson: p.id,
        p_prompt: p.text,
        p_options: p.options,
        p_answer: p.answer,
      });
    } else {
      const map: Record<string, [string, Record<string, unknown>]> = {
        enroll: ["prosul_enroll", { p_course: p.id }],
        complete: [
          "prosul_complete",
          { p_lesson: p.id, p_answers: p.answers ?? {} },
        ],
        certificate: ["prosul_certificate", { p_course: p.id }],
        register: ["prosul_event_register", { p_event: p.id }],
        cancel: ["prosul_event_register", { p_event: p.id, p_cancel: true }],
      };
      const [fn, args] = map[p.action];
      result = await c.db.rpc(fn, args);
    }
    if (result.error)
      return failure(
        "Operação recusada. Verifique matrícula, publicação e requisitos de conclusão.",
        409,
      );
    return NextResponse.json({ result: result.data, ok: true });
  } catch {
    return failure("Pedido inválido ou sem acesso.", 403);
  }
}
