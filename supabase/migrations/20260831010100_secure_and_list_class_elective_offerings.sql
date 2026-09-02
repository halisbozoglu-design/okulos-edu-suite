-- Forward security repair for the default anon EXECUTE grant, plus a scoped
-- read model for the operator's class-level elective decision screen.
revoke all on function public.select_official_elective_for_class_v1(uuid, uuid, smallint) from anon;

create or replace function public.list_official_electives_for_class_v1(p_class_id uuid)
returns table(
  offering_id uuid,
  course_id uuid,
  course_name text,
  category text,
  hour_options smallint[],
  elective_group_key text,
  max_selections smallint,
  source_note text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.school_classes%rowtype;
begin
  perform public.open_permission_context('curriculum.manage');
  select * into v_class
  from public.school_classes
  where id = p_class_id
    and active
    and institution_code = public.current_tenant_code();
  if not found then raise exception 'CLASS_NOT_FOUND'; end if;

  return query
  select o.id, o.course_id, c.name, o.category, o.hour_options,
         o.elective_group_key, o.max_selections, o.source_note
  from public.course_offering_rules o
  join public.course_catalog c on c.id = o.course_id and c.active
  join public.academic_years y on y.id = v_class.academic_year_id
  where o.active
    and o.institution_code = public.current_tenant_code()
    and o.academic_year = y.code
    and o.grade_level = v_class.grade_level
    and (o.program_type is null or o.program_type = v_class.program_type)
    and (lower(o.category) = 'secmeli' or o.elective_group_key is not null)
  order by coalesce(o.elective_group_key, ''), c.name;
end;
$$;

revoke all on function public.list_official_electives_for_class_v1(uuid) from public;
revoke all on function public.list_official_electives_for_class_v1(uuid) from anon;
grant execute on function public.list_official_electives_for_class_v1(uuid) to authenticated;
