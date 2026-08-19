-- Correct DISTINCT slot accounting after LEFT JOINs.
-- PostgreSQL composite (NULL,NULL) can otherwise behave as one distinct composite value.

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
