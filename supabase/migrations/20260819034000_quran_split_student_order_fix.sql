create or replace function public.prepare_quran_split(
  p_class_id uuid,
  p_academic_year text,
  p_teacher_1 uuid,
  p_teacher_2 uuid
)
returns public.quran_split_plans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_g1 uuid;
  v_g2 uuid;
  v_plan public.quran_split_plans;
  v_student record;
  v_index integer := 0;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if p_teacher_1 = p_teacher_2 then raise exception 'QURAN_GROUP_TEACHERS_MUST_DIFFER'; end if;
  select count(*)::integer into v_count from public.students where class_id=p_class_id and active=true;
  if v_count <= 25 then raise exception 'QURAN_SPLIT_REQUIRES_OVER_25_STUDENTS'; end if;

  insert into public.class_subgroups(class_id,subgroup_key,label) values(p_class_id,'KURAN-G1','Kur’an-ı Kerim Grup 1')
  on conflict(class_id,subgroup_key) do update set active=true,label=excluded.label returning id into v_g1;
  insert into public.class_subgroups(class_id,subgroup_key,label) values(p_class_id,'KURAN-G2','Kur’an-ı Kerim Grup 2')
  on conflict(class_id,subgroup_key) do update set active=true,label=excluded.label returning id into v_g2;

  delete from public.class_subgroup_students where subgroup_id in (v_g1,v_g2);
  for v_student in
    select id from public.students
    where class_id=p_class_id and active=true
    order by school_number nulls last, full_name, id
  loop
    v_index := v_index + 1;
    insert into public.class_subgroup_students(subgroup_id,student_id)
    values(case when v_index % 2=1 then v_g1 else v_g2 end, v_student.id);
  end loop;

  insert into public.quran_split_plans(class_id,academic_year,enabled,group_1_id,group_2_id,teacher_1_id,teacher_2_id,created_by,updated_at)
  values(p_class_id,p_academic_year,true,v_g1,v_g2,p_teacher_1,p_teacher_2,auth.uid(),now())
  on conflict(class_id,academic_year) do update set enabled=true,group_1_id=v_g1,group_2_id=v_g2,
    teacher_1_id=p_teacher_1,teacher_2_id=p_teacher_2,updated_at=now()
  returning * into v_plan;
  return v_plan;
end;
$$;
