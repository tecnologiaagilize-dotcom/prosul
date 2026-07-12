"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { COUNTRY_NAMES, SECTORS } from "@/lib/data";

export function DirectoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pais = searchParams.get("pais") ?? "";
  const setor = searchParams.get("setor") ?? "";
  const q = searchParams.get("q") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/diretorio?${params.toString()}`);
  }

  const selectClass =
    "bg-[var(--ink-panel)] border border-[var(--line)] rounded-sm px-4 py-2.5 text-sm text-[var(--text-on-dark)] focus:border-[var(--gold)] outline-none";

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        className={`${selectClass} flex-1 min-w-[180px]`}
        placeholder="Buscar por nome..."
        defaultValue={q}
        onChange={(e) => updateParam("q", e.target.value)}
      />
      <select
        className={selectClass}
        value={pais}
        onChange={(e) => updateParam("pais", e.target.value)}
      >
        <option value="">Todos os países</option>
        {COUNTRY_NAMES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={setor}
        onChange={(e) => updateParam("setor", e.target.value)}
      >
        <option value="">Todos os setores</option>
        {SECTORS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {(pais || setor || q) && (
        <button
          onClick={() => router.push("/diretorio")}
          className="eyebrow text-[var(--gold)] hover:underline"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
