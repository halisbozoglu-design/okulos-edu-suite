create table if not exists public.legislation_library (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  legislation_type text not null default 'other',
  topic text,
  school_levels text[] not null default '{}',
  school_types text[] not null default '{}',
  source_url text,
  file_url text,
  effective_on date,
  notes text,
  tags text[] not null default '{}',
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legislation_shares (
  id uuid primary key default gen_random_uuid(),
  legislation_id uuid not null references public.legislation_library(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text,
  read_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(legislation_id,user_id)
);

alter table public.legislation_library enable row level security;
alter table public.legislation_shares enable row level security;

drop policy if exists legislation_library_read on public.legislation_library;
create policy legislation_library_read on public.legislation_library for select to authenticated using (active);
drop policy if exists legislation_library_manage on public.legislation_library;
create policy legislation_library_manage on public.legislation_library for all to authenticated using (public.has_permission(auth.uid(),'settings.manage')) with check (public.has_permission(auth.uid(),'settings.manage'));

drop policy if exists legislation_shares_read on public.legislation_shares;
create policy legislation_shares_read on public.legislation_shares for select to authenticated using (user_id=auth.uid() or public.has_permission(auth.uid(),'settings.manage'));
drop policy if exists legislation_shares_manage on public.legislation_shares;
create policy legislation_shares_manage on public.legislation_shares for all to authenticated using (public.has_permission(auth.uid(),'settings.manage')) with check (public.has_permission(auth.uid(),'settings.manage'));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('legislation','legislation',false,20971520,array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

drop policy if exists legislation_storage_read on storage.objects;
create policy legislation_storage_read on storage.objects for select to authenticated using (bucket_id='legislation');
drop policy if exists legislation_storage_manage on storage.objects;
create policy legislation_storage_manage on storage.objects for all to authenticated using (bucket_id='legislation' and public.has_permission(auth.uid(),'settings.manage')) with check (bucket_id='legislation' and public.has_permission(auth.uid(),'settings.manage'));
