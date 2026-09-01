-- Deterministic command parsing never writes first. Every command is previewed
-- against the same server constraint core before the user may apply it.

create or replace function public.preview_schedule_assignment_slot_v1(
  p_teacher_assignment_id uuid,
  p_weekday smallint,
  p_period smallint,
  p_classroom_id uuid default null,
  p_subgroup_id uuid default null,
  p_locked boolean default true,
  p_source_kind text default 'command_manual'
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_message text;
begin
  perform public.open_permission_context('schedule.edit');
  begin
    v_id := public.upsert_schedule_slot_permission_core_v2(
      p_teacher_assignment_id, p_weekday, p_period, p_classroom_id,
      p_subgroup_id, null, p_locked, p_source_kind
    );
    raise exception using errcode='P0001', message='OKULOS_COMMAND_PREVIEW_ROLLBACK';
  exception when others then
    if sqlerrm = 'OKULOS_COMMAND_PREVIEW_ROLLBACK' then
      return jsonb_build_object('ok', true, 'teacher_assignment_id', p_teacher_assignment_id,
        'weekday', p_weekday, 'period', p_period);
    end if;
    v_message := sqlerrm;
    return jsonb_build_object('ok', false, 'error', v_message);
  end;
end $$;

create or replace function public.preview_teacher_slot_unavailable_v1(
  p_teacher_id uuid,
  p_weekday smallint,
  p_period smallint
) returns jsonb language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('schedule.rules');
  if exists (
    select 1 from public.teacher_schedule s
    where s.active and s.institution_code = public.current_tenant_code()
      and s.teacher_id = p_teacher_id and s.weekday = p_weekday and s.period = p_period
  ) then
    return jsonb_build_object('ok', false, 'error', 'TEACHER_SLOT_ALREADY_SCHEDULED');
  end if;
  return jsonb_build_object('ok', true, 'teacher_id', p_teacher_id,
    'weekday', p_weekday, 'period', p_period);
end $$;

revoke all on function public.preview_schedule_assignment_slot_v1(uuid, smallint, smallint, uuid, uuid, boolean, text) from public, anon;
grant execute on function public.preview_schedule_assignment_slot_v1(uuid, smallint, smallint, uuid, uuid, boolean, text) to authenticated;
revoke all on function public.preview_teacher_slot_unavailable_v1(uuid, smallint, smallint) from public, anon;
grant execute on function public.preview_teacher_slot_unavailable_v1(uuid, smallint, smallint) to authenticated;
