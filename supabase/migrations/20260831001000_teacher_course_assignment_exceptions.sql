-- A justified assignment exception is explicit, auditable and never bypasses timetable HARD rules.

alter table public.teacher_course_assignments
  add column if not exists is_justified_exception boolean not null default false,
  add column if not exists exception_reason text,
  add column if not exists exception_permission_status text,
  add column if not exists exception_approved_by uuid references public.profiles(user_id) on delete set null,
  add column if not exists exception_approved_at timestamptz;

alter table public.teacher_course_assignments
  drop constraint if exists teacher_course_assignments_exception_complete;
alter table public.teacher_course_assignments
  add constraint teacher_course_assignments_exception_complete check (
    (not is_justified_exception and exception_reason is null and exception_permission_status is null
      and exception_approved_by is null and exception_approved_at is null)
    or
    (is_justified_exception and length(btrim(coalesce(exception_reason, ''))) >= 10
      and exception_permission_status = 'NOT_ALLOWED'
      and exception_approved_by is not null and exception_approved_at is not null)
  );

create table if not exists public.teacher_course_assignment_exception_events (
  id bigint generated always as identity primary key,
  institution_code text not null references public.institutions(institution_code) on delete restrict,
  teacher_assignment_id uuid references public.teacher_course_assignments(id) on delete set null,
  class_course_requirement_id uuid not null references public.class_course_requirements(id) on delete restrict,
  teacher_id uuid not null references public.profiles(user_id) on delete restrict,
  action text not null check (action in ('CREATED', 'UPDATED', 'CLEARED')),
  permission_status text,
  reason text,
  actor_user_id uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_teacher_assignment_exception_events_assignment
  on public.teacher_course_assignment_exception_events(teacher_assignment_id, created_at desc);
create index if not exists idx_teacher_assignment_exception_events_tenant
  on public.teacher_course_assignment_exception_events(institution_code, created_at desc);

alter table public.teacher_course_assignment_exception_events enable row level security;
revoke all on table public.teacher_course_assignment_exception_events from anon, authenticated;
grant select on table public.teacher_course_assignment_exception_events to authenticated;
drop policy if exists "curriculum managers read justified teacher assignment exceptions" on public.teacher_course_assignment_exception_events;
create policy "curriculum managers read justified teacher assignment exceptions"
on public.teacher_course_assignment_exception_events for select to authenticated
using (public.has_permission('curriculum.manage') and public.tenant_row_allowed(institution_code));

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
    if new.exception_approved_by is null then new.exception_approved_by := auth.uid(); end if;
    if new.exception_approved_at is null then new.exception_approved_at := now(); end if;
  else
    new.exception_reason := null;
    new.exception_permission_status := null;
    new.exception_approved_by := null;
    new.exception_approved_at := null;
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
    or old.teacher_id is distinct from new.teacher_id or old.class_course_requirement_id is distinct from new.class_course_requirement_id
  ) then v_action := 'UPDATED';
  else return new;
  end if;

  insert into public.teacher_course_assignment_exception_events(
    institution_code, teacher_assignment_id, class_course_requirement_id, teacher_id,
    action, permission_status, reason, actor_user_id
  ) values (
    new.institution_code, new.id, new.class_course_requirement_id, new.teacher_id,
    v_action, case when new.is_justified_exception then new.exception_permission_status else old.exception_permission_status end,
    case when new.is_justified_exception then new.exception_reason else old.exception_reason end, auth.uid()
  );
  return new;
end $$;
drop trigger if exists trg_audit_teacher_course_assignment_exception_v1 on public.teacher_course_assignments;
create trigger trg_audit_teacher_course_assignment_exception_v1
after insert or update on public.teacher_course_assignments
for each row execute function public.audit_teacher_course_assignment_exception_v1();

create or replace function public.assign_teacher_to_class_course_v2(
  p_requirement_id uuid,
  p_teacher_id uuid,
  p_hours smallint default null,
  p_group text default 'main',
  p_force_exception boolean default false,
  p_exception_reason text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_required smallint; v_existing integer; v_hours smallint; v_id uuid;
  v_course_id uuid; v_status text; v_group text;
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
  if p_force_exception then
    if v_status <> 'NOT_ALLOWED' then raise exception 'TTKB_EXCEPTION_REQUIRES_NOT_ALLOWED_STATUS'; end if;
    if length(btrim(coalesce(p_exception_reason, ''))) < 10 then raise exception 'TTKB_EXCEPTION_REASON_REQUIRED'; end if;
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
    created_by, updated_at
  ) values (
    public.current_tenant_code(), p_requirement_id, p_teacher_id, v_hours, v_group,
    p_force_exception, case when p_force_exception then btrim(p_exception_reason) else null end,
    case when p_force_exception then v_status else null end,
    case when p_force_exception then auth.uid() else null end, case when p_force_exception then now() else null end,
    auth.uid(), now()
  ) on conflict(class_course_requirement_id, teacher_id, assignment_group) do update set
    assigned_hours = excluded.assigned_hours,
    is_justified_exception = excluded.is_justified_exception,
    exception_reason = excluded.exception_reason,
    exception_permission_status = excluded.exception_permission_status,
    exception_approved_by = excluded.exception_approved_by,
    exception_approved_at = excluded.exception_approved_at,
    updated_at = now()
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.get_teacher_course_assignment_exceptions_v1()
returns table(teacher_assignment_id uuid, class_course_requirement_id uuid, teacher_id uuid, course_name text, class_name text, reason text, approved_by uuid, approved_at timestamptz)
language sql stable security definer set search_path=public as $$
  select a.id, a.class_course_requirement_id, a.teacher_id, c.name, sc.class_name,
    a.exception_reason, a.exception_approved_by, a.exception_approved_at
  from public.teacher_course_assignments a
  join public.class_course_requirements r on r.id = a.class_course_requirement_id
  join public.course_catalog c on c.id = r.course_id
  join public.school_classes sc on sc.id = r.class_id
  where a.is_justified_exception and public.tenant_row_allowed(a.institution_code)
  order by sc.class_name, c.name, a.created_at;
$$;

-- Keep an approved exception visible, but do not turn it into a timetable HARD failure.
alter function public.get_schedule_integrity_report() rename to get_schedule_integrity_report_pre_teacher_exception_v1;
create or replace function public.get_schedule_integrity_report()
returns table(severity text, code text, affected_count integer, detail text)
language sql stable security definer set search_path=public as $$
  select x.severity, x.code,
    case when x.code = 'TTKB_PERMISSION_PROBLEM' then (
      select count(*)::integer from public.teacher_course_assignments a
      join public.class_course_requirements r on r.id = a.class_course_requirement_id
      where public.tenant_row_allowed(a.institution_code)
        and not a.is_justified_exception
        and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) <> 'ALLOWED'
    ) else x.affected_count end,
    x.detail
  from public.get_schedule_integrity_report_pre_teacher_exception_v1() x
  where x.code <> 'TTKB_PERMISSION_PROBLEM'
    or exists(
      select 1 from public.teacher_course_assignments a join public.class_course_requirements r on r.id = a.class_course_requirement_id
      where public.tenant_row_allowed(a.institution_code) and not a.is_justified_exception
        and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) <> 'ALLOWED'
    )
  union all
  select 'warning', 'TTKB_JUSTIFIED_EXCEPTION', count(*)::integer,
    'Gerekçeli branş dışı öğretmen ataması var; yayın öncesi yönetim onayı kontrol edilmelidir.'
  from public.teacher_course_assignments a
  where a.is_justified_exception and public.tenant_row_allowed(a.institution_code)
  having count(*) > 0;
$$;

alter function public.get_schedule_scenario_hard_issues_v2(uuid) rename to get_schedule_scenario_hard_issues_pre_teacher_exception_v1;
create or replace function public.get_schedule_scenario_hard_issues_v2(p_scenario_id uuid)
returns table(code text, affected_count integer, detail text)
language sql stable security definer set search_path=public as $$
  select x.code,
    case when x.code = 'TTKB_PERMISSION_PROBLEM' then (
      select count(distinct sr.teacher_assignment_id)::integer
      from public.schedule_scenario_rows sr
      join public.teacher_course_assignments a on a.id = sr.teacher_assignment_id
      join public.class_course_requirements r on r.id = a.class_course_requirement_id
      where sr.scenario_id = p_scenario_id and not a.is_justified_exception
        and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) <> 'ALLOWED'
    ) else x.affected_count end,
    x.detail
  from public.get_schedule_scenario_hard_issues_pre_teacher_exception_v1(p_scenario_id) x
  where x.code <> 'TTKB_PERMISSION_PROBLEM'
    or exists(
      select 1 from public.schedule_scenario_rows sr
      join public.teacher_course_assignments a on a.id = sr.teacher_assignment_id
      join public.class_course_requirements r on r.id = a.class_course_requirement_id
      where sr.scenario_id = p_scenario_id and not a.is_justified_exception
        and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) <> 'ALLOWED'
    );
$$;

alter function public.validate_schedule_scenario_v2(uuid) rename to validate_schedule_scenario_pre_teacher_exception_v1;
create or replace function public.validate_schedule_scenario_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_total integer; v_pre integer; v_invalid integer;
begin
  v_pre := public.validate_schedule_scenario_pre_teacher_exception_v1(p_scenario_id);
  select count(distinct sr.teacher_assignment_id)::integer into v_total
  from public.schedule_scenario_rows sr
  join public.teacher_course_assignments a on a.id = sr.teacher_assignment_id
  join public.class_course_requirements r on r.id = a.class_course_requirement_id
  where sr.scenario_id = p_scenario_id and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) <> 'ALLOWED';
  select count(distinct sr.teacher_assignment_id)::integer into v_invalid
  from public.schedule_scenario_rows sr
  join public.teacher_course_assignments a on a.id = sr.teacher_assignment_id
  join public.class_course_requirements r on r.id = a.class_course_requirement_id
  where sr.scenario_id = p_scenario_id and not a.is_justified_exception
    and public.teacher_course_permission_status(a.teacher_id, r.course_id, current_date) <> 'ALLOWED';
  delete from public.schedule_scenario_integrity_issues where scenario_id = p_scenario_id and code = 'TTKB_PERMISSION_PROBLEM';
  if v_invalid > 0 then
    insert into public.schedule_scenario_integrity_issues(scenario_id, code, affected_count, detail)
    values(p_scenario_id, 'TTKB_PERMISSION_PROBLEM', v_invalid, 'Senaryoda öğretmen alan-ders uygunluğu ALLOWED değil.')
    on conflict(scenario_id, code) do update set affected_count = excluded.affected_count, detail = excluded.detail, created_at = now();
  end if;
  return v_pre - coalesce(v_total, 0) + coalesce(v_invalid, 0);
end $$;

revoke all on function public.validate_teacher_course_assignment_area(), public.audit_teacher_course_assignment_exception_v1() from public;
revoke all on function public.assign_teacher_to_class_course_v2(uuid, uuid, smallint, text, boolean, text), public.get_teacher_course_assignment_exceptions_v1() from public;
grant execute on function public.assign_teacher_to_class_course_v2(uuid, uuid, smallint, text, boolean, text), public.get_teacher_course_assignment_exceptions_v1() to authenticated;
revoke all on function public.get_schedule_integrity_report(), public.get_schedule_scenario_hard_issues_v2(uuid), public.validate_schedule_scenario_v2(uuid) from public;
grant execute on function public.get_schedule_integrity_report(), public.get_schedule_scenario_hard_issues_v2(uuid), public.validate_schedule_scenario_v2(uuid) to authenticated;
