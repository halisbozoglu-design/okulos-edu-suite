-- OkulOS timetable scenario solver.
-- Greedy multi-scenario generator on top of the existing hard-constraint model.

alter table public.teacher_schedule add column if not exists locked boolean not null default false;

create table if not exists public.schedule_generation_settings (
  id boolean primary key default true check(id=true),
  teaching_days smallint[] not null default array[1,2,3,4,5]::smallint[],
  periods_per_day smallint not null default 8 check(periods_per_day between 1 and 12),
  max_same_course_per_day smallint not null default 2 check(max_same_course_per_day between 1 and 8),
  gap_penalty integer not null default 8,
  late_period_penalty integer not null default 2,
  repeated_course_penalty integer not null default 12,
  updated_at timestamptz not null default now()
);
insert into public.schedule_generation_settings(id) values(true) on conflict(id) do nothing;

create table if not exists public.schedule_scenarios (
  id uuid primary key default gen_random_uuid(),
  generation_group uuid not null,
  scenario_no smallint not null check(scenario_no between 1 and 4),
  title text not null,
  score integer not null default 0,
  unplaced_count integer not null default 0,
  row_count integer not null default 0,
  status text not null default 'generated' check(status in ('generated','selected','applied','discarded')),
  generated_by uuid references public.profiles(user_id) on delete set null,
  generated_at timestamptz not null default now(),
  unique(generation_group,scenario_no)
);

create table if not exists public.schedule_scenario_rows (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.schedule_scenarios(id) on delete cascade,
  requirement_id uuid references public.class_course_requirements(id) on delete cascade,
  teacher_assignment_id uuid references public.teacher_course_assignments(id) on delete cascade,
  teacher_id uuid not null references public.profiles(user_id) on delete restrict,
  class_id uuid references public.school_classes(id) on delete restrict,
  weekday smallint not null check(weekday between 1 and 7),
  period smallint not null check(period between 1 and 12),
  class_name text not null,
  subject text not null,
  classroom_id uuid references public.classrooms(id) on delete restrict,
  subgroup_id uuid references public.class_subgroups(id) on delete restrict,
  subgroup_key text,
  is_group_split boolean not null default false,
  locked boolean not null default false,
  source_schedule_id uuid references public.teacher_schedule(id) on delete set null,
  unique(scenario_id,teacher_id,weekday,period),
  unique(scenario_id,class_id,weekday,period,subgroup_key)
);

create table if not exists public.schedule_unplaced_items (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.schedule_scenarios(id) on delete cascade,
  requirement_id uuid references public.class_course_requirements(id) on delete cascade,
  teacher_assignment_id uuid references public.teacher_course_assignments(id) on delete cascade,
  teacher_id uuid references public.profiles(user_id) on delete restrict,
  class_id uuid references public.school_classes(id) on delete restrict,
  subject text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.schedule_generation_settings enable row level security;
alter table public.schedule_scenarios enable row level security;
alter table public.schedule_scenario_rows enable row level security;
alter table public.schedule_unplaced_items enable row level security;

grant select on public.schedule_generation_settings,public.schedule_scenarios,public.schedule_scenario_rows,public.schedule_unplaced_items to authenticated;
grant insert,update,delete on public.schedule_generation_settings,public.schedule_scenarios,public.schedule_scenario_rows,public.schedule_unplaced_items to authenticated;
create policy "authenticated read schedule generation settings" on public.schedule_generation_settings for select to authenticated using(true);
create policy "managers manage schedule generation settings" on public.schedule_generation_settings for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "managers read schedule scenarios" on public.schedule_scenarios for select to authenticated using(public.is_manager_or_admin());
create policy "managers manage schedule scenarios" on public.schedule_scenarios for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "managers read schedule scenario rows" on public.schedule_scenario_rows for select to authenticated using(public.is_manager_or_admin());
create policy "managers manage schedule scenario rows" on public.schedule_scenario_rows for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "managers read unplaced schedule items" on public.schedule_unplaced_items for select to authenticated using(public.is_manager_or_admin());
create policy "managers manage unplaced schedule items" on public.schedule_unplaced_items for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

create or replace function public.scenario_teacher_consecutive_count(p_scenario uuid,p_teacher uuid,p_day smallint,p_period smallint)
returns integer language plpgsql stable security definer set search_path=public as $$
declare v_periods integer[];v integer;v_prev integer:=null;v_run integer:=0;v_max integer:=0;
begin
  select array_agg(x order by x) into v_periods from (select distinct period::integer x from public.schedule_scenario_rows where scenario_id=p_scenario and teacher_id=p_teacher and weekday=p_day union select p_period::integer) q;
  foreach v in array coalesce(v_periods,array[]::integer[]) loop
    if v_prev is not null and v=v_prev+1 then v_run:=v_run+1; else v_run:=1; end if;
    v_max:=greatest(v_max,v_run);v_prev:=v;
  end loop;return v_max;
end;$$;

create or replace function public.generate_schedule_scenarios()
returns table(generation_group uuid,scenario_id uuid,scenario_no smallint,score integer,unplaced_count integer,row_count integer)
language plpgsql security definer set search_path=public as $$
declare
  v_group uuid:=gen_random_uuid();
  v_scenario uuid;v_no smallint;v_settings public.schedule_generation_settings%rowtype;
  v_item record;v_hour integer;v_day smallint;v_period smallint;v_best_day smallint;v_best_period smallint;v_candidate_score integer;v_best_score integer;
  v_daily_same integer;v_max_consecutive integer;v_unplaced integer;v_score integer;v_rows integer;v_hash integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  perform public.assert_curriculum_ready_for_timetable();
  select * into v_settings from public.schedule_generation_settings where id=true;

  for v_no in 1..4 loop
    insert into public.schedule_scenarios(generation_group,scenario_no,title,generated_by)
    values(v_group,v_no,'Senaryo '||v_no,auth.uid()) returning id into v_scenario;

    -- Preserve rows explicitly locked by management.
    insert into public.schedule_scenario_rows(scenario_id,teacher_id,class_id,weekday,period,class_name,subject,classroom_id,subgroup_id,subgroup_key,is_group_split,locked,source_schedule_id)
    select v_scenario,ts.teacher_id,ts.class_id,ts.weekday,ts.period,ts.class_name,ts.subject,ts.classroom_id,ts.subgroup_id,ts.subgroup_key,ts.is_group_split,true,ts.id
    from public.teacher_schedule ts where ts.active=true and ts.locked=true;

    for v_item in
      select a.id assignment_id,a.teacher_id,a.assigned_hours,r.id requirement_id,r.class_id,r.course_id,c.name subject,sc.class_name,
             coalesce(tc.max_consecutive_hours,4) max_consecutive
      from public.teacher_course_assignments a
      join public.class_course_requirements r on r.id=a.class_course_requirement_id
      join public.course_catalog c on c.id=r.course_id
      join public.school_classes sc on sc.id=r.class_id
      left join public.teacher_schedule_constraints tc on tc.teacher_id=a.teacher_id
      order by ((abs(hashtext(a.id::text)) + v_no*97) % 1000),sc.composite_key,c.name
    loop
      for v_hour in 1..v_item.assigned_hours loop
        v_best_day:=null;v_best_period:=null;v_best_score:=2147483647;
        foreach v_day in array v_settings.teaching_days loop
          for v_period in 1..v_settings.periods_per_day loop
            if exists(select 1 from public.teacher_unavailability u where u.teacher_id=v_item.teacher_id and u.weekday=v_day and u.period=v_period and u.active=true) then continue; end if;
            if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.teacher_id=v_item.teacher_id and x.weekday=v_day and x.period=v_period) then continue; end if;
            if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.class_id=v_item.class_id and x.weekday=v_day and x.period=v_period and x.subgroup_id is null) then continue; end if;
            if public.scenario_teacher_consecutive_count(v_scenario,v_item.teacher_id,v_day,v_period)>v_item.max_consecutive then continue; end if;

            select count(*) into v_daily_same from public.schedule_scenario_rows x
            where x.scenario_id=v_scenario and x.class_id=v_item.class_id and x.weekday=v_day and x.subject=v_item.subject;
            v_hash:=abs(hashtext(v_item.assignment_id::text||':'||v_hour::text||':'||v_no::text||':'||v_day::text||':'||v_period::text));
            v_candidate_score := (case when v_daily_same>=v_settings.max_same_course_per_day then v_settings.repeated_course_penalty*(v_daily_same-v_settings.max_same_course_per_day+1) else 0 end)
              + greatest(v_period-6,0)*v_settings.late_period_penalty + (v_hash % 7);
            -- Prefer filling around existing lessons rather than creating isolated gaps.
            if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.teacher_id=v_item.teacher_id and x.weekday=v_day and x.period in (v_period-1,v_period+1)) then v_candidate_score:=v_candidate_score-3; end if;
            if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.class_id=v_item.class_id and x.weekday=v_day and x.period in (v_period-1,v_period+1)) then v_candidate_score:=v_candidate_score-2; end if;
            if v_candidate_score<v_best_score then v_best_score:=v_candidate_score;v_best_day:=v_day;v_best_period:=v_period; end if;
          end loop;
        end loop;

        if v_best_day is null then
          insert into public.schedule_unplaced_items(scenario_id,requirement_id,teacher_assignment_id,teacher_id,class_id,subject,reason)
          values(v_scenario,v_item.requirement_id,v_item.assignment_id,v_item.teacher_id,v_item.class_id,v_item.subject,'UYGUN_BOS_SLOT_BULUNAMADI');
        else
          insert into public.schedule_scenario_rows(scenario_id,requirement_id,teacher_assignment_id,teacher_id,class_id,weekday,period,class_name,subject)
          values(v_scenario,v_item.requirement_id,v_item.assignment_id,v_item.teacher_id,v_item.class_id,v_best_day,v_best_period,v_item.class_name,v_item.subject);
        end if;
      end loop;
    end loop;

    select count(*) into v_unplaced from public.schedule_unplaced_items where scenario_id=v_scenario;
    select count(*) into v_rows from public.schedule_scenario_rows where scenario_id=v_scenario;
    -- Score: unplaced lessons dominate; then teacher/class gaps and late lessons.
    select v_unplaced*10000
      + coalesce(sum(case when x.period>6 then (x.period-6)*v_settings.late_period_penalty else 0 end),0)
      + coalesce((select sum(gaps)*v_settings.gap_penalty from (
          select teacher_id,weekday,greatest(max(period)-min(period)+1-count(*),0) gaps
          from public.schedule_scenario_rows where scenario_id=v_scenario group by teacher_id,weekday
        ) q),0)
    into v_score from public.schedule_scenario_rows x where x.scenario_id=v_scenario;

    update public.schedule_scenarios set score=v_score,unplaced_count=v_unplaced,row_count=v_rows where id=v_scenario;
  end loop;

  return query select s.generation_group,s.id,s.scenario_no,s.score,s.unplaced_count,s.row_count from public.schedule_scenarios s where s.generation_group=v_group order by s.score,s.scenario_no;
end;$$;

revoke all on function public.generate_schedule_scenarios() from public;
grant execute on function public.generate_schedule_scenarios() to authenticated;

create or replace function public.apply_schedule_scenario(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if exists(select 1 from public.schedule_unplaced_items where scenario_id=p_scenario_id) then raise exception 'SCENARIO_HAS_UNPLACED_LESSONS'; end if;
  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND'; end if;

  delete from public.teacher_schedule where active=true and locked=false;
  insert into public.teacher_schedule(teacher_id,class_id,weekday,period,class_name,subject,classroom_id,subgroup_id,subgroup_key,is_group_split,active,locked)
  select r.teacher_id,r.class_id,r.weekday,r.period,r.class_name,r.subject,r.classroom_id,r.subgroup_id,r.subgroup_key,r.is_group_split,true,false
  from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.locked=false
  order by r.weekday,r.period,r.class_name;
  get diagnostics v_count=row_count;
  update public.schedule_scenarios set status=case when id=p_scenario_id then 'applied' else status end where generation_group=(select generation_group from public.schedule_scenarios where id=p_scenario_id);
  return v_count;
end;$$;
revoke all on function public.apply_schedule_scenario(uuid) from public;
grant execute on function public.apply_schedule_scenario(uuid) to authenticated;

-- Final integrity guards.
create or replace function public.validate_teacher_course_assignment_area()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare v_status text;v_course_id uuid;
begin
  select course_id into v_course_id from public.class_course_requirements where id=new.class_course_requirement_id;
  if v_course_id is null then raise exception 'COURSE_REQUIREMENT_NOT_FOUND'; end if;
  v_status:=public.teacher_course_permission_status(new.teacher_id,v_course_id,current_date);
  if v_status='NOT_ALLOWED' then raise exception 'TTKB_AREA_COURSE_NOT_ALLOWED'; end if;
  return new;
end;
$$;
drop trigger if exists trg_validate_teacher_course_assignment_area on public.teacher_course_assignments;
create trigger trg_validate_teacher_course_assignment_area
before insert or update on public.teacher_course_assignments
for each row execute function public.validate_teacher_course_assignment_area();

drop index if exists uq_schedule_scenario_normal_class_slot;
create unique index uq_schedule_scenario_normal_class_slot
on public.schedule_scenario_rows(scenario_id,class_id,weekday,period)
where class_id is not null and is_group_split=false;

drop index if exists uq_schedule_scenario_group_slot;
create unique index uq_schedule_scenario_group_slot
on public.schedule_scenario_rows(scenario_id,class_id,weekday,period,subgroup_key)
where class_id is not null and is_group_split=true and subgroup_key is not null;