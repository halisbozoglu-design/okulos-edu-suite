-- SmartBoard daily lifecycle projection from OkulOS academic data.
-- Runtime integration never depends on a Lovable token.

create table if not exists public.institution_period_times (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  period smallint not null check (period between 1 and 20),
  starts_at time not null,
  ends_at time not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (institution_code, academic_year_id, weekday, period)
);

-- Non-weekly uses such as DYK, etut, exam, event and manual reservation.
-- This is a normalized OkulOS scheduling source, not a SmartBoard-local duplicate user entry.
create table if not exists public.institution_schedule_events (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  academic_year_id uuid references public.academic_years(id) on delete cascade,
  section_instance_id uuid references public.section_instances(id) on delete set null,
  physical_room_id uuid not null references public.physical_rooms(id) on delete restrict,
  teacher_id uuid references public.profiles(user_id) on delete set null,
  event_date date not null,
  starts_at time not null,
  ends_at time not null,
  event_kind text not null check (event_kind in ('DYK','COURSE','ETUT','EXAM','EVENT','RESERVATION','OTHER')),
  title text not null,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- School calendar override. CLOSED suppresses weekly lessons but explicit schedule events may still run.
create table if not exists public.institution_calendar_days (
  institution_code text not null,
  calendar_date date not null,
  day_mode text not null check (day_mode in ('NORMAL','CLOSED','SPECIAL')),
  note text,
  suppress_weekly_lessons boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (institution_code, calendar_date)
);

create table if not exists public.smartboard_power_policies (
  institution_code text primary key,
  wake_lead_minutes integer not null default 20 check (wake_lead_minutes between 1 and 120),
  lobby_lead_minutes integer not null default 15 check (lobby_lead_minutes between 0 and 120),
  wol_retry_from_minutes integer not null default 19 check (wol_retry_from_minutes between 0 and 120),
  shutdown_warning_minutes integer not null default 5 check (shutdown_warning_minutes between 1 and 60),
  short_break_max_minutes integer not null default 20 check (short_break_max_minutes between 1 and 180),
  long_gap_shutdown_minutes integer not null default 60 check (long_gap_shutdown_minutes between 10 and 360),
  break_display_mode text not null default 'SIGNAGE' check (break_display_mode in ('SIGNAGE','SCHOOL_TV','CLOCK','SLEEP')),
  default_after_day_action text not null default 'SHUTDOWN' check (default_after_day_action in ('SHUTDOWN','SUSPEND','KEEP_ON')),
  updated_at timestamptz not null default now()
);

create index if not exists idx_schedule_events_room_day
  on public.institution_schedule_events(institution_code, physical_room_id, event_date, starts_at)
  where active=true;
create index if not exists idx_period_times_lookup
  on public.institution_period_times(institution_code, academic_year_id, weekday, period);

-- Resolve all usable blocks for one board/day. Weekly lessons are suppressed on CLOSED days.
-- Teacher absence without a substitute invalidates the weekly lesson; a substitute becomes effective teacher.
create or replace function public.smartboard_day_activities(
  p_institution_code text,
  p_device_key text,
  p_day date
)
returns table(
  source_kind text,
  source_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  section_instance_id uuid,
  section_name text,
  subject_or_title text,
  scheduled_teacher_id uuid,
  effective_teacher_id uuid,
  teacher_available boolean,
  physical_room_id uuid
)
language sql
stable
security definer
set search_path=public
as $$
with board_room as (
  select b.physical_room_id
  from public.smartboard_room_bindings b
  where b.institution_code=p_institution_code
    and b.smartboard_device_key=p_device_key
    and b.active=true
    and b.valid_from <= (p_day::timestamp + interval '23 hours 59 minutes 59 seconds')
    and (b.valid_until is null or b.valid_until >= p_day::timestamp)
  order by b.valid_from desc limit 1
), cal as (
  select coalesce((select suppress_weekly_lessons from public.institution_calendar_days c
                   where c.institution_code=p_institution_code and c.calendar_date=p_day),false) suppress_weekly
), weekly as (
  select 'LESSON'::text source_kind,
         ts.id source_id,
         (p_day + pt.starts_at)::timestamptz starts_at,
         (p_day + pt.ends_at)::timestamptz ends_at,
         ts.section_instance_id,
         coalesce(si.display_name,ts.class_name) section_name,
         ts.subject subject_or_title,
         ts.teacher_id scheduled_teacher_id,
         coalesce(sa.substitute_user_id,ts.teacher_id) effective_teacher_id,
         case when al.id is null then true when sa.id is not null then true else false end teacher_available,
         public.resolve_lesson_room(ts.id,p_day) physical_room_id
  from public.teacher_schedule ts
  join public.institution_period_times pt
    on pt.institution_code=ts.institution_code
   and pt.academic_year_id=ts.academic_year_id
   and pt.weekday=ts.weekday and pt.period=ts.period
  left join public.section_instances si on si.id=ts.section_instance_id and si.institution_code=ts.institution_code
  left join public.absence_lessons al on al.teacher_id=ts.teacher_id and al.lesson_date=p_day and al.period=ts.period
  left join public.substitute_assignments sa on sa.absence_lesson_id=al.id
  cross join cal
  where ts.institution_code=p_institution_code
    and ts.weekday=extract(isodow from p_day)::smallint
    and cal.suppress_weekly=false
), explicit_events as (
  select e.event_kind::text source_kind,
         e.id source_id,
         (e.event_date + e.starts_at)::timestamptz starts_at,
         (e.event_date + e.ends_at)::timestamptz ends_at,
         e.section_instance_id,
         si.display_name section_name,
         e.title subject_or_title,
         e.teacher_id scheduled_teacher_id,
         e.teacher_id effective_teacher_id,
         true teacher_available,
         e.physical_room_id
  from public.institution_schedule_events e
  left join public.section_instances si on si.id=e.section_instance_id and si.institution_code=e.institution_code
  where e.institution_code=p_institution_code and e.event_date=p_day and e.active=true
), all_rows as (
  select * from weekly
  union all
  select * from explicit_events
)
select a.*
from all_rows a join board_room br on br.physical_room_id=a.physical_room_id
where a.teacher_available=true
order by a.starts_at,a.ends_at,a.source_kind;
$$;

-- Board-ready daily payload. Local Hub/board can cache this payload and run offline.
create or replace function public.smartboard_daily_plan(
  p_institution_code text,
  p_device_key text,
  p_day date
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_policy public.smartboard_power_policies%rowtype;
  v_first timestamptz;
  v_last timestamptz;
  v_activities jsonb;
begin
  if auth.role() <> 'service_role' and not public.has_institution_access(p_institution_code) then
    raise exception 'TENANT_ACCESS_DENIED';
  end if;

  select * into v_policy from public.smartboard_power_policies where institution_code=p_institution_code;
  if not found then
    v_policy.institution_code := p_institution_code;
    v_policy.wake_lead_minutes := 20;
    v_policy.lobby_lead_minutes := 15;
    v_policy.wol_retry_from_minutes := 19;
    v_policy.shutdown_warning_minutes := 5;
    v_policy.short_break_max_minutes := 20;
    v_policy.long_gap_shutdown_minutes := 60;
    v_policy.break_display_mode := 'SIGNAGE';
    v_policy.default_after_day_action := 'SHUTDOWN';
  end if;

  select min(a.starts_at),max(a.ends_at),coalesce(jsonb_agg(to_jsonb(a) order by a.starts_at,a.ends_at),'[]'::jsonb)
    into v_first,v_last,v_activities
  from public.smartboard_day_activities(p_institution_code,p_device_key,p_day) a;

  return jsonb_build_object(
    'institutionCode',p_institution_code,
    'deviceKey',p_device_key,
    'date',p_day,
    'hasUsage',v_first is not null,
    'wakeAt',case when v_first is null then null else v_first-make_interval(mins=>v_policy.wake_lead_minutes) end,
    'lobbyAt',case when v_first is null then null else v_first-make_interval(mins=>v_policy.lobby_lead_minutes) end,
    'wolFallbackAt',case when v_first is null then null else v_first-make_interval(mins=>v_policy.wol_retry_from_minutes) end,
    'lastUsageEndsAt',v_last,
    'shutdownWarningAt',case when v_last is null then null else v_last end,
    'shutdownAt',case when v_last is null then null else v_last+make_interval(mins=>v_policy.shutdown_warning_minutes) end,
    'policy',jsonb_build_object(
      'shutdownWarningMinutes',v_policy.shutdown_warning_minutes,
      'shortBreakMaxMinutes',v_policy.short_break_max_minutes,
      'longGapShutdownMinutes',v_policy.long_gap_shutdown_minutes,
      'breakDisplayMode',v_policy.break_display_mode,
      'afterDayAction',v_policy.default_after_day_action
    ),
    'activities',v_activities
  );
end $$;

alter table public.institution_period_times enable row level security;
alter table public.institution_schedule_events enable row level security;
alter table public.institution_calendar_days enable row level security;
alter table public.smartboard_power_policies enable row level security;

do $$ begin create policy "tenant read period times" on public.institution_period_times for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;
do $$ begin create policy "tenant read schedule events" on public.institution_schedule_events for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;
do $$ begin create policy "tenant read calendar days" on public.institution_calendar_days for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;
do $$ begin create policy "tenant read smartboard power policies" on public.smartboard_power_policies for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;

do $$ begin create policy "managers manage period times" on public.institution_period_times for all to authenticated using(public.has_institution_access(institution_code) and public.is_manager_or_admin()) with check(public.has_institution_access(institution_code) and public.is_manager_or_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "managers manage schedule events" on public.institution_schedule_events for all to authenticated using(public.has_institution_access(institution_code) and public.is_manager_or_admin()) with check(public.has_institution_access(institution_code) and public.is_manager_or_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "managers manage calendar days" on public.institution_calendar_days for all to authenticated using(public.has_institution_access(institution_code) and public.is_manager_or_admin()) with check(public.has_institution_access(institution_code) and public.is_manager_or_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "managers manage smartboard power policies" on public.smartboard_power_policies for all to authenticated using(public.has_institution_access(institution_code) and public.is_manager_or_admin()) with check(public.has_institution_access(institution_code) and public.is_manager_or_admin()); exception when duplicate_object then null; end $$;

grant select on public.institution_period_times,public.institution_schedule_events,public.institution_calendar_days,public.smartboard_power_policies to authenticated;
grant all on public.institution_period_times,public.institution_schedule_events,public.institution_calendar_days,public.smartboard_power_policies to service_role;
grant execute on function public.smartboard_day_activities(text,text,date) to authenticated,service_role;
grant execute on function public.smartboard_daily_plan(text,text,date) to authenticated,service_role;
