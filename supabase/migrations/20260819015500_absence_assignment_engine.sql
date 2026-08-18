create table if not exists public.school_classes (
  id uuid primary key default gen_random_uuid(),
  class_name text not null,
  program_type text,
  active boolean not null default true,
  unique (class_name, program_type)
);

alter table public.teacher_schedule
  add column if not exists class_id uuid references public.school_classes(id) on delete restrict;

create table if not exists public.absences (
  id uuid primary key default gen_random_uuid(),
  crisis_report_id uuid not null unique references public.crisis_reports(id) on delete cascade,
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  absence_date date not null,
  has_medical_report boolean not null default false,
  note text,
  status text not null default 'open' check (status in ('open','planned','resolved')),
  created_at timestamptz not null default now(),
  unique (teacher_id, absence_date)
);

alter table public.absence_lessons
  add column if not exists class_id uuid references public.school_classes(id) on delete restrict;

alter table public.substitute_assignments
  add column if not exists approval_status text not null default 'approved'
    check (approval_status in ('suggested','approved','rejected','changed')),
  add column if not exists approved_by uuid references public.profiles(user_id) on delete set null,
  add column if not exists approved_at timestamptz;

create table if not exists public.assignment_audit_log (
  id bigint generated always as identity primary key,
  assignment_id uuid references public.substitute_assignments(id) on delete set null,
  absence_lesson_id uuid references public.absence_lessons(id) on delete set null,
  actor_user_id uuid references public.profiles(user_id) on delete set null,
  action text not null check (action in ('suggested','created','approved','changed','rejected','deleted')),
  old_substitute_user_id uuid references public.profiles(user_id) on delete set null,
  new_substitute_user_id uuid references public.profiles(user_id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_absences_teacher_date on public.absences(teacher_id, absence_date);
create index if not exists idx_assignment_audit_assignment on public.assignment_audit_log(assignment_id, created_at desc);

alter table public.school_classes enable row level security;
alter table public.absences enable row level security;
alter table public.assignment_audit_log enable row level security;

grant select on public.school_classes to authenticated;
grant select on public.absences to authenticated;
grant select on public.assignment_audit_log to authenticated;

create policy "authenticated can read school classes"
on public.school_classes for select to authenticated using (true);

create policy "users can read relevant absences"
on public.absences for select to authenticated
using (
  teacher_id = (select auth.uid())
  or public.is_manager_or_admin()
);

create policy "managers can read assignment audit"
on public.assignment_audit_log for select to authenticated
using (public.is_manager_or_admin());

-- Keep only the new canonical morning absence notification to avoid duplicate VP alerts.
drop trigger if exists trg_notify_duty_vp_of_crisis on public.crisis_reports;

create or replace function public.notify_duty_vp_of_absence()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vp uuid;
  v_teacher text;
begin
  select vice_principal_id into v_vp
  from public.duty_rotation
  where duty_date = new.absence_date;

  if v_vp is null then return new; end if;

  select coalesce(full_name, 'Öğretmen') into v_teacher
  from public.profiles where user_id = new.teacher_id;

  insert into public.notifications(user_id, type, priority, title, message, action_label, action_url)
  values (
    v_vp,
    'crisis',
    'critical',
    'Sabah devamsızlık bildirimi',
    format('%s bugün devamsızlık bildirdi%s. Boş dersleri ve vekalet önerilerini kontrol edin.',
      v_teacher,
      case when new.has_medical_report then ' (raporu var)' else '' end),
    'Vekalet Yönetimi',
    '/substitutes'
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_duty_vp_of_absence on public.absences;
create trigger trg_notify_duty_vp_of_absence
after insert on public.absences
for each row execute function public.notify_duty_vp_of_absence();

create or replace function public.suggest_substitutes_for_day(p_date date default current_date)
returns table (
  absence_lesson_id uuid,
  period smallint,
  class_id uuid,
  class_name text,
  subject text,
  candidate_user_id uuid,
  candidate_name text,
  candidate_role public.app_role,
  priority integer,
  weekly_load bigint,
  reason text
)
language sql
stable
security definer
set search_path = public
as $$
  with empty_lessons as (
    select al.*
    from public.absence_lessons al
    left join public.substitute_assignments sa on sa.absence_lesson_id = al.id
    where al.lesson_date = p_date and sa.id is null
  ), candidate_pool as (
    select el.id as lesson_id, tda.teacher_id as user_id, 1 as priority, 'Nöbetçi öğretmen'::text as reason
    from empty_lessons el
    join public.teacher_duty_assignments tda on tda.duty_date = p_date
    join public.profiles p on p.user_id = tda.teacher_id and p.role = 'teacher'

    union all

    select el.id, dr.vice_principal_id, 2, 'Nöbetçi müdür yardımcısı'
    from empty_lessons el
    join public.duty_rotation dr on dr.duty_date = p_date

    union all

    select el.id, vp.user_id, 3, 'Diğer uygun müdür yardımcısı'
    from empty_lessons el
    join public.vice_principals vp on vp.active = true
    where vp.user_id <> coalesce((select vice_principal_id from public.duty_rotation where duty_date = p_date), '00000000-0000-0000-0000-000000000000'::uuid)
  ), eligible as (
    select
      cp.lesson_id,
      cp.user_id,
      min(cp.priority) as priority,
      min(cp.reason) as reason,
      count(sa_week.id) as weekly_load
    from candidate_pool cp
    join empty_lessons el on el.id = cp.lesson_id
    left join public.substitute_assignments sa_week
      on sa_week.substitute_user_id = cp.user_id
     and sa_week.assigned_at >= date_trunc('week', p_date::timestamp)
     and sa_week.assigned_at < date_trunc('week', p_date::timestamp) + interval '7 days'
    where cp.user_id <> el.teacher_id
      and not exists (
        select 1 from public.absences a
        where a.teacher_id = cp.user_id and a.absence_date = p_date and a.status <> 'resolved'
      )
      and not exists (
        select 1 from public.teacher_schedule ts
        where ts.teacher_id = cp.user_id
          and ts.weekday = extract(isodow from p_date)::smallint
          and ts.period = el.period
      )
      and not exists (
        select 1
        from public.substitute_assignments sa2
        join public.absence_lessons al2 on al2.id = sa2.absence_lesson_id
        where sa2.substitute_user_id = cp.user_id
          and al2.lesson_date = p_date
          and al2.period = el.period
      )
    group by cp.lesson_id, cp.user_id
  ), ranked as (
    select e.*, row_number() over (
      partition by e.lesson_id
      order by e.priority, e.weekly_load, e.user_id
    ) as rn
    from eligible e
  )
  select
    el.id,
    el.period,
    el.class_id,
    el.class_name,
    el.subject,
    r.user_id,
    p.full_name,
    p.role,
    r.priority,
    r.weekly_load,
    r.reason
  from empty_lessons el
  join ranked r on r.lesson_id = el.id and r.rn <= 5
  join public.profiles p on p.user_id = r.user_id
  order by el.period, el.class_name, r.rn;
$$;

revoke all on function public.suggest_substitutes_for_day(date) from public;
grant execute on function public.suggest_substitutes_for_day(date) to authenticated;

create or replace function public.log_substitute_assignment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.assignment_audit_log(
      assignment_id, absence_lesson_id, actor_user_id, action, new_substitute_user_id, metadata
    ) values (
      new.id, new.absence_lesson_id, coalesce(new.assigned_by, auth.uid()),
      case when new.approval_status = 'suggested' then 'suggested' else 'created' end,
      new.substitute_user_id,
      jsonb_build_object('approval_status', new.approval_status)
    );
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.assignment_audit_log(
      assignment_id, absence_lesson_id, actor_user_id, action,
      old_substitute_user_id, new_substitute_user_id, metadata
    ) values (
      new.id, new.absence_lesson_id, coalesce(new.approved_by, new.assigned_by, auth.uid()),
      case
        when new.approval_status = 'approved' and old.approval_status is distinct from 'approved' then 'approved'
        when new.approval_status = 'rejected' then 'rejected'
        else 'changed'
      end,
      old.substitute_user_id, new.substitute_user_id,
      jsonb_build_object('old_status', old.approval_status, 'new_status', new.approval_status)
    );
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.assignment_audit_log(
      assignment_id, absence_lesson_id, actor_user_id, action, old_substitute_user_id
    ) values (old.id, old.absence_lesson_id, auth.uid(), 'deleted', old.substitute_user_id);
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_log_substitute_assignment_change on public.substitute_assignments;
create trigger trg_log_substitute_assignment_change
after insert or update or delete on public.substitute_assignments
for each row execute function public.log_substitute_assignment_change();
