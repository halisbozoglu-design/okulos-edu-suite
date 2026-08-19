-- ==== 20260819022500_telegram_bot.sql ====
create extension if not exists pgcrypto;

create table if not exists public.telegram_integrations (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  telegram_chat_id bigint unique,
  enabled boolean not null default false,
  linked_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.telegram_link_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_telegram_link_tokens_user
  on public.telegram_link_tokens(user_id, created_at desc);

alter table public.telegram_integrations enable row level security;
alter table public.telegram_link_tokens enable row level security;

grant select, update on public.telegram_integrations to authenticated;

create policy "users can read own telegram integration"
on public.telegram_integrations for select to authenticated
using (user_id = (select auth.uid()));

create policy "users can disable own telegram integration"
on public.telegram_integrations for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create or replace function public.create_telegram_link_token()
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user uuid := auth.uid();
  v_token text;
begin
  if v_user is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  delete from public.telegram_link_tokens
  where user_id = v_user and used_at is null;

  v_token := encode(gen_random_bytes(32), 'hex');

  insert into public.telegram_link_tokens(user_id, token_hash, expires_at)
  values (
    v_user,
    encode(digest(v_token, 'sha256'), 'hex'),
    now() + interval '15 minutes'
  );

  return v_token;
end;
$$;

revoke all on function public.create_telegram_link_token() from public;
grant execute on function public.create_telegram_link_token() to authenticated;

create or replace function public.disable_telegram_notifications()
returns void
language sql
security definer
set search_path = public
as $$
  update public.telegram_integrations
  set enabled = false, updated_at = now()
  where user_id = auth.uid();
$$;

revoke all on function public.disable_telegram_notifications() from public;
grant execute on function public.disable_telegram_notifications() to authenticated;

-- ==== 20260819022600_telegram_security.sql ====
revoke update on public.telegram_integrations from authenticated;
grant select on public.telegram_integrations to authenticated;

-- ==== 20260819023500_schedule_module.sql ====
alter table public.teacher_schedule
  add column if not exists class_id uuid references public.school_classes(id) on delete restrict,
  add column if not exists classroom text,
  add column if not exists subgroup_key text,
  add column if not exists is_group_split boolean not null default false,
  add column if not exists active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists uq_teacher_schedule_teacher_slot
  on public.teacher_schedule(teacher_id, weekday, period)
  where active = true;

create unique index if not exists uq_teacher_schedule_class_slot
  on public.teacher_schedule(class_id, weekday, period)
  where active = true and class_id is not null and is_group_split = false;

create unique index if not exists uq_teacher_schedule_class_subgroup_slot
  on public.teacher_schedule(class_id, weekday, period, subgroup_key)
  where active = true and class_id is not null and is_group_split = true and subgroup_key is not null;

create table if not exists public.schedule_import_batches (
  id uuid primary key default gen_random_uuid(),
  imported_by uuid not null references public.profiles(user_id) on delete restrict,
  file_name text not null,
  file_type text not null check (file_type in ('xlsx','xls','csv','txt')),
  row_count integer not null default 0,
  imported_at timestamptz not null default now()
);

create table if not exists public.schedule_audit_log (
  id bigint generated always as identity primary key,
  schedule_id uuid references public.teacher_schedule(id) on delete set null,
  actor_user_id uuid references public.profiles(user_id) on delete set null,
  action text not null check (action in ('created','updated','deleted','imported')),
  old_row jsonb,
  new_row jsonb,
  created_at timestamptz not null default now()
);

alter table public.schedule_import_batches enable row level security;
alter table public.schedule_audit_log enable row level security;

grant select on public.schedule_import_batches, public.schedule_audit_log to authenticated;
grant insert, update, delete on public.teacher_schedule to authenticated;

create policy "managers manage schedules"
on public.teacher_schedule for all to authenticated
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

create policy "managers read schedule imports"
on public.schedule_import_batches for select to authenticated
using (public.is_manager_or_admin());

create policy "managers read schedule audit"
on public.schedule_audit_log for select to authenticated
using (public.is_manager_or_admin());

create or replace function public.log_schedule_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.schedule_audit_log(schedule_id, actor_user_id, action, new_row)
    values (new.id, auth.uid(), 'created', to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.schedule_audit_log(schedule_id, actor_user_id, action, old_row, new_row)
    values (new.id, auth.uid(), 'updated', to_jsonb(old), to_jsonb(new));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.schedule_audit_log(schedule_id, actor_user_id, action, old_row)
    values (old.id, auth.uid(), 'deleted', to_jsonb(old));
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_log_schedule_change on public.teacher_schedule;
create trigger trg_log_schedule_change
after insert or update or delete on public.teacher_schedule
for each row execute function public.log_schedule_change();

create or replace function public.import_weekly_schedule(
  p_file_name text,
  p_file_type text,
  p_rows jsonb
)
returns table(import_batch_id uuid, imported_rows integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_batch uuid;
  v_row jsonb;
  v_teacher_id uuid;
  v_class_id uuid;
  v_count integer := 0;
  v_schedule_id uuid;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if p_file_type not in ('xlsx','xls','csv','txt') then raise exception 'UNSUPPORTED_FILE_TYPE'; end if;
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'INVALID_ROWS'; end if;

  insert into public.schedule_import_batches(imported_by,file_name,file_type,row_count)
  values (auth.uid(), p_file_name, p_file_type, jsonb_array_length(p_rows))
  returning id into v_batch;

  for v_row in select value from jsonb_array_elements(p_rows)
  loop
    select user_id into v_teacher_id
    from public.profiles
    where lower(trim(full_name)) = lower(trim(v_row->>'teacherName'))
      and role = 'teacher';

    if v_teacher_id is null then raise exception 'TEACHER_NOT_FOUND: %', v_row->>'teacherName'; end if;

    select id into v_class_id
    from public.school_classes
    where composite_key = public.normalize_class_key(v_row->>'className', v_row->>'programType');

    if v_class_id is null then raise exception 'CLASS_NOT_FOUND: %', v_row->>'className'; end if;

    insert into public.teacher_schedule(
      teacher_id, weekday, period, class_id, class_name, subject, classroom,
      subgroup_key, is_group_split, active, updated_at
    ) values (
      v_teacher_id,
      (v_row->>'dayOfWeek')::smallint,
      (v_row->>'periodNumber')::smallint,
      v_class_id,
      (select class_name from public.school_classes where id = v_class_id),
      trim(v_row->>'subject'),
      nullif(trim(v_row->>'classroom'),''),
      nullif(trim(v_row->>'subgroupKey'),''),
      coalesce((v_row->>'isGroupSplit')::boolean,false),
      true,
      now()
    )
    on conflict (teacher_id, weekday, period) where active = true
    do update set
      class_id = excluded.class_id,
      class_name = excluded.class_name,
      subject = excluded.subject,
      classroom = excluded.classroom,
      subgroup_key = excluded.subgroup_key,
      is_group_split = excluded.is_group_split,
      updated_at = now()
    returning id into v_schedule_id;

    insert into public.schedule_audit_log(schedule_id, actor_user_id, action, new_row)
    select v_schedule_id, auth.uid(), 'imported', to_jsonb(ts)
    from public.teacher_schedule ts where ts.id = v_schedule_id;

    v_count := v_count + 1;
  end loop;

  return query select v_batch, v_count;
end;
$$;

revoke all on function public.import_weekly_schedule(text,text,jsonb) from public;
grant execute on function public.import_weekly_schedule(text,text,jsonb) to authenticated;

-- Ensure schedule changes are available to connected clients.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'teacher_schedule'
  ) then
    alter publication supabase_realtime add table public.teacher_schedule;
  end if;
end $$;

-- ==== 20260819023800_schedule_payroll_sync.sql ====
create table if not exists public.payroll_dirty_periods (
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  year integer not null check (year between 2000 and 2100),
  month integer not null check (month between 1 and 12),
  reason text not null,
  marked_at timestamptz not null default now(),
  primary key (teacher_id, year, month)
);

alter table public.payroll_dirty_periods enable row level security;
grant select on public.payroll_dirty_periods to authenticated;

create policy "managers read dirty payroll periods"
on public.payroll_dirty_periods for select to authenticated
using (public.is_manager_or_admin());

create or replace function public.mark_payroll_dirty_from_schedule()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher uuid := coalesce(new.teacher_id, old.teacher_id);
  v_today date := current_date;
  v_next date := (current_date + interval '1 month')::date;
begin
  insert into public.payroll_dirty_periods(teacher_id, year, month, reason, marked_at)
  values (v_teacher, extract(year from v_today)::int, extract(month from v_today)::int, 'Ders programı değişti', now())
  on conflict (teacher_id, year, month)
  do update set reason = excluded.reason, marked_at = now();

  insert into public.payroll_dirty_periods(teacher_id, year, month, reason, marked_at)
  values (v_teacher, extract(year from v_next)::int, extract(month from v_next)::int, 'Ders programı değişti', now())
  on conflict (teacher_id, year, month)
  do update set reason = excluded.reason, marked_at = now();

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_schedule_marks_payroll_dirty on public.teacher_schedule;
create trigger trg_schedule_marks_payroll_dirty
after insert or update or delete on public.teacher_schedule
for each row execute function public.mark_payroll_dirty_from_schedule();

create or replace function public.clear_payroll_dirty_after_recalc()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'calculated' then
    delete from public.payroll_dirty_periods
    where year = extract(year from new.period_start)::int
      and month = extract(month from new.period_start)::int;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_clear_payroll_dirty_after_recalc on public.payroll_calculation_runs;
create trigger trg_clear_payroll_dirty_after_recalc
after insert on public.payroll_calculation_runs
for each row execute function public.clear_payroll_dirty_after_recalc();

-- ==== 20260819024000_schedule_conflict_and_payroll_guard.sql ====
create unique index if not exists uq_teacher_schedule_room_slot
  on public.teacher_schedule(lower(classroom), weekday, period)
  where active = true and classroom is not null and btrim(classroom) <> '';

create or replace function public.validate_schedule_slot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.weekday not between 1 and 7 then raise exception 'INVALID_DAY'; end if;
  if new.period not between 1 and 12 then raise exception 'INVALID_PERIOD'; end if;

  if exists (
    select 1 from public.teacher_schedule ts
    where ts.teacher_id = new.teacher_id
      and ts.weekday = new.weekday
      and ts.period = new.period
      and ts.active = true
      and ts.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) then raise exception 'TEACHER_DOUBLE_BOOKING'; end if;

  if new.classroom is not null and btrim(new.classroom) <> '' and exists (
    select 1 from public.teacher_schedule ts
    where lower(btrim(ts.classroom)) = lower(btrim(new.classroom))
      and ts.weekday = new.weekday
      and ts.period = new.period
      and ts.active = true
      and ts.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) then raise exception 'ROOM_DOUBLE_BOOKING'; end if;

  if new.class_id is not null then
    if new.is_group_split then
      if coalesce(btrim(new.subgroup_key),'') = '' then raise exception 'SUBGROUP_REQUIRED'; end if;
      if exists (
        select 1 from public.teacher_schedule ts
        where ts.class_id = new.class_id
          and ts.weekday = new.weekday
          and ts.period = new.period
          and ts.active = true
          and ts.is_group_split = true
          and ts.subgroup_key = new.subgroup_key
          and ts.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      ) then raise exception 'CLASS_SUBGROUP_DOUBLE_BOOKING'; end if;
    elsif exists (
      select 1 from public.teacher_schedule ts
      where ts.class_id = new.class_id
        and ts.weekday = new.weekday
        and ts.period = new.period
        and ts.active = true
        and ts.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) then raise exception 'CLASS_DOUBLE_BOOKING'; end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_validate_schedule_slot on public.teacher_schedule;
create trigger trg_validate_schedule_slot
before insert or update on public.teacher_schedule
for each row execute function public.validate_schedule_slot();

create or replace view public.schedules
with (security_invoker = true)
as
select
  id,
  teacher_id,
  class_id,
  weekday as day_of_week,
  period as period_number,
  class_name,
  subject,
  classroom,
  subgroup_key,
  is_group_split,
  active,
  updated_at
from public.teacher_schedule;

grant select on public.schedules to authenticated;

create or replace function public.approve_payroll_month(p_year int, p_month int)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;

  if exists (
    select 1 from public.payroll_dirty_periods d
    where d.year = p_year and d.month = p_month
  ) then
    raise exception 'PAYROLL_RECALC_REQUIRED';
  end if;

  update public.payroll_day_entries
     set approved = true, approved_by = auth.uid(), approved_at = now()
   where work_date >= make_date(p_year,p_month,1)
     and work_date < make_date(p_year,p_month,1) + interval '1 month';
  get diagnostics v_count = row_count;

  update public.payroll_calculation_runs
     set status = 'approved'
   where period_start = make_date(p_year,p_month,1)
     and period_end = (make_date(p_year,p_month,1) + interval '1 month - 1 day')::date;

  return v_count;
end;
$$;

revoke all on function public.approve_payroll_month(int,int) from public;
grant execute on function public.approve_payroll_month(int,int) to authenticated;