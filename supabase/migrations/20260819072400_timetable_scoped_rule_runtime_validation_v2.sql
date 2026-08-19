-- Runtime schedule writes use the same scoped rule hierarchy as the solver.
create or replace function public.validate_schedule_semantics_v2()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_assignment public.teacher_course_assignments%rowtype;
  v_req public.class_course_requirements%rowtype;
  v_course public.course_catalog%rowtype;
  v_profile public.schedule_time_profiles%rowtype;
  v_constraint public.teacher_schedule_constraints%rowtype;
  v_rule public.course_schedule_rules%rowtype;
  v_rule_scope text;
  v_room public.classrooms%rowtype;
  v_subgroup public.class_subgroups%rowtype;
  v_lr public.lesson_room_rules%rowtype;
  v_daily integer;v_weekly integer;v_days integer;v_assignment_hours integer;v_course_daily integer;v_run integer;
  v_zero uuid:='00000000-0000-0000-0000-000000000000'::uuid;
begin
  if new.active and (new.teacher_assignment_id is null or new.class_course_requirement_id is null or new.course_id is null) then raise exception 'SCHEDULE_SEMANTIC_LINK_REQUIRED';end if;
  if not new.active then return new;end if;

  select * into v_assignment from public.teacher_course_assignments where id=new.teacher_assignment_id;
  if not found then raise exception 'TEACHER_ASSIGNMENT_NOT_FOUND';end if;
  select * into v_req from public.class_course_requirements where id=v_assignment.class_course_requirement_id;
  if not found then raise exception 'COURSE_REQUIREMENT_NOT_FOUND';end if;
  select * into v_course from public.course_catalog where id=v_req.course_id and active=true;
  if not found then raise exception 'COURSE_NOT_FOUND';end if;
  if v_assignment.teacher_id<>new.teacher_id then raise exception 'SCHEDULE_TEACHER_ASSIGNMENT_MISMATCH';end if;
  if v_req.id<>new.class_course_requirement_id or v_req.class_id is distinct from new.class_id then raise exception 'SCHEDULE_REQUIREMENT_MISMATCH';end if;
  if v_course.id<>new.course_id then raise exception 'SCHEDULE_COURSE_MISMATCH';end if;

  new.subject:=v_course.name;
  select class_name into new.class_name from public.school_classes where id=v_req.class_id and active=true;
  if new.class_name is null then raise exception 'ACTIVE_CLASS_NOT_FOUND';end if;

  if new.subgroup_id is not null then
    select * into v_subgroup from public.class_subgroups where id=new.subgroup_id and active=true;
    if not found then raise exception 'SUBGROUP_NOT_FOUND';end if;
    if v_subgroup.class_id<>new.class_id then raise exception 'SUBGROUP_CLASS_MISMATCH';end if;
    new.subgroup_key:=v_subgroup.subgroup_key;new.is_group_split:=true;
  else
    new.subgroup_key:=null;new.is_group_split:=false;
  end if;

  if new.classroom_id is not null then
    select * into v_room from public.classrooms where id=new.classroom_id and active=true;
    if not found then raise exception 'CLASSROOM_NOT_FOUND';end if;
    new.classroom:=v_room.name;
    if v_room.capacity<coalesce(public.student_count_for_schedule(new.class_id,new.subgroup_id),0) then raise exception 'ROOM_CAPACITY_EXCEEDED';end if;
    select * into v_lr from public.lesson_room_rules lr where lr.active=true and new.subject ilike lr.subject_pattern order by length(lr.subject_pattern) desc limit 1;
    if found then
      if v_lr.required_room_type is not null and v_room.room_type<>v_lr.required_room_type then raise exception 'ROOM_TYPE_MISMATCH';end if;
      if v_lr.required_department is not null and coalesce(v_room.department,'')<>v_lr.required_department then raise exception 'ROOM_DEPARTMENT_MISMATCH';end if;
      if v_lr.required_hardware is not null and v_lr.required_hardware<>'{}'::jsonb and not(v_room.hardware @> v_lr.required_hardware) then raise exception 'ROOM_HARDWARE_MISMATCH';end if;
    end if;
    if exists(select 1 from public.teacher_schedule ts where ts.active and ts.classroom_id=new.classroom_id and ts.weekday=new.weekday and ts.period=new.period and ts.id<>coalesce(new.id,v_zero)) then raise exception 'ROOM_DOUBLE_BOOKING';end if;
  else new.classroom:=null;end if;

  select * into v_profile from public.schedule_time_profiles where active=true limit 1;
  if not found then raise exception 'ACTIVE_TIME_PROFILE_REQUIRED';end if;
  if not(new.weekday=any(v_profile.teaching_days)) then raise exception 'DAY_OUTSIDE_ACTIVE_TIME_PROFILE';end if;
  if new.period<1 or new.period>v_profile.periods_per_day then raise exception 'PERIOD_OUTSIDE_ACTIVE_TIME_PROFILE';end if;
  if exists(select 1 from public.teacher_unavailability u where u.teacher_id=new.teacher_id and u.weekday=new.weekday and u.period=new.period and u.active) then raise exception 'TEACHER_UNAVAILABLE';end if;

  select * into v_constraint from public.teacher_schedule_constraints where teacher_id=new.teacher_id;
  if found then
    if v_constraint.max_daily_hours is not null then
      select count(*)::integer into v_daily from public.teacher_schedule ts where ts.teacher_id=new.teacher_id and ts.weekday=new.weekday and ts.active and ts.id<>coalesce(new.id,v_zero);
      if v_daily+1>v_constraint.max_daily_hours then raise exception 'TEACHER_DAILY_LIMIT_EXCEEDED';end if;
    end if;
    if v_constraint.max_weekly_hours is not null then
      select count(*)::integer into v_weekly from public.teacher_schedule ts where ts.teacher_id=new.teacher_id and ts.active and ts.id<>coalesce(new.id,v_zero);
      if v_weekly+1>v_constraint.max_weekly_hours then raise exception 'TEACHER_WEEKLY_LIMIT_EXCEEDED';end if;
    end if;
    if v_constraint.max_working_days is not null then
      select count(distinct weekday)::integer into v_days from public.teacher_schedule ts where ts.teacher_id=new.teacher_id and ts.active and ts.id<>coalesce(new.id,v_zero);
      if not exists(select 1 from public.teacher_schedule ts where ts.teacher_id=new.teacher_id and ts.active and ts.weekday=new.weekday and ts.id<>coalesce(new.id,v_zero)) then v_days:=v_days+1;end if;
      if v_days>v_constraint.max_working_days then raise exception 'TEACHER_MAX_WORKING_DAYS_EXCEEDED';end if;
    end if;
    if v_constraint.max_consecutive_hours is not null then
      with periods as (
        select distinct ts.period::integer p from public.teacher_schedule ts where ts.teacher_id=new.teacher_id and ts.weekday=new.weekday and ts.active and ts.id<>coalesce(new.id,v_zero)
        union select new.period::integer
      ),grouped as(select p,p-row_number() over(order by p)::integer grp from periods),runs as(select count(*)::integer len from grouped group by grp)
      select coalesce(max(len),0) into v_run from runs;
      if v_run>v_constraint.max_consecutive_hours then raise exception 'TEACHER_CONSECUTIVE_LIMIT_EXCEEDED';end if;
    end if;
  end if;

  select count(*)::integer into v_assignment_hours from public.teacher_schedule ts where ts.teacher_assignment_id=new.teacher_assignment_id and ts.active and ts.id<>coalesce(new.id,v_zero);
  if v_assignment_hours+1>v_assignment.assigned_hours then raise exception 'TEACHER_ASSIGNMENT_HOURS_EXCEEDED';end if;

  v_rule:=public.get_effective_schedule_rule_v2(v_req.id,v_assignment.id);
  v_rule_scope:=public.get_effective_schedule_rule_scope_v2(v_req.id,v_assignment.id);
  if v_rule.course_id is not null then
    if cardinality(v_rule.prohibited_days)>0 and new.weekday=any(v_rule.prohibited_days) then raise exception 'COURSE_DAY_PROHIBITED';end if;
    if cardinality(v_rule.prohibited_periods)>0 and new.period=any(v_rule.prohibited_periods) then raise exception 'COURSE_PERIOD_PROHIBITED';end if;
    if v_rule.max_per_day is not null then
      if v_rule_scope='assignment' then
        select count(distinct ts.period)::integer into v_course_daily from public.teacher_schedule ts
        where ts.teacher_assignment_id=new.teacher_assignment_id and ts.weekday=new.weekday and ts.active and ts.id<>coalesce(new.id,v_zero);
        if not exists(select 1 from public.teacher_schedule ts where ts.teacher_assignment_id=new.teacher_assignment_id and ts.weekday=new.weekday and ts.period=new.period and ts.active and ts.id<>coalesce(new.id,v_zero)) then v_course_daily:=v_course_daily+1;end if;
      else
        select count(distinct ts.period)::integer into v_course_daily from public.teacher_schedule ts
        where ts.class_course_requirement_id=new.class_course_requirement_id and ts.weekday=new.weekday and ts.active and ts.id<>coalesce(new.id,v_zero);
        if not exists(select 1 from public.teacher_schedule ts where ts.class_course_requirement_id=new.class_course_requirement_id and ts.weekday=new.weekday and ts.period=new.period and ts.active and ts.id<>coalesce(new.id,v_zero)) then v_course_daily:=v_course_daily+1;end if;
      end if;
      if v_course_daily>v_rule.max_per_day then raise exception 'COURSE_DAILY_LIMIT_EXCEEDED';end if;
    end if;
  end if;

  if new.class_id is not null then
    if new.subgroup_id is null then
      if exists(select 1 from public.teacher_schedule ts where ts.class_id=new.class_id and ts.weekday=new.weekday and ts.period=new.period and ts.active and ts.id<>coalesce(new.id,v_zero)) then raise exception 'CLASS_DOUBLE_BOOKING';end if;
    elsif exists(
      select 1 from public.teacher_schedule ts
      where ts.class_id=new.class_id and ts.weekday=new.weekday and ts.period=new.period and ts.active and ts.id<>coalesce(new.id,v_zero)
        and (ts.subgroup_id is null or ts.subgroup_id=new.subgroup_id or exists(
          select 1 from public.class_subgroup_students a join public.class_subgroup_students b on b.student_id=a.student_id
          where a.subgroup_id=new.subgroup_id and b.subgroup_id=ts.subgroup_id
        ))
    ) then raise exception 'STUDENT_GROUP_CONFLICT';end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_schedule_semantics_v2 on public.teacher_schedule;
create trigger trg_validate_schedule_semantics_v2 before insert or update on public.teacher_schedule
for each row execute function public.validate_schedule_semantics_v2();
