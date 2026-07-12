-- Rede Prosul — 001_empresas.sql
-- Idempotente: pode ser rodado mais de uma vez sem erro.

create extension if not exists "pgcrypto";

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome_empresa text not null,
  tipo text not null,
  pais text not null,
  setor text not null,
  produtos_servicos text not null,
  descricao text,
  nome_contato text not null,
  email_contato text not null,
  telefone_contato text,
  website text,
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'rejeitado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists empresas_status_idx on public.empresas (status);
create index if not exists empresas_pais_idx on public.empresas (pais);
create index if not exists empresas_setor_idx on public.empresas (setor);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists empresas_set_updated_at on public.empresas;
create trigger empresas_set_updated_at
  before update on public.empresas
  for each row execute function public.set_updated_at();

-- RLS
alter table public.empresas enable row level security;

-- Qualquer visitante pode cadastrar (status é sempre 'pendente' por default;
-- o check constraint acima impede valores inválidos).
drop policy if exists "public_insert_empresas" on public.empresas;
create policy "public_insert_empresas"
  on public.empresas for insert
  to anon, authenticated
  with check (status = 'pendente');

-- Qualquer visitante só enxerga registros aprovados.
drop policy if exists "public_select_aprovadas" on public.empresas;
create policy "public_select_aprovadas"
  on public.empresas for select
  to anon
  using (status = 'aprovado');

-- Usuários autenticados (equipe do painel admin) enxergam tudo.
drop policy if exists "admin_select_all" on public.empresas;
create policy "admin_select_all"
  on public.empresas for select
  to authenticated
  using (true);

-- Usuários autenticados podem atualizar status (moderação).
drop policy if exists "admin_update_all" on public.empresas;
create policy "admin_update_all"
  on public.empresas for update
  to authenticated
  using (true)
  with check (true);
