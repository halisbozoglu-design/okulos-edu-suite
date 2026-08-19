-- Bridge Quran split plans to Timetable V2 without duplicate data entry.
alter table public.quran_split_plans add column if not exists sync_group_id uuid references public.schedule_sync_groups(id) on delete set null;

create or replace function public.sync_quran_plan_to_timetable(p_plan_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_plan public.quran_split_plans%rowtype;v_course uuid;v_req uuid;v_a1 uuid;v_a2 uuid;v_group uuid;v_matches integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  select * into v_plan from public.quran_split_plans where id=p_plan_id and enabled=true;
  if not found then raise exception 'QURAN_SPLIT_PLAN_REQUIRED';end if;
  select count(*),min(r.course_id),min(r.id) into v_matches,v_course,v_req
  from public.class_course_requirements r join public.course_catalog c on c.id=r.course_id
  where r.class_id=v_plan.class_id and (lower(c.name) like '%kur''an%' or lower(c.name) like '%kur’an%' or lower(c.name) like '%kuran%');
  if v_matches=0 then raise exception 'QURAN_COURSE_REQUIREMENT_NOT_FOUND';end if;
  if v_matches>1 then raise exception 'QURAN_COURSE_REQUIREMENT_AMBIGUOUS';end if;
  select id into v_a1 from public.teacher_course_assignments where class_course_requirement_id=v_req and teacher_id=v_plan.teacher_1_id limit 1;
  select id into v_a2 from public.teacher_course_assignments where class_course_requirement_id=v_req and teacher_id=v_plan.teacher_2_id limit 1;
  if v_a1 is null or v_a2 is null then raise exception 'QURAN_TEACHER_ASSIGNMENTS_REQUIRED';end if;
  if v_plan.sync_group_id is not null and exists(select 1 from public.schedule_sync_groups where id=v_plan.sync_group_id) then v_group:=v_plan.sync_group_id;
  else
    insert into public.schedule_sync_groups(name,class_id,required_simultaneous,note,active)
    values('Kur’an Paralel · '||(select composite_key from public.school_classes where id=v_plan.class_id)||' · '||v_plan.academic_year,v_plan.class_id,true,'Kur’an split planından otomatik oluşturuldu',true)
    on conflict(name) do update set active=true,class_id=excluded.class_id returning id into v_group;
    update public.quran_split_plans set sync_group_id=v_group,updated_at=now() where id=v_plan.id;
  end if;
  delete from public.schedule_sync_group_members where sync_group_id=v_group;
  insert into public.schedule_sync_group_members(sync_group_id,teacher_assignment_id,subgroup_id,block_hours)
  values(v_group,v_a1,v_plan.group_1_id,1),(v_group,v_a2,v_plan.group_2_id,1);
  return v_group;
end;$$;
revoke all on function public.sync_quran_plan_to_timetable(uuid) from public;
grant execute on function public.sync_quran_plan_to_timetable(uuid) to authenticated;

create or replace function public.assign_quran_parallel_lesson(
  p_class_id uuid,p_academic_year text,p_weekday smallint,p_period smallint,p_subject text,
  p_classroom_1 uuid default null,p_classroom_2 uuid default null
)
returns integer language plpgsql security definer set search_path=public as $$
declare
  v_plan public.quran_split_plans%rowtype;v_group uuid;v_m1 public.schedule_sync_group_members%rowtype;v_m2 public.schedule_sync_group_members%rowtype;v_s1 uuid;v_s2 uuid;v_block uuid:=gen_random_uuid();
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  select * into v_plan from public.quran_split_plans where class_id=p_class_id and academic_year=p_academic_year and enabled=true;
  if not found then raise exception 'QURAN_SPLIT_PLAN_REQUIRED';end if;
  v_group:=public.sync_quran_plan_to_timetable(v_plan.id);
  select * into v_m1 from public.schedule_sync_group_members where sync_group_id=v_group and subgroup_id=v_plan.group_1_id limit 1;
  select * into v_m2 from public.schedule_sync_group_members where sync_group_id=v_group and subgroup_id=v_plan.group_2_id limit 1;
  v_s1:=public.upsert_schedule_slot_v2(v_m1.teacher_assignment_id,p_weekday,p_period,p_classroom_1,v_plan.group_1_id,null,false,'manual');
  v_s2:=public.upsert_schedule_slot_v2(v_m2.teacher_assignment_id,p_weekday,p_period,p_classroom_2,v_plan.group_2_id,null,false,'manual');
  update public.teacher_schedule set sync_group_id=v_group,block_key=v_block where id in(v_s1,v_s2);
  return 2;
end;$$;
revoke all on function public.assign_quran_parallel_lesson(uuid,text,smallint,smallint,text,uuid,uuid) from public;
grant execute on function public.assign_quran_parallel_lesson(uuid,text,smallint,smallint,text,uuid,uuid) to authenticated;
