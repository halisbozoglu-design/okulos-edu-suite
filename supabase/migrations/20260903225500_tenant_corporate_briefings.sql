begin;

create table if not exists public.institution_briefings (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null references public.institutions(institution_code) on update cascade on delete cascade,
  academic_year text not null,
  status text not null default 'draft' check (status in ('draft','approved','archived')),
  draft jsonb not null default '{}'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  asset_manifest jsonb not null default '{}'::jsonb,
  created_by uuid not null default auth.uid(),
  updated_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institution_code, academic_year)
);

alter table public.institution_briefings enable row level security;

create policy institution_briefings_select
on public.institution_briefings
for select
to authenticated
using (
  public.can_access_institution(institution_code)
  or public.is_super_admin()
);

create policy institution_briefings_insert
on public.institution_briefings
for insert
to authenticated
with check (
  institution_code = public.current_tenant_code()
  and public.can_access_institution(institution_code)
);

create policy institution_briefings_update
on public.institution_briefings
for update
to authenticated
using (
  public.can_access_institution(institution_code)
  or public.is_super_admin()
)
with check (
  public.can_access_institution(institution_code)
  or public.is_super_admin()
);

create policy institution_briefings_delete
on public.institution_briefings
for delete
to authenticated
using (
  public.can_access_institution(institution_code)
  or public.is_super_admin()
);

create or replace function public.touch_institution_briefing()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_touch_institution_briefing on public.institution_briefings;
create trigger trg_touch_institution_briefing
before update on public.institution_briefings
for each row execute function public.touch_institution_briefing();

insert into public.tenant_scope_registry(table_name, scope, note, updated_at)
values ('institution_briefings','tenant','Kurumsal brifing taslakları ve bölüm düzeni institution_code ile tenant bazında izole edilir.',now())
on conflict (table_name) do update
set scope=excluded.scope, note=excluded.note, updated_at=excluded.updated_at;

commit;