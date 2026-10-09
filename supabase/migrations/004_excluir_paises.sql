-- PROSUL — exclusão de registros, países participantes e acesso sem MFA.
-- Aplicar depois de 003_storage_fotos.sql. Pode ser reaplicada.
-- Rodar no SQL Editor com o seletor de papel em "postgres".
begin;

-- 1) Novo tipo de conteúdo: país participante (bandeira + representante)
alter table public.prosul_resources drop constraint if exists prosul_resources_kind_check;
alter table public.prosul_resources add constraint prosul_resources_kind_check check(kind in('page','news','video','document','event','school','journey','program','course','module','lesson','class','organization','asset','maintenance','inventory','loan','initiative','opportunity','legislative','about','photo','country'));

-- 2) Acesso administrativo sem MFA (decisão do proprietário — já aplicada manualmente)
create or replace function public.prosul_staff() returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select exists(select 1 from prosul_members where id=auth.uid() and status='active' and role<>'member')
$$;

-- 3) Editores também gerenciam países participantes
create or replace function public.prosul_can(k text) returns boolean language sql stable security definer set search_path=public,pg_temp as $$select prosul_staff() and exists(select 1 from prosul_members where id=auth.uid() and (role='admin' or role='editor' and k in('about','photo','country','page','news','video','document','event','initiative','opportunity','legislative') or role='academy' and k in('school','journey','program','course','module','lesson','class') or role='operations' and k in('organization','asset','maintenance','inventory','loan')))$$;

-- 4) Exclusão definitiva de um registro (com auditoria)
create or replace function public.prosul_delete(p_id uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r prosul_resources;
begin
  select * into r from prosul_resources where id=p_id for update;
  if not found then raise exception 'Registro inexistente'; end if;
  if not prosul_can(r.kind) then raise exception 'Permissão insuficiente'; end if;
  if exists(select 1 from prosul_resources where parent_id=p_id) then
    raise exception 'Há registros vinculados a este item';
  end if;
  delete from prosul_resources where id=p_id;
  insert into prosul_audit(actor,action,resource_id,details)
  values(auth.uid(),'resource.deleted',p_id,jsonb_build_object('kind',r.kind,'title',r.title,'data',r.data));
  return r.data;
end$$;
revoke all on function public.prosul_delete(uuid) from public, anon;
grant execute on function public.prosul_delete(uuid) to authenticated;

commit;
