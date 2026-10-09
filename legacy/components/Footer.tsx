export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="eyebrow text-[var(--text-on-dark-dim)]">
          Rede Prosul — iniciativa independente de apoio à Frente Parlamentar Prosul
        </p>
        <p className="eyebrow text-[var(--text-on-dark-dim)]">
          Argentina · Brasil · Chile · Colômbia · Equador · Guiana · Paraguai · Peru · Suriname · Uruguai
        </p>
      </div>
    </footer>
  );
}
