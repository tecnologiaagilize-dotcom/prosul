import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-3 group">
          <span className="font-display text-xl tracking-tight">
            Rede <em className="not-italic text-[var(--gold)]">Prosul</em>
          </span>
          <span className="eyebrow hidden sm:inline text-[var(--text-on-dark-dim)]">
            Negócios entre nações
          </span>
        </Link>
        <nav className="flex items-center gap-6 font-mono text-[13px] tracking-wide">
          <Link href="/diretorio" className="hover:text-[var(--gold)] transition-colors">
            Diretório
          </Link>
          <Link
            href="/cadastro"
            className="border border-[var(--gold)] text-[var(--gold)] px-4 py-1.5 rounded-sm hover:bg-[var(--gold)] hover:text-[var(--ink)] transition-colors"
          >
            Cadastrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
