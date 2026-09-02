create table if not exists public.schedule_scenario_enrollments(
 id uuid primary key default gen_random_uuid(),
 scenario_id uuid not null references public.schedule_scenarios(id) on delete cascade,
 institution_code text not null default public.current_tenant_code(),
 student_id uuid not null references public.students(id) on delete cascade,
 teacher_assignment_id uuid not null references public.teacher_course_assignments(id) on delete cascade,
 request_id uuid references public.student_course_requests(id) on delete cascade,
 locked boolean not null default false,
 allow_overlap boolean not null default false,
 created_at timestamptz not null default now(),
 unique(scenario_id,student_id,teacher_assignment_id)
);
create index if not exists idx_schedule_scenario_enrollments_scenario on public.schedule_scenario_enrollments(scenario_id);
create index if not exists idx_schedule_scenario_enrollments_assignment on public.schedule_scenario_enrollments(teacher_assignment_id);
alter table public.schedule_scenario_enrollments enable row level security;
drop policy if exists schedule_scenario_enrollments_read on public.schedule_scenario_enrollments;
create policy schedule_scenario_enrollments_read on public.schedule_scenario_enrollments for select to authenticated using(public.tenant_row_allowed(institution_code) and(public.is_manager_or_admin() or public.has_permission('schedule.generate')));
revoke all on table public.schedule_scenario_enrollments from anon,authenticated;
grant select on table public.schedule_scenario_enrollments to authenticated;

create or replace function public.assert_joint_schedule_candidate_v1(p_scenario_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare v_tenant text;v_bad integer;
begin
 perform public.open_permission_context('schedule.generate');
 select institution_code into v_tenant from public.schedule_scenarios where id=p_scenario_id and institution_code=public.current_tenant_code();
 if v_tenant is null then raise exception 'SCENARIO_NOT_FOUND_IN_TENANT';end if;
 if not exists(select 1 from public.schedule_scenario_enrollments where scenario_id=p_scenario_id and institution_code=v_tenant) then raise exception 'JOINT_ENROLLMENT_PLAN_REQUIRED';end if;
 select count(*) into v_bad from(
  select e.teacher_assignment_id
  from public.schedule_scenario_enrollments e
  join public.teacher_course_assignments a on a.id=e.teacher_assignment_id and a.institution_code=e.institution_code
  left join lateral(select min(c.capacity)capacity from public.schedule_scenario_rows sr join public.classrooms c on c.id=sr.classroom_id where sr.scenario_id=e.scenario_id and sr.teacher_assignment_id=e.teacher_assignment_id)room on true
  where e.scenario_id=p_scenario_id
  group by e.teacher_assignment_id,a.section_capacity,room.capacity
  having coalesce(a.section_capacity,room.capacity) is null or count(*)>coalesce(a.section_capacity,room.capacity)
 )x;
 if v_bad>0 then raise exception 'JOINT_SECTION_CAPACITY_INVALID: %',v_bad;end if;
 select count(*) into v_bad from public.student_course_requests r
 where r.active and r.request_kind='PRIMARY' and r.institution_code=v_tenant
 and not exists(
  select 1 from public.schedule_scenario_enrollments e
  join public.teacher_course_assignments a on a.id=e.teacher_assignment_id
  join public.class_course_requirements cr on cr.id=a.class_course_requirement_id
  left join public.student_course_requests chosen on chosen.id=e.request_id and chosen.student_id=r.student_id
  where e.scenario_id=p_scenario_id and e.student_id=r.student_id
  and(cr.course_id=r.course_id or e.request_id=r.id or(r.alternative_group is not null and chosen.alternative_group=r.alternative_group))
 );
 if v_bad>0 then raise exception 'JOINT_PRIMARY_REQUEST_UNASSIGNED: %',v_bad;end if;
 select count(*) into v_bad from public.schedule_scenario_enrollments a
 join public.schedule_scenario_enrollments b on b.scenario_id=a.scenario_id and b.student_id=a.student_id and b.id>a.id
 join public.schedule_scenario_rows ar on ar.scenario_id=a.scenario_id and ar.teacher_assignment_id=a.teacher_assignment_id
 join public.schedule_scenario_rows br on br.scenario_id=b.scenario_id and br.teacher_assignment_id=b.teacher_assignment_id and br.weekday=ar.weekday and br.period=ar.period
 where a.scenario_id=p_scenario_id and not a.allow_overlap and not b.allow_overlap;
 if v_bad>0 then raise exception 'JOINT_STUDENT_TIME_CONFLICT: %',v_bad;end if;
 select count(*) into v_bad from public.schedule_scenario_enrollments e
 join public.schedule_scenario_rows r on r.scenario_id=e.scenario_id and r.teacher_assignment_id=e.teacher_assignment_id
 join public.student_free_time_requests f on f.student_id=e.student_id and f.active and f.mode='HARD' and f.weekday=r.weekday and r.period=any(f.periods) and f.institution_code=e.institution_code
 where e.scenario_id=p_scenario_id;
 if v_bad>0 then raise exception 'JOINT_HARD_FREE_TIME_CONFLICT: %',v_bad;end if;
end$$;

create or replace function public.import_joint_schedule_candidate_v1(p_rows jsonb,p_enrollments jsonb,p_title text default 'Joint timetable + sectioning adayı') returns uuid language plpgsql security definer set search_path=public as $$
declare v_scenario uuid;v record;
begin
 perform public.open_permission_context('schedule.generate');
 if jsonb_typeof(p_enrollments)<>'array' or jsonb_array_length(p_enrollments)=0 then raise exception 'JOINT_ENROLLMENTS_REQUIRED';end if;
 v_scenario:=public.import_local_schedule_candidate_v1(p_rows,p_title);
 for v in select * from jsonb_to_recordset(p_enrollments)as x(student_id uuid,assignment_id uuid,request_id uuid,locked boolean,allow_overlap boolean) loop
  if not exists(select 1 from public.students s where s.id=v.student_id and s.active and s.institution_code=public.current_tenant_code()) then raise exception 'JOINT_STUDENT_INVALID';end if;
  if not exists(select 1 from public.teacher_course_assignments a where a.id=v.assignment_id and a.institution_code=public.current_tenant_code()) then raise exception 'JOINT_ASSIGNMENT_INVALID';end if;
  if v.request_id is not null and not exists(select 1 from public.student_course_requests r join public.teacher_course_assignments a on a.id=v.assignment_id join public.class_course_requirements cr on cr.id=a.class_course_requirement_id where r.id=v.request_id and r.student_id=v.student_id and r.active and r.course_id=cr.course_id and r.institution_code=public.current_tenant_code()) then raise exception 'JOINT_REQUEST_ASSIGNMENT_MISMATCH';end if;
  if v.request_id is null and not exists(select 1 from public.student_schedule_enrollments e where e.student_id=v.student_id and e.teacher_assignment_id=v.assignment_id and e.active and e.locked and e.institution_code=public.current_tenant_code()) then raise exception 'JOINT_LOCKED_ENROLLMENT_INVALID';end if;
  insert into public.schedule_scenario_enrollments(scenario_id,institution_code,student_id,teacher_assignment_id,request_id,locked,allow_overlap) values(v_scenario,public.current_tenant_code(),v.student_id,v.assignment_id,v.request_id,coalesce(v.locked,false),coalesce(v.allow_overlap,false));
 end loop;
 perform public.assert_joint_schedule_candidate_v1(v_scenario);
 return v_scenario;
exception when others then if v_scenario is not null then delete from public.schedule_scenarios where id=v_scenario and institution_code=public.current_tenant_code();end if;raise;
end$$;

create or replace function public.apply_joint_schedule_candidate_v1(p_scenario_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_schedule integer;v_enrollments integer;
begin
 perform public.open_permission_context('schedule.generate');
 perform pg_advisory_xact_lock(hashtextextended(public.current_tenant_code()||':joint-schedule-sectioning',0));
 perform public.assert_joint_schedule_candidate_v1(p_scenario_id);
 v_schedule:=public.apply_schedule_scenario(p_scenario_id);
 update public.student_schedule_enrollments set active=false,updated_at=now() where institution_code=public.current_tenant_code() and source='solver' and not locked;
 insert into public.student_schedule_enrollments(institution_code,student_id,teacher_assignment_id,request_id,locked,source,active)
 select institution_code,student_id,teacher_assignment_id,request_id,locked,case when locked then 'manual' else 'solver' end,true from public.schedule_scenario_enrollments where scenario_id=p_scenario_id and institution_code=public.current_tenant_code()
 on conflict(institution_code,student_id,teacher_assignment_id)do update set request_id=excluded.request_id,active=true,locked=public.student_schedule_enrollments.locked or excluded.locked,source=case when public.student_schedule_enrollments.locked then public.student_schedule_enrollments.source else excluded.source end,updated_at=now();
 get diagnostics v_enrollments=row_count;
 delete from public.student_sectioning_issues where institution_code=public.current_tenant_code();
 perform public.assert_joint_schedule_candidate_v1(p_scenario_id);
 return jsonb_build_object('scenario_id',p_scenario_id,'schedule_rows',v_schedule,'enrollments',v_enrollments);
end$$;

revoke all on function public.assert_joint_schedule_candidate_v1(uuid),public.import_joint_schedule_candidate_v1(jsonb,jsonb,text),public.apply_joint_schedule_candidate_v1(uuid) from public,anon;
grant execute on function public.import_joint_schedule_candidate_v1(jsonb,jsonb,text),public.apply_joint_schedule_candidate_v1(uuid) to authenticated;
