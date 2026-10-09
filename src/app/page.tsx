import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Globe2,
  Landmark,
  CalendarDays,
  Building2,
  PlayCircle,
} from "lucide-react";
const modules = [
  {
    icon: Landmark,
    title: "Observatório Legislativo",
    text: "Acompanhe notícias e projetos sobre integração latino-americana.",
    href: "/observatorio",
  },
  {
    icon: BookOpen,
    title: "PROSUL Academy",
    text: "Cursos, jornadas e formação para ampliar conhecimentos e conexões.",
    href: "/academy",
  },
  {
    icon: Globe2,
    title: "Incentivos e investimentos",
    text: "Informações com fontes e situações claramente identificadas.",
    href: "/conteudos/opportunity",
  },
  {
    icon: CalendarDays,
    title: "Agenda de cooperação",
    text: "Encontros, debates, seminários e atividades institucionais.",
    href: "/conteudos/event",
  },
  {
    icon: Building2,
    title: "Instituições",
    text: "Conheça as organizações com informações publicadas na plataforma.",
    href: "/conteudos/organization",
  },
  {
    icon: PlayCircle,
    title: "Vídeos e publicações",
    text: "Conteúdos para compreender e acompanhar a integração regional.",
    href: "/conteudos/video",
  },
];
export default function Home() {
  return (
    <div className="wrap">
      <section className="hero">
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
      </section>
      <div className="section-heading">
        <div>
          <small>EXPLORE A PLATAFORMA</small>
          <h2>Conexões para o desenvolvimento</h2>
        </div>
        <Link href="/conteudos/page">Conheça a Frente →</Link>
      </div>
      <div className="grid">
        {modules.map((m) => (
          <Link className="card" key={m.title} href={m.href}>
            <m.icon color="#008339" size={28} />
            <h3>{m.title}</h3>
            <p className="muted">{m.text}</p>
            <ArrowUpRight size={20} />
          </Link>
        ))}
      </div>
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
