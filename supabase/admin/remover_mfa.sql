-- PROSUL — desativa a autenticação em duas etapas (MFA) para todo o sistema.
-- Supabase > SQL Editor > papel "postgres" > Run. Pode ser executado mais de uma vez.
begin;

-- 1) Acesso administrativo passa a exigir só: conta ativa + papel administrativo
create or replace function public.prosul_staff() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from prosul_members
                where id = auth.uid() and status = 'active' and role <> 'member')
$$;

-- 2) Remove os autenticadores cadastrados (o login deixa de pedir o código)
delete from auth.mfa_factors;

commit;

-- Conferência: mfa_restantes deve ser 0 e os administradores devem aparecer ativos
select (select count(*) from auth.mfa_factors) as mfa_restantes,
       m.email, m.role, m.status
from public.prosul_members m
where m.role <> 'member';
