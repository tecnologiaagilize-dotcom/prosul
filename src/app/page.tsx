import { PublicMedia } from "@/components/PublicMedia";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
const modules = [
  {
    icon: "/icons/observatorio.webp",
    title: "Observatório Legislativo",
    text: "Acompanhe notícias e projetos sobre integração latino-americana.",
    href: "/observatorio",
  },
  {
    icon: "/icons/academy.webp",
    title: "PROSUL Academy",
    text: "Cursos, jornadas e formação para ampliar conhecimentos e conexões.",
    href: "/academy",
  },
  {
    icon: "/icons/incentivos.webp",
    title: "Incentivos e investimentos",
    text: "Informações com fontes e situações claramente identificadas.",
    href: "/conteudos/opportunity",
  },
  {
    icon: "/icons/agenda.webp",
    title: "Agenda de cooperação",
    text: "Encontros, debates, seminários e atividades institucionais.",
    href: "/conteudos/event",
  },
  {
    icon: "/icons/instituicoes.webp",
    title: "Instituições",
    text: "Conheça as organizações com informações publicadas na plataforma.",
    href: "/conteudos/organization",
  },
  {
    icon: "/icons/videos.webp",
    title: "Vídeos e publicações",
    text: "Conteúdos para compreender e acompanhar a integração regional.",
    href: "/conteudos/video",
  },
];
export default function Home() {
  return (
    <div className="wrap home">
      <section className="hero hero-globe">
        <div className="hero-text">
          <span className="eyebrow">FRENTE PARLAMENTAR MISTA PROSUL</span>
          <h1>
            Conhecimento que aproxima.
            <br />
            Cooperação que transforma.
          </h1>
          <p>
            Um espaço de informação, formação e diálogo sobre a integração da
            América Latina.
          </p>
          <Link className="btn" href="/observatorio">
            Explorar o observatório <ArrowUpRight size={18} />
          </Link>
          <Link style={{ marginLeft: 24 }} href="/cadastrar">
            Participe da plataforma →
          </Link>
        </div>
        <div className="hero-visual">
          <video
            className="globe-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/media/globo-prosul.jpg"
            aria-label="Globo PROSUL girando, com a América do Sul em destaque e bandeiras ao redor"
          >
            <source src="/media/globo-prosul.mp4" type="video/mp4" />
            <source src="/media/globo-prosul.webm" type="video/webm" />
          </video>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <small>EXPLORE A PLATAFORMA</small>
          <h2>Conexões para o desenvolvimento</h2>
        </div>
        <Link href="/conheca-a-frente">
          Conheça a Frente Parlamentar Mista PROSUL →
        </Link>
      </div>
      <div className="grid">
        {modules.map((m) => (
          <Link className="card" key={m.title} href={m.href}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="module-icon"
              src={m.icon}
              alt=""
              width={72}
              height={72}
              loading="lazy"
            />
            <h3>{m.title}</h3>
            <p className="muted">{m.text}</p>
            <ArrowUpRight size={20} />
          </Link>
        ))}
      </div>
      <PublicMedia kind="photo" preview />
      <PublicMedia kind="video" preview />
      <section
        className="card"
        style={{
          marginTop: 32,
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2>Informação com origem e contexto.</h2>
          <p className="muted">
            Acesse as notícias, os documentos e as atividades publicadas.
          </p>
        </div>
        <div className="actions">
          <Link className="btn" href="/conteudos/news">
            Últimas notícias
          </Link>
          <Link className="btn secondary" href="/conteudos/document">
            Biblioteca
          </Link>
        </div>
      </section>
    </div>
  );
}
