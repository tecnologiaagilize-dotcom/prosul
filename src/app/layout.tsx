import "./globals.css";
import Link from "next/link";
export const metadata = {
  title: {
    default: "PROSUL | Integração e conhecimento",
    template: "%s | PROSUL",
  },
  description:
    "Plataforma institucional, formação e observatório de integração latino-americana.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip" href="#conteudo">
          Pular para o conteúdo
        </a>
        <header className="site-header">
          <Link className="brand" href="/">
            PRO<span>SUL</span>
            <small>FRENTE PARLAMENTAR MISTA</small>
          </Link>
          <nav aria-label="Principal">
            <Link href="/conheca-a-frente">
              Conheça a Frente Parlamentar Mista PROSUL
            </Link>
            <Link href="/galeria">Galeria</Link>
            <Link href="/conteudos/video">Vídeos</Link>
            <Link href="/conteudos/news">Notícias</Link>
            <Link href="/academy">Academy</Link>
            <Link href="/observatorio">Observatório</Link>
            <Link href="/conteudos/event">Agenda</Link>
            <Link href="/entrar">Minha conta ↗</Link>
          </nav>
        </header>
        <main id="conteudo">{children}</main>
        <footer>
          PROSUL · Integração, conhecimento e cooperação.
          <div>
            <Link href="/conteudos/document">Biblioteca</Link> ·{" "}
            <Link href="/conteudos/video">Vídeos</Link> ·{" "}
            <Link href="/privacidade">Privacidade</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
