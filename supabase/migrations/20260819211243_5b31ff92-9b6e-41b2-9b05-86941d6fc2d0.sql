-- OkulOS formal Norm Kadro analysis engine.
-- Formal norm is kept separate from operational teacher capacity.
-- Course -> norm area and area -> norm rule mappings are explicit/effective-dated; no legal mapping is guessed in code.

create table if not exists public.norm_course_area_rules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.course_catalog(id) on delete cascade,
  teaching_area_id uuid not null references public.teaching_areas(id) on delete cascade,
  source_id uuid references public.legal_rule_sources(id) on delete restrict,
  effective_from date not null,
  effective_to date,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from),
  unique(course_id, teaching_area_id, effective_from)
);

create table if not exists public.norm_area_rule_assignments (
  id uuid primary key default gen_random_uuid(),
  teaching_area_id uuid not null references public.teaching_areas(id) on delete cascade,
  rule_set_id uuid not null references public.norm_rule_sets(id) on delete cascade,
  source_id uuid references public.legal_rule_sources(id) on delete restrict,
  effective_from date not null,
  effective_to date,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from),
  unique(teaching_area_id, rule_set_id, effective_from)
);

create index if not exists idx_norm_course_area_current
  on public.norm_course_area_rules(course_id, teaching_area_id, effective_from, effective_to)
  where active=true;
create index if not exists idx_norm_area_rule_current
  on public.norm_area_rule_assignments(teaching_area_id, effective_from, effective_to)
  where active=true;

alter table public.norm_course_area_rules enable row level security;
alter table public.norm_area_rule_assignments enable row level security;

grant select on public.norm_course_area_rules, public.norm_area_rule_assignments to authenticated;
grant insert,update,delete on public.norm_course_area_rules, public.norm_area_rule_assignments to authenticated;

create policy "authenticated read norm course area rules"
on public.norm_course_area_rules for select to authenticated using(true);
create policy "authenticated read norm area rule assignments"
on public.norm_area_rule_assignments for select to authenticated using(true);
create policy "super admin manages norm course area rules"
on public.norm_course_area_rules for all to authenticated
using(public.is_super_admin()) with check(public.is_super_admin());
create policy "super admin manages norm area rule assignments"
on public.norm_area_rule_assignments for all to authenticated
using(public.is_super_admin()) with check(public.is_super_admin());

create or replace function public.get_norm_readiness(p_on_date date default current_date)
returns table(
  missing_course_area_count integer,
  missing_area_rule_count integer,
  mapped_course_count integer,
  mapped_area_count integer,
  ready boolean
)
language sql
stable
security definer
set search_path=public
as $$
with used_courses as (
  select distinct r.course_id
  from public.class_course_requirements r
  join public.school_classes c on c.id=r.class_id and c.active=true
), course_map as (
  select uc.course_id,
         exists(
           select 1 from public.norm_course_area_rules n
           where n.course_id=uc.course_id and n.active=true
             and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
         ) mapped
  from used_courses uc
), used_areas as (
  select distinct n.teaching_area_id
  from public.norm_course_area_rules n
  join used_courses uc on uc.course_id=n.course_id
  where n.active=true and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
), area_map as (
  select ua.teaching_area_id,
         exists(
           select 1 from public.norm_area_rule_assignments a
           where a.teaching_area_id=ua.teaching_area_id and a.active=true
             and a.effective_from<=p_on_date and (a.effective_to is null or a.effective_to>=p_on_date)
         ) mapped
  from used_areas ua
)
select
  coalesce((select count(*) from course_map where not mapped),0)::integer,
  coalesce((select count(*) from area_map where not mapped),0)::integer,
  coalesce((select count(*) from course_map where mapped),0)::integer,
  coalesce((select count(*) from area_map where mapped),0)::integer,
  not exists(select 1 from course_map where not mapped)
    and not exists(select 1 from area_map where not mapped);
$$;

create or replace function public.get_norm_missing_mappings(p_on_date date default current_date)
returns table(item_type text,item_id uuid,item_name text,detail text)
language sql
stable
security definer
set search_path=public
as $$
with used_courses as (
  select distinct r.course_id, cc.name
  from public.class_course_requirements r
  join public.school_classes c on c.id=r.class_id and c.active=true
  join public.course_catalog cc on cc.id=r.course_id
), missing_courses as (
  select 'COURSE_AREA'::text item_type, uc.course_id item_id, uc.name item_name,
         'Dersin hangi norm alanına sayılacağı tanımlanmamış'::text detail
  from used_courses uc
  where not exists(
    select 1 from public.norm_course_area_rules n
    where n.course_id=uc.course_id and n.active=true
      and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
  )
), used_areas as (
  select distinct n.teaching_area_id, ta.name
  from public.norm_course_area_rules n
  join used_courses uc on uc.course_id=n.course_id
  join public.teaching_areas ta on ta.id=n.teaching_area_id
  where n.active=true and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
), missing_rules as (
  select 'AREA_RULE'::text item_type, ua.teaching_area_id item_id, ua.name item_name,
         'Alan için yürürlükte norm kural seti tanımlanmamış'::text detail
  from used_areas ua
  where not exists(
    select 1 from public.norm_area_rule_assignments a
    where a.teaching_area_id=ua.teaching_area_id and a.active=true
      and a.effective_from<=p_on_date and (a.effective_to is null or a.effective_to>=p_on_date)
  )
)
select * from missing_courses
union all
select * from missing_rules
order by item_type,item_name;
$$;

create or replace function public.get_formal_norm_analysis(p_on_date date default current_date)
returns table(
  teaching_area_id uuid,
  teaching_area_name text,
  total_weekly_hours integer,
  rule_set_id uuid,
  rule_set_name text,
  formal_norm integer,
  active_teacher_count integer,
  operational_difference integer,
  status text
)
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_ready record;
begin
  select * into v_ready from public.get_norm_readiness(p_on_date);
  if not coalesce(v_ready.ready,false) then
    raise exception 'NORM_MAPPING_INCOMPLETE';
  end if;

  return query
  with area_load as (
    select n.teaching_area_id, sum(r.weekly_hours)::integer total_hours
    from public.class_course_requirements r
    join public.school_classes c on c.id=r.class_id and c.active=true
    join public.norm_course_area_rules n on n.course_id=r.course_id
      and n.active=true and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
    group by n.teaching_area_id
  ), area_rule as (
    select distinct on (a.teaching_area_id)
      a.teaching_area_id,a.rule_set_id
    from public.norm_area_rule_assignments a
    where a.active=true and a.effective_from<=p_on_date and (a.effective_to is null or a.effective_to>=p_on_date)
    order by a.teaching_area_id,a.effective_from desc,a.created_at desc
  ), teacher_counts as (
    select p.teaching_area_id,count(*)::integer cnt
    from public.profiles p
    where p.role='teacher' and p.teaching_area_id is not null
    group by p.teaching_area_id
  )
  select
    al.teaching_area_id,
    ta.name,
    al.total_hours,
    ar.rule_set_id,
    rs.name,
    public.calculate_norm_from_rule(ar.rule_set_id,al.total_hours) formal_norm,
    coalesce(tc.cnt,0) active_teacher_count,
    coalesce(tc.cnt,0)-public.calculate_norm_from_rule(ar.rule_set_id,al.total_hours) operational_difference,
    case
      when coalesce(tc.cnt,0) < public.calculate_norm_from_rule(ar.rule_set_id,al.total_hours) then 'TEACHER_DEFICIT'
      when coalesce(tc.cnt,0) > public.calculate_norm_from_rule(ar.rule_set_id,al.total_hours) then 'TEACHER_SURPLUS'
      else 'BALANCED'
    end status
  from area_load al
  join public.teaching_areas ta on ta.id=al.teaching_area_id
  join area_rule ar on ar.teaching_area_id=al.teaching_area_id
  join public.norm_rule_sets rs on rs.id=ar.rule_set_id
  left join teacher_counts tc on tc.teaching_area_id=al.teaching_area_id
  order by ta.name;
end;
$$;

revoke all on function public.get_norm_readiness(date) from public;
revoke all on function public.get_norm_missing_mappings(date) from public;
revoke all on function public.get_formal_norm_analysis(date) from public;
grant execute on function public.get_norm_readiness(date) to authenticated;
grant execute on function public.get_norm_missing_mappings(date) to authenticated;
grant execute on function public.get_formal_norm_analysis(date) to authenticated;
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
  v_rule_found boolean;
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
    v_rule_found:=found;

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
        not v_rule_found
        or (
          (v_rule.required_room_type is null or c.room_type=v_rule.required_room_type)
          and (v_rule.required_department is null or coalesce(c.department,'')=v_rule.required_department)
          and (v_rule.required_hardware='{}'::jsonb or c.hardware @> v_rule.required_hardware)
        )
      )
    order by
      case when v_rule_found and v_rule.required_department is not null and c.department=v_rule.required_department then 0 else 1 end,
      c.capacity-coalesce(v_students,0),
      c.name
    limit 1;

    if v_room is null then
      insert into public.schedule_room_assignment_issues(scenario_id,scenario_row_id,reason,detail)
      values(p_scenario_id,v_row.id,'NO_SUITABLE_CLASSROOM',
        case when v_rule_found then 'Derslik tipi/kapasite/donanım koşullarına uygun boş derslik bulunamadı' else 'Kapasitesi yeterli boş derslik bulunamadı' end)
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
-- Immutable working timetable restore points.
-- Scenario application automatically stores the previous working schedule.

create table if not exists public.schedule_restore_points (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  reason text not null default 'manual',
  row_count integer not null default 0,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.schedule_restore_point_rows (
  id bigint generated always as identity primary key,
  restore_point_id uuid not null references public.schedule_restore_points(id) on delete cascade,
  snapshot jsonb not null
);

create index if not exists idx_schedule_restore_points_created on public.schedule_restore_points(created_at desc);
create index if not exists idx_schedule_restore_rows_point on public.schedule_restore_point_rows(restore_point_id);

alter table public.schedule_restore_points enable row level security;
alter table public.schedule_restore_point_rows enable row level security;
grant select on public.schedule_restore_points,public.schedule_restore_point_rows to authenticated;
create policy "managers read restore points" on public.schedule_restore_points for select to authenticated using(public.is_manager_or_admin());
create policy "managers read restore point rows" on public.schedule_restore_point_rows for select to authenticated using(public.is_manager_or_admin());
revoke insert,update,delete on public.schedule_restore_points,public.schedule_restore_point_rows from authenticated;

create or replace function public.create_schedule_restore_point(p_label text default 'Çalışma programı',p_reason text default 'manual')
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_id uuid;v_count integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  select count(*)::integer into v_count from public.teacher_schedule where active=true;
  insert into public.schedule_restore_points(label,reason,row_count,created_by)
  values(coalesce(nullif(trim(p_label),''),'Çalışma programı'),coalesce(nullif(trim(p_reason),''),'manual'),v_count,auth.uid()) returning id into v_id;
  insert into public.schedule_restore_point_rows(restore_point_id,snapshot)
  select v_id,to_jsonb(ts) from public.teacher_schedule ts where ts.active=true order by ts.weekday,ts.period,ts.class_name,ts.teacher_id;
  return v_id;
end;
$$;
revoke all on function public.create_schedule_restore_point(text,text) from public;
grant execute on function public.create_schedule_restore_point(text,text) to authenticated;

create or replace function public.restore_schedule_restore_point(p_restore_point_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare v_count integer:=0;v_snapshot jsonb;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if not exists(select 1 from public.schedule_restore_points where id=p_restore_point_id) then raise exception 'RESTORE_POINT_NOT_FOUND'; end if;

  -- Store current state first, so every restore operation is itself reversible (redo by restoring this new point).
  perform public.create_schedule_restore_point('Geri yükleme öncesi otomatik kopya','before_restore');

  delete from public.teacher_schedule where active=true;
  for v_snapshot in select snapshot from public.schedule_restore_point_rows where restore_point_id=p_restore_point_id order by id loop
    insert into public.teacher_schedule(
      id,teacher_id,weekday,period,class_name,subject,class_id,classroom,classroom_id,subgroup_id,subgroup_key,is_group_split,active,locked,updated_at
    ) values(
      coalesce((v_snapshot->>'id')::uuid,gen_random_uuid()),
      (v_snapshot->>'teacher_id')::uuid,
      (v_snapshot->>'weekday')::smallint,
      (v_snapshot->>'period')::smallint,
      v_snapshot->>'class_name',
      v_snapshot->>'subject',
      nullif(v_snapshot->>'class_id','')::uuid,
      nullif(v_snapshot->>'classroom',''),
      nullif(v_snapshot->>'classroom_id','')::uuid,
      nullif(v_snapshot->>'subgroup_id','')::uuid,
      nullif(v_snapshot->>'subgroup_key',''),
      coalesce((v_snapshot->>'is_group_split')::boolean,false),
      true,
      coalesce((v_snapshot->>'locked')::boolean,false),
      now()
    );
    v_count:=v_count+1;
  end loop;
  return v_count;
end;
$$;
revoke all on function public.restore_schedule_restore_point(uuid) from public;
grant execute on function public.restore_schedule_restore_point(uuid) to authenticated;

-- Replace scenario apply function so the current draft can always be restored.
create or replace function public.apply_schedule_scenario(p_scenario_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare v_count integer;v_restore uuid;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if exists(select 1 from public.schedule_unplaced_items where scenario_id=p_scenario_id) then raise exception 'SCENARIO_HAS_UNPLACED_LESSONS'; end if;
  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND'; end if;
  if exists(select 1 from public.classrooms where active=true)
     and exists(select 1 from public.schedule_scenario_rows where scenario_id=p_scenario_id and classroom_id is null) then
    raise exception 'SCENARIO_HAS_UNASSIGNED_CLASSROOMS';
  end if;

  v_restore:=public.create_schedule_restore_point('Senaryo uygulama öncesi','before_scenario_apply');

  delete from public.teacher_schedule where active=true and locked=false;
  insert into public.teacher_schedule(teacher_id,class_id,weekday,period,class_name,subject,classroom_id,subgroup_id,subgroup_key,is_group_split,active,locked)
  select r.teacher_id,r.class_id,r.weekday,r.period,r.class_name,r.subject,r.classroom_id,r.subgroup_id,r.subgroup_key,r.is_group_split,true,false
  from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.locked=false
  order by r.weekday,r.period,r.class_name;
  get diagnostics v_count=row_count;
  update public.schedule_scenarios set status=case when id=p_scenario_id then 'applied' else status end where generation_group=(select generation_group from public.schedule_scenarios where id=p_scenario_id);
  return v_count;
end;
$$;
revoke all on function public.apply_schedule_scenario(uuid) from public;
grant execute on function public.apply_schedule_scenario(uuid) to authenticated;
-- Norm mapping integrity: exactly one current course->area and one current area->rule mapping is required.

create or replace function public.get_norm_readiness(p_on_date date default current_date)
returns table(
  missing_course_area_count integer,
  missing_area_rule_count integer,
  mapped_course_count integer,
  mapped_area_count integer,
  ready boolean
)
language sql
stable
security definer
set search_path=public
as $$
with used_courses as (
  select distinct r.course_id
  from public.class_course_requirements r
  join public.school_classes c on c.id=r.class_id and c.active=true
), course_map as (
  select uc.course_id,
    (select count(*) from public.norm_course_area_rules n
      where n.course_id=uc.course_id and n.active=true
        and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)) map_count
  from used_courses uc
), unique_areas as (
  select distinct n.teaching_area_id
  from course_map cm
  join public.norm_course_area_rules n on n.course_id=cm.course_id
    and n.active=true and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
  where cm.map_count=1
), area_map as (
  select ua.teaching_area_id,
    (select count(*) from public.norm_area_rule_assignments a
      where a.teaching_area_id=ua.teaching_area_id and a.active=true
        and a.effective_from<=p_on_date and (a.effective_to is null or a.effective_to>=p_on_date)) map_count
  from unique_areas ua
)
select
  coalesce((select count(*) from course_map where map_count<>1),0)::integer,
  coalesce((select count(*) from area_map where map_count<>1),0)::integer,
  coalesce((select count(*) from course_map where map_count=1),0)::integer,
  coalesce((select count(*) from area_map where map_count=1),0)::integer,
  not exists(select 1 from course_map where map_count<>1)
    and not exists(select 1 from area_map where map_count<>1);
$$;

create or replace function public.get_norm_missing_mappings(p_on_date date default current_date)
returns table(item_type text,item_id uuid,item_name text,detail text)
language sql
stable
security definer
set search_path=public
as $$
with used_courses as (
  select distinct r.course_id,cc.name
  from public.class_course_requirements r
  join public.school_classes c on c.id=r.class_id and c.active=true
  join public.course_catalog cc on cc.id=r.course_id
), course_counts as (
  select uc.course_id,uc.name,
    (select count(*) from public.norm_course_area_rules n
      where n.course_id=uc.course_id and n.active=true
        and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)) map_count
  from used_courses uc
), bad_courses as (
  select 'COURSE_AREA'::text item_type,course_id item_id,name item_name,
    case when map_count=0 then 'Dersin hangi norm alanına sayılacağı tanımlanmamış'
         else 'Ders için aynı tarihte birden fazla norm alanı tanımlı; tek eşleşmeye düşürülmeli' end::text detail
  from course_counts where map_count<>1
), unique_areas as (
  select distinct n.teaching_area_id,ta.name
  from course_counts cc
  join public.norm_course_area_rules n on n.course_id=cc.course_id and cc.map_count=1
    and n.active=true and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
  join public.teaching_areas ta on ta.id=n.teaching_area_id
), area_counts as (
  select ua.teaching_area_id,ua.name,
    (select count(*) from public.norm_area_rule_assignments a
      where a.teaching_area_id=ua.teaching_area_id and a.active=true
        and a.effective_from<=p_on_date and (a.effective_to is null or a.effective_to>=p_on_date)) map_count
  from unique_areas ua
), bad_areas as (
  select 'AREA_RULE'::text item_type,teaching_area_id item_id,name item_name,
    case when map_count=0 then 'Alan için yürürlükte norm kural seti tanımlanmamış'
         else 'Alan için aynı tarihte birden fazla norm kural seti tanımlı; tek eşleşmeye düşürülmeli' end::text detail
  from area_counts where map_count<>1
)
select * from bad_courses
union all select * from bad_areas
order by item_type,item_name;
$$;
-- Automatically run classroom assignment when a generated scenario receives its final row count.

create or replace function public.auto_assign_rooms_after_scenario_generation()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if new.row_count>0 and (old.row_count is distinct from new.row_count or old.status is distinct from new.status) then
    perform * from public.assign_classrooms_to_scenario(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_auto_assign_rooms_after_scenario_generation on public.schedule_scenarios;
create trigger trg_auto_assign_rooms_after_scenario_generation
after update of row_count,status on public.schedule_scenarios
for each row
when (new.row_count>0)
execute function public.auto_assign_rooms_after_scenario_generation();