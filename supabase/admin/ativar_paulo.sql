-- Execute manualmente no SQL Editor APÓS cadastro e confirmação do e-mail.
-- Não contém senha e não cria nem altera credenciais do Supabase Auth.
begin;
do $$
declare uid uuid;
begin
  select id into uid from auth.users
  where lower(email)='pauloinvesst74@gmail.com' and email_confirmed_at is not null;
  if uid is null then
    raise exception 'Cadastre pauloinvesst74@gmail.com e confirme o e-mail antes de ativar o administrador.';
  end if;
  insert into public.prosul_members(id,name,email,status,role)
  values(uid,'Paulo Roberto Ribeiro da Rocha','pauloinvesst74@gmail.com','active','admin')
  on conflict(id) do update set status='active',role='admin';
  insert into public.prosul_audit(actor,action,resource_id,details)
  values(uid,'admin.bootstrap',uid,'{"method":"manual_sql_owner"}'::jsonb);
end $$;
commit;
select email,status,role from public.prosul_members where lower(email)='pauloinvesst74@gmail.com';
