import { z } from "zod";
export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "url"
    | "number"
    | "date"
    | "datetime-local"
    | "select";
  options?: string[];
  required?: boolean;
};
const url: Field = { key: "url", label: "Link HTTPS", type: "url" };
export const kinds = {
  page: { label: "Institucional", group: "Conteúdo", fields: [] },
  news: {
    label: "Notícias",
    group: "Conteúdo",
    fields: [{ key: "source", label: "Fonte oficial", type: "url" }, url],
  },
  video: {
    label: "Vídeos",
    group: "Conteúdo",
    fields: [
      { ...url, required: true },
      {
        key: "transcript",
        label: "Transcrição ou alternativa textual",
        type: "textarea",
      },
    ],
  },
  document: {
    label: "Biblioteca",
    group: "Conteúdo",
    fields: [
      { ...url, required: true },
      { key: "author", label: "Autoria" },
      { key: "edition", label: "Edição" },
    ],
  },
  event: {
    label: "Eventos e agenda",
    group: "Conteúdo",
    fields: [
      {
        key: "starts",
        label: "Início",
        type: "datetime-local",
        required: true,
      },
      { key: "ends", label: "Fim", type: "datetime-local" },
      {
        key: "timezone",
        label: "Fuso IANA (ex.: America/Sao_Paulo)",
        required: true,
      },
      { key: "location", label: "Local ou endereço virtual" },
      url,
    ],
  },
  school: { label: "Escolas", group: "Academy", fields: [] },
  journey: { label: "Jornadas", group: "Academy", fields: [] },
  program: { label: "Programas", group: "Academy", fields: [] },
  course: {
    label: "Cursos",
    group: "Academy",
    fields: [
      { key: "hours", label: "Carga horária", type: "number", required: true },
    ],
  },
  module: { label: "Módulos", group: "Academy", fields: [] },
  lesson: {
    label: "Lições",
    group: "Academy",
    fields: [
      url,
      { key: "objective", label: "Objetivo" },
      { key: "reflection", label: "Reflexão e aplicação", type: "textarea" },
    ],
  },
  class: {
    label: "Turmas",
    group: "Academy",
    fields: [
      { key: "starts", label: "Início", type: "date" },
      { key: "ends", label: "Fim", type: "date" },
      { key: "tutor", label: "Tutor responsável" },
    ],
  },
  organization: {
    label: "Instituições",
    group: "Gestão",
    fields: [{ key: "contact", label: "Contato institucional" }, url],
  },
  asset: {
    label: "Patrimônio",
    group: "Gestão",
    fields: [
      { key: "code", label: "Código patrimonial", required: true },
      { key: "location", label: "Localização" },
      { key: "custodian", label: "Responsável" },
      { key: "value", label: "Aquisição (BRL)", type: "number" },
      {
        key: "condition",
        label: "Condição",
        type: "select",
        options: ["bom", "manutencao", "baixado"],
      },
    ],
  },
  maintenance: {
    label: "Manutenções",
    group: "Gestão",
    fields: [
      { key: "due", label: "Data prevista", type: "date" },
      { key: "cost", label: "Custo (BRL)", type: "number" },
      { key: "result", label: "Resultado", type: "textarea" },
    ],
  },
  inventory: {
    label: "Inventários",
    group: "Gestão",
    fields: [
      {
        key: "date",
        label: "Data de conferência",
        type: "date",
        required: true,
      },
      { key: "result", label: "Resultado da conferência", required: true },
    ],
  },
  loan: {
    label: "Empréstimos de bens",
    group: "Gestão",
    fields: [
      {
        key: "borrower",
        label: "Responsável pelo recebimento",
        required: true,
      },
      { key: "due", label: "Devolução prevista", type: "date", required: true },
      { key: "returned", label: "Devolvido em", type: "date" },
    ],
  },
  initiative: {
    label: "Projetos de cooperação",
    group: "Observatório",
    fields: [{ key: "source", label: "Fonte oficial", type: "url" }, url],
  },
  opportunity: {
    label: "Incentivos e investimentos",
    group: "Observatório",
    fields: [
      {
        key: "stage",
        label: "Situação",
        type: "select",
        options: ["proposta", "aprovada", "disponivel", "encerrada"],
        required: true,
      },
      { key: "source", label: "Fonte oficial", type: "url", required: true },
      { key: "deadline", label: "Prazo", type: "date" },
      { key: "eligibility", label: "Critérios de acesso", type: "textarea" },
    ],
  },
  legislative: {
    label: "Notícias e projetos legislativos",
    group: "Observatório",
    fields: [
      {
        key: "provider",
        label: "Origem",
        type: "select",
        options: ["camara", "senado"],
        required: true,
      },
      { key: "source", label: "Link oficial", type: "url", required: true },
      { key: "external_id", label: "Identificador oficial" },
      { key: "stage", label: "Situação informada pela fonte" },
      { key: "fetched_at", label: "Data da consulta" },
    ],
  },
} satisfies Record<string, { label: string; group: string; fields: Field[] }>;
export type Kind = keyof typeof kinds;
export const kindKeys = Object.keys(kinds) as Kind[];
export const privateKinds: Kind[] = [
  "asset",
  "maintenance",
  "inventory",
  "loan",
];
export const parentKinds: Partial<Record<Kind, Kind[]>> = {
  journey: ["school"],
  program: ["journey"],
  course: ["program"],
  module: ["course"],
  lesson: ["module"],
  class: ["course"],
  maintenance: ["asset"],
  inventory: ["asset"],
  loan: ["asset"],
};
export const requiredParent: Kind[] = [
  "journey",
  "program",
  "module",
  "lesson",
  "class",
  "maintenance",
  "inventory",
  "loan",
];
export const countries = [
  "AR",
  "BO",
  "BR",
  "CL",
  "CO",
  "CR",
  "CU",
  "DO",
  "EC",
  "SV",
  "GT",
  "HT",
  "HN",
  "MX",
  "NI",
  "PA",
  "PY",
  "PE",
  "UY",
  "VE",
];
export const safeUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
};
export const resourceSchema = z
  .object({
    id: z.string().uuid().optional(),
    version: z.number().int().positive().optional(),
    kind: z.enum(kindKeys as [Kind, ...Kind[]]),
    title: z.string().trim().min(3).max(250),
    summary: z.string().max(1000).default(""),
    body: z.string().max(100000).default(""),
    country: z.string().max(2).default(""),
    theme: z.string().max(120).default(""),
    parent_id: z.string().uuid().nullable().default(null),
    position: z.number().int().min(0).default(0),
    data: z.record(z.string().max(10000)).default({}),
    status: z
      .enum(["draft", "review", "published", "archived"])
      .default("draft"),
  })
  .superRefine((r, ctx) => {
    if (r.id && !r.version)
      ctx.addIssue({
        code: "custom",
        path: ["version"],
        message: "Versão obrigatória para editar.",
      });
    if (r.country && !countries.includes(r.country))
      ctx.addIssue({ code: "custom", message: "País inválido." });
    if (requiredParent.includes(r.kind) && !r.parent_id)
      ctx.addIssue({
        code: "custom",
        message: "Selecione o vínculo principal.",
      });
    for (const f of kinds[r.kind].fields as Field[]) {
      const v = r.data[f.key];
      if (f.required && !v?.trim())
        ctx.addIssue({ code: "custom", message: `Preencha ${f.label}.` });
      if (v && f.type === "url" && !safeUrl(v))
        ctx.addIssue({
          code: "custom",
          message: "Use links HTTPS sem credenciais.",
        });
      if (
        v &&
        f.type === "number" &&
        (!Number.isFinite(Number(v)) || Number(v) < 0)
      )
        ctx.addIssue({ code: "custom", message: "Valor numérico inválido." });
      if (v && f.options && !f.options.includes(v))
        ctx.addIssue({ code: "custom", message: "Opção inválida." });
      if (
        v &&
        ["date", "datetime-local"].includes(f.type ?? "") &&
        !Number.isFinite(Date.parse(v))
      )
        ctx.addIssue({ code: "custom", message: "Data inválida." });
    }
    if (r.data.starts && r.data.ends && r.data.ends < r.data.starts)
      ctx.addIssue({ code: "custom", message: "Fim anterior ao início." });
    if (r.kind === "event")
      try {
        new Intl.DateTimeFormat("pt", { timeZone: r.data.timezone }).format();
      } catch {
        ctx.addIssue({ code: "custom", message: "Fuso inválido." });
      }
    if (r.kind === "legislative" && r.data.source && safeUrl(r.data.source)) {
      const h = new URL(r.data.source).hostname;
      if (!/(^|\.)(camara|senado)\.leg\.br$/.test(h))
        ctx.addIssue({
          code: "custom",
          message: "Use fonte oficial da Câmara ou Senado.",
        });
    }
  });
export type Resource = {
  id: string;
  kind: Kind;
  title: string;
  summary: string;
  body: string;
  country: string;
  theme: string;
  parent_id: string | null;
  position: number;
  data: Record<string, string>;
  status: string;
  version: number;
  updated_at: string;
};
