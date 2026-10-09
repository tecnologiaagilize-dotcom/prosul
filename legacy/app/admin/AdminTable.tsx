"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";

type Row = {
  id: string;
  nome_empresa: string;
  tipo: string;
  pais: string;
  setor: string;
  produtos_servicos: string;
  nome_contato: string;
  email_contato: string;
  status: string;
  created_at: string;
};

const TABS = [
  { key: "pendente", label: "Em análise" },
  { key: "aprovado", label: "Publicados" },
  { key: "rejeitado", label: "Não aprovados" },
] as const;

export function AdminTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("pendente");
  const [pending, setPending] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setPending(id);
    const supabase = createClient();
    await supabase.from("empresas").update({ status }).eq("id", id);
    setPending(null);
    router.refresh();
  }

  const filtered = rows.filter((r) => r.status === tab);

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b border-[var(--line)]">
        {TABS.map((t) => {
          const count = rows.filter((r) => r.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`font-mono text-sm px-4 py-3 border-b-2 transition-colors ${
                tab === t.key
                  ? "border-[var(--gold)] text-[var(--gold)]"
                  : "border-transparent text-[var(--text-on-dark-dim)] hover:text-[var(--text-on-dark)]"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[var(--text-on-dark-dim)] py-10 text-center eyebrow">
          Nada por aqui
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-[var(--ink-panel)] border border-[var(--line)] rounded-sm p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-lg">{r.nome_empresa}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="eyebrow text-[var(--text-on-dark-dim)]">
                    {r.pais} · {r.tipo} · {r.setor}
                  </p>
                </div>
                <p className="eyebrow text-[var(--text-on-dark-dim)]">
                  {new Date(r.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <p className="text-sm text-[var(--text-on-dark-dim)] mt-3 leading-relaxed">
                {r.produtos_servicos}
              </p>

              <p className="text-sm mt-3 font-mono">
                {r.nome_contato} —{" "}
                <a
                  href={`mailto:${r.email_contato}`}
                  className="text-[var(--gold)] hover:underline"
                >
                  {r.email_contato}
                </a>
              </p>

              {tab !== "aprovado" && (
                <div className="flex gap-3 mt-4">
                  <button
                    disabled={pending === r.id}
                    onClick={() => setStatus(r.id, "aprovado")}
                    className="font-mono text-xs tracking-wide px-4 py-2 rounded-sm bg-[var(--status-approved)] text-[var(--ink)] hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Aprovar e publicar
                  </button>
                  {tab !== "rejeitado" && (
                    <button
                      disabled={pending === r.id}
                      onClick={() => setStatus(r.id, "rejeitado")}
                      className="font-mono text-xs tracking-wide px-4 py-2 rounded-sm border border-[var(--clay)] text-[var(--clay-soft)] hover:bg-[var(--clay)] hover:text-[var(--ink)] transition-colors disabled:opacity-50"
                    >
                      Não aprovar
                    </button>
                  )}
                </div>
              )}
              {tab === "aprovado" && (
                <div className="flex gap-3 mt-4">
                  <button
                    disabled={pending === r.id}
                    onClick={() => setStatus(r.id, "pendente")}
                    className="font-mono text-xs tracking-wide px-4 py-2 rounded-sm border border-[var(--line)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors disabled:opacity-50"
                  >
                    Remover do diretório
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
