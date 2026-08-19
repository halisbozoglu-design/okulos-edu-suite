-- Connect central calendar to timetable publication and duty operations.

create or replace function public.publish_current_schedule(
  p_effective_from date,
  p_academic_year text default null,
  p_title text default 'Haftalık Ders Programı',
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_publication_id uuid;
  v_hash text;
  v_count integer;
  v_payload text;
  v_year public.academic_years%rowtype;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if p_effective_from is null then raise exception 'EFFECTIVE_DATE_REQUIRED'; end if;

  select * into v_year from public.academic_years where active=true limit 1;
  if not found then raise exception 'ACTIVE_ACADEMIC_YEAR_REQUIRED'; end if;
  if p_effective_from < v_year.starts_on or p_effective_from > v_year.ends_on then
    raise exception 'EFFECTIVE_DATE_OUTSIDE_ACTIVE_ACADEMIC_YEAR';
  end if;

  perform public.assert_curriculum_ready_for_timetable();

  select count(*)::integer into v_count from public.teacher_schedule where active=true;
  if v_count=0 then raise exception 'EMPTY_SCHEDULE_CANNOT_BE_PUBLISHED'; end if;

  select string_agg(
    concat_ws('|',ts.teacher_id::text,coalesce(ts.class_id::text,''),ts.weekday::text,ts.period::text,ts.class_name,ts.subject,
      coalesce(ts.classroom,''),coalesce(ts.classroom_id::text,''),coalesce(ts.subgroup_id::text,''),coalesce(ts.subgroup_key,''),ts.is_group_split::text),
    E'\n' order by ts.teacher_id,ts.weekday,ts.period,coalesce(ts.subgroup_key,''),ts.id
  ) into v_payload from public.teacher_schedule ts where ts.active=true;
  v_hash:=encode(digest(coalesce(v_payload,''),'sha256'),'hex');

  insert into public.schedule_publications(effective_from,academic_year,title,note,schedule_hash,row_count,published_by)
  values(p_effective_from,coalesce(nullif(trim(p_academic_year),''),v_year.code),coalesce(nullif(trim(p_title),''),'Haftalık Ders Programı'),nullif(trim(p_note),''),v_hash,v_count,auth.uid())
  returning id into v_publication_id;

  insert into public.schedule_publication_rows(
    publication_id,source_schedule_id,teacher_id,class_id,weekday,period,class_name,subject,classroom,classroom_id,subgroup_id,subgroup_key,is_group_split,snapshot
  )
  select v_publication_id,ts.id,ts.teacher_id,ts.class_id,ts.weekday,ts.period,ts.class_name,ts.subject,ts.classroom,ts.classroom_id,
    ts.subgroup_id,ts.subgroup_key,ts.is_group_split,to_jsonb(ts)
  from public.teacher_schedule ts where ts.active=true
  order by ts.teacher_id,ts.weekday,ts.period,coalesce(ts.subgroup_key,''),ts.id;

  return v_publication_id;
end;
$$;

create or replace function public.guard_operational_date_in_academic_year()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare v_date date;
begin
  v_date:=case when tg_table_name='duty_rotation' then new.duty_date else new.duty_date end;
  if not exists(select 1 from public.academic_years where active=true and v_date between starts_on and ends_on) then
    raise exception 'DUTY_DATE_OUTSIDE_ACTIVE_ACADEMIC_YEAR';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_duty_rotation_academic_year on public.duty_rotation;
create trigger trg_guard_duty_rotation_academic_year
before insert or update of duty_date on public.duty_rotation
for each row execute function public.guard_operational_date_in_academic_year();

drop trigger if exists trg_guard_teacher_duty_academic_year on public.teacher_duty_assignments;
create trigger trg_guard_teacher_duty_academic_year
before insert or update of duty_date on public.teacher_duty_assignments
for each row execute function public.guard_operational_date_in_academic_year();
