-- Assistant/co-teachers are real timetable resources, never display-only labels.
create table if not exists public.schedule_assignment_additional_teachers(
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  teacher_assignment_id uuid not null references public.teacher_course_assignments(id) on delete cascade,
  teacher_id uuid not null references public.profiles(user_id) on delete restrict,
  resource_role text not null check(resource_role in ('ASSISTANT','CO_TEACHER')),
  created_by uuid references public.profiles(user_id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique(institution_code,teacher_assignment_id,teacher_id)
);
alter table public.schedule_assignment_additional_teachers enable row level security;
revoke all on public.schedule_assignment_additional_teachers from public,anon,authenticated;
grant select,insert,update,delete on public.schedule_assignment_additional_teachers to authenticated;
create policy schedule_assignment_additional_teachers_tenant
on public.schedule_assignment_additional_teachers for all to authenticated
using(public.tenant_row_allowed(institution_code) and public.is_manager_or_admin())
with check(public.tenant_row_allowed(institution_code) and public.is_manager_or_admin());

create or replace function public.guard_schedule_additional_teacher_resource_v1()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_tenant text;v_primary uuid;v_slot record;
begin
  select a.institution_code,a.teacher_id into v_tenant,v_primary
  from public.teacher_course_assignments a where a.id=new.teacher_assignment_id;
  if v_tenant is null or new.institution_code is distinct from v_tenant then
    raise exception 'CROSS_TENANT_ADDITIONAL_TEACHER';
  end if;
  if new.teacher_id=v_primary then raise exception 'PRIMARY_TEACHER_CANNOT_BE_DUPLICATED';end if;
  for v_slot in
    select ts.id,ts.weekday,ts.period,ts.schedule_session_id
    from public.teacher_schedule ts
    where ts.active and ts.teacher_assignment_id=new.teacher_assignment_id
  loop
    if exists(select 1 from public.teacher_unavailability u
      where u.institution_code=v_tenant and u.teacher_id=new.teacher_id and u.active
        and u.weekday=v_slot.weekday and u.period=v_slot.period
        and (u.schedule_session_id is null or u.schedule_session_id=v_slot.schedule_session_id))
    then raise exception 'ADDITIONAL_TEACHER_UNAVAILABLE';end if;
    if exists(
      select 1 from public.teacher_schedule other
      join public.teacher_course_assignments oa on oa.id=other.teacher_assignment_id
      where other.institution_code=v_tenant and other.active and other.id<>v_slot.id
        and other.weekday=v_slot.weekday and other.period=v_slot.period
        and (oa.teacher_id=new.teacher_id or exists(select 1
          from public.schedule_assignment_additional_teachers x
          where x.institution_code=v_tenant and x.teacher_assignment_id=oa.id and x.teacher_id=new.teacher_id))
    ) then raise exception 'ADDITIONAL_TEACHER_DOUBLE_BOOKING';end if;
  end loop;
  return new;
end $$;
drop trigger if exists trg_schedule_additional_teacher_resource_v1 on public.schedule_assignment_additional_teachers;
create trigger trg_schedule_additional_teacher_resource_v1 before insert or update
on public.schedule_assignment_additional_teachers for each row
execute function public.guard_schedule_additional_teacher_resource_v1();

create or replace function public.assert_schedule_all_teacher_resources_v1()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_tenant text;v_teacher uuid;v_max_daily integer;v_max_consecutive integer;v_periods integer[];v_p integer;v_run integer;v_best integer;
begin
  v_tenant:=new.institution_code;
  for v_teacher in
    select a.teacher_id from public.teacher_course_assignments a
      where a.id=new.teacher_assignment_id and a.institution_code=v_tenant
    union
    select x.teacher_id from public.schedule_assignment_additional_teachers x
      where x.teacher_assignment_id=new.teacher_assignment_id and x.institution_code=v_tenant
  loop
    if exists(select 1 from public.teacher_unavailability u
      where u.institution_code=v_tenant and u.teacher_id=v_teacher and u.active
        and u.weekday=new.weekday and u.period=new.period
        and (u.schedule_session_id is null or u.schedule_session_id=new.schedule_session_id))
    then raise exception 'TEACHER_RESOURCE_UNAVAILABLE';end if;
    if exists(
      select 1 from public.teacher_schedule other
      join public.teacher_course_assignments oa on oa.id=other.teacher_assignment_id
      where other.institution_code=v_tenant and other.active
        and other.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid)
        and other.weekday=new.weekday and other.period=new.period
        and (oa.teacher_id=v_teacher or exists(select 1
          from public.schedule_assignment_additional_teachers x
          where x.institution_code=v_tenant and x.teacher_assignment_id=oa.id and x.teacher_id=v_teacher))
    ) then raise exception 'TEACHER_RESOURCE_DOUBLE_BOOKING';end if;
    select c.max_daily_hours,c.max_consecutive_hours into v_max_daily,v_max_consecutive
      from public.teacher_schedule_constraints c
      where c.teacher_id=v_teacher and c.institution_code=v_tenant;
    select array_agg(distinct q.period order by q.period) into v_periods from(
      select other.period from public.teacher_schedule other
      join public.teacher_course_assignments oa on oa.id=other.teacher_assignment_id
      where other.institution_code=v_tenant and other.active and other.weekday=new.weekday
        and other.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid)
        and (oa.teacher_id=v_teacher or exists(select 1 from public.schedule_assignment_additional_teachers x
          where x.institution_code=v_tenant and x.teacher_assignment_id=oa.id and x.teacher_id=v_teacher))
      union select new.period
    )q;
    if v_max_daily is not null and cardinality(v_periods)>v_max_daily then
      raise exception 'TEACHER_RESOURCE_DAILY_LIMIT';
    end if;
    if v_max_consecutive is not null then
      v_run:=0;v_best:=0;
      foreach v_p in array coalesce(v_periods,'{}'::integer[]) loop
        if v_run=0 or v_p=(v_periods[array_position(v_periods,v_p)-1]+1) then v_run:=v_run+1;else v_run:=1;end if;
        v_best:=greatest(v_best,v_run);
      end loop;
      if v_best>v_max_consecutive then raise exception 'TEACHER_RESOURCE_CONSECUTIVE_LIMIT';end if;
    end if;
  end loop;
  return new;
end $$;
drop trigger if exists trg_95_schedule_all_teacher_resources_v1 on public.teacher_schedule;
create trigger trg_95_schedule_all_teacher_resources_v1 before insert or update
on public.teacher_schedule for each row execute function public.assert_schedule_all_teacher_resources_v1();

create or replace function public.assert_scenario_all_teacher_resources_v1()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_teacher uuid;
begin
  for v_teacher in
    select a.teacher_id from public.teacher_course_assignments a
      where a.id=new.teacher_assignment_id and a.institution_code=new.institution_code
    union
    select x.teacher_id from public.schedule_assignment_additional_teachers x
      where x.teacher_assignment_id=new.teacher_assignment_id and x.institution_code=new.institution_code
  loop
    if exists(
      select 1 from public.schedule_scenario_rows other
      join public.teacher_course_assignments oa on oa.id=other.teacher_assignment_id
      where other.institution_code=new.institution_code and other.scenario_id=new.scenario_id
        and other.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid)
        and other.weekday=new.weekday and other.period=new.period
        and (oa.teacher_id=v_teacher or exists(select 1
          from public.schedule_assignment_additional_teachers x
          where x.institution_code=new.institution_code and x.teacher_assignment_id=oa.id and x.teacher_id=v_teacher))
    ) then raise exception 'SCENARIO_TEACHER_RESOURCE_DOUBLE_BOOKING';end if;
  end loop;
  return new;
end $$;
drop trigger if exists trg_95_scenario_all_teacher_resources_v1 on public.schedule_scenario_rows;
create trigger trg_95_scenario_all_teacher_resources_v1 before insert or update
on public.schedule_scenario_rows for each row execute function public.assert_scenario_all_teacher_resources_v1();

create or replace view public.schedule_assignment_options
with(security_invoker=true) as
select a.id teacher_assignment_id,a.teacher_id,p.full_name teacher_name,
  coalesce((select array_agg(x.teacher_id order by x.teacher_id)
    from public.schedule_assignment_additional_teachers x
    where x.institution_code=a.institution_code and x.teacher_assignment_id=a.id),'{}'::uuid[]) additional_teacher_ids,
  a.assigned_hours,r.id requirement_id,r.class_id,sc.class_name,sc.composite_key,r.course_id,c.name course_name,
  coalesce((select count(*) from public.teacher_schedule ts where ts.active and ts.teacher_assignment_id=a.id),0)::integer placed_hours,
  greatest(a.assigned_hours-coalesce((select count(*) from public.teacher_schedule ts where ts.active and ts.teacher_assignment_id=a.id),0),0)::integer remaining_hours
from public.teacher_course_assignments a
join public.profiles p on p.user_id=a.teacher_id
join public.class_course_requirements r on r.id=a.class_course_requirement_id
join public.school_classes sc on sc.id=r.class_id
join public.course_catalog c on c.id=r.course_id
where sc.active and c.active;
grant select on public.schedule_assignment_options to authenticated;

revoke all on function public.guard_schedule_additional_teacher_resource_v1() from public,anon,authenticated;
revoke all on function public.assert_schedule_all_teacher_resources_v1() from public,anon,authenticated;
revoke all on function public.assert_scenario_all_teacher_resources_v1() from public,anon,authenticated;
