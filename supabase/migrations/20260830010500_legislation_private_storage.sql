-- Legislation attachments are accessed through short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('legislation', 'legislation', false)
on conflict (id) do update set public = false;

create policy legislation_files_read_authenticated_v1
on storage.objects for select to authenticated
using (bucket_id = 'legislation');

create policy legislation_files_insert_manager_v1
on storage.objects for insert to authenticated
with check (bucket_id = 'legislation' and public.is_manager_or_admin());

create policy legislation_files_update_manager_v1
on storage.objects for update to authenticated
using (bucket_id = 'legislation' and public.is_manager_or_admin())
with check (bucket_id = 'legislation' and public.is_manager_or_admin());

create policy legislation_files_delete_manager_v1
on storage.objects for delete to authenticated
using (bucket_id = 'legislation' and public.is_manager_or_admin());
