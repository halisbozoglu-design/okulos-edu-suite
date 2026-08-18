create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  type text not null check (type in ('crisis','substitute','schedule','system')),
  priority text not null default 'normal' check (priority in ('normal','high','critical')),
  title text not null,
  message text not null,
  action_label text,
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_created
  on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_user_unread
  on public.notifications(user_id, read_at) where read_at is null;

alter table public.notifications enable row level security;
grant select, update on public.notifications to authenticated;

create policy "users can read own notifications"
on public.notifications for select to authenticated
using (user_id = (select auth.uid()));

create policy "users can update own notifications"
on public.notifications for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create or replace function public.notify_substitute_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lesson record;
begin
  select period, class_name, subject
    into v_lesson
  from public.absence_lessons
  where id = new.absence_lesson_id;

  insert into public.notifications(
    user_id, type, priority, title, message, action_label, action_url
  ) values (
    new.substitute_user_id,
    'substitute',
    'critical',
    'Yeni vekalet görevi',
    format('%s. ders %s sınıfında %s dersine vekalet edeceksiniz. Dersi yürütün ve işlenen konuyu sınıf defterine kaydedin.', v_lesson.period, v_lesson.class_name, v_lesson.subject),
    'Vekaleti Aç',
    '/substitutes'
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_substitute_assignment on public.substitute_assignments;
create trigger trg_notify_substitute_assignment
after insert on public.substitute_assignments
for each row execute function public.notify_substitute_assignment();

create or replace function public.notify_duty_vp_of_crisis()
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
  where duty_date = new.report_date;

  if v_vp is null then
    return new;
  end if;

  select coalesce(full_name, 'Öğretmen') into v_teacher
  from public.profiles where user_id = new.teacher_id;

  insert into public.notifications(
    user_id, type, priority, title, message, action_label, action_url
  ) values (
    v_vp,
    'crisis',
    'critical',
    'Kriz / devamsızlık bildirimi',
    format('%s bugün devamsızlık bildirdi%s. Vekalet planını kontrol edin.', v_teacher, case when new.has_medical_report then ' (raporu var)' else '' end),
    'Vekalet Yönetimi',
    '/substitutes'
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_duty_vp_of_crisis on public.crisis_reports;
create trigger trg_notify_duty_vp_of_crisis
after insert on public.crisis_reports
for each row execute function public.notify_duty_vp_of_crisis();

create or replace function public.notify_schedule_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    insert into public.notifications(
      user_id, type, priority, title, message, action_label, action_url
    ) values (
      new.teacher_id,
      'schedule',
      'high',
      'Ders programınız güncellendi',
      format('%s. ders: %s / %s bilgisi güncellendi.', new.period, new.class_name, new.subject),
      'Programı Gör',
      '/dashboard'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_schedule_change on public.teacher_schedule;
create trigger trg_notify_schedule_change
after update on public.teacher_schedule
for each row execute function public.notify_schedule_change();

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
