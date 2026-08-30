-- The selection table is intentionally private. This RPC is its sole operator
-- mutation path, so it must establish both an operator role and the class tenant
-- before SECURITY DEFINER bypasses the table's RLS policies.
create or replace function public.set_class_iho_application_v1(
  p_class uuid,
  p_code text,
  p_subject text default null,
  p_extra smallint default null,
  p_settings jsonb default '{}'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.school_classes;
  r public.official_timetable_application_rules;
  scope text;
  resolved jsonb;
begin
  if not public.is_manager_or_admin() then
    raise exception 'İHO ders çizelgesi uygulaması için yönetici yetkisi gerekir';
  end if;

  select *
  into c
  from public.school_classes
  where id = p_class
    and active
    and public.tenant_row_allowed(institution_code);

  if not found or c.school_type <> 'IMAM_HATIP_ORTAOKULU' then
    raise exception 'Aktif ve yetkili İHO sınıfı bulunamadı';
  end if;

  if p_code = 'IHO_STANDARD' then
    delete from public.class_timetable_application_selections
    where class_id = p_class
      and selection_scope = 'PRIMARY';
    return public.resolve_class_iho_timetable_v1(p_class);
  end if;

  select *
  into r
  from public.official_timetable_application_rules
  where code = p_code
    and active;

  if not found or not (c.grade_level = any(r.grades)) then
    raise exception 'Uygulama sınıf düzeyiyle uyumsuz';
  end if;

  scope := case
    when p_code = 'IHO_OPTIONAL_ADDITIONAL_ACTIVITY' then 'ADDITIONAL'
    else 'PRIMARY'
  end;
  resolved := public.resolve_iho_application_v1(c.grade_level, p_code, p_subject, p_extra);

  insert into public.class_timetable_application_selections(
    class_id, rule_id, selection_scope, subject_choice, extra_hours, settings
  )
  values (p_class, r.id, scope, p_subject, p_extra, coalesce(p_settings, '{}'))
  on conflict (class_id, selection_scope) do update
  set rule_id = excluded.rule_id,
      subject_choice = excluded.subject_choice,
      extra_hours = excluded.extra_hours,
      settings = excluded.settings,
      active = true,
      updated_at = now();

  return resolved || jsonb_build_object('selection_settings', coalesce(p_settings, '{}'));
end;
$$;

revoke all on function public.set_class_iho_application_v1(uuid, text, text, smallint, jsonb) from anon;
grant execute on function public.set_class_iho_application_v1(uuid, text, text, smallint, jsonb) to authenticated;
