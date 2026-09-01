-- Daily substitution must reserve every teacher attached to an assignment.
create or replace function public.get_schedule_daily_teacher_resources_v1(p_date date default current_date)
returns table(
  event_key text,
  source_schedule_id uuid,
  teacher_id uuid,
  period smallint,
  classroom_id uuid,
  is_primary boolean
)
language sql stable security definer set search_path=public as $$
  with events as (
    select * from public.get_schedule_daily_effective_v2(p_date)
  ), resources as (
    select e.event_key,e.source_schedule_id,e.teacher_id,e.period,e.classroom_id,true is_primary
    from events e where e.teacher_id is not null
    union all
    select e.event_key,e.source_schedule_id,x.teacher_id,e.period,e.classroom_id,false
    from events e
    join public.teacher_schedule ts on ts.id=e.source_schedule_id
    join public.schedule_assignment_additional_teachers x
      on x.institution_code=ts.institution_code
     and x.teacher_assignment_id=ts.teacher_assignment_id
    where public.tenant_row_allowed(x.institution_code)
  )
  select distinct on(r.event_key,r.teacher_id)
    r.event_key,r.source_schedule_id,r.teacher_id,r.period,r.classroom_id,r.is_primary
  from resources r
  order by r.event_key,r.teacher_id,r.is_primary desc
$$;

create or replace function public.get_substitution_transfer_issues_v1(
  p_teacher uuid,p_date date,p_period smallint,p_classroom uuid
)
returns text[] language plpgsql stable security definer set search_path=public as $$
declare nb uuid;ob uuid;req smallint;avail smallint;allow_transfer boolean;prof uuid;r record;issues text[]:='{}';
begin
  if p_classroom is null then return issues;end if;
  select building_id into nb from public.classrooms where id=p_classroom and active;
  if nb is null then return issues;end if;
  select id into prof from public.schedule_time_profiles
    where active and public.tenant_row_allowed(institution_code)
    order by updated_at desc limit 1;
  if prof is null then return issues;end if;
  for r in
    select period,classroom_id from public.get_schedule_daily_teacher_resources_v1(p_date)
    where teacher_id=p_teacher and classroom_id is not null and period in(p_period-1,p_period+1)
  loop
    select building_id into ob from public.classrooms where id=r.classroom_id and active;
    if ob is null or ob=nb then continue;end if;
    req:=public.get_schedule_building_travel_minutes_v1(ob,nb);
    if r.period=p_period-1 then
      select minutes,transfer_allowed into avail,allow_transfer from public.schedule_period_breaks
      where time_profile_id=prof and after_period=r.period and public.tenant_row_allowed(institution_code);
    else
      select minutes,transfer_allowed into avail,allow_transfer from public.schedule_period_breaks
      where time_profile_id=prof and after_period=p_period and public.tenant_row_allowed(institution_code);
    end if;
    if not coalesce(allow_transfer,false) then
      issues:=array_append(issues,'BUILDING_TRANSFER_NOT_ALLOWED');
    elsif coalesce(avail,0)<req then
      issues:=array_append(issues,'BUILDING_TRANSFER_TIME_INSUFFICIENT');
    end if;
  end loop;
  return issues;
end $$;

create or replace function public.get_substitute_candidates_v4(p_absence_lesson_id uuid)
returns table(
  candidate_user_id uuid,candidate_name text,qualified boolean,duty boolean,
  weekly_load bigint,monthly_load bigint,hard_reasons text[],feasible boolean,
  rank_score numeric,reason text
)
language sql stable security definer set search_path=public as $$
with l as (
  select al.* from public.absence_lessons al
  where al.id=p_absence_lesson_id and public.tenant_row_allowed(al.institution_code)
), p as (
  select pr.user_id,pr.full_name,l.teacher_id,l.lesson_date,l.period,l.course_id,l.classroom_id,
    l.source_schedule_id
  from l join public.profiles pr on pr.role='teacher' and public.tenant_row_allowed(pr.institution_code)
  where pr.user_id<>l.teacher_id
), x as (
  select p.*,
    exists(
      select 1 from public.teacher_course_assignments ta
      join public.class_course_requirements cr on cr.id=ta.class_course_requirement_id
      where ta.teacher_id=p.user_id and cr.course_id=p.course_id
    ) qualified,
    exists(
      select 1 from public.teacher_duty_assignments d
      where d.teacher_id=p.user_id and d.duty_date=p.lesson_date
        and public.tenant_row_allowed(d.institution_code)
    ) duty,
    (select count(*) from public.substitute_assignments s
      join public.absence_lessons al on al.id=s.absence_lesson_id
      where s.substitute_user_id=p.user_id and s.active
        and public.tenant_row_allowed(s.institution_code)
        and al.lesson_date>=date_trunc('week',p.lesson_date)::date
        and al.lesson_date<(date_trunc('week',p.lesson_date)+interval '7 days')::date)::bigint weekly_load,
    (select count(*) from public.substitute_assignments s
      join public.absence_lessons al on al.id=s.absence_lesson_id
      where s.substitute_user_id=p.user_id and s.active
        and public.tenant_row_allowed(s.institution_code)
        and al.lesson_date>=date_trunc('month',p.lesson_date)::date
        and al.lesson_date<(date_trunc('month',p.lesson_date)+interval '1 month')::date)::bigint monthly_load,
    array_remove(array[
      case when exists(select 1 from public.absences a
        where a.teacher_id=p.user_id and a.absence_date=p.lesson_date and a.status<>'resolved'
          and public.tenant_row_allowed(a.institution_code)) then 'ABSENT' end,
      case when exists(select 1 from public.teacher_unavailability u
        where u.teacher_id=p.user_id and u.weekday=extract(isodow from p.lesson_date)::smallint
          and u.period=p.period and u.active and public.tenant_row_allowed(u.institution_code))
        then 'UNAVAILABLE' end,
      case when exists(select 1 from public.get_schedule_daily_teacher_resources_v1(p.lesson_date) r
        where r.teacher_id=p.user_id and r.period=p.period
          and r.source_schedule_id is distinct from p.source_schedule_id) then 'TIME_CONFLICT' end
    ],null)::text[] || public.get_substitution_transfer_issues_v1(
      p.user_id,p.lesson_date,p.period,p.classroom_id
    ) hard_reasons
  from p
), z as (
  select x.*,cardinality(hard_reasons)=0 feasible,
    (case when qualified and duty then 0 when qualified then 100 when duty then 250 else 500 end
      +weekly_load*20+monthly_load*3)::numeric rank_score
  from x
)
select user_id,full_name,qualified,duty,weekly_load,monthly_load,hard_reasons,feasible,rank_score,
  concat(case when qualified then 'ders yeterliliği doğrulandı' else 'ders yeterliliği doğrulanamadı' end,
    ' · ',case when duty then 'nöbetçi' else 'nöbetçi değil' end,
    ' · hafta ',weekly_load,' · ay ',monthly_load,
    case when cardinality(hard_reasons)>0 then ' · HARD: '||array_to_string(hard_reasons,',') else '' end)
from z order by feasible desc,rank_score,user_id
$$;

create or replace function public.assert_schedule_daily_overlay_hard_v1(p_date date)
returns void language plpgsql security definer set search_path=public as $$
declare r record;
begin
  if exists(
    select 1 from public.get_schedule_daily_teacher_resources_v1(p_date)
    group by teacher_id,period having count(*)>1
  ) then raise exception 'SUBSTITUTION_TEACHER_RESOURCE_CONFLICT';end if;
  if exists(
    select 1 from public.get_schedule_daily_effective_v2(p_date)a
    join public.get_schedule_daily_effective_v2(p_date)b
      on a.event_key<b.event_key and a.period=b.period and a.class_ids&&b.class_ids
     and cardinality(a.class_ids)>0
     and(a.subgroup_id is null or b.subgroup_id is null or a.subgroup_id=b.subgroup_id)
  ) then raise exception 'SUBSTITUTION_CLASS_CONFLICT';end if;
  if exists(
    select 1 from public.get_schedule_daily_effective_v2(p_date)e
    where e.classroom_id is not null group by e.classroom_id,e.period having count(*)>1
  ) then raise exception 'SUBSTITUTION_ROOM_CONFLICT';end if;
  if exists(
    select 1 from public.schedule_room_pools rp
    join public.classrooms c on c.room_pool_id=rp.id
    join public.get_schedule_daily_effective_v2(p_date)e on e.classroom_id=c.id
    where rp.active and public.tenant_row_allowed(rp.institution_code)
    group by rp.id,rp.max_simultaneous_activities,e.period
    having count(*)>rp.max_simultaneous_activities
  ) then raise exception 'SUBSTITUTION_ROOM_POOL_SIMULTANEOUS_LIMIT';end if;
  if exists(
    with ev as (
      select e.*,s.unknown_count,s.student_count
      from public.get_schedule_daily_effective_v2(p_date)e
      left join lateral(
        select coalesce(bool_or(sc.imported_student_count is null),false) unknown_count,
          sum(coalesce(sc.imported_student_count,0)) student_count
        from unnest(e.class_ids)cid join public.school_classes sc on sc.id=cid
      )s on true
    )
    select 1 from public.schedule_room_pools rp
    join public.classrooms c on c.room_pool_id=rp.id join ev e on e.classroom_id=c.id
    where rp.active and rp.capacity is not null and public.tenant_row_allowed(rp.institution_code)
    group by rp.id,rp.capacity,e.period
    having bool_or(e.is_overlay) and bool_or(coalesce(e.unknown_count,false))
  ) then raise exception 'SUBSTITUTION_ROOM_POOL_CAPACITY_UNKNOWN';end if;
  if exists(
    with ev as (
      select e.*,coalesce(s.student_count,0) student_count
      from public.get_schedule_daily_effective_v2(p_date)e
      left join lateral(
        select sum(coalesce(sc.imported_student_count,0)) student_count
        from unnest(e.class_ids)cid join public.school_classes sc on sc.id=cid
      )s on true
    )
    select 1 from public.schedule_room_pools rp
    join public.classrooms c on c.room_pool_id=rp.id join ev e on e.classroom_id=c.id
    where rp.active and rp.capacity is not null and public.tenant_row_allowed(rp.institution_code)
    group by rp.id,rp.capacity,e.period
    having bool_or(e.is_overlay) and sum(e.student_count)>rp.capacity
  ) then raise exception 'SUBSTITUTION_ROOM_POOL_CAPACITY_EXCEEDED';end if;
  for r in
    select distinct teacher_id,period,classroom_id
    from public.get_schedule_daily_teacher_resources_v1(p_date)
    where classroom_id is not null
  loop
    if cardinality(public.get_substitution_transfer_issues_v1(
      r.teacher_id,p_date,r.period,r.classroom_id
    ))>0 then
      raise exception '%',(public.get_substitution_transfer_issues_v1(
        r.teacher_id,p_date,r.period,r.classroom_id
      ))[1];
    end if;
  end loop;
end $$;

revoke all on function public.get_schedule_daily_teacher_resources_v1(date) from public,anon,authenticated;
revoke all on function public.get_substitution_transfer_issues_v1(uuid,date,smallint,uuid) from public,anon;
revoke all on function public.get_substitute_candidates_v4(uuid) from public,anon;
revoke all on function public.assert_schedule_daily_overlay_hard_v1(date) from public,anon,authenticated;
grant execute on function public.get_substitution_transfer_issues_v1(uuid,date,smallint,uuid) to authenticated;
grant execute on function public.get_substitute_candidates_v4(uuid) to authenticated;
