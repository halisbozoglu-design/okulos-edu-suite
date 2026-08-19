-- Automatic classroom assignment for generated timetable scenarios.
-- Uses existing room capacity/type/department/hardware rules. Never fabricates a room.

create table if not exists public.schedule_room_assignment_issues (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.schedule_scenarios(id) on delete cascade,
  scenario_row_id uuid not null references public.schedule_scenario_rows(id) on delete cascade,
  reason text not null,
  detail text,
  created_at timestamptz not null default now(),
  unique(scenario_id,scenario_row_id)
);

alter table public.schedule_room_assignment_issues enable row level security;
grant select,insert,update,delete on public.schedule_room_assignment_issues to authenticated;
create policy "managers read room assignment issues" on public.schedule_room_assignment_issues for select to authenticated using(public.is_manager_or_admin());
create policy "managers manage room assignment issues" on public.schedule_room_assignment_issues for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

create or replace function public.assign_classrooms_to_scenario(p_scenario_id uuid)
returns table(assigned_count integer,unassigned_count integer)
language plpgsql
security definer
set search_path=public
as $$
declare
  v_row record;
  v_rule public.lesson_room_rules%rowtype;
  v_room uuid;
  v_students integer;
  v_assigned integer:=0;
  v_unassigned integer:=0;
  v_has_rooms boolean;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND'; end if;

  select exists(select 1 from public.classrooms where active=true) into v_has_rooms;
  delete from public.schedule_room_assignment_issues where scenario_id=p_scenario_id;

  if not v_has_rooms then
    return query select 0,0;
    return;
  end if;

  for v_row in
    select r.*
    from public.schedule_scenario_rows r
    where r.scenario_id=p_scenario_id
    order by r.weekday,r.period,r.class_name,r.subject
  loop
    if v_row.classroom_id is not null then
      v_assigned:=v_assigned+1;
      continue;
    end if;

    v_students:=public.student_count_for_schedule(v_row.class_id,v_row.subgroup_id);
    select * into v_rule
    from public.lesson_room_rules lr
    where lr.active=true and v_row.subject ilike lr.subject_pattern
    order by length(lr.subject_pattern) desc
    limit 1;

    select c.id into v_room
    from public.classrooms c
    where c.active=true
      and c.capacity>=coalesce(v_students,0)
      and not exists(
        select 1 from public.schedule_scenario_rows x
        where x.scenario_id=p_scenario_id and x.weekday=v_row.weekday and x.period=v_row.period
          and x.classroom_id=c.id and x.id<>v_row.id
      )
      and (
        not found
        or (
          (v_rule.required_room_type is null or c.room_type=v_rule.required_room_type)
          and (v_rule.required_department is null or coalesce(c.department,'')=v_rule.required_department)
          and (v_rule.required_hardware='{}'::jsonb or c.hardware @> v_rule.required_hardware)
        )
      )
    order by
      case when found and v_rule.required_department is not null and c.department=v_rule.required_department then 0 else 1 end,
      c.capacity-coalesce(v_students,0),
      c.name
    limit 1;

    if v_room is null then
      insert into public.schedule_room_assignment_issues(scenario_id,scenario_row_id,reason,detail)
      values(p_scenario_id,v_row.id,'NO_SUITABLE_CLASSROOM',
        case when found then 'Derslik tipi/kapasite/donanım koşullarına uygun boş derslik bulunamadı' else 'Kapasitesi yeterli boş derslik bulunamadı' end)
      on conflict(scenario_id,scenario_row_id) do update set reason=excluded.reason,detail=excluded.detail,created_at=now();
      v_unassigned:=v_unassigned+1;
    else
      update public.schedule_scenario_rows set classroom_id=v_room where id=v_row.id;
      v_assigned:=v_assigned+1;
    end if;
    v_room:=null;
  end loop;

  return query select v_assigned,v_unassigned;
end;
$$;

revoke all on function public.assign_classrooms_to_scenario(uuid) from public;
grant execute on function public.assign_classrooms_to_scenario(uuid) to authenticated;

create or replace function public.get_scenario_room_status(p_scenario_id uuid)
returns table(total_rows integer,assigned_rows integer,unassigned_rows integer,room_issue_count integer,rooms_configured boolean)
language sql
stable
security definer
set search_path=public
as $$
select
  count(*)::integer,
  count(*) filter(where r.classroom_id is not null)::integer,
  count(*) filter(where r.classroom_id is null)::integer,
  (select count(*)::integer from public.schedule_room_assignment_issues i where i.scenario_id=p_scenario_id),
  exists(select 1 from public.classrooms where active=true)
from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id;
$$;
revoke all on function public.get_scenario_room_status(uuid) from public;
grant execute on function public.get_scenario_room_status(uuid) to authenticated;
