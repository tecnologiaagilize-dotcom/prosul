export type Country = {
  code: string;
  name: string;
  status: "fundador" | "associado";
};

// Fundadores: Declaração de Santiago, 22/03/2019.
// Associados: aderiram posteriormente ao Foro (ex: Suriname, Uruguai).
export const COUNTRIES: Country[] = [
  { code: "AR", name: "Argentina", status: "fundador" },
  { code: "BR", name: "Brasil", status: "fundador" },
  { code: "CL", name: "Chile", status: "fundador" },
  { code: "CO", name: "Colômbia", status: "fundador" },
  { code: "EC", name: "Equador", status: "fundador" },
  { code: "GY", name: "Guiana", status: "fundador" },
  { code: "PY", name: "Paraguai", status: "fundador" },
  { code: "PE", name: "Peru", status: "fundador" },
  { code: "SR", name: "Suriname", status: "associado" },
  { code: "UY", name: "Uruguai", status: "associado" },
];

export const COUNTRY_NAMES = COUNTRIES.map((c) => c.name);

export const SECTORS = [
  "Agronegócio e alimentos",
  "Energia e mineração",
  "Infraestrutura e construção",
  "Indústria e manufatura",
  "Tecnologia e serviços digitais",
  "Saúde e biotecnologia",
  "Educação e pesquisa",
  "Logística e transporte",
  "Turismo e cultura",
  "Defesa e segurança",
  "Financeiro e seguros",
  "Meio ambiente e sustentabilidade",
  "Outro",
] as const;

export const ORG_TYPES = [
  "Empresa privada",
  "Instituto ou fundação",
  "Cooperativa ou associação",
  "Órgão público",
  "Universidade ou centro de pesquisa",
] as const;

export const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  pendente: { label: "Em análise", tone: "pending" },
  aprovado: { label: "Publicado", tone: "approved" },
  rejeitado: { label: "Não aprovado", tone: "rejected" },
};
