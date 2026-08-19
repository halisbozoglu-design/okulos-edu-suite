-- OkulOS central academic year / working calendar engine.
-- Schedule, duty, exams and payroll should consume the same date source.

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  starts_on date not null,
  ends_on date not null,
  teacher_work_starts_on date,
  teaching_starts_on date,
  first_term_ends_on date,
  second_term_starts_on date,
  teaching_ends_on date,
  active boolean not null default false,
  source_note text,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  check (teaching_ends_on is null or teaching_starts_on is null or teaching_ends_on >= teaching_starts_on)
);

create unique index if not exists uq_academic_year_one_active on public.academic_years((active)) where active = true;

create table if not exists public.school_calendar_events (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  event_type text not null check (event_type in (
    'holiday','break','professional_work','teaching_day','exam_window','common_exam_window','responsibility_exam_window','ceremony','other'
  )),
  title text not null,
  starts_on date not null,
  ends_on date not null,
  blocks_teaching boolean not null default false,
  counts_as_workday boolean not null default false,
  all_day boolean not null default true,
  note text,
  source_note text,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create index if not exists idx_school_calendar_events_year_dates on public.school_calendar_events(academic_year_id, starts_on, ends_on);

alter table public.academic_years enable row level security;
alter table public.school_calendar_events enable row level security;

grant select on public.academic_years, public.school_calendar_events to authenticated;
grant insert, update, delete on public.academic_years, public.school_calendar_events to authenticated;

create policy "authenticated read academic years" on public.academic_years for select to authenticated using (true);
create policy "authenticated read calendar events" on public.school_calendar_events for select to authenticated using (true);
create policy "managers manage academic years" on public.academic_years for all to authenticated
using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "managers manage calendar events" on public.school_calendar_events for all to authenticated
using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());

create or replace function public.set_active_academic_year(p_academic_year_id uuid)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if not exists(select 1 from public.academic_years where id=p_academic_year_id) then raise exception 'ACADEMIC_YEAR_NOT_FOUND'; end if;
  update public.academic_years set active=false,updated_at=now() where active=true and id<>p_academic_year_id;
  update public.academic_years set active=true,updated_at=now() where id=p_academic_year_id;
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
  select ay from public.academic_years ay where ay.active=true limit 1;
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
begin
  select * into v_year from public.academic_years where active=true limit 1;
  if not found then return false; end if;
  if v_year.teaching_starts_on is null or v_year.teaching_ends_on is null then return false; end if;
  if p_date < v_year.teaching_starts_on or p_date > v_year.teaching_ends_on then return false; end if;
  if extract(isodow from p_date)::int in (6,7) then return false; end if;
  select exists(
    select 1 from public.school_calendar_events e
    where e.academic_year_id=v_year.id and e.blocks_teaching=true and p_date between e.starts_on and e.ends_on
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
  with ay as (select * from public.academic_years where active=true limit 1),
  days as (select generate_series(p_from::timestamp,p_to::timestamp,interval '1 day')::date as d)
  select d.d,
    extract(isodow from d.d)::int between 1 and 5,
    public.is_teaching_day(d.d),
    (
      (extract(isodow from d.d)::int between 1 and 5 and exists(select 1 from ay where d.d between starts_on and ends_on))
      or exists(select 1 from public.school_calendar_events e, ay where e.academic_year_id=ay.id and e.counts_as_workday=true and d.d between e.starts_on and e.ends_on)
    ) and not exists(select 1 from public.school_calendar_events e, ay where e.academic_year_id=ay.id and e.event_type='holiday' and d.d between e.starts_on and e.ends_on) as is_workday,
    coalesce(array(
      select e.title from public.school_calendar_events e, ay
      where e.academic_year_id=ay.id and d.d between e.starts_on and e.ends_on
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
begin
  if not exists(select 1 from public.academic_years where active=true and p_date between starts_on and ends_on) then
    raise exception 'DATE_OUTSIDE_ACTIVE_ACADEMIC_YEAR';
  end if;
  return true;
end;
$$;
revoke all on function public.assert_date_in_active_academic_year(date) from public;
grant execute on function public.assert_date_in_active_academic_year(date) to authenticated;
