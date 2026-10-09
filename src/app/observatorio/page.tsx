import { ContentList } from "@/components/ContentList";
import Link from "next/link";
export default function Page() {
  return (
    <>
      <section className="wrap">
        <h1>Observatório PROSUL</h1>
        <p>
          Notícias e proposições da Câmara e do Senado relacionadas à América
          Latina. Conteúdos selecionados e revisados, com fonte e situação
          identificadas.
        </p>
        <div className="actions">
          <Link className="btn secondary" href="/conteudos/opportunity">
            Incentivos e investimentos
          </Link>
          <Link className="btn secondary" href="/conteudos/initiative">
            Projetos de cooperação
          </Link>
        </div>
      </section>
      <ContentList kind="legislative" title="Acompanhamento legislativo" />
    </>
  );
}
