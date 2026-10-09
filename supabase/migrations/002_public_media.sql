-- Aplicar depois de 001_prosul.sql. Pode ser reaplicada. Não altera usuários.
begin;
alter table public.prosul_resources drop constraint if exists prosul_resources_kind_check;
alter table public.prosul_resources add constraint prosul_resources_kind_check check(kind in('page','news','video','document','event','school','journey','program','course','module','lesson','class','organization','asset','maintenance','inventory','loan','initiative','opportunity','legislative','about','photo'));
create or replace function public.prosul_can(k text) returns boolean language sql stable security definer set search_path=public,pg_temp as $$select prosul_staff() and exists(select 1 from prosul_members where id=auth.uid() and (role='admin' or role='editor' and k in('about','photo','page','news','video','document','event','initiative','opportunity','legislative') or role='academy' and k in('school','journey','program','course','module','lesson','class') or role='operations' and k in('organization','asset','maintenance','inventory','loan')))$$;

commit;
