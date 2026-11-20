-- 004_storage.sql
-- Public media bucket for product and blog images.

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read site media" on storage.objects;
create policy "Public read site media" on storage.objects
  for select using (bucket_id = 'site-media');

drop policy if exists "Admin insert site media" on storage.objects;
create policy "Admin insert site media" on storage.objects
  for insert with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "Admin update site media" on storage.objects;
create policy "Admin update site media" on storage.objects
  for update using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "Admin delete site media" on storage.objects;
create policy "Admin delete site media" on storage.objects
  for delete using (bucket_id = 'site-media' and public.is_admin());
