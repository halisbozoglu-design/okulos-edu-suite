-- Timetable revision + concurrency guard.
-- Any critical timetable input change invalidates previously generated scenarios.

create table if not exists public.schedule_engine_state(
  id boolean primary key default true check(id=true),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
insert into public.schedule_engine_state(id,revision) values(true,1) on conflict(id) do nothing;
alter table public.schedule_engine_state enable row level security;
grant select on public.schedule_engine_state to authenticated;
create policy "authenticated read schedule engine state" on public.schedule_engine_state
for select to authenticated using(true);

alter table public.schedule_scenarios
add column if not exists basis_revision bigint;

create or replace function public.bump_schedule_engine_revision()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  insert into public.schedule_engine_state(id,revision,updated_at)
  values(true,2,now())
  on conflict(id) do update
    set revision=public.schedule_engine_state.revision+1,
        updated_at=now();
  return null;
end;
$$;

-- Statement-level triggers: one revision increment per mutation statement, not per row.
do $$
declare
  t text;
begin
  foreach t in array array[
    'teacher_schedule',
    'class_course_requirements',
    'teacher_course_assignments',
    'teacher_unavailability',
    'teacher_schedule_constraints',
    'teacher_schedule_preferences',
    'course_schedule_rules',
    'schedule_sync_groups',
    'schedule_sync_group_members',
    'class_subgroup_students',
    'classrooms',
    'lesson_room_rules',
    'schedule_time_profiles'
  ] loop
    execute format('drop trigger if exists trg_schedule_revision_%I on public.%I',t,t);
    execute format(
      'create trigger trg_schedule_revision_%I after insert or update or delete on public.%I for each statement execute function public.bump_schedule_engine_revision()',
      t,t
    );
  end loop;
end;
$$;

create or replace function public.generate_schedule_scenarios_v2()
returns table(generation_group uuid,scenario_id uuid,scenario_no smallint,score integer,unplaced_count integer,row_count integer)
language plpgsql
security definer
set search_path=public
as $$
declare
  v_sync record;
  v_group uuid;
  v_revision bigint;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;

  -- Serialize generation/apply operations so a scenario cannot be built over a moving timetable base.
  perform pg_advisory_xact_lock(hashtext('okulos:timetable:engine'));

  select * into v_sync from public.sync_all_quran_plans_to_timetable();
  perform public.assert_schedule_preparation_ready();
  select revision into v_revision from public.schedule_engine_state where id=true;

  select g.generation_group into v_group
  from public.generate_schedule_scenarios() g
  limit 1;

  if v_group is null then raise exception 'SCHEDULE_GENERATION_RETURNED_NO_SCENARIOS';end if;

  update public.schedule_scenarios
  set basis_revision=v_revision
  where generation_group=v_group;

  -- A newly generated batch supersedes older unapplied batches.
  update public.schedule_scenarios
  set status='discarded'
  where generation_group<>v_group
    and status in ('generated','selected');

  return query
  select s.generation_group,s.id,s.scenario_no,s.score,s.unplaced_count,s.row_count
  from public.schedule_scenarios s
  where s.generation_group=v_group
  order by s.score,s.scenario_no;
end;
$$;
revoke all on function public.generate_schedule_scenarios_v2() from public;
grant execute on function public.generate_schedule_scenarios_v2() to authenticated;

create or replace function public.apply_schedule_scenario(p_scenario_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_count integer;
  v_issues integer;
  v_basis bigint;
  v_current bigint;
  v_status text;
  v_group uuid;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;

  perform pg_advisory_xact_lock(hashtext('okulos:timetable:engine'));

  select basis_revision,status,generation_group
  into v_basis,v_status,v_group
  from public.schedule_scenarios
  where id=p_scenario_id;

  if not found then raise exception 'SCENARIO_NOT_FOUND';end if;
  if v_status not in ('generated','selected') then raise exception 'SCENARIO_NOT_APPLICABLE_STATUS: %',v_status;end if;

  select revision into v_current from public.schedule_engine_state where id=true;
  if v_basis is null or v_basis<>v_current then
    raise exception 'STALE_SCENARIO_REGENERATE: scenario revision %, current revision %',coalesce(v_basis,-1),v_current;
  end if;

  v_issues:=public.validate_schedule_scenario_v2(p_scenario_id);
  if v_issues>0 then raise exception 'SCENARIO_HAS_HARD_INTEGRITY_ISSUES: %',v_issues;end if;
  if exists(select 1 from public.schedule_unplaced_items where scenario_id=p_scenario_id) then raise exception 'SCENARIO_HAS_UNPLACED_LESSONS';end if;
  if exists(select 1 from public.schedule_room_assignment_issues where scenario_id=p_scenario_id) then raise exception 'SCENARIO_HAS_CLASSROOM_ISSUES';end if;

  perform public.create_schedule_restore_point('Senaryo uygulanmadan önce otomatik yedek','before_scenario_apply');

  delete from public.teacher_schedule where active=true and locked=false;
  insert into public.teacher_schedule(
    teacher_id,class_id,weekday,period,class_name,subject,classroom_id,
    subgroup_id,subgroup_key,is_group_split,active,locked,
    course_id,class_course_requirement_id,teacher_assignment_id,source_kind,sync_group_id,block_key
  )
  select
    r.teacher_id,r.class_id,r.weekday,r.period,r.class_name,r.subject,r.classroom_id,
    r.subgroup_id,r.subgroup_key,r.is_group_split,true,r.locked,
    r.course_id,r.requirement_id,r.teacher_assignment_id,'solver',r.sync_group_id,r.block_key
  from public.schedule_scenario_rows r
  where r.scenario_id=p_scenario_id and r.locked=false
  order by r.weekday,r.period,r.class_name;

  get diagnostics v_count=row_count;

  update public.schedule_scenarios
  set status=case when id=p_scenario_id then 'applied' else 'discarded' end
  where generation_group=v_group;

  perform public.assert_schedule_publishable();
  return v_count;
end;
$$;
revoke all on function public.apply_schedule_scenario(uuid) from public;
grant execute on function public.apply_schedule_scenario(uuid) to authenticated;

create or replace view public.schedule_scenario_status_v2
with (security_invoker=true)
as
select
  s.generation_group,
  s.id as scenario_id,
  s.scenario_no,
  s.score,
  s.row_count,
  s.unplaced_count,
  s.status,
  s.basis_revision,
  es.revision as current_revision,
  (s.basis_revision is null or s.basis_revision<>es.revision) as stale,
  coalesce((select sum(i.affected_count)::integer from public.schedule_scenario_integrity_issues i where i.scenario_id=s.id),0) as hard_issue_count,
  coalesce((select count(*)::integer from public.schedule_room_assignment_issues r where r.scenario_id=s.id),0) as room_issue_count,
  (s.status in ('generated','selected')
   and s.basis_revision=es.revision
   and s.unplaced_count=0
   and not exists(select 1 from public.schedule_scenario_integrity_issues i where i.scenario_id=s.id)
   and not exists(select 1 from public.schedule_room_assignment_issues r where r.scenario_id=s.id)) as applicable
from public.schedule_scenarios s
cross join public.schedule_engine_state es
where es.id=true;

grant select on public.schedule_scenario_status_v2 to authenticated;
