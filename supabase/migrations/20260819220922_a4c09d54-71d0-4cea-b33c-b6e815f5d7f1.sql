-- 20260819071300_schedule_parallel_count_null_fix.sql
alter function public.get_schedule_integrity_report_core_v2()
rename to get_schedule_integrity_report_parallel_core_v2;

create or replace function public.get_schedule_integrity_report_core_v2()
returns table(severity text,code text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
with
correct_requirement as (
  select count(*)::integer n from (
    select r.id,r.weekly_hours,
           count(distinct (ts.weekday,ts.period)) filter(where ts.id is not null)::integer placed
    from public.class_course_requirements r
    left join public.teacher_schedule ts on ts.class_course_requirement_id=r.id and ts.active=true
    group by r.id,r.weekly_hours
    having count(distinct (ts.weekday,ts.period)) filter(where ts.id is not null)<>r.weekly_hours
  ) q
),
correct_class as (
  select count(*)::integer n from (
    select c.id,c.expected_weekly_hours,
           count(distinct (ts.weekday,ts.period)) filter(where ts.id is not null)::integer placed
    from public.school_classes c
    left join public.teacher_schedule ts on ts.class_id=c.id and ts.active=true
    where c.active=true
    group by c.id,c.expected_weekly_hours
    having c.expected_weekly_hours is null
       or count(distinct (ts.weekday,ts.period)) filter(where ts.id is not null)<>c.expected_weekly_hours
  ) q
)
select * from public.get_schedule_integrity_report_parallel_core_v2()
where code not in ('REQUIREMENT_HOURS_MISMATCH','CLASS_WEEKLY_HOURS_MISMATCH')
union all
select 'error','REQUIREMENT_HOURS_MISMATCH',n,'Sınıf-ders haftalık saati benzersiz zaman dilimleri üzerinden hedefle uyuşmuyor.' from correct_requirement where n>0
union all
select 'error','CLASS_WEEKLY_HOURS_MISMATCH',n,'Sınıf toplam haftalık ders saati benzersiz zaman dilimleri üzerinden hedefle uyuşmuyor.' from correct_class where n>0;
$$;

alter function public.get_schedule_scenario_hard_issues_v2(uuid)
rename to get_schedule_scenario_hard_issues_parallel_core_v2;

create or replace function public.get_schedule_scenario_hard_issues_v2(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
with
correct_requirement as (
  select count(*)::integer n from (
    select r.id,r.weekly_hours,
           count(distinct (sr.weekday,sr.period)) filter(where sr.id is not null)::integer placed
    from public.class_course_requirements r
    left join public.schedule_scenario_rows sr on sr.scenario_id=p_scenario_id and sr.requirement_id=r.id
    group by r.id,r.weekly_hours
    having count(distinct (sr.weekday,sr.period)) filter(where sr.id is not null)<>r.weekly_hours
  ) q
),
correct_class as (
  select count(*)::integer n from (
    select c.id,c.expected_weekly_hours,
           count(distinct (sr.weekday,sr.period)) filter(where sr.id is not null)::integer placed
    from public.school_classes c
    left join public.schedule_scenario_rows sr on sr.scenario_id=p_scenario_id and sr.class_id=c.id
    where c.active=true
    group by c.id,c.expected_weekly_hours
    having c.expected_weekly_hours is null
       or count(distinct (sr.weekday,sr.period)) filter(where sr.id is not null)<>c.expected_weekly_hours
  ) q
)
select * from public.get_schedule_scenario_hard_issues_parallel_core_v2(p_scenario_id)
where code not in ('REQUIREMENT_HOURS_MISMATCH','CLASS_WEEKLY_HOURS_MISMATCH')
union all
select 'REQUIREMENT_HOURS_MISMATCH',n,'Sınıf-ders haftalık saati benzersiz zaman dilimleri üzerinden hedefle uyuşmuyor.' from correct_requirement where n>0
union all
select 'CLASS_WEEKLY_HOURS_MISMATCH',n,'Sınıf haftalık saati benzersiz zaman dilimleri üzerinden hedefle uyuşmuyor.' from correct_class where n>0;
$$;

revoke all on function public.get_schedule_integrity_report_core_v2() from public;
grant execute on function public.get_schedule_integrity_report_core_v2() to authenticated;
revoke all on function public.get_schedule_scenario_hard_issues_v2(uuid) from public;
grant execute on function public.get_schedule_scenario_hard_issues_v2(uuid) to authenticated;

-- 20260819071400_schedule_rescore_refreshes_validation_v2.sql
create or replace function public.rescore_schedule_scenario_v2(p_scenario_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_score integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND';end if;

  perform public.validate_schedule_scenario_v2(p_scenario_id);

  v_score:=public.calculate_schedule_scenario_score_v2(p_scenario_id);
  update public.schedule_scenarios
  set score=v_score,
      unplaced_count=(select count(*) from public.schedule_unplaced_items where scenario_id=p_scenario_id),
      row_count=(select count(*) from public.schedule_scenario_rows where scenario_id=p_scenario_id)
  where id=p_scenario_id;
  return v_score;
end;
$$;
revoke all on function public.rescore_schedule_scenario_v2(uuid) from public;
grant execute on function public.rescore_schedule_scenario_v2(uuid) to authenticated;

-- 20260819071500_schedule_validation_single_source_v2.sql
create or replace function public.validate_schedule_scenario_v2(p_scenario_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_count integer := 0;
begin
  if not public.is_manager_or_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then
    raise exception 'SCENARIO_NOT_FOUND';
  end if;

  delete from public.schedule_scenario_integrity_issues
  where scenario_id=p_scenario_id;

  insert into public.schedule_scenario_integrity_issues(
    scenario_id,
    code,
    affected_count,
    detail
  )
  select
    p_scenario_id,
    i.code,
    greatest(coalesce(i.affected_count,1),1),
    i.detail
  from public.get_schedule_scenario_hard_issues_v2(p_scenario_id) i
  where coalesce(i.affected_count,0)>0;

  select coalesce(sum(affected_count),0)::integer
  into v_count
  from public.schedule_scenario_integrity_issues
  where scenario_id=p_scenario_id;

  return v_count;
end;
$$;

revoke all on function public.validate_schedule_scenario_v2(uuid) from public;
grant execute on function public.validate_schedule_scenario_v2(uuid) to authenticated;

create or replace function public.rescore_schedule_scenario_v2(p_scenario_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_score integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND';end if;

  perform public.validate_schedule_scenario_v2(p_scenario_id);
  v_score:=public.calculate_schedule_scenario_score_v2(p_scenario_id);

  update public.schedule_scenarios
  set score=v_score,
      unplaced_count=(select count(*) from public.schedule_unplaced_items where scenario_id=p_scenario_id),
      row_count=(select count(*) from public.schedule_scenario_rows where scenario_id=p_scenario_id)
  where id=p_scenario_id;

  return v_score;
end;
$$;

revoke all on function public.rescore_schedule_scenario_v2(uuid) from public;
grant execute on function public.rescore_schedule_scenario_v2(uuid) to authenticated;