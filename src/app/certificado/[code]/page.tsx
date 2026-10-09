import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!z.string().uuid().safeParse(code).success)
    return <section className="wrap">Código inválido.</section>;
  try {
    const db = await createClient();
    const { data, error } = await db.rpc("prosul_certificate_verify", {
      p_code: code,
    });
    if (error || !data?.length)
      return <section className="wrap">Certificado não localizado.</section>;
    const c = data[0];
    return (
      <section className="wrap">
        <article
          className="card"
          style={{
            padding: 60,
            borderTop: "6px solid #002776",
            textAlign: "center",
          }}
        >
          <small>PROSUL ACADEMY</small>
          <h1>Certificado de conclusão</h1>
          <p>Certificamos a conclusão, por</p>
          <h2>{c.name}</h2>
          <p>do curso</p>
          <h2>{c.title}</h2>
          <p>
            Carga horária: {c.hours} horas · Emissão:{" "}
            {new Date(c.issued_at).toLocaleDateString("pt-BR")}
          </p>
          <small>Código de verificação: {code}</small>
          <p>
            Certificado de curso livre. Não confere título acadêmico ou função
            institucional.
          </p>
        </article>
      </section>
    );
  } catch {
    return (
      <section className="wrap">
        Verificação temporariamente indisponível.
      </section>
    );
  }
}
