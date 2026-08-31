-- A justified out-of-area assignment is temporary.  An expired approval must
-- become a canonical validation problem instead of remaining a permanent warning.

alter table public.teacher_course_assignments
  add column if not exists exception_valid_from date,
  add column if not exists exception_valid_until date;

update public.teacher_course_assignments
set exception_valid_from = current_date
where is_justified_exception
  and exception_valid_from is null;

alter table public.teacher_course_assignments
  alter column exception_valid_from set default current_date;

alter table public.teacher_course_assignments
  drop constraint if exists teacher_course_assignments_exception_complete;
alter table public.teacher_course_assignments
  add constraint teacher_course_assignments_exception_complete check (
    (not is_justified_exception
      and exception_reason is null and exception_permission_status is null
      and exception_approved_by is null and exception_approved_at is null
      and exception_valid_from is null and exception_valid_until is null)
    or
    (is_justified_exception and length(btrim(coalesce(exception_reason, ''))) >= 10
      and exception_permission_status = 'NOT_ALLOWED'
      and exception_approved_by is not null and exception_approved_at is not null
      and exception_valid_from is not null
      and (exception_valid_until is null or exception_valid_until >= exception_valid_from))
  );

alter table public.teacher_course_assignment_exception_events
  add column if not exists valid_from date,
  add column if not exists valid_until date;

create or replace function public.validate_teacher_course_assignment_area()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_course_id uuid; v_status text;
begin
  select r.course_id into v_course_id
  from public.class_course_requirements r
  where r.id = new.class_course_requirement_id;
  if v_course_id is null then raise exception 'COURSE_REQUIREMENT_NOT_FOUND'; end if;

  v_status := public.teacher_course_permission_status(new.teacher_id, v_course_id, current_date);
  if new.is_justified_exception then
    if v_status <> 'NOT_ALLOWED' then raise exception 'TTKB_EXCEPTION_REQUIRES_NOT_ALLOWED_STATUS'; end if;
    new.exception_reason := btrim(new.exception_reason);
    new.exception_permission_status := v_status;
    new.exception_valid_from := coalesce(new.exception_valid_from, current_date);
    if new.exception_valid_until is not null and new.exception_valid_until < new.exception_valid_from then
      raise exception 'TTKB_EXCEPTION_INVALID_DATE_RANGE';
    end if;
    if new.exception_approved_by is null then new.exception_approved_by := auth.uid(); end if;
    if new.exception_approved_at is null then new.exception_approved_at := now(); end if;
  else
    new.exception_reason := null;
    new.exception_permission_status := null;
    new.exception_approved_by := null;
    new.exception_approved_at := null;
    new.exception_valid_from := null;
    new.exception_valid_until := null;
    if v_status = 'NOT_ALLOWED' then raise exception 'TTKB_AREA_COURSE_NOT_ALLOWED'; end if;
  end if;
  return new;
end $$;

create or replace function public.audit_teacher_course_assignment_exception_v1()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_action text;
begin
  if tg_op = 'INSERT' and new.is_justified_exception then v_action := 'CREATED';
  elsif tg_op = 'UPDATE' and old.is_justified_exception and not new.is_justified_exception then v_action := 'CLEARED';
  elsif tg_op = 'UPDATE' and new.is_justified_exception and (
    not old.is_justified_exception or old.exception_reason is distinct from new.exception_reason
    or old.exception_valid_from is distinct from new.exception_valid_from
    or old.exception_valid_until is distinct from new.exception_valid_until
    or old.teacher_id is distinct from new.teacher_id or old.class_course_requirement_id is distinct from new.class_course_requirement_id
  ) then v_action := 'UPDATED';
  else return new;
  end if;

  insert into public.teacher_course_assignment_exception_events(
    institution_code, teacher_assignment_id, class_course_requirement_id, teacher_id,
    action, permission_status, reason, valid_from, valid_until, actor_user_id
  ) values (
    new.institution_code, new.id, new.class_course_requirement_id, new.teacher_id,
    v_action, case when new.is_justified_exception then new.exception_permission_status else old.exception_permission_status end,
    case when new.is_justified_exception then new.exception_reason else old.exception_reason end,
    case when new.is_justified_exception then new.exception_valid_from else old.exception_valid_from end,
    case when new.is_justified_exception then new.exception_valid_until else old.exception_valid_until end,
    auth.uid()
  );
  return new;
end $$;

create or replace function public.assign_teacher_to_class_course_v3(
  p_requirement_id uuid,
  p_teacher_id uuid,
  p_hours smallint default null,
  p_group text default 'main',
  p_force_exception boolean default false,
  p_exception_reason text default null,
  p_exception_valid_from date default null,
  p_exception_valid_until date default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_required smallint; v_existing integer; v_hours smallint; v_id uuid;
  v_course_id uuid; v_status text; v_group text; v_valid_from date;
begin
  perform public.open_permission_context('curriculum.manage');
  select r.weekly_hours, r.course_id into v_required, v_course_id
  from public.class_course_requirements r
  where r.id = p_requirement_id and public.tenant_row_allowed(r.institution_code);
  if v_course_id is null then raise exception 'COURSE_REQUIREMENT_NOT_FOUND'; end if;
  if not exists(select 1 from public.profiles p where p.user_id = p_teacher_id and p.role = 'teacher' and public.tenant_row_allowed(p.institution_code)) then
    raise exception 'TEACHER_NOT_FOUND';
  end if;
  v_status := public.teacher_course_permission_status(p_teacher_id, v_course_id, current_date);
  v_valid_from := coalesce(p_exception_valid_from, current_date);
  if p_force_exception then
    if v_status <> 'NOT_ALLOWED' then raise exception 'TTKB_EXCEPTION_REQUIRES_NOT_ALLOWED_STATUS'; end if;
    if length(btrim(coalesce(p_exception_reason, ''))) < 10 then raise exception 'TTKB_EXCEPTION_REASON_REQUIRED'; end if;
    if p_exception_valid_until is not null and p_exception_valid_until < v_valid_from then raise exception 'TTKB_EXCEPTION_INVALID_DATE_RANGE'; end if;
  elsif v_status = 'NOT_ALLOWED' then
    raise exception 'TTKB_AREA_COURSE_NOT_ALLOWED';
  end if;

  v_group := coalesce(nullif(btrim(p_group), ''), 'main');
  select coalesce(sum(a.assigned_hours), 0)::integer into v_existing
  from public.teacher_course_assignments a
  where a.class_course_requirement_id = p_requirement_id and a.assignment_group = v_group and a.teacher_id <> p_teacher_id;
  v_hours := coalesce(p_hours, v_required - v_existing);
  if v_hours <= 0 or v_existing + v_hours > v_required then raise exception 'ASSIGNED_HOURS_EXCEED_REQUIREMENT'; end if;

  insert into public.teacher_course_assignments(
    institution_code, class_course_requirement_id, teacher_id, assigned_hours, assignment_group,
    is_justified_exception, exception_reason, exception_permission_status, exception_approved_by, exception_approved_at,
    exception_valid_from, exception_valid_until, created_by, updated_at
  ) values (
    public.current_tenant_code(), p_requirement_id, p_teacher_id, v_hours, v_group,
    p_force_exception, case when p_force_exception then btrim(p_exception_reason) else null end,
    case when p_force_exception then v_status else null end,
    case when p_force_exception then auth.uid() else null end, case when p_force_exception then now() else null end,
    case when p_force_exception then v_valid_from else null end, case when p_force_exception then p_exception_valid_until else null end,
    auth.uid(), now()
  ) on conflict(class_course_requirement_id, teacher_id, assignment_group) do update set
    assigned_hours = excluded.assigned_hours,
    is_justified_exception = excluded.is_justified_exception,
    exception_reason = excluded.exception_reason,
    exception_permission_status = excluded.exception_permission_status,
    exception_approved_by = excluded.exception_approved_by,
    exception_approved_at = excluded.exception_approved_at,
    exception_valid_from = excluded.exception_valid_from,
    exception_valid_until = excluded.exception_valid_until,
    updated_at = now()
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.get_teacher_course_assignment_exceptions_v2()
returns table(teacher_assignment_id uuid, class_course_requirement_id uuid, teacher_id uuid, course_name text, class_name text, reason text, approved_by uuid, approved_at timestamptz, valid_from date, valid_until date, is_current boolean)
language sql stable security definer set search_path=public as $$
  select a.id, a.class_course_requirement_id, a.teacher_id, c.name, sc.class_name,
    a.exception_reason, a.exception_approved_by, a.exception_approved_at,
    a.exception_valid_from, a.exception_valid_until,
    a.exception_valid_from <= current_date and (a.exception_valid_until is null or a.exception_valid_until >= current_date)
  from public.teacher_course_assignments a
  join public.class_course_requirements r on r.id = a.class_course_requirement_id
  join public.course_catalog c on c.id = r.course_id
  join public.school_classes sc on sc.id = r.class_id
  where a.is_justified_exception and public.tenant_row_allowed(a.institution_code)
  order by sc.class_name, c.name, a.created_at;
$$;

-- The previous wrappers deliberately hid approved exceptions.  Retain that
-- behaviour only while their approval is within its validity window.
alter function public.get_schedule_integrity_report() rename to get_schedule_integrity_report_pre_timebound_exception_v1;
create or replace function public.get_schedule_integrity_report()
returns table(severity text, code text, affected_count integer, detail text)
language sql stable security definer set search_path=public as $$
  select x.severity, x.code, x.affected_count, x.detail
  from public.get_schedule_integrity_report_pre_timebound_exception_v1() x
  where x.code not in ('TTKB_PERMISSION_PROBLEM', 'TTKB_JUSTIFIED_EXCEPTION')
  union all
  select 'error', 'TTKB_PERMISSION_PROBLEM', count(*)::integer,
    'Öğretmen alan-ders uygunluğu ALLOWED değil veya istisna süresi dolmuş.'
  from public.teacher_course_assignments a
  join public.class_course_requirements r on r.id = a.class_course_requirement_id
  where public.tenant_row_allowed(a.institution_code)
    and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) <> 'ALLOWED'
    and not (a.is_justified_exception and a.exception_valid_from <= current_date
      and (a.exception_valid_until is null or a.exception_valid_until >= current_date))
  having count(*) > 0
  union all
  select 'warning', 'TTKB_JUSTIFIED_EXCEPTION', count(*)::integer,
    'Süreli gerekçeli branş dışı öğretmen ataması var; yayın öncesi yönetim onayı kontrol edilmelidir.'
  from public.teacher_course_assignments a
  where a.is_justified_exception and public.tenant_row_allowed(a.institution_code)
    and a.exception_valid_from <= current_date
    and (a.exception_valid_until is null or a.exception_valid_until >= current_date)
  having count(*) > 0;
$$;

alter function public.get_schedule_scenario_hard_issues_v2(uuid) rename to get_schedule_scenario_hard_issues_pre_timebound_exception_v1;
create or replace function public.get_schedule_scenario_hard_issues_v2(p_scenario_id uuid)
returns table(code text, affected_count integer, detail text)
language sql stable security definer set search_path=public as $$
  select x.code, x.affected_count, x.detail
  from public.get_schedule_scenario_hard_issues_pre_timebound_exception_v1(p_scenario_id) x
  where x.code <> 'TTKB_PERMISSION_PROBLEM'
  union all
  select 'TTKB_PERMISSION_PROBLEM', count(distinct sr.teacher_assignment_id)::integer,
    'Senaryoda öğretmen alan-ders uygunluğu ALLOWED değil veya istisna süresi dolmuş.'
  from public.schedule_scenario_rows sr
  join public.teacher_course_assignments a on a.id = sr.teacher_assignment_id
  join public.class_course_requirements r on r.id = a.class_course_requirement_id
  where sr.scenario_id = p_scenario_id
    and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) <> 'ALLOWED'
    and not (a.is_justified_exception and a.exception_valid_from <= current_date
      and (a.exception_valid_until is null or a.exception_valid_until >= current_date))
  having count(distinct sr.teacher_assignment_id) > 0;
$$;

alter function public.validate_schedule_scenario_v2(uuid) rename to validate_schedule_scenario_pre_timebound_exception_v1;
create or replace function public.validate_schedule_scenario_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_total integer; v_pre integer; v_invalid integer;
begin
  v_pre := public.validate_schedule_scenario_pre_timebound_exception_v1(p_scenario_id);
  select count(distinct sr.teacher_assignment_id)::integer into v_total
  from public.schedule_scenario_rows sr
  join public.teacher_course_assignments a on a.id = sr.teacher_assignment_id
  join public.class_course_requirements r on r.id = a.class_course_requirement_id
  where sr.scenario_id = p_scenario_id
    and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) <> 'ALLOWED';
  select count(distinct sr.teacher_assignment_id)::integer into v_invalid
  from public.schedule_scenario_rows sr
  join public.teacher_course_assignments a on a.id = sr.teacher_assignment_id
  join public.class_course_requirements r on r.id = a.class_course_requirement_id
  where sr.scenario_id = p_scenario_id
    and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) <> 'ALLOWED'
    and not (a.is_justified_exception and a.exception_valid_from <= current_date
      and (a.exception_valid_until is null or a.exception_valid_until >= current_date));
  delete from public.schedule_scenario_integrity_issues where scenario_id = p_scenario_id and code = 'TTKB_PERMISSION_PROBLEM';
  if v_invalid > 0 then
    insert into public.schedule_scenario_integrity_issues(scenario_id, code, affected_count, detail)
    values(p_scenario_id, 'TTKB_PERMISSION_PROBLEM', v_invalid, 'Senaryoda öğretmen alan-ders uygunluğu ALLOWED değil veya istisna süresi dolmuş.')
    on conflict(scenario_id, code) do update set affected_count = excluded.affected_count, detail = excluded.detail, created_at = now();
  end if;
  return v_pre - coalesce(v_total, 0) + coalesce(v_invalid, 0);
end $$;

-- Copying a curriculum must not create an unapproved, timeless exception.
create or replace function public.clone_class_curriculum(p_source_class_id uuid, p_target_class_id uuid, p_copy_teachers boolean default false)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  perform public.open_permission_context('curriculum.manage');
  if p_source_class_id = p_target_class_id then raise exception 'SOURCE_AND_TARGET_CLASS_SAME'; end if;
  if not exists(select 1 from public.school_classes where id = p_source_class_id and public.tenant_row_allowed(institution_code)) then raise exception 'SOURCE_CLASS_NOT_FOUND'; end if;
  if not exists(select 1 from public.school_classes where id = p_target_class_id and public.tenant_row_allowed(institution_code)) then raise exception 'TARGET_CLASS_NOT_FOUND'; end if;

  insert into public.class_course_requirements(class_id, course_id, weekly_hours, category, source_template_id, locked, note, updated_at)
  select p_target_class_id, course_id, weekly_hours, category, source_template_id, false, note, now()
  from public.class_course_requirements where class_id = p_source_class_id
  on conflict (class_id, course_id) do update set weekly_hours = excluded.weekly_hours, category = excluded.category,
    source_template_id = excluded.source_template_id, note = excluded.note, updated_at = now()
  where not class_course_requirements.locked;
  get diagnostics v_count = row_count;

  update public.school_classes target set expected_weekly_hours = source.expected_weekly_hours, updated_at = now()
  from public.school_classes source where source.id = p_source_class_id and target.id = p_target_class_id
    and target.institution_code = public.current_tenant_code();

  if p_copy_teachers then
    insert into public.teacher_course_assignments(
      class_course_requirement_id, teacher_id, assigned_hours, assignment_group, note, created_by,
      is_justified_exception, exception_reason, exception_permission_status, exception_approved_by, exception_approved_at,
      exception_valid_from, exception_valid_until, updated_at
    )
    select target_requirement.id, assignment.teacher_id, assignment.assigned_hours, assignment.assignment_group,
      assignment.note, auth.uid(), assignment.is_justified_exception, assignment.exception_reason,
      case when assignment.is_justified_exception then 'NOT_ALLOWED' else null end,
      case when assignment.is_justified_exception then auth.uid() else null end,
      case when assignment.is_justified_exception then now() else null end,
      case when assignment.is_justified_exception then coalesce(assignment.exception_valid_from, current_date) else null end,
      case when assignment.is_justified_exception then assignment.exception_valid_until else null end, now()
    from public.teacher_course_assignments assignment
    join public.class_course_requirements source_requirement on source_requirement.id = assignment.class_course_requirement_id
      and source_requirement.class_id = p_source_class_id
    join public.class_course_requirements target_requirement on target_requirement.class_id = p_target_class_id
      and target_requirement.course_id = source_requirement.course_id
    on conflict (class_course_requirement_id, teacher_id, assignment_group) do update set
      assigned_hours = excluded.assigned_hours, note = excluded.note, is_justified_exception = excluded.is_justified_exception,
      exception_reason = excluded.exception_reason, exception_permission_status = excluded.exception_permission_status,
      exception_approved_by = excluded.exception_approved_by, exception_approved_at = excluded.exception_approved_at,
      exception_valid_from = excluded.exception_valid_from, exception_valid_until = excluded.exception_valid_until, updated_at = now();
  end if;
  perform public.refresh_class_curriculum_status(p_target_class_id);
  return v_count;
end;
$$;

revoke all on function public.assign_teacher_to_class_course_v3(uuid, uuid, smallint, text, boolean, text, date, date), public.get_teacher_course_assignment_exceptions_v2() from public;
grant execute on function public.assign_teacher_to_class_course_v3(uuid, uuid, smallint, text, boolean, text, date, date), public.get_teacher_course_assignment_exceptions_v2() to authenticated;
revoke all on function public.validate_teacher_course_assignment_area(), public.audit_teacher_course_assignment_exception_v1() from public;
revoke all on function public.get_schedule_integrity_report(), public.get_schedule_scenario_hard_issues_v2(uuid), public.validate_schedule_scenario_v2(uuid) from public;
grant execute on function public.get_schedule_integrity_report(), public.get_schedule_scenario_hard_issues_v2(uuid), public.validate_schedule_scenario_v2(uuid) to authenticated;
