-- Final public boundary for scenario validation.  The inherited validator chain
-- keeps every existing HARD rule; this boundary only makes tenant and permission
-- checks explicit and removes anonymous access to SECURITY DEFINER functions.

create or replace function public.assert_canonical_schedule_scenario_access_v1(
  p_scenario_id uuid
) returns void
language plpgsql stable security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if not (
    public.is_manager_or_admin()
    or public.has_permission('schedule.view')
    or public.has_permission('schedule.edit')
    or public.has_permission('schedule.rules')
    or public.has_permission('schedule.generate')
    or public.has_permission('schedule.apply')
    or public.has_permission('schedule.publish')
    or public.has_permission('schedule.restore')
  ) then
    raise exception 'PERMISSION_DENIED: schedule.view';
  end if;
end $$;

create or replace function public.get_schedule_scenario_hard_issues_v2(
  p_scenario_id uuid
) returns table(code text, affected_count integer, detail text)
language plpgsql stable security definer set search_path=public as $$
begin
  perform public.assert_canonical_schedule_scenario_access_v1(p_scenario_id);
  perform public.assert_schedule_scenario_tenant_phase3_v1(p_scenario_id);
  return query
    select x.code,x.affected_count,x.detail
    from public.get_schedule_scenario_hard_issues_pre_timebound_exception_v1(p_scenario_id) x
    where x.code <> 'TTKB_PERMISSION_PROBLEM'
  union all
    select 'TTKB_PERMISSION_PROBLEM',count(distinct sr.teacher_assignment_id)::integer,
      'Senaryoda öğretmen alan-ders uygunluğu ALLOWED değil veya istisna süresi dolmuş.'
    from public.schedule_scenario_rows sr
    join public.teacher_course_assignments a on a.id=sr.teacher_assignment_id
    join public.class_course_requirements r on r.id=a.class_course_requirement_id
    where sr.scenario_id=p_scenario_id
      and public.teacher_course_permission_status(a.teacher_id,r.course_id,current_date)<>'ALLOWED'
      and not (a.is_justified_exception and a.exception_valid_from<=current_date
        and (a.exception_valid_until is null or a.exception_valid_until>=current_date))
    having count(distinct sr.teacher_assignment_id)>0;
end $$;

create or replace function public.validate_schedule_scenario_v2(
  p_scenario_id uuid
) returns integer
language plpgsql security definer set search_path=public as $$
begin
  perform public.assert_canonical_schedule_scenario_access_v1(p_scenario_id);
  perform public.assert_schedule_scenario_tenant_phase3_v1(p_scenario_id);
  return public.validate_schedule_scenario_pre_timebound_exception_v1(p_scenario_id);
end $$;

-- Internal stages are no longer data-API endpoints.  Final endpoints remain
-- callable only by authenticated users, then enforce the explicit permission
-- and tenant assertions above.
revoke all on function public.assert_canonical_schedule_scenario_access_v1(uuid),
  public.get_schedule_scenario_hard_issues_pre_timebound_exception_v1(uuid),
  public.validate_schedule_scenario_pre_timebound_exception_v1(uuid),
  public.get_schedule_scenario_hard_issues_v2(uuid),
  public.validate_schedule_scenario_v2(uuid)
from public, anon;
grant execute on function public.get_schedule_scenario_hard_issues_v2(uuid),
  public.validate_schedule_scenario_v2(uuid)
to authenticated;
