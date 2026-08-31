-- A teacher-course mismatch is a user-controlled manual assignment, not a
-- time-bound exception workflow. The only extra interaction is confirming the
-- warning at the moment of assignment.

alter table public.teacher_course_assignments
  add column if not exists is_manual_override boolean not null default false;

-- Preserve already-approved records as confirmed manual assignments, then
-- remove the now-obsolete reason, approval and validity data.
update public.teacher_course_assignments
set is_manual_override = true
where is_justified_exception;

create or replace function public.validate_teacher_course_assignment_area()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_course_id uuid; v_status text;
begin
  select r.course_id into v_course_id
  from public.class_course_requirements r
  where r.id = new.class_course_requirement_id;
  if v_course_id is null then raise exception 'COURSE_REQUIREMENT_NOT_FOUND'; end if;

  v_status := public.teacher_course_permission_status(new.teacher_id, v_course_id, current_date);
  if v_status = 'NOT_ALLOWED' and not new.is_manual_override then
    raise exception 'MANUAL_ASSIGNMENT_CONFIRMATION_REQUIRED';
  end if;
  if new.is_manual_override and v_status <> 'NOT_ALLOWED' then
    raise exception 'MANUAL_OVERRIDE_REQUIRES_NOT_ALLOWED_STATUS';
  end if;

  -- These columns belonged to the retired approval workflow. They are always
  -- cleared so a confirmation never carries a user-entered reason or date.
  new.is_justified_exception := false;
  new.exception_reason := null;
  new.exception_permission_status := null;
  new.exception_approved_by := null;
  new.exception_approved_at := null;
  new.exception_valid_from := null;
  new.exception_valid_until := null;
  return new;
end $$;

-- Let the replacement trigger normalise legacy rows before enforcing the
-- simplified invariant.
update public.teacher_course_assignments
set is_justified_exception = false,
    exception_reason = null,
    exception_permission_status = null,
    exception_approved_by = null,
    exception_approved_at = null,
    exception_valid_from = null,
    exception_valid_until = null
where is_justified_exception
   or exception_reason is not null
   or exception_permission_status is not null
   or exception_approved_by is not null
   or exception_approved_at is not null
   or exception_valid_from is not null
   or exception_valid_until is not null;

alter table public.teacher_course_assignments
  drop constraint if exists teacher_course_assignments_exception_complete;
alter table public.teacher_course_assignments
  add constraint teacher_course_assignments_manual_override_consistent check (
    not is_justified_exception
    and exception_reason is null
    and exception_permission_status is null
    and exception_approved_by is null
    and exception_approved_at is null
    and exception_valid_from is null
    and exception_valid_until is null
  );

create or replace function public.audit_teacher_course_assignment_exception_v1()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_action text;
begin
  if tg_op = 'INSERT' and new.is_manual_override then v_action := 'CREATED';
  elsif tg_op = 'UPDATE' and old.is_manual_override and not new.is_manual_override then v_action := 'CLEARED';
  elsif tg_op = 'UPDATE' and new.is_manual_override and (
    not old.is_manual_override or old.teacher_id is distinct from new.teacher_id
    or old.class_course_requirement_id is distinct from new.class_course_requirement_id
  ) then v_action := 'UPDATED';
  else return new;
  end if;

  insert into public.teacher_course_assignment_exception_events(
    institution_code, teacher_assignment_id, class_course_requirement_id, teacher_id,
    action, permission_status, reason, valid_from, valid_until, actor_user_id
  ) values (
    new.institution_code, new.id, new.class_course_requirement_id, new.teacher_id,
    v_action, case when new.is_manual_override then 'NOT_ALLOWED' else null end,
    case when new.is_manual_override then 'Kullanıcı alan–ders uyarısını onayladı.' else null end,
    null, null, auth.uid()
  );
  return new;
end $$;

create or replace function public.assign_teacher_to_class_course_v4(
  p_requirement_id uuid,
  p_teacher_id uuid,
  p_hours smallint default null,
  p_group text default 'main',
  p_confirm_manual_override boolean default false
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_required smallint; v_existing integer; v_hours smallint; v_id uuid;
  v_course_id uuid; v_status text; v_group text; v_is_manual_override boolean;
begin
  perform public.open_permission_context('curriculum.manage');
  select r.weekly_hours, r.course_id into v_required, v_course_id
  from public.class_course_requirements r
  where r.id = p_requirement_id and public.tenant_row_allowed(r.institution_code);
  if v_course_id is null then raise exception 'COURSE_REQUIREMENT_NOT_FOUND'; end if;
  if not exists(
    select 1 from public.profiles p
    where p.user_id = p_teacher_id and p.role = 'teacher'
      and public.tenant_row_allowed(p.institution_code)
  ) then raise exception 'TEACHER_NOT_FOUND'; end if;

  v_status := public.teacher_course_permission_status(p_teacher_id, v_course_id, current_date);
  if v_status = 'NOT_ALLOWED' and not p_confirm_manual_override then
    raise exception 'MANUAL_ASSIGNMENT_CONFIRMATION_REQUIRED';
  end if;
  v_is_manual_override := v_status = 'NOT_ALLOWED' and p_confirm_manual_override;

  v_group := coalesce(nullif(btrim(p_group), ''), 'main');
  select coalesce(sum(a.assigned_hours), 0)::integer into v_existing
  from public.teacher_course_assignments a
  where a.class_course_requirement_id = p_requirement_id
    and a.assignment_group = v_group and a.teacher_id <> p_teacher_id;
  v_hours := coalesce(p_hours, v_required - v_existing);
  if v_hours <= 0 or v_existing + v_hours > v_required then
    raise exception 'ASSIGNED_HOURS_EXCEED_REQUIREMENT';
  end if;

  insert into public.teacher_course_assignments(
    institution_code, class_course_requirement_id, teacher_id, assigned_hours,
    assignment_group, is_manual_override, created_by, updated_at
  ) values (
    public.current_tenant_code(), p_requirement_id, p_teacher_id, v_hours,
    v_group, v_is_manual_override, auth.uid(), now()
  ) on conflict(class_course_requirement_id, teacher_id, assignment_group) do update set
    assigned_hours = excluded.assigned_hours,
    is_manual_override = excluded.is_manual_override,
    updated_at = now()
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.get_manual_teacher_assignment_overrides_v1()
returns table(
  teacher_assignment_id uuid, course_name text, class_name text, teacher_name text
) language sql stable security definer set search_path=public as $$
  select a.id, c.name, sc.class_name, coalesce(p.full_name, 'Öğretmen')
  from public.teacher_course_assignments a
  join public.class_course_requirements r on r.id = a.class_course_requirement_id
  join public.course_catalog c on c.id = r.course_id
  join public.school_classes sc on sc.id = r.class_id
  left join public.profiles p on p.user_id = a.teacher_id
  where a.is_manual_override
    and public.tenant_row_allowed(a.institution_code)
  order by sc.class_name, c.name, p.full_name;
$$;

alter function public.get_schedule_integrity_report()
  rename to get_schedule_integrity_report_pre_manual_override_v1;
create or replace function public.get_schedule_integrity_report()
returns table(severity text, code text, affected_count integer, detail text)
language sql stable security definer set search_path=public as $$
  select x.severity, x.code, x.affected_count, x.detail
  from public.get_schedule_integrity_report_pre_manual_override_v1() x
  where x.code not in ('TTKB_PERMISSION_PROBLEM', 'TTKB_JUSTIFIED_EXCEPTION')
  union all
  select 'error', 'TTKB_PERMISSION_PROBLEM', count(*)::integer,
    'Öğretmen alan–ders uygunluğu yok ve kullanıcı manuel atamayı onaylamadı.'
  from public.teacher_course_assignments a
  join public.class_course_requirements r on r.id = a.class_course_requirement_id
  where public.tenant_row_allowed(a.institution_code)
    and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) = 'NOT_ALLOWED'
    and not a.is_manual_override
  having count(*) > 0
  union all
  select 'warning', 'TTKB_MANUAL_OVERRIDE', count(*)::integer,
    'Kullanıcı onayıyla branş dışı manuel öğretmen ataması var.'
  from public.teacher_course_assignments a
  where a.is_manual_override and public.tenant_row_allowed(a.institution_code)
  having count(*) > 0;
$$;

alter function public.get_schedule_scenario_hard_issues_v2(uuid)
  rename to get_schedule_scenario_hard_issues_pre_manual_override_v1;
create or replace function public.get_schedule_scenario_hard_issues_v2(p_scenario_id uuid)
returns table(code text, affected_count integer, detail text)
language plpgsql stable security definer set search_path=public as $$
begin
  perform public.assert_canonical_schedule_scenario_access_v1(p_scenario_id);
  perform public.assert_schedule_scenario_tenant_phase3_v1(p_scenario_id);
  return query
    select x.code, x.affected_count, x.detail
    from public.get_schedule_scenario_hard_issues_pre_manual_override_v1(p_scenario_id) x
    where x.code <> 'TTKB_PERMISSION_PROBLEM'
  union all
    select 'TTKB_PERMISSION_PROBLEM', count(distinct sr.teacher_assignment_id)::integer,
      'Senaryoda öğretmen alan–ders uygunluğu yok ve manuel atama onaylanmadı.'
    from public.schedule_scenario_rows sr
    join public.teacher_course_assignments a on a.id = sr.teacher_assignment_id
    join public.class_course_requirements r on r.id = a.class_course_requirement_id
    where sr.scenario_id = p_scenario_id
      and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) = 'NOT_ALLOWED'
      and not a.is_manual_override
    having count(distinct sr.teacher_assignment_id) > 0;
end $$;

alter function public.validate_schedule_scenario_v2(uuid)
  rename to validate_schedule_scenario_pre_manual_override_v1;
create or replace function public.validate_schedule_scenario_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_pre integer; v_total integer; v_invalid integer;
begin
  v_pre := public.validate_schedule_scenario_pre_manual_override_v1(p_scenario_id);
  select count(distinct sr.teacher_assignment_id)::integer into v_total
  from public.schedule_scenario_rows sr
  join public.teacher_course_assignments a on a.id = sr.teacher_assignment_id
  join public.class_course_requirements r on r.id = a.class_course_requirement_id
  where sr.scenario_id = p_scenario_id
    and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) = 'NOT_ALLOWED';
  select count(distinct sr.teacher_assignment_id)::integer into v_invalid
  from public.schedule_scenario_rows sr
  join public.teacher_course_assignments a on a.id = sr.teacher_assignment_id
  join public.class_course_requirements r on r.id = a.class_course_requirement_id
  where sr.scenario_id = p_scenario_id
    and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) = 'NOT_ALLOWED'
    and not a.is_manual_override;
  delete from public.schedule_scenario_integrity_issues
  where scenario_id = p_scenario_id and code = 'TTKB_PERMISSION_PROBLEM';
  if v_invalid > 0 then
    insert into public.schedule_scenario_integrity_issues(scenario_id, code, affected_count, detail)
    values (p_scenario_id, 'TTKB_PERMISSION_PROBLEM', v_invalid,
      'Senaryoda öğretmen alan–ders uygunluğu yok ve manuel atama onaylanmadı.')
    on conflict(scenario_id, code) do update set
      affected_count = excluded.affected_count, detail = excluded.detail, created_at = now();
  end if;
  return v_pre - coalesce(v_total, 0) + coalesce(v_invalid, 0);
end $$;

revoke all on function public.assign_teacher_to_class_course_v3(uuid, uuid, smallint, text, boolean, text, date, date) from authenticated;
revoke all on function public.assign_teacher_to_class_course_v4(uuid, uuid, smallint, text, boolean) from public, anon;
grant execute on function public.assign_teacher_to_class_course_v4(uuid, uuid, smallint, text, boolean) to authenticated;
revoke all on function public.get_manual_teacher_assignment_overrides_v1() from public, anon;
grant execute on function public.get_manual_teacher_assignment_overrides_v1() to authenticated;
revoke all on function public.validate_teacher_course_assignment_area(), public.audit_teacher_course_assignment_exception_v1() from public, anon;
revoke all on function public.get_schedule_integrity_report(), public.get_schedule_scenario_hard_issues_v2(uuid), public.validate_schedule_scenario_v2(uuid) from public, anon;
grant execute on function public.get_schedule_integrity_report(), public.get_schedule_scenario_hard_issues_v2(uuid), public.validate_schedule_scenario_v2(uuid) to authenticated;
