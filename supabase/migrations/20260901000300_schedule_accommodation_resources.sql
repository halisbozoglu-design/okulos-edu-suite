-- Neutral timetable accommodations: resource capabilities + individual participation.
-- Deliberately stores no diagnosis, disability, medical detail or justification.
alter table public.classrooms add column if not exists schedule_capabilities text[] not null default '{}';
alter table public.class_course_requirements add column if not exists required_room_capabilities text[] not null default '{}';
alter table public.student_schedule_enrollments add column if not exists participation_kind text not null default 'REGULAR';
do $$begin
 if not exists(select 1 from pg_constraint where conname='student_schedule_enrollments_participation_kind_check') then
  alter table public.student_schedule_enrollments add constraint student_schedule_enrollments_participation_kind_check check(participation_kind in('REGULAR','INDIVIDUAL_SUPPORT'));
 end if;
end$$;
create index if not exists idx_classrooms_schedule_capabilities on public.classrooms using gin(schedule_capabilities);
create index if not exists idx_requirements_room_capabilities on public.class_course_requirements using gin(required_room_capabilities);

create or replace function public.assert_schedule_accommodation_slot_v1(p_teacher_assignment_id uuid,p_classroom_id uuid,p_weekday integer,p_period integer,p_ignore_schedule_id uuid default null)
returns void language plpgsql security definer set search_path=public as $$
declare v_required text[];v_available text[];v_missing text[];v_tenant text;v_conflict uuid;
begin
 select cr.required_room_capabilities,ta.institution_code into v_required,v_tenant
 from public.teacher_course_assignments ta join public.class_course_requirements cr on cr.id=ta.class_course_requirement_id and cr.institution_code=ta.institution_code
 where ta.id=p_teacher_assignment_id and tenant_row_allowed(ta.institution_code);
 if not found then raise exception 'ASSIGNMENT_NOT_FOUND_IN_TENANT';end if;
 if p_classroom_id is not null then
  select c.schedule_capabilities into v_available from public.classrooms c where c.id=p_classroom_id and c.institution_code=v_tenant and tenant_row_allowed(c.institution_code);
  if not found then raise exception 'CLASSROOM_NOT_FOUND_IN_TENANT';end if;
  select coalesce(array_agg(x order by x),'{}'::text[]) into v_missing from unnest(coalesce(v_required,'{}'::text[]))x where not(x=any(coalesce(v_available,'{}'::text[])));
  if cardinality(v_missing)>0 then raise exception 'ROOM_CAPABILITY_REQUIRED:%',array_to_string(v_missing,',');end if;
 elsif cardinality(coalesce(v_required,'{}'::text[]))>0 then raise exception 'ROOM_REQUIRED_FOR_CAPABILITY';
 end if;
 select e.student_id into v_conflict
 from public.student_schedule_enrollments e
 left join public.student_course_requests er on er.id=e.request_id and er.institution_code=e.institution_code
 join public.student_schedule_enrollments oe on oe.student_id=e.student_id and oe.institution_code=e.institution_code and oe.active and oe.teacher_assignment_id<>e.teacher_assignment_id
 left join public.student_course_requests oer on oer.id=oe.request_id and oer.institution_code=oe.institution_code
 join public.teacher_schedule ots on ots.teacher_assignment_id=oe.teacher_assignment_id and ots.institution_code=e.institution_code and ots.active and ots.weekday=p_weekday and ots.period=p_period and (p_ignore_schedule_id is null or ots.id<>p_ignore_schedule_id)
 where e.active and e.institution_code=v_tenant and e.teacher_assignment_id=p_teacher_assignment_id and not coalesce(er.allow_overlap,false) and not coalesce(oer.allow_overlap,false)
 limit 1;
 if v_conflict is not null then raise exception 'STUDENT_TIME_CONFLICT:%',v_conflict;end if;
end$$;

create or replace function public.guard_schedule_accommodation_slot_v1()returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.active then perform public.assert_schedule_accommodation_slot_v1(new.teacher_assignment_id,new.classroom_id,new.weekday,new.period,new.id);end if;
 return new;
end$$;
drop trigger if exists trg_schedule_accommodation_slot_v1 on public.teacher_schedule;
create trigger trg_schedule_accommodation_slot_v1 before insert or update of teacher_assignment_id,classroom_id,weekday,period,active on public.teacher_schedule for each row execute function public.guard_schedule_accommodation_slot_v1();

create or replace function public.guard_student_enrollment_slot_v1()returns trigger language plpgsql security definer set search_path=public as $$
declare s record;
begin
 if new.active then
  for s in select ts.id,ts.classroom_id,ts.weekday,ts.period from public.teacher_schedule ts where ts.active and ts.institution_code=new.institution_code and ts.teacher_assignment_id=new.teacher_assignment_id loop
   perform public.assert_schedule_accommodation_slot_v1(new.teacher_assignment_id,s.classroom_id,s.weekday,s.period,s.id);
  end loop;
 end if;
 return new;
end$$;
drop trigger if exists trg_student_enrollment_slot_v1 on public.student_schedule_enrollments;
create trigger trg_student_enrollment_slot_v1 after insert or update of student_id,teacher_assignment_id,request_id,active,participation_kind on public.student_schedule_enrollments for each row execute function public.guard_student_enrollment_slot_v1();

create or replace function public.get_schedule_accommodation_hard_issues_v1()
returns table(issue_code text,teacher_assignment_id uuid,student_id uuid,classroom_id uuid,weekday integer,period integer,detail text)
language sql stable security definer set search_path=public as $$
with room_issues as(
 select 'ROOM_CAPABILITY_MISMATCH'::text issue_code,ts.teacher_assignment_id,null::uuid student_id,ts.classroom_id,ts.weekday,ts.period,
  'Eksik oda yeteneği: '||array_to_string(array(select x from unnest(cr.required_room_capabilities)x where not(x=any(coalesce(c.schedule_capabilities,'{}'::text[])))),', ') detail
 from public.teacher_schedule ts join public.teacher_course_assignments ta on ta.id=ts.teacher_assignment_id and ta.institution_code=ts.institution_code join public.class_course_requirements cr on cr.id=ta.class_course_requirement_id and cr.institution_code=ts.institution_code left join public.classrooms c on c.id=ts.classroom_id and c.institution_code=ts.institution_code
 where ts.active and tenant_row_allowed(ts.institution_code) and cardinality(cr.required_room_capabilities)>0 and(ts.classroom_id is null or c.id is null or not(cr.required_room_capabilities<@coalesce(c.schedule_capabilities,'{}'::text[])))
),student_issues as(
 select distinct 'STUDENT_TIME_CONFLICT'::text,e.teacher_assignment_id,e.student_id,ts.classroom_id,ts.weekday,ts.period,'Öğrenci aynı anda iki aktif programa katılamaz.'::text detail
 from public.student_schedule_enrollments e left join public.student_course_requests er on er.id=e.request_id and er.institution_code=e.institution_code join public.student_schedule_enrollments oe on oe.student_id=e.student_id and oe.institution_code=e.institution_code and oe.active and oe.teacher_assignment_id>e.teacher_assignment_id left join public.student_course_requests oer on oer.id=oe.request_id and oer.institution_code=oe.institution_code join public.teacher_schedule ts on ts.teacher_assignment_id=e.teacher_assignment_id and ts.institution_code=e.institution_code and ts.active join public.teacher_schedule ots on ots.teacher_assignment_id=oe.teacher_assignment_id and ots.institution_code=e.institution_code and ots.active and ots.weekday=ts.weekday and ots.period=ts.period
 where e.active and tenant_row_allowed(e.institution_code) and not coalesce(er.allow_overlap,false) and not coalesce(oer.allow_overlap,false)
)select * from room_issues union all select * from student_issues order by weekday,period,issue_code;
$$;

revoke all on function public.assert_schedule_accommodation_slot_v1(uuid,uuid,integer,integer,uuid),public.get_schedule_accommodation_hard_issues_v1() from public,anon;
grant execute on function public.get_schedule_accommodation_hard_issues_v1() to authenticated;
