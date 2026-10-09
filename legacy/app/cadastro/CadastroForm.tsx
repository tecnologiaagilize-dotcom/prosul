"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COUNTRY_NAMES, SECTORS, ORG_TYPES } from "@/lib/data";

type FormState = {
  nome_empresa: string;
  tipo: string;
  pais: string;
  setor: string;
  produtos_servicos: string;
  descricao: string;
  nome_contato: string;
  email_contato: string;
  telefone_contato: string;
  website: string;
};

const EMPTY: FormState = {
  nome_empresa: "",
  tipo: ORG_TYPES[0],
  pais: "",
  setor: "",
  produtos_servicos: "",
  descricao: "",
  nome_contato: "",
  email_contato: "",
  telefone_contato: "",
  website: "",
};

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-[var(--text-on-dark-dim)]">
        {label}
        {required && <span className="text-[var(--gold)]"> *</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full bg-[var(--ink-panel)] border border-[var(--line)] rounded-sm px-4 py-2.5 text-[var(--text-on-dark)] placeholder:text-[var(--text-on-dark-dim)] focus:border-[var(--gold)] outline-none transition-colors";

export function CadastroForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.nome_empresa ||
      !form.pais ||
      !form.setor ||
      !form.produtos_servicos ||
      !form.nome_contato ||
      !form.email_contato
    ) {
      setStatus("error");
      setErrorMsg("Preencha os campos obrigatórios antes de enviar.");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.from("empresas").insert({
      ...form,
      status: "pendente",
    });

    if (error) {
      setStatus("error");
      setErrorMsg(
        "Não foi possível enviar o cadastro agora. Tente novamente em instantes."
      );
      return;
    }

    setStatus("done");
    setForm(EMPTY);
  }

  if (status === "done") {
    return (
      <div className="bg-[var(--ink-panel)] border border-[var(--gold)] rounded-sm px-8 py-12 text-center">
        <p className="eyebrow text-[var(--gold)] mb-3">Cadastro recebido</p>
        <h2 className="font-display text-2xl mb-3">
          Obrigado. Seu registro entrou em análise.
        </h2>
        <p className="text-[var(--text-on-dark-dim)] max-w-md mx-auto">
          Assim que for confirmado, seu perfil passa a constar no diretório
          público da Rede Prosul.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-8 font-mono text-sm text-[var(--gold)] hover:underline"
        >
          Cadastrar outra empresa
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <fieldset className="space-y-5">
        <p className="eyebrow text-[var(--gold)]">Identificação</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Nome da empresa ou instituto" required>
            <input
              className={inputClass}
              value={form.nome_empresa}
              onChange={(e) => update("nome_empresa", e.target.value)}
              placeholder="Ex.: Manufatura Austral Ltda."
            />
          </Field>
          <Field label="Tipo de organização" required>
            <select
              className={inputClass}
              value={form.tipo}
              onChange={(e) => update("tipo", e.target.value)}
            >
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="País de origem" required>
            <select
              className={inputClass}
              value={form.pais}
              onChange={(e) => update("pais", e.target.value)}
            >
              <option value="">Selecione</option>
              {COUNTRY_NAMES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Setor de atuação" required>
            <select
              className={inputClass}
              value={form.setor}
              onChange={(e) => update("setor", e.target.value)}
            >
              <option value="">Selecione</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <p className="eyebrow text-[var(--gold)]">O que sua organização oferece</p>
        <Field label="Produtos ou serviços" required>
          <textarea
            className={inputClass}
            rows={3}
            value={form.produtos_servicos}
            onChange={(e) => update("produtos_servicos", e.target.value)}
            placeholder="Ex.: Exportação de máquinas agrícolas, peças e assistência técnica."
          />
        </Field>
        <Field label="Descrição da empresa">
          <textarea
            className={inputClass}
            rows={4}
            value={form.descricao}
            onChange={(e) => update("descricao", e.target.value)}
            placeholder="Um breve histórico, porte, mercados já atendidos, diferenciais."
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <p className="eyebrow text-[var(--gold)]">Contato</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Nome do responsável" required>
            <input
              className={inputClass}
              value={form.nome_contato}
              onChange={(e) => update("nome_contato", e.target.value)}
            />
          </Field>
          <Field label="E-mail" required>
            <input
              type="email"
              className={inputClass}
              value={form.email_contato}
              onChange={(e) => update("email_contato", e.target.value)}
            />
          </Field>
          <Field label="Telefone / WhatsApp">
            <input
              className={inputClass}
              value={form.telefone_contato}
              onChange={(e) => update("telefone_contato", e.target.value)}
              placeholder="+55 61 9...."
            />
          </Field>
          <Field label="Site (opcional)">
            <input
              className={inputClass}
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://"
            />
          </Field>
        </div>
      </fieldset>

      {status === "error" && (
        <p className="text-[var(--clay-soft)] text-sm font-mono">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="bg-[var(--gold)] text-[var(--ink)] font-mono text-sm tracking-wide px-8 py-3.5 rounded-sm hover:bg-[var(--gold-soft)] transition-colors disabled:opacity-60"
      >
        {status === "submitting" ? "Enviando..." : "Enviar cadastro"}
      </button>
    </form>
  );
}
