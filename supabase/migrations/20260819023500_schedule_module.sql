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

create or replace function public.validate_schedule_slot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.weekday not between 1 and 7 then
    raise exception 'INVALID_DAY';
  end if;
  if new.period not between 1 and 12 then
    raise exception 'INVALID_PERIOD';
  end if;

  if exists (
    select 1 from public.teacher_schedule ts
    where ts.teacher_id = new.teacher_id
      and ts.weekday = new.weekday
      and ts.period = new.period
      and ts.active = true
      and ts.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) then
    raise exception 'TEACHER_DOUBLE_BOOKING';
  end if;

  if new.class_id is not null then
    if new.is_group_split then
      if coalesce(trim(new.subgroup_key),'') = '' then
        raise exception 'SUBGROUP_REQUIRED';
      end if;
      if exists (
        select 1 from public.teacher_schedule ts
        where ts.class_id = new.class_id
          and ts.weekday = new.weekday
          and ts.period = new.period
          and ts.active = true
          and ts.is_group_split = true
          and ts.subgroup_key = new.subgroup_key
          and ts.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      ) then
        raise exception 'CLASS_SUBGROUP_DOUBLE_BOOKING';
      end if;
    elsif exists (
      select 1 from public.teacher_schedule ts
      where ts.class_id = new.class_id
        and ts.weekday = new.weekday
        and ts.period = new.period
        and ts.active = true
        and ts.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) then
      raise exception 'CLASS_DOUBLE_BOOKING';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_validate_schedule_slot on public.teacher_schedule;
create trigger trg_validate_schedule_slot
before insert or update on public.teacher_schedule
for each row execute function public.validate_schedule_slot();

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
