-- OPCIONAL: cadastra os 12 países da América do Sul como "Países participantes",
-- publicados e com "Representante a definir". Depois edite/exclua no admin.
-- Não duplica países já cadastrados. Rodar com o papel "postgres".
do $$
declare
  owner uuid := (select id from public.prosul_members where role='admin' and status='active' order by created_at limit 1);
  c record; rid uuid; i int := 0;
begin
  if owner is null then raise exception 'Nenhum administrador ativo encontrado.'; end if;
  for c in select * from (values
    ('AR','Argentina'),('BO','Bolívia'),('BR','Brasil'),('CL','Chile'),
    ('CO','Colômbia'),('EC','Equador'),('GY','Guiana'),('PY','Paraguai'),
    ('PE','Peru'),('SR','Suriname'),('UY','Uruguai'),('VE','Venezuela')) v(code,name)
  loop
    i := i + 1;
    continue when exists(select 1 from public.prosul_resources where kind='country' and data->>'code'=c.code);
    rid := gen_random_uuid();
    insert into public.prosul_resources(id,kind,title,position,status,data,created_by)
    values(rid,'country',c.name,i*10,'published',jsonb_build_object('code',c.code),owner);
    update public.prosul_resources set published=jsonb_build_object('id',id,'kind',kind,'title',title,'summary',summary,'body',body,'country',country,'theme',theme,'parent_id',parent_id,'position',position,'data',data,'version',version,'status','published','updated_at',updated_at)
    where id=rid;
  end loop;
end $$;
select title, data->>'code' as codigo, position from public.prosul_resources where kind='country' order by position;
