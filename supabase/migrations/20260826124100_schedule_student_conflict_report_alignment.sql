create or replace function public.get_schedule_student_conflict_report_v2()
returns table(student_id uuid,student_name text,weekday smallint,period smallint,conflict_count integer,assignment_ids uuid[],subjects text[])
language sql stable security definer set search_path='public' as $$
with e as (
  select en.student_id,en.teacher_assignment_id,
         coalesce(req.allow_overlap,false) allow_overlap
  from public.student_schedule_enrollments en
  join public.teacher_course_assignments ta on ta.id=en.teacher_assignment_id
  join public.class_course_requirements cr on cr.id=ta.class_course_requirement_id
  left join lateral (
    select bool_or(scr.allow_overlap) allow_overlap
    from public.student_course_requests scr
    where scr.active and scr.student_id=en.student_id and scr.course_id=cr.course_id
      and public.tenant_row_allowed(scr.institution_code)
  ) req on true
  where en.active and public.tenant_row_allowed(en.institution_code)
), events as (
  select a.student_id,ta.weekday,ta.period,a.teacher_assignment_id left_id,b.teacher_assignment_id right_id
  from e a join e b on b.student_id=a.student_id and a.teacher_assignment_id<b.teacher_assignment_id
  join public.teacher_schedule ta on ta.teacher_assignment_id=a.teacher_assignment_id and ta.active
  join public.teacher_schedule tb on tb.teacher_assignment_id=b.teacher_assignment_id and tb.active and tb.weekday=ta.weekday and tb.period=ta.period
  where not a.allow_overlap and not b.allow_overlap
), grouped as (
  select student_id,weekday,period,count(*)::integer conflict_count,
         array_agg(distinct x.assignment_id) assignment_ids
  from events ev
  cross join lateral (values(ev.left_id),(ev.right_id)) x(assignment_id)
  group by student_id,weekday,period
)
select g.student_id,s.full_name,g.weekday,g.period,g.conflict_count,g.assignment_ids,
       array(select distinct ts.subject from public.teacher_schedule ts where ts.active and ts.teacher_assignment_id=any(g.assignment_ids) order by ts.subject)
from grouped g join public.students s on s.id=g.student_id and s.active
order by g.conflict_count desc,s.full_name,g.weekday,g.period;
$$;

create or replace function public.get_schedule_scenario_student_conflict_summary_v1(p_scenario_id uuid)
returns table(conflict_events bigint,affected_students bigint,weighted_conflict numeric)
language sql stable security definer set search_path='public' as $$
with sr as (
  select teacher_assignment_id,weekday,period
  from public.schedule_scenario_rows
  where scenario_id=p_scenario_id and teacher_assignment_id is not null
), pair_conflicts as (
  select w.left_assignment_id,w.right_assignment_id,w.student_weight,w.severity_weight
  from sr a join sr b on a.weekday=b.weekday and a.period=b.period and a.teacher_assignment_id<b.teacher_assignment_id
  join public.get_schedule_assignment_student_conflict_weights_v2() w
    on w.left_assignment_id=a.teacher_assignment_id and w.right_assignment_id=b.teacher_assignment_id
), affected as (
  select distinct e.student_id
  from pair_conflicts pc
  join public.student_schedule_enrollments e on e.active and e.teacher_assignment_id=pc.left_assignment_id and public.tenant_row_allowed(e.institution_code)
  join public.student_schedule_enrollments e2 on e2.active and e2.student_id=e.student_id and e2.teacher_assignment_id=pc.right_assignment_id
  join public.teacher_course_assignments ta on ta.id=e.teacher_assignment_id
  join public.class_course_requirements cr on cr.id=ta.class_course_requirement_id
  join public.teacher_course_assignments ta2 on ta2.id=e2.teacher_assignment_id
  join public.class_course_requirements cr2 on cr2.id=ta2.class_course_requirement_id
  left join lateral (select coalesce(bool_or(scr.allow_overlap),false) allowed from public.student_course_requests scr where scr.active and scr.student_id=e.student_id and scr.course_id=cr.course_id and public.tenant_row_allowed(scr.institution_code)) a on true
  left join lateral (select coalesce(bool_or(scr.allow_overlap),false) allowed from public.student_course_requests scr where scr.active and scr.student_id=e.student_id and scr.course_id=cr2.course_id and public.tenant_row_allowed(scr.institution_code)) b on true
  where not a.allowed and not b.allowed
)
select coalesce(sum(student_weight),0)::bigint,(select count(*) from affected)::bigint,coalesce(sum(severity_weight),0)::numeric from pair_conflicts;
$$;
