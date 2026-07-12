import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function EmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", id)
    .eq("status", "aprovado")
    .single();

  if (!company) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-4">
          <Link
            href="/diretorio"
            className="eyebrow text-[var(--gold)] hover:underline"
          >
            ← Voltar ao diretório
          </Link>

          <p className="eyebrow text-[var(--text-on-dark-dim)] mt-8 mb-3">
            {company.pais} · {company.tipo}
          </p>
          <h1 className="font-display text-4xl mb-4">
            {company.nome_empresa}
          </h1>
          <p className="eyebrow text-[var(--gold)]">{company.setor}</p>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-10 space-y-10">
          <div>
            <h2 className="eyebrow text-[var(--text-on-dark-dim)] mb-3">
              Produtos e serviços oferecidos
            </h2>
            <p className="leading-relaxed">{company.produtos_servicos}</p>
          </div>

          {company.descricao && (
            <div>
              <h2 className="eyebrow text-[var(--text-on-dark-dim)] mb-3">
                Sobre a organização
              </h2>
              <p className="leading-relaxed text-[var(--text-on-dark-dim)]">
                {company.descricao}
              </p>
            </div>
          )}

          <div className="bg-[var(--ink-panel)] border border-[var(--line)] rounded-sm p-6">
            <h2 className="eyebrow text-[var(--text-on-dark-dim)] mb-4">
              Contato
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="text-[var(--text-on-dark-dim)] w-28 shrink-0">
                  Responsável
                </dt>
                <dd>{company.nome_contato}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-[var(--text-on-dark-dim)] w-28 shrink-0">
                  E-mail
                </dt>
                <dd>
                  <a
                    href={`mailto:${company.email_contato}`}
                    className="text-[var(--gold)] hover:underline"
                  >
                    {company.email_contato}
                  </a>
                </dd>
              </div>
              {company.telefone_contato && (
                <div className="flex gap-3">
                  <dt className="text-[var(--text-on-dark-dim)] w-28 shrink-0">
                    Telefone
                  </dt>
                  <dd>{company.telefone_contato}</dd>
                </div>
              )}
              {company.website && (
                <div className="flex gap-3">
                  <dt className="text-[var(--text-on-dark-dim)] w-28 shrink-0">
                    Site
                  </dt>
                  <dd>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gold)] hover:underline"
                    >
                      {company.website}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
