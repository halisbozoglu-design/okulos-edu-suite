alter table public.schedule_generation_settings add column if not exists student_conflict_penalty integer not null default 250;

drop function if exists public.get_schedule_assignment_student_conflict_weights_v2();
create function public.get_schedule_assignment_student_conflict_weights_v2()
returns table(left_assignment_id uuid,right_assignment_id uuid,student_weight bigint,severity_weight numeric)
language sql stable security definer set search_path='public' as $$
with e as (
  select e.student_id,e.teacher_assignment_id,r.course_id,
         coalesce(req.importance,1::numeric) importance,
         coalesce(req.allow_overlap,false) allow_overlap
  from public.student_schedule_enrollments e
  join public.teacher_course_assignments ta on ta.id=e.teacher_assignment_id
  join public.class_course_requirements r on r.id=ta.class_course_requirement_id
  left join lateral (
    select bool_or(scr.allow_overlap) allow_overlap,
           max((case scr.request_kind when 'primary' then 4 when 'alternative' then 2 when 'substitute' then 1 else 1 end)::numeric / greatest(scr.priority,1)) importance
    from public.student_course_requests scr
    where scr.active and scr.student_id=e.student_id and scr.course_id=r.course_id
      and public.tenant_row_allowed(scr.institution_code)
  ) req on true
  where e.active and public.tenant_row_allowed(e.institution_code)
), pairs as (
  select least(a.teacher_assignment_id,b.teacher_assignment_id) l,
         greatest(a.teacher_assignment_id,b.teacher_assignment_id) r,
         count(distinct a.student_id)::bigint students,
         sum(least(a.importance,b.importance))::numeric severity
  from e a join e b on b.student_id=a.student_id and a.teacher_assignment_id<b.teacher_assignment_id
  where not a.allow_overlap and not b.allow_overlap
  group by 1,2
)
select l,r,students,severity from pairs where students>0 order by severity desc,students desc,l,r;
$$;

drop function if exists public.get_schedule_student_conflict_report_v2();
create function public.get_schedule_student_conflict_report_v2()
returns table(student_id uuid,student_name text,weekday smallint,period smallint,conflict_count integer,assignment_ids uuid[],subjects text[])
language sql stable security definer set search_path='public' as $$
select e.student_id,s.full_name,ts.weekday,ts.period,(count(*)-1)::integer,
       array_agg(distinct ts.teacher_assignment_id),array_agg(distinct ts.subject order by ts.subject)
from public.student_schedule_enrollments e
join public.students s on s.id=e.student_id and s.active
join public.teacher_schedule ts on ts.teacher_assignment_id=e.teacher_assignment_id and ts.active
where e.active and public.tenant_row_allowed(e.institution_code)
group by e.student_id,s.full_name,ts.weekday,ts.period
having count(*)>1
order by count(*) desc,s.full_name,ts.weekday,ts.period;
$$;

drop function if exists public.get_schedule_scenario_student_conflict_summary_v1(uuid);
create function public.get_schedule_scenario_student_conflict_summary_v1(p_scenario_id uuid)
returns table(conflict_events bigint,affected_students bigint,weighted_conflict numeric)
language sql stable security definer set search_path='public' as $$
with sr as (
  select teacher_assignment_id,weekday,period
  from public.schedule_scenario_rows
  where scenario_id=p_scenario_id and teacher_assignment_id is not null
), pair_conflicts as (
  select w.student_weight,w.severity_weight
  from sr a join sr b on a.weekday=b.weekday and a.period=b.period and a.teacher_assignment_id<b.teacher_assignment_id
  join public.get_schedule_assignment_student_conflict_weights_v2() w
    on w.left_assignment_id=a.teacher_assignment_id and w.right_assignment_id=b.teacher_assignment_id
), affected as (
  select distinct e.student_id
  from public.student_schedule_enrollments e
  join sr a on a.teacher_assignment_id=e.teacher_assignment_id
  join sr b on b.weekday=a.weekday and b.period=a.period and b.teacher_assignment_id<>a.teacher_assignment_id
  join public.student_schedule_enrollments e2 on e2.student_id=e.student_id and e2.teacher_assignment_id=b.teacher_assignment_id and e2.active
  where e.active and public.tenant_row_allowed(e.institution_code)
)
select coalesce(sum(student_weight),0)::bigint,(select count(*) from affected)::bigint,coalesce(sum(severity_weight),0)::numeric from pair_conflicts;
$$;

create or replace function public.calculate_schedule_scenario_score_v2(p_scenario_id uuid)
returns integer language sql stable security definer set search_path='public' as $$
  select greatest(least(
    public.calculate_schedule_scenario_score_pre_phase3(p_scenario_id)::bigint
    +public.get_schedule_phase3_scoped_preference_score_v1(p_scenario_id)::bigint
    +coalesce((select ceil(weighted_conflict*coalesce((select student_conflict_penalty from public.schedule_generation_settings where id=true limit 1),250))::bigint from public.get_schedule_scenario_student_conflict_summary_v1(p_scenario_id)),0),
    2147483647),-2147483648)::integer;
$$;

grant execute on function public.get_schedule_assignment_student_conflict_weights_v2() to authenticated;
grant execute on function public.get_schedule_student_conflict_report_v2() to authenticated;
grant execute on function public.get_schedule_scenario_student_conflict_summary_v1(uuid) to authenticated;
