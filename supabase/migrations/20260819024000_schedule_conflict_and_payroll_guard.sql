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
