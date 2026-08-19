create table if not exists public.duty_tardiness_logs (
  id uuid primary key default gen_random_uuid(),
  duty_date date not null,
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  period smallint check (period between 1 and 12),
  class_name text,
  minutes_late smallint not null check (minutes_late between 1 and 240),
  note text,
  recorded_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.duty_incident_logs (
  id uuid primary key default gen_random_uuid(),
  duty_date date not null,
  reporter_id uuid references public.profiles(user_id) on delete set null,
  duty_location text,
  description text not null,
  action_taken text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_duty_tardiness_date on public.duty_tardiness_logs(duty_date,teacher_id);
create index if not exists idx_duty_incidents_date on public.duty_incident_logs(duty_date,occurred_at);

alter table public.duty_tardiness_logs enable row level security;
alter table public.duty_incident_logs enable row level security;
grant select,insert,update,delete on public.duty_tardiness_logs,public.duty_incident_logs to authenticated;

create policy "managers manage duty tardiness" on public.duty_tardiness_logs
for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "authenticated read duty incidents" on public.duty_incident_logs
for select to authenticated using (true);
create policy "authenticated create duty incidents" on public.duty_incident_logs
for insert to authenticated with check (reporter_id=auth.uid() or public.is_manager_or_admin());
create policy "managers manage duty incidents" on public.duty_incident_logs
for update to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "managers delete duty incidents" on public.duty_incident_logs
for delete to authenticated using (public.is_manager_or_admin());

create or replace function public.get_daily_duty_book(p_date date)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'date', p_date,
    'manager', (
      select jsonb_build_object('user_id',p.user_id,'full_name',p.full_name,'phone',p.phone)
      from public.duty_rotation dr join public.profiles p on p.user_id=dr.vice_principal_id
      where dr.duty_date=p_date
    ),
    'duty_teachers', coalesce((
      select jsonb_agg(jsonb_build_object('user_id',p.user_id,'full_name',p.full_name,'location',tda.duty_location) order by p.full_name)
      from public.teacher_duty_assignments tda join public.profiles p on p.user_id=tda.teacher_id
      where tda.duty_date=p_date
    ),'[]'::jsonb),
    'absent_teachers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'teacher_id',a.teacher_id,'full_name',p.full_name,'medical_report',a.has_medical_report,'note',a.note,
        'lessons', coalesce((select jsonb_agg(jsonb_build_object('period',al.period,'class_name',al.class_name,'subject',al.subject) order by al.period)
          from public.absence_lessons al where al.teacher_id=a.teacher_id and al.lesson_date=p_date),'[]'::jsonb)
      ) order by p.full_name)
      from public.absences a join public.profiles p on p.user_id=a.teacher_id
      where a.absence_date=p_date and a.status <> 'resolved'
    ),'[]'::jsonb),
    'substitutions', coalesce((
      select jsonb_agg(jsonb_build_object('period',al.period,'class_name',al.class_name,'subject',al.subject,'substitute',p.full_name) order by al.period,al.class_name)
      from public.substitute_assignments sa
      join public.absence_lessons al on al.id=sa.absence_lesson_id
      join public.profiles p on p.user_id=sa.substitute_user_id
      where al.lesson_date=p_date
    ),'[]'::jsonb),
    'tardiness', coalesce((
      select jsonb_agg(jsonb_build_object('id',l.id,'teacher_id',l.teacher_id,'full_name',p.full_name,'period',l.period,'class_name',l.class_name,'minutes_late',l.minutes_late,'note',l.note) order by l.created_at)
      from public.duty_tardiness_logs l join public.profiles p on p.user_id=l.teacher_id
      where l.duty_date=p_date
    ),'[]'::jsonb),
    'incidents', coalesce((
      select jsonb_agg(jsonb_build_object('id',i.id,'reporter',p.full_name,'location',i.duty_location,'description',i.description,'action_taken',i.action_taken,'occurred_at',i.occurred_at) order by i.occurred_at)
      from public.duty_incident_logs i left join public.profiles p on p.user_id=i.reporter_id
      where i.duty_date=p_date
    ),'[]'::jsonb),
    'notes', (select to_jsonb(n) from public.duty_day_notes n where n.duty_date=p_date)
  );
$$;
