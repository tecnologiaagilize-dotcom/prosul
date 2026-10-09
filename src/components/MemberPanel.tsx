"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client-api";
import { supabase } from "@/lib/supabase/client";
export function MemberPanel() {
  const [me, setMe] = useState<any>(null),
    [learning, setLearning] = useState<any>(null),
    [error, setError] = useState("");
  useEffect(() => {
    api("/api/me")
      .then((d) => {
        setMe(d);
        if (d.profile?.status === "active")
          api("/api/learning")
            .then(setLearning)
            .catch((e) => setError(e.message));
      })
      .catch(() => setError("Entre com sua conta para continuar."));
  }, []);
  return (
    <section className="wrap">
      <h1>Minha área PROSUL</h1>
      {error && (
        <p className="notice error">
          {error} <Link href="/entrar">Entrar</Link>
        </p>
      )}
      {me?.profile && (
        <>
          <p>
            Olá, {me.profile.name}.{" "}
            <span className="tag">
              {
                (
                  {
                    pending: "Aguardando aprovação",
                    active: "Cadastro ativo",
                    suspended: "Acesso suspenso",
                  } as any
                )[me.profile.status]
              }
            </span>
          </p>
          <div className="actions">
            <Link className="btn" href="/academy">
              Meus cursos e Academy
            </Link>
            <Link className="btn secondary" href="/nova-senha">
              Alterar senha
            </Link>
            {me.profile.role !== "member" && (
              <Link className="btn secondary" href="/admin">
                Administração
              </Link>
            )}
            <button
              className="secondary"
              onClick={async () => {
                await supabase.auth.signOut();
                location.href = "/entrar";
              }}
            >
              Sair
            </button>
          </div>
          {me.profile.status === "pending" && (
            <p className="notice">
              Seu cadastro será analisado. A conta não confere função
              institucional nem participação formal na Frente.
            </p>
          )}
          {learning && (
            <>
              <div className="grid">
                {[
                  ["Matrículas", learning.enrollments.length],
                  ["Lições concluídas", learning.progress.length],
                  ["Certificados", learning.certificates.length],
                ].map(([a, b]) => (
                  <div className="card" key={a}>
                    <small>{a}</small>
                    <p className="stat">{b}</p>
                  </div>
                ))}
              </div>
              <h2 style={{ margin: "30px 0 15px" }}>Continuar formação</h2>
              {learning.enrollments.map((r: any) => (
                <p key={r.course_id}>
                  <Link href={"/academy/" + r.course_id}>
                    Abrir curso matriculado →
                  </Link>
                </p>
              ))}
              <h2>Meus certificados</h2>
              {learning.certificates.map((c: any) => (
                <p key={c.code}>
                  <Link href={"/certificado/" + c.code}>{c.title} →</Link>
                </p>
              ))}
              <h2>Minhas inscrições</h2>
              {learning.registrations.map((e: any) => (
                <p key={e.event_id}>
                  <Link href={"/conteudo/" + e.event_id}>
                    Consultar evento e inscrição →
                  </Link>
                </p>
              ))}
              <h2>Minhas anotações</h2>
              {learning.notes.map((n: any) => (
                <article className="card" key={n.id}>
                  <p className="prose">{n.body}</p>
                  <button
                    className="secondary"
                    onClick={async () => {
                      try {
                        await api("/api/learning", {
                          action: "delete-note",
                          id: n.id,
                        });
                        setLearning(await api("/api/learning"));
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  >
                    Excluir anotação
                  </button>
                </article>
              ))}
            </>
          )}
        </>
      )}
    </section>
  );
}
