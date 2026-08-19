-- Sync pre-registration teaching area into the authenticated profile and include TTKB readiness in timetable gate.

create or replace function public.enforce_profile_insert_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pre public.pre_registered_teachers%rowtype;
  v_auth_email text;
  v_bootstrap public.super_admin_bootstrap%rowtype;
begin
  if auth.uid() is null or new.user_id <> auth.uid() then raise exception 'PROFILE_INSERT_NOT_OWN_USER'; end if;
  select lower(email) into v_auth_email from auth.users where id=auth.uid();
  if v_auth_email is null then raise exception 'AUTH_EMAIL_REQUIRED'; end if;

  select * into v_bootstrap from public.super_admin_bootstrap where email=v_auth_email and active=true limit 1;
  if found then
    new.tckn:=null; new.email:=v_auth_email; new.full_name:=v_bootstrap.full_name;
    new.role:='admin'; new.is_super_admin:=true; new.teaching_area_id:=null; new.updated_at:=now();
    return new;
  end if;

  if new.tckn is null or new.tckn !~ '^\d{11}$' then raise exception 'INVALID_TCKN'; end if;
  select * into v_pre from public.pre_registered_teachers where tckn=new.tckn and active=true limit 1;
  if not found then raise exception 'PRE_REGISTERED_TEACHER_NOT_FOUND'; end if;
  if v_pre.email is not null and lower(trim(v_pre.email))<>v_auth_email then raise exception 'EMAIL_DOES_NOT_MATCH_PRE_REGISTRATION'; end if;

  new.tckn:=v_pre.tckn; new.email:=v_auth_email; new.full_name:=v_pre.full_name;
  new.role:=v_pre.role; new.is_super_admin:=false; new.teaching_area_id:=v_pre.teaching_area_id; new.updated_at:=now();
  update public.pre_registered_teachers set email=coalesce(email,v_auth_email) where id=v_pre.id;
  return new;
end;
$$;

create or replace function public.super_admin_set_profile_teaching_area(p_user_id uuid,p_teaching_area_id uuid)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
begin
  if not public.is_super_admin() then raise exception 'NOT_SUPER_ADMIN'; end if;
  if p_teaching_area_id is not null and not exists(select 1 from public.teaching_areas where id=p_teaching_area_id and active=true) then raise exception 'TEACHING_AREA_NOT_FOUND'; end if;
  update public.profiles set teaching_area_id=p_teaching_area_id,updated_at=now() where user_id=p_user_id;
  return found;
end;
$$;
revoke all on function public.super_admin_set_profile_teaching_area(uuid,uuid) from public;
grant execute on function public.super_admin_set_profile_teaching_area(uuid,uuid) to authenticated;

-- Timetable readiness now also requires every teacher-course assignment to resolve to an ALLOWED current TTKB mapping.
create or replace function public.get_curriculum_readiness(p_class_id uuid default null)
returns table(
  class_id uuid,
  composite_key text,
  expected_hours integer,
  planned_hours integer,
  assigned_hours integer,
  unassigned_course_count integer,
  partially_assigned_course_count integer,
  ready boolean,
  blocking_reason text
)
language sql
stable
security definer
set search_path=public
as $$
  with assignment_by_req as (
    select r.id,r.class_id,r.course_id,r.weekly_hours,
      coalesce(sum(a.assigned_hours),0)::integer as assigned,
      count(a.id) filter(where a.id is not null and public.teacher_course_permission_status(a.teacher_id,r.course_id,current_date)<>'ALLOWED')::integer as ttkb_problem_count
    from public.class_course_requirements r
    left join public.teacher_course_assignments a on a.class_course_requirement_id=r.id
    group by r.id,r.class_id,r.course_id,r.weekly_hours
  ), by_class as (
    select c.id,c.composite_key,c.expected_weekly_hours,
      coalesce(sum(ar.weekly_hours),0)::integer as planned,
      coalesce(sum(ar.assigned),0)::integer as assigned,
      count(*) filter(where ar.id is not null and ar.assigned=0)::integer as unassigned,
      count(*) filter(where ar.id is not null and ar.assigned>0 and ar.assigned<ar.weekly_hours)::integer as partial,
      coalesce(sum(ar.ttkb_problem_count),0)::integer as ttkb_problems
    from public.school_classes c
    left join assignment_by_req ar on ar.class_id=c.id
    where c.active=true and (p_class_id is null or c.id=p_class_id)
    group by c.id,c.composite_key,c.expected_weekly_hours
  )
  select b.id,b.composite_key,b.expected_weekly_hours::integer,b.planned,b.assigned,b.unassigned,b.partial,
    (b.expected_weekly_hours is not null and b.planned=b.expected_weekly_hours and b.assigned=b.planned and b.unassigned=0 and b.partial=0 and b.ttkb_problems=0) as ready,
    case
      when b.expected_weekly_hours is null then 'HEDEF_HAFTALIK_SAAT_TANIMSIZ'
      when b.planned<b.expected_weekly_hours then 'DERS_YUKU_EKSIK'
      when b.planned>b.expected_weekly_hours then 'DERS_YUKU_FAZLA'
      when b.unassigned>0 then 'OGRETMEN_ATANMAMIS_DERS_VAR'
      when b.partial>0 or b.assigned<b.planned then 'OGRETMEN_SAATI_EKSIK'
      when b.assigned>b.planned then 'OGRETMEN_SAATI_FAZLA'
      when b.ttkb_problems>0 then 'TTKB_ALAN_DERS_ESLESMESI_EKSIK_VEYA_UYGUN_DEGIL'
      else null
    end
  from by_class b order by b.composite_key;
$$;
