import Link from "next/link";

type Company = {
  id: string;
  nome_empresa: string;
  tipo: string;
  pais: string;
  setor: string;
  produtos_servicos: string;
};

export function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      href={`/empresa/${company.id}`}
      className="block bg-[var(--ink-panel)] border border-[var(--line)] rounded-sm p-6 hover:border-[var(--gold)] transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-display text-xl leading-tight">
          {company.nome_empresa}
        </h3>
        <span className="eyebrow text-[var(--gold)] shrink-0 mt-1">
          {company.pais}
        </span>
      </div>
      <p className="eyebrow text-[var(--text-on-dark-dim)] mb-3">
        {company.tipo} · {company.setor}
      </p>
      <p className="text-sm text-[var(--text-on-dark-dim)] leading-relaxed line-clamp-2">
        {company.produtos_servicos}
      </p>
    </Link>
  );
}
