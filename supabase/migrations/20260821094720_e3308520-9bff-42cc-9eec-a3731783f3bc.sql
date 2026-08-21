-- Phase 1 closure: academic year is a tenant-scoped authority.
-- Fix legacy global uniqueness/active-year constraints and harden chronology + RPC scope.

-- Legacy academic_years was created before tenantization with global uniqueness.
-- Every institution must be able to own the same code (for example 2026-2027)
-- and exactly one active year per institution.
alter table public.academic_years drop constraint if exists academic_years_code_key;
drop index if exists public.uq_academic_year_one_active;

create unique index if not exists uq_academic_year_tenant_code
  on public.academic_years(institution_code, code);
create unique index if not exists uq_academic_year_one_active_per_tenant
  on public.academic_years(institution_code)
  where active = true;

-- Chronology must be internally coherent. Optional dates may be omitted, but when present
-- they must remain inside the academic-year envelope and in chronological order.
alter table public.academic_years drop constraint if exists academic_year_chronology_v2;
alter table public.academic_years add constraint academic_year_chronology_v2 check (
  ends_on > starts_on
  and (teacher_work_starts_on is null or teacher_work_starts_on between starts_on and ends_on)
  and (teaching_starts_on is null or teaching_starts_on between starts_on and ends_on)
  and (first_term_ends_on is null or first_term_ends_on between starts_on and ends_on)
  and (second_term_starts_on is null or second_term_starts_on between starts_on and ends_on)
  and (teaching_ends_on is null or teaching_ends_on between starts_on and ends_on)
  and (teacher_work_starts_on is null or teaching_starts_on is null or teacher_work_starts_on <= teaching_starts_on)
  and (teaching_starts_on is null or first_term_ends_on is null or teaching_starts_on < first_term_ends_on)
  and (first_term_ends_on is null or second_term_starts_on is null or first_term_ends_on < second_term_starts_on)
  and (second_term_starts_on is null or teaching_ends_on is null or second_term_starts_on < teaching_ends_on)
  and (teaching_starts_on is null or teaching_ends_on is null or teaching_starts_on < teaching_ends_on)
) not valid;
alter table public.academic_years validate constraint academic_year_chronology_v2;

-- Delegated settings managers may manage the central academic-year/calendar authority.
drop policy if exists "delegated settings managers manage academic years" on public.academic_years;
create policy "delegated settings managers manage academic years" on public.academic_years
for all to authenticated
using (public.has_permission('settings.manage'))
with check (public.has_permission('settings.manage'));

drop policy if exists "delegated settings managers manage calendar events" on public.school_calendar_events;
create policy "delegated settings managers manage calendar events" on public.school_calendar_events
for all to authenticated
using (public.has_permission('settings.manage'))
with check (public.has_permission('settings.manage'));

-- Calendar rows must always point to an academic year belonging to the same institution.
create or replace function public.enforce_calendar_academic_year_tenant()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_year_tenant text;
begin
  select institution_code into v_year_tenant
  from public.academic_years
  where id = new.academic_year_id;

  if v_year_tenant is null then
    raise exception 'ACADEMIC_YEAR_NOT_FOUND';
  end if;
  if new.institution_code is null then
    new.institution_code := v_year_tenant;
  end if;
  if new.institution_code <> v_year_tenant then
    raise exception 'ACADEMIC_YEAR_TENANT_MISMATCH';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_calendar_academic_year_tenant() from public;

drop trigger if exists trg_calendar_academic_year_tenant on public.school_calendar_events;
create trigger trg_calendar_academic_year_tenant
before insert or update of academic_year_id,institution_code on public.school_calendar_events
for each row execute function public.enforce_calendar_academic_year_tenant();

-- Central active-year switch: only settings managers, only inside the caller tenant.
create or replace function public.set_active_academic_year(p_academic_year_id uuid)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare
  v_tenant text;
begin
  if not public.has_permission('settings.manage') then
    raise exception 'PERMISSION_DENIED: settings.manage';
  end if;
  v_tenant := public.current_tenant_code();
  if v_tenant is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if not exists(
    select 1 from public.academic_years
    where id=p_academic_year_id and institution_code=v_tenant
  ) then
    raise exception 'ACADEMIC_YEAR_NOT_FOUND';
  end if;

  update public.academic_years
  set active=false,updated_at=now()
  where institution_code=v_tenant and active=true and id<>p_academic_year_id;

  update public.academic_years
  set active=true,updated_at=now()
  where id=p_academic_year_id and institution_code=v_tenant;
  return true;
end;
$$;
revoke all on function public.set_active_academic_year(uuid) from public;
grant execute on function public.set_active_academic_year(uuid) to authenticated;

create or replace function public.get_active_academic_year()
returns public.academic_years
language sql
stable
security definer
set search_path=public
as $$
  select ay
  from public.academic_years ay
  where ay.active=true
    and ay.institution_code=public.current_tenant_code()
  limit 1;
$$;
revoke all on function public.get_active_academic_year() from public;
grant execute on function public.get_active_academic_year() to authenticated;

create or replace function public.is_teaching_day(p_date date)
returns boolean
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_year public.academic_years%rowtype;
  v_block boolean;
  v_tenant text := public.current_tenant_code();
begin
  if v_tenant is null then return false; end if;
  select * into v_year
  from public.academic_years
  where active=true and institution_code=v_tenant
  limit 1;
  if not found then return false; end if;
  if v_year.teaching_starts_on is null or v_year.teaching_ends_on is null then return false; end if;
  if p_date < v_year.teaching_starts_on or p_date > v_year.teaching_ends_on then return false; end if;
  if extract(isodow from p_date)::int in (6,7) then return false; end if;

  select exists(
    select 1 from public.school_calendar_events e
    where e.institution_code=v_tenant
      and e.academic_year_id=v_year.id
      and e.blocks_teaching=true
      and p_date between e.starts_on and e.ends_on
  ) into v_block;
  return not v_block;
end;
$$;
revoke all on function public.is_teaching_day(date) from public;
grant execute on function public.is_teaching_day(date) to authenticated;

create or replace function public.get_calendar_days(p_from date, p_to date)
returns table(
  day_date date,
  is_weekday boolean,
  is_teaching_day boolean,
  is_workday boolean,
  event_titles text[]
)
language sql
stable
security definer
set search_path=public
as $$
  with tenant as (select public.current_tenant_code() as code),
  ay as (
    select a.* from public.academic_years a, tenant t
    where a.active=true and a.institution_code=t.code limit 1
  ),
  days as (select generate_series(p_from::timestamp,p_to::timestamp,interval '1 day')::date as d)
  select d.d,
    extract(isodow from d.d)::int between 1 and 5,
    public.is_teaching_day(d.d),
    (
      (extract(isodow from d.d)::int between 1 and 5 and exists(select 1 from ay where d.d between starts_on and ends_on))
      or exists(select 1 from public.school_calendar_events e, ay where e.institution_code=ay.institution_code and e.academic_year_id=ay.id and e.counts_as_workday=true and d.d between e.starts_on and e.ends_on)
    ) and not exists(select 1 from public.school_calendar_events e, ay where e.institution_code=ay.institution_code and e.academic_year_id=ay.id and e.event_type='holiday' and d.d between e.starts_on and e.ends_on) as is_workday,
    coalesce(array(
      select e.title from public.school_calendar_events e, ay
      where e.institution_code=ay.institution_code and e.academic_year_id=ay.id and d.d between e.starts_on and e.ends_on
      order by e.starts_on,e.title
    ),array[]::text[]) as event_titles
  from days d
  order by d.d;
$$;
revoke all on function public.get_calendar_days(date,date) from public;
grant execute on function public.get_calendar_days(date,date) to authenticated;

create or replace function public.assert_date_in_active_academic_year(p_date date)
returns boolean
language plpgsql
stable
security definer
set search_path=public
as $$
declare v_tenant text := public.current_tenant_code();
begin
  if v_tenant is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if not exists(
    select 1 from public.academic_years
    where institution_code=v_tenant and active=true and p_date between starts_on and ends_on
  ) then
    raise exception 'DATE_OUTSIDE_ACTIVE_ACADEMIC_YEAR';
  end if;
  return true;
end;
$$;
revoke all on function public.assert_date_in_active_academic_year(date) from public;
grant execute on function public.assert_date_in_active_academic_year(date) to authenticated;