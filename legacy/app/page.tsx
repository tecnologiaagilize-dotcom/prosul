import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RouteMap } from "@/components/RouteMap";

const STEPS = [
  {
    n: "01",
    title: "Cadastro",
    body: "A empresa ou instituto registra seus dados, setor de atuação e os produtos ou serviços que deseja oferecer aos demais países do bloco.",
  },
  {
    n: "02",
    title: "Análise",
    body: "A equipe responsável confere as informações antes da publicação — cada registro entra em fila até ser confirmado.",
  },
  {
    n: "03",
    title: "Publicação",
    body: "Uma vez aprovado, o perfil passa a constar no diretório público, visível por país e por setor.",
  },
  {
    n: "04",
    title: "Negócios",
    body: "Parlamentares, assessorias e outras empresas usam o diretório para encontrar parceiros comerciais dentro do Prosul.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-6">
          <p className="eyebrow text-[var(--gold)] mb-5">
            Frente Parlamentar Prosul — plataforma de negócios
          </p>
          <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] max-w-3xl">
            Um diretório para quem quer{" "}
            <em className="not-italic text-[var(--gold)]">fazer negócio</em>{" "}
            entre os países da América do Sul.
          </h1>
          <p className="mt-6 max-w-xl text-[var(--text-on-dark-dim)] text-lg leading-relaxed">
            Cadastre sua empresa ou instituto, descreva o que ela oferece, e
            fique visível para parceiros comerciais nos dez países que hoje
            compõem o Foro para o Progresso da América do Sul.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/cadastro"
              className="bg-[var(--gold)] text-[var(--ink)] font-mono text-sm tracking-wide px-6 py-3 rounded-sm hover:bg-[var(--gold-soft)] transition-colors"
            >
              Cadastrar minha empresa
            </Link>
            <Link
              href="/diretorio"
              className="border border-[var(--line)] font-mono text-sm tracking-wide px-6 py-3 rounded-sm hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
            >
              Explorar o diretório
            </Link>
          </div>
        </section>

        {/* Route map — signature element */}
        <section className="max-w-6xl mx-auto px-6 py-14">
          <div className="bg-[var(--ink-panel)] border border-[var(--line)] rounded-sm px-6 sm:px-10 py-10">
            <p className="eyebrow text-[var(--text-on-dark-dim)] mb-6">
              Dez estações — oito fundadores, dois associados
            </p>
            <RouteMap linkBase="/diretorio" />
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-display text-3xl mb-10">Como funciona</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line)] border border-[var(--line)]">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-[var(--ink)] p-6">
                <span className="font-mono text-sm text-[var(--gold)]">
                  {s.n}
                </span>
                <h3 className="font-display text-xl mt-3 mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--text-on-dark-dim)] leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="bg-[var(--paper)] text-[var(--text-on-paper)] rounded-sm px-8 sm:px-12 py-14 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div>
              <h2 className="font-display text-3xl max-w-md">
                Sua empresa já pode estar na próxima rodada de negócios.
              </h2>
              <p className="mt-3 text-[var(--text-on-paper-dim)] max-w-md">
                O cadastro leva poucos minutos e não tem custo.
              </p>
            </div>
            <Link
              href="/cadastro"
              className="shrink-0 bg-[var(--ink)] text-[var(--text-on-dark)] font-mono text-sm tracking-wide px-6 py-3 rounded-sm hover:bg-[var(--ink-panel-raised)] transition-colors text-center"
            >
              Iniciar cadastro
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
