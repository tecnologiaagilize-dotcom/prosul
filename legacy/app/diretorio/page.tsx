import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompanyCard } from "@/components/CompanyCard";
import { DirectoryFilters } from "./DirectoryFilters";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Diretório | Rede Prosul",
};

export const revalidate = 0;

type SearchParams = Promise<{ pais?: string; setor?: string; q?: string }>;

async function DirectoryResults({ searchParams }: { searchParams: SearchParams }) {
  const { pais, setor, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("empresas")
    .select("id, nome_empresa, tipo, pais, setor, produtos_servicos")
    .eq("status", "aprovado")
    .order("created_at", { ascending: false });

  if (pais) query = query.eq("pais", pais);
  if (setor) query = query.eq("setor", setor);
  if (q) query = query.ilike("nome_empresa", `%${q}%`);

  const { data: companies, error } = await query;

  if (error) {
    return (
      <p className="text-[var(--clay-soft)] font-mono text-sm">
        Não foi possível carregar o diretório agora.
      </p>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="border border-dashed border-[var(--line)] rounded-sm p-12 text-center">
        <p className="eyebrow text-[var(--text-on-dark-dim)]">
          Nenhum resultado com esses filtros
        </p>
        <p className="mt-2 text-[var(--text-on-dark-dim)]">
          Ajuste a busca ou{" "}
          <a href="/cadastro" className="text-[var(--gold)] hover:underline">
            cadastre a primeira empresa
          </a>{" "}
          dessa categoria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {companies.map((c) => (
        <CompanyCard key={c.id} company={c} />
      ))}
    </div>
  );
}

export default function DiretorioPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <p className="eyebrow text-[var(--gold)] mb-4">Diretório público</p>
          <h1 className="font-display text-4xl mb-8">
            Empresas e institutos cadastrados
          </h1>
          <Suspense>
            <DirectoryFilters />
          </Suspense>
        </section>
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <Suspense
            fallback={
              <p className="eyebrow text-[var(--text-on-dark-dim)]">
                Carregando...
              </p>
            }
          >
            <DirectoryResults searchParams={searchParams} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}
