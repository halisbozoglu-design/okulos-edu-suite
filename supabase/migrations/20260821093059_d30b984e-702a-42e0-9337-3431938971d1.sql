create table if not exists public.institutions (
  institution_code text primary key check (institution_code ~ '^\d{5,10}$'),
  school_name text not null check (char_length(trim(school_name)) >= 3),
  status text not null default 'active' check (status in ('active','suspended','closed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.institution_memberships (
  institution_code text not null references public.institutions(institution_code) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_role text not null check (membership_role in ('principal','vice_principal','guidance_teacher','teacher','staff')),
  is_owner boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (institution_code,user_id)
);
create unique index if not exists one_active_owner_per_institution
  on public.institution_memberships(institution_code) where active and is_owner;

create table if not exists public.principal_recovery_identity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  institution_code text not null references public.institutions(institution_code) on delete cascade,
  email text not null,
  phone text not null check (phone ~ '^05\d{9}$'),
  tckn_masked text not null,
  tckn_hmac text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(institution_code,email)
);

grant select on public.institutions to authenticated;
grant all on public.institutions to service_role;
grant select on public.institution_memberships to authenticated;
grant all on public.institution_memberships to service_role;
grant all on public.principal_recovery_identity to service_role;

alter table public.profiles alter column tckn drop not null;
alter table public.profiles add column if not exists institution_code text references public.institutions(institution_code) on delete set null;

alter table public.institutions enable row level security;
alter table public.institution_memberships enable row level security;
alter table public.principal_recovery_identity enable row level security;

create or replace function public.get_my_institution_code()
returns text
language sql stable security definer set search_path=public as $$
  select m.institution_code
  from public.institution_memberships m
  where m.user_id=auth.uid() and m.active
  order by m.is_owner desc,m.created_at
  limit 1;
$$;
revoke all on function public.get_my_institution_code() from public, anon;
grant execute on function public.get_my_institution_code() to authenticated, service_role;

create or replace function public.is_institution_principal()
returns boolean
language sql stable security definer set search_path=public as $$
  select auth.uid() is not null and exists(
    select 1 from public.institution_memberships m
    where m.user_id=auth.uid() and m.active and m.membership_role='principal'
  );
$$;
revoke all on function public.is_institution_principal() from public, anon;
grant execute on function public.is_institution_principal() to authenticated, service_role;

create or replace function public.can_access_institution(p_institution_code text)
returns boolean
language sql stable security definer set search_path=public as $$
  select auth.uid() is not null and exists(
    select 1 from public.institution_memberships m
    where m.user_id=auth.uid() and m.active and m.institution_code=p_institution_code
  );
$$;
revoke all on function public.can_access_institution(text) from public, anon;
grant execute on function public.can_access_institution(text) to authenticated, service_role;

create or replace function public.get_my_principal_institution_code()
returns text language sql stable security definer set search_path=public as $$
  select coalesce(
    (select m.institution_code from public.institution_memberships m where m.user_id=auth.uid() and m.active and m.membership_role='principal' order by m.is_owner desc,m.created_at limit 1),
    (select p.institution_code from public.institution_principals p where p.user_id=auth.uid() and p.active order by p.assigned_at limit 1)
  );
$$;
revoke all on function public.get_my_principal_institution_code() from public, anon;
grant execute on function public.get_my_principal_institution_code() to authenticated, service_role;

create or replace function public.is_principal_user()
returns boolean language sql stable security definer set search_path=public as $$
  select auth.uid() is not null and not public.is_super_admin() and (
    public.is_institution_principal()
    or exists(select 1 from public.personnel_registry r where r.linked_user_id=auth.uid() and r.system_role='principal' and r.active)
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin')
  );
$$;
revoke all on function public.is_principal_user() from public, anon;
grant execute on function public.is_principal_user() to authenticated, service_role;

drop policy if exists institutions_member_read on public.institutions;
create policy institutions_member_read on public.institutions for select to authenticated
using(public.can_access_institution(institution_code));

drop policy if exists memberships_self_read on public.institution_memberships;
create policy memberships_self_read on public.institution_memberships for select to authenticated
using(user_id=auth.uid());

drop policy if exists memberships_principal_read on public.institution_memberships;
create policy memberships_principal_read on public.institution_memberships for select to authenticated
using(public.is_institution_principal() and public.can_access_institution(institution_code));

revoke all on public.principal_recovery_identity from anon, authenticated;

insert into public.institution_principals(institution_code,user_id,active)
select m.institution_code,m.user_id,m.active
from public.institution_memberships m
where m.membership_role='principal'
on conflict(institution_code,user_id) do update set active=excluded.active;