create type public.app_role as enum ('admin', 'manager', 'teacher');

create table if not exists public.pre_registered_teachers (
  id uuid primary key default gen_random_uuid(),
  tckn text not null unique check (tckn ~ '^\d{11}$'),
  email text,
  full_name text not null,
  role public.app_role not null default 'teacher',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tckn text not null unique check (tckn ~ '^\d{11}$'),
  email text,
  full_name text,
  role public.app_role not null default 'teacher',
  blood_type text,
  phone text,
  emergency_contact text,
  updated_at timestamptz not null default now()
);

alter table public.pre_registered_teachers enable row level security;
alter table public.profiles enable row level security;

revoke all on public.pre_registered_teachers from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

create policy "users can read own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users can insert own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users can update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

create policy "admins can read all profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

create policy "admins can update all profiles"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
