-- These maintenance RPCs are invoked from operator UI flows.  They remain
-- callable by their respective delegated roles, but must establish that role
-- and the target tenant before SECURITY DEFINER bypasses table RLS.
create or replace function public.refresh_class_curriculum_status(p_class_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected integer;
  v_total integer;
  v_status text;
begin
  perform public.open_permission_context('curriculum.manage');

  select expected_weekly_hours
  into v_expected
  from public.school_classes
  where id = p_class_id
    and institution_code = public.current_tenant_code();

  if not found then
    raise exception 'CLASS_NOT_FOUND';
  end if;

  select coalesce(sum(weekly_hours), 0)::integer
  into v_total
  from public.class_course_requirements
  where class_id = p_class_id;

  v_status := case
    when v_expected is null then 'draft'
    when v_total < v_expected then 'draft'
    when v_total = v_expected then 'complete'
    else 'overflow'
  end;

  update public.school_classes
  set curriculum_status = v_status,
      updated_at = now()
  where id = p_class_id
    and institution_code = public.current_tenant_code();

  return v_status;
end;
$$;

create or replace function public.refresh_schedule_repair_suggestions_v1(p_scenario_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  u record;
  n integer := 0;
begin
  perform public.open_permission_context('schedule.generate');
  perform public.assert_schedule_scenario_tenant_phase3_v1(p_scenario_id);

  delete from public.schedule_repair_suggestions
  where scenario_id = p_scenario_id
    and applied_at is null;

  for u in
    select * from public.schedule_unplaced_items where scenario_id = p_scenario_id
  loop
    if coalesce((u.diagnostic ->> 'teacher_unavailable')::integer, 0) > 0 then
      insert into public.schedule_repair_suggestions(
        scenario_id, unplaced_item_id, rank, action_code, title, description, proposed_change, estimated_gain
      ) values (
        p_scenario_id, u.id, 1, 'EXPAND_TEACHER_WINDOW',
        'Öğretmen uygunluk penceresini gözden geçir',
        coalesce(u.subject, 'Ders') || ' için yalnız soft uygunluk/tercih pencerelerini genişletmek yeni aday saat oluşturabilir.',
        jsonb_build_object('target', 'teacher_constraint', 'operation', 'relax_soft_only'), 3
      );
      n := n + 1;
    end if;

    if coalesce((u.diagnostic ->> 'daily_limit')::integer, 0) > 0 then
      insert into public.schedule_repair_suggestions(
        scenario_id, unplaced_item_id, rank, action_code, title, description, proposed_change, estimated_gain
      ) values (
        p_scenario_id, u.id, 2, 'REBALANCE_DAILY_LOAD',
        'Günlük yükü başka güne kaydır',
        coalesce(u.subject, 'Ders') || ' için günlük soft limit dolu. Aynı öğretmen/sınıfın daha boş günlerine yeniden dağıtım önerilir.',
        jsonb_build_object('target', 'daily_load', 'operation', 'rebalance'), 2
      );
      n := n + 1;
    end if;

    if coalesce((u.diagnostic ->> 'consecutive_limit')::integer, 0) > 0 then
      insert into public.schedule_repair_suggestions(
        scenario_id, unplaced_item_id, rank, action_code, title, description, proposed_change, estimated_gain
      ) values (
        p_scenario_id, u.id, 3, 'RELAX_SOFT_CONSECUTIVE',
        'Ardışık ders tercihini esnet',
        coalesce(u.subject, 'Ders') || ' için yalnız SOFT ardışıklık kuralını bir kademe esneterek tekrar dene.',
        jsonb_build_object('target', 'consecutive_soft_rule', 'operation', 'relax_one_level'), 2
      );
      n := n + 1;
    end if;

    if coalesce((u.diagnostic ->> 'course_time_rule')::integer, 0) > 0 then
      insert into public.schedule_repair_suggestions(
        scenario_id, unplaced_item_id, rank, action_code, title, description, proposed_change, estimated_gain
      ) values (
        p_scenario_id, u.id, 4, 'REVIEW_COURSE_TIME_SOFT',
        'Ders zaman tercihini gözden geçir',
        coalesce(u.subject, 'Ders') || ' için zaman kuralı adayları daraltıyor. HARD olmayan zaman tercihlerini gevşet.',
        jsonb_build_object('target', 'course_time_rule', 'operation', 'relax_soft_only'), 2
      );
      n := n + 1;
    end if;

    if not exists (
      select 1 from public.schedule_repair_suggestions s where s.unplaced_item_id = u.id
    ) then
      insert into public.schedule_repair_suggestions(
        scenario_id, unplaced_item_id, rank, action_code, title, description, proposed_change, estimated_gain
      ) values (
        p_scenario_id, u.id, 9, 'MANUAL_REVIEW',
        'Güvenli elle yerleştirme seçeneklerini göster',
        coalesce(u.subject, 'Ders') || ' için hard kuralları bozmadan otomatik çözüm bulunamadı. Uygun boş hücreleri ve takas seçeneklerini göster.',
        jsonb_build_object('target', 'manual_assist', 'operation', 'show_safe_slots'), 1
      );
      n := n + 1;
    end if;
  end loop;

  return n;
end;
$$;
