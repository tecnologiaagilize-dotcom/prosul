-- PROSUL — armazenamento de fotos enviadas pelo admin (Supabase Storage).
-- Aplicar depois de 002_public_media.sql. Pode ser reaplicada.
-- Rodar no SQL Editor com o seletor de papel em "postgres".
begin;

-- Bucket público (leitura aberta) — até 10 MB por arquivo, só imagens.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('prosul-fotos', 'prosul-fotos', true, 10485760,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Somente quem pode gerenciar a galeria (admin/editor) envia, troca ou apaga.
drop policy if exists prosul_fotos_insert on storage.objects;
drop policy if exists prosul_fotos_update on storage.objects;
drop policy if exists prosul_fotos_delete on storage.objects;
drop policy if exists prosul_fotos_select on storage.objects;

create policy prosul_fotos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'prosul-fotos' and public.prosul_can('photo'));
create policy prosul_fotos_update on storage.objects for update to authenticated
  using (bucket_id = 'prosul-fotos' and public.prosul_can('photo'))
  with check (bucket_id = 'prosul-fotos' and public.prosul_can('photo'));
create policy prosul_fotos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'prosul-fotos' and public.prosul_can('photo'));
create policy prosul_fotos_select on storage.objects for select to authenticated
  using (bucket_id = 'prosul-fotos' and public.prosul_can('photo'));

commit;
