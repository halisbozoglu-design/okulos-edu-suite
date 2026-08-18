create table if not exists public.vice_principals (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  active boolean not null default true
);

create table if not exists public.duty_rotation (
  duty_date date primary key,
  vice_principal_id uuid not null references public.vice_principals(user_id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.teacher_duty_assignments (
  duty_date date not null,
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  primary key (duty_date, teacher_id)
);

create table if not exists public.teacher_schedule (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  period smallint not null check (period between 1 and 12),
  class_name text not null,
  subject text not null,
  unique (teacher_id, weekday, period)
);

create table if not exists public.crisis_reports (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  report_date date not null default current_date,
  has_medical_report boolean not null default false,
  note text,
  status text not null default 'open' check (status in ('open', 'assigned', 'closed')),
  created_at timestamptz not null default now(),
  unique (teacher_id, report_date)
);

create table if not exists public.absence_lessons (
  id uuid primary key default gen_random_uuid(),
  crisis_report_id uuid not null references public.crisis_reports(id) on delete cascade,
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  lesson_date date not null,
  period smallint not null check (period between 1 and 12),
  class_name text not null,
  subject text not null,
  unique (teacher_id, lesson_date, period)
);

create table if not exists public.substitute_assignments (
  id uuid primary key default gen_random_uuid(),
  absence_lesson_id uuid not null unique references public.absence_lessons(id) on delete cascade,
  substitute_user_id uuid not null references public.profiles(user_id) on delete restrict,
  assigned_by uuid not null references public.profiles(user_id) on delete restrict,
  assigned_at timestamptz not null default now(),
  notified_at timestamptz
);

create table if not exists public.fcm_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  token text not null unique,
  platform text not null default 'web' check (platform in ('web', 'android', 'ios')),
  updated_at timestamptz not null default now()
);

create index if not exists idx_teacher_schedule_lookup on public.teacher_schedule(teacher_id, weekday, period);
create index if not exists idx_absence_lessons_day on public.absence_lessons(lesson_date, period);
create index if not exists idx_substitute_user_time on public.substitute_assignments(substitute_user_id, assigned_at);
create index if not exists idx_fcm_tokens_user on public.fcm_tokens(user_id);

alter table public.vice_principals enable row level security;
alter table public.duty_rotation enable row level security;
alter table public.teacher_duty_assignments enable row level security;
alter table public.teacher_schedule enable row level security;
alter table public.crisis_reports enable row level security;
alter table public.absence_lessons enable row level security;
alter table public.substitute_assignments enable row level security;
alter table public.fcm_tokens enable row level security;

grant select on public.duty_rotation, public.vice_principals, public.teacher_duty_assignments, public.teacher_schedule to authenticated;
grant select, insert on public.crisis_reports to authenticated;
grant select on public.absence_lessons, public.substitute_assignments to authenticated;
grant select, insert, update, delete on public.fcm_tokens to authenticated;

create policy "authenticated can read duty rotation" on public.duty_rotation for select to authenticated using (true);
create policy "authenticated can read vice principals" on public.vice_principals for select to authenticated using (true);
create policy "authenticated can read duty teachers" on public.teacher_duty_assignments for select to authenticated using (true);
create policy "authenticated can read schedules" on public.teacher_schedule for select to authenticated using (true);

create policy "teacher can read own crisis" on public.crisis_reports for select to authenticated
using (teacher_id = (select auth.uid()) or public.is_admin() or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'manager'));
create policy "teacher can create own crisis" on public.crisis_reports for insert to authenticated
with check (teacher_id = (select auth.uid()));

create policy "teacher can read own absence lessons" on public.absence_lessons for select to authenticated
using (teacher_id = (select auth.uid()) or public.is_admin() or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'manager'));

create policy "assigned teacher can read assignments" on public.substitute_assignments for select to authenticated
using (
  substitute_user_id = (select auth.uid())
  or public.is_admin()
  or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'manager')
);

create policy "users manage own fcm tokens" on public.fcm_tokens for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create or replace function public.is_manager_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = (select auth.uid()) and role in ('manager', 'admin')
  );
$$;

revoke all on function public.is_manager_or_admin() from public;
grant execute on function public.is_manager_or_admin() to authenticated;

create policy "managers can read operational profiles"
on public.profiles for select to authenticated
using (public.is_manager_or_admin());

create or replace function public.assign_substitutes_for_day(p_date date default current_date)
returns table (
  assignment_id uuid,
  absence_lesson_id uuid,
  substitute_user_id uuid,
  substitute_name text,
  period smallint,
  class_name text,
  subject text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lesson record;
  v_candidate uuid;
begin
  if not public.is_manager_or_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  for v_lesson in
    select al.*
    from public.absence_lessons al
    left join public.substitute_assignments sa on sa.absence_lesson_id = al.id
    where al.lesson_date = p_date and sa.id is null
    order by al.period, al.class_name
  loop
    with candidate_pool as (
      select tda.teacher_id as user_id, 1 as priority
      from public.teacher_duty_assignments tda
      join public.profiles p on p.user_id = tda.teacher_id and p.role = 'teacher'
      where tda.duty_date = p_date

      union all

      select dr.vice_principal_id, 2
      from public.duty_rotation dr
      where dr.duty_date = p_date

      union all

      select vp.user_id, 3
      from public.vice_principals vp
      where vp.active = true
        and vp.user_id <> coalesce((select dr.vice_principal_id from public.duty_rotation dr where dr.duty_date = p_date), '00000000-0000-0000-0000-000000000000'::uuid)
    ), eligible as (
      select distinct on (cp.user_id)
        cp.user_id,
        cp.priority,
        (
          select count(*)
          from public.substitute_assignments sa2
          where sa2.substitute_user_id = cp.user_id
            and sa2.assigned_at >= date_trunc('month', p_date::timestamp)
            and sa2.assigned_at < date_trunc('month', p_date::timestamp) + interval '1 month'
        ) as monthly_load
      from candidate_pool cp
      where cp.user_id <> v_lesson.teacher_id
        and not exists (
          select 1 from public.crisis_reports cr
          where cr.teacher_id = cp.user_id and cr.report_date = p_date and cr.status <> 'closed'
        )
        and not exists (
          select 1 from public.teacher_schedule ts
          where ts.teacher_id = cp.user_id
            and ts.weekday = extract(isodow from p_date)::smallint
            and ts.period = v_lesson.period
        )
        and not exists (
          select 1
          from public.substitute_assignments sa3
          join public.absence_lessons al3 on al3.id = sa3.absence_lesson_id
          where sa3.substitute_user_id = cp.user_id
            and al3.lesson_date = p_date
            and al3.period = v_lesson.period
        )
      order by cp.user_id, cp.priority
    )
    select e.user_id into v_candidate
    from eligible e
    order by e.priority, e.monthly_load, e.user_id
    limit 1;

    if v_candidate is null then
      raise exception 'NO_SUBSTITUTE_AVAILABLE: period %, class %', v_lesson.period, v_lesson.class_name;
    end if;

    insert into public.substitute_assignments(absence_lesson_id, substitute_user_id, assigned_by)
    values (v_lesson.id, v_candidate, (select auth.uid()));
  end loop;

  update public.crisis_reports cr
  set status = 'assigned'
  where cr.report_date = p_date
    and not exists (
      select 1
      from public.absence_lessons al
      left join public.substitute_assignments sa on sa.absence_lesson_id = al.id
      where al.crisis_report_id = cr.id and sa.id is null
    );

  return query
  select sa.id, al.id, sa.substitute_user_id, p.full_name, al.period, al.class_name, al.subject
  from public.substitute_assignments sa
  join public.absence_lessons al on al.id = sa.absence_lesson_id
  join public.profiles p on p.user_id = sa.substitute_user_id
  where al.lesson_date = p_date
  order by al.period, al.class_name;
end;
$$;

revoke all on function public.assign_substitutes_for_day(date) from public;
grant execute on function public.assign_substitutes_for_day(date) to authenticated;
