-- Atomic virtual/composite/shared-room resources. classroom_id remains the canonical primary room.
create table if not exists public.schedule_room_bundles(
 id uuid primary key default gen_random_uuid(),
 institution_code text not null default public.current_tenant_code() references public.institutions(institution_code) on delete restrict,
 name text not null,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(institution_code,name)
);
create table if not exists public.schedule_room_bundle_members(
 bundle_id uuid not null references public.schedule_room_bundles(id) on delete cascade,
 classroom_id uuid not null references public.classrooms(id) on delete restrict,
 member_role text not null default 'SUPPORT' check(member_role in('PRIMARY','SUPPORT')),
 ordinal smallint not null default 1 check(ordinal>0),
 primary key(bundle_id,classroom_id),
 unique(bundle_id,ordinal)
);
create unique index if not exists uq_schedule_room_bundle_primary on public.schedule_room_bundle_members(bundle_id) where member_role='PRIMARY';
create table if not exists public.schedule_assignment_room_bundle_options(
 teacher_assignment_id uuid not null references public.teacher_course_assignments(id) on delete cascade,
 bundle_id uuid not null references public.schedule_room_bundles(id) on delete cascade,
 institution_code text not null default public.current_tenant_code() references public.institutions(institution_code) on delete restrict,
 preference_penalty integer not null default 0 check(preference_penalty>=0),
 primary key(teacher_assignment_id,bundle_id)
);
alter table public.schedule_scenario_rows add column if not exists room_bundle_id uuid references public.schedule_room_bundles(id) on delete restrict;
alter table public.teacher_schedule add column if not exists room_bundle_id uuid references public.schedule_room_bundles(id) on delete restrict;
create index if not exists idx_schedule_scenario_rows_bundle on public.schedule_scenario_rows(scenario_id,room_bundle_id) where room_bundle_id is not null;
create index if not exists idx_teacher_schedule_bundle_slot on public.teacher_schedule(institution_code,weekday,period,room_bundle_id) where active and room_bundle_id is not null;

alter table public.schedule_room_bundles enable row level security;
alter table public.schedule_room_bundle_members enable row level security;
alter table public.schedule_assignment_room_bundle_options enable row level security;
drop policy if exists schedule_room_bundles_read on public.schedule_room_bundles;
create policy schedule_room_bundles_read on public.schedule_room_bundles for select to authenticated using(public.tenant_row_allowed(institution_code));
drop policy if exists schedule_room_bundles_manage on public.schedule_room_bundles;
create policy schedule_room_bundles_manage on public.schedule_room_bundles for all to authenticated using(public.tenant_row_allowed(institution_code) and(public.has_permission('classrooms.manage') or public.has_permission('schedule.rules') or public.is_manager_or_admin())) with check(public.tenant_row_allowed(institution_code) and(public.has_permission('classrooms.manage') or public.has_permission('schedule.rules') or public.is_manager_or_admin()));
drop policy if exists schedule_room_bundle_members_read on public.schedule_room_bundle_members;
create policy schedule_room_bundle_members_read on public.schedule_room_bundle_members for select to authenticated using(exists(select 1 from public.schedule_room_bundles b where b.id=bundle_id and public.tenant_row_allowed(b.institution_code)));
drop policy if exists schedule_room_bundle_members_manage on public.schedule_room_bundle_members;
create policy schedule_room_bundle_members_manage on public.schedule_room_bundle_members for all to authenticated using(exists(select 1 from public.schedule_room_bundles b where b.id=bundle_id and public.tenant_row_allowed(b.institution_code) and(public.has_permission('classrooms.manage') or public.has_permission('schedule.rules') or public.is_manager_or_admin()))) with check(exists(select 1 from public.schedule_room_bundles b where b.id=bundle_id and public.tenant_row_allowed(b.institution_code) and(public.has_permission('classrooms.manage') or public.has_permission('schedule.rules') or public.is_manager_or_admin())));
drop policy if exists schedule_assignment_room_bundle_options_read on public.schedule_assignment_room_bundle_options;
create policy schedule_assignment_room_bundle_options_read on public.schedule_assignment_room_bundle_options for select to authenticated using(public.tenant_row_allowed(institution_code));
drop policy if exists schedule_assignment_room_bundle_options_manage on public.schedule_assignment_room_bundle_options;
create policy schedule_assignment_room_bundle_options_manage on public.schedule_assignment_room_bundle_options for all to authenticated using(public.tenant_row_allowed(institution_code) and(public.has_permission('schedule.rules') or public.is_manager_or_admin())) with check(public.tenant_row_allowed(institution_code) and(public.has_permission('schedule.rules') or public.is_manager_or_admin()));
revoke all on table public.schedule_room_bundles,public.schedule_room_bundle_members,public.schedule_assignment_room_bundle_options from anon,authenticated;
grant select on table public.schedule_room_bundles,public.schedule_room_bundle_members,public.schedule_assignment_room_bundle_options to authenticated;
grant insert,update,delete on table public.schedule_room_bundles,public.schedule_room_bundle_members to authenticated;
grant insert,update,delete on table public.schedule_assignment_room_bundle_options to authenticated;

create or replace function public.assert_room_bundle_definition_v1(p_bundle_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare v_tenant text;v_primary integer;v_members integer;
begin
 select institution_code into v_tenant from public.schedule_room_bundles where id=p_bundle_id and active;
 if v_tenant is null then raise exception 'ROOM_BUNDLE_NOT_FOUND';end if;
 select count(*),count(*)filter(where m.member_role='PRIMARY') into v_members,v_primary from public.schedule_room_bundle_members m join public.classrooms c on c.id=m.classroom_id where m.bundle_id=p_bundle_id and c.active and c.institution_code=v_tenant;
 if v_members<2 then raise exception 'ROOM_BUNDLE_REQUIRES_MULTIPLE_ACTIVE_ROOMS';end if;
 if v_primary<>1 then raise exception 'ROOM_BUNDLE_REQUIRES_ONE_PRIMARY_ROOM';end if;
 if exists(select 1 from public.schedule_room_bundle_members m join public.classrooms c on c.id=m.classroom_id where m.bundle_id=p_bundle_id and c.institution_code<>v_tenant) then raise exception 'ROOM_BUNDLE_TENANT_MISMATCH';end if;
end$$;

create or replace function public.guard_room_bundle_config_v1() returns trigger language plpgsql security definer set search_path=public as $$
declare v_bundle uuid:=coalesce(new.bundle_id,old.bundle_id);v_tenant text;v_assignment_tenant text;
begin
 select institution_code into v_tenant from public.schedule_room_bundles where id=v_bundle;
 if tg_table_name='schedule_room_bundle_members' then
  if exists(select 1 from public.teacher_schedule where active and room_bundle_id=v_bundle) then raise exception 'ROOM_BUNDLE_IN_ACTIVE_SCHEDULE';end if;
  if tg_op<>'DELETE' and not exists(select 1 from public.classrooms where id=new.classroom_id and active and institution_code=v_tenant) then raise exception 'ROOM_BUNDLE_CLASSROOM_TENANT_MISMATCH';end if;
 else
  if tg_op='DELETE' and exists(select 1 from public.teacher_schedule where active and teacher_assignment_id=old.teacher_assignment_id and room_bundle_id=old.bundle_id) then raise exception 'ROOM_BUNDLE_OPTION_IN_ACTIVE_SCHEDULE';end if;
  if tg_op='DELETE' then return old;end if;
  select institution_code into v_assignment_tenant from public.teacher_course_assignments where id=new.teacher_assignment_id;
  if v_assignment_tenant is null or v_assignment_tenant<>v_tenant or new.institution_code<>v_tenant then raise exception 'ROOM_BUNDLE_ASSIGNMENT_TENANT_MISMATCH';end if;
  perform public.assert_room_bundle_definition_v1(v_bundle);
 end if;
 if tg_op='DELETE' then return old;end if;return new;
end$$;
drop trigger if exists trg_room_bundle_members_guard_v1 on public.schedule_room_bundle_members;
create trigger trg_room_bundle_members_guard_v1 before insert or update or delete on public.schedule_room_bundle_members for each row execute function public.guard_room_bundle_config_v1();
drop trigger if exists trg_assignment_room_bundle_guard_v1 on public.schedule_assignment_room_bundle_options;
create trigger trg_assignment_room_bundle_guard_v1 before insert or update or delete on public.schedule_assignment_room_bundle_options for each row execute function public.guard_room_bundle_config_v1();

create or replace function public.guard_room_bundle_lifecycle_v1() returns trigger language plpgsql security definer set search_path=public as $$begin if(tg_op='DELETE' or(new.active=false and old.active=true))and exists(select 1 from public.teacher_schedule where active and room_bundle_id=old.id)then raise exception 'ROOM_BUNDLE_IN_ACTIVE_SCHEDULE';end if;if tg_op='DELETE'then return old;end if;return new;end$$;
drop trigger if exists trg_room_bundle_lifecycle_v1 on public.schedule_room_bundles;
create trigger trg_room_bundle_lifecycle_v1 before update of active or delete on public.schedule_room_bundles for each row execute function public.guard_room_bundle_lifecycle_v1();
create or replace function public.guard_bundle_classroom_lifecycle_v1() returns trigger language plpgsql security definer set search_path=public as $$begin if old.active and not new.active and exists(select 1 from public.schedule_room_bundle_members m join public.teacher_schedule t on t.room_bundle_id=m.bundle_id and t.active where m.classroom_id=old.id)then raise exception 'BUNDLE_CLASSROOM_IN_ACTIVE_SCHEDULE';end if;return new;end$$;
drop trigger if exists trg_bundle_classroom_lifecycle_v1 on public.classrooms;
create trigger trg_bundle_classroom_lifecycle_v1 before update of active on public.classrooms for each row execute function public.guard_bundle_classroom_lifecycle_v1();

create or replace function public.assert_composite_room_scenario_v1(p_scenario_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare v_tenant text;v_bad integer;
begin
 select institution_code into v_tenant from public.schedule_scenarios where id=p_scenario_id and institution_code=public.current_tenant_code();
 if v_tenant is null then raise exception 'SCENARIO_NOT_FOUND_IN_TENANT';end if;
 select count(*) into v_bad from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.room_bundle_id is null and exists(select 1 from public.schedule_assignment_room_bundle_options o where o.teacher_assignment_id=r.teacher_assignment_id and o.institution_code=v_tenant);
 if v_bad>0 then raise exception 'COMPOSITE_ROOM_REQUIRED: %',v_bad;end if;
 select count(*) into v_bad from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.room_bundle_id is not null and(
  not exists(select 1 from public.schedule_assignment_room_bundle_options o where o.teacher_assignment_id=r.teacher_assignment_id and o.bundle_id=r.room_bundle_id and o.institution_code=v_tenant)
  or not exists(select 1 from public.schedule_room_bundles b where b.id=r.room_bundle_id and b.active and b.institution_code=v_tenant)
  or not exists(select 1 from public.schedule_room_bundle_members m where m.bundle_id=r.room_bundle_id and m.member_role='PRIMARY' and m.classroom_id=r.classroom_id)
 );
 if v_bad>0 then raise exception 'COMPOSITE_ROOM_OPTION_INVALID: %',v_bad;end if;
 select count(*) into v_bad from public.schedule_scenario_rows r join public.schedule_room_bundle_members m on m.bundle_id=r.room_bundle_id left join public.classrooms c on c.id=m.classroom_id and c.active and c.institution_code=v_tenant where r.scenario_id=p_scenario_id and c.id is null;
 if v_bad>0 then raise exception 'COMPOSITE_ROOM_COMPONENT_INFEASIBLE: %',v_bad;end if;
 select count(*) into v_bad from public.schedule_scenario_rows r join public.schedule_room_bundle_members m on m.bundle_id=r.room_bundle_id join public.teacher_course_assignments a on a.id=r.teacher_assignment_id join public.class_course_requirements cr on cr.id=a.class_course_requirement_id join public.classrooms c on c.id=m.classroom_id where r.scenario_id=p_scenario_id and not(coalesce(cr.required_room_capabilities,'{}'::text[])<@coalesce(c.schedule_capabilities,'{}'::text[]));
 if v_bad>0 then raise exception 'COMPOSITE_ROOM_CAPABILITY_MISMATCH: %',v_bad;end if;
 with resources as(select r.id,r.teacher_assignment_id,r.weekday,r.period,coalesce(m.classroom_id,r.classroom_id)classroom_id from public.schedule_scenario_rows r left join public.schedule_room_bundle_members m on m.bundle_id=r.room_bundle_id where r.scenario_id=p_scenario_id)
 select count(*) into v_bad from resources a join resources b on b.id>a.id and b.weekday=a.weekday and b.period=a.period and b.classroom_id=a.classroom_id and public.schedule_assignment_scopes_overlap_v1(a.teacher_assignment_id,b.teacher_assignment_id);
 if v_bad>0 then raise exception 'COMPOSITE_ROOM_TIME_CONFLICT: %',v_bad;end if;
 with resources as(select distinct r.id,r.class_id,r.subgroup_id,r.weekday,r.period,c.room_pool_id from public.schedule_scenario_rows r left join public.schedule_room_bundle_members m on m.bundle_id=r.room_bundle_id join public.classrooms c on c.id=coalesce(m.classroom_id,r.classroom_id) where r.scenario_id=p_scenario_id and c.room_pool_id is not null),bad as(select x.room_pool_id from resources x join public.schedule_room_pools p on p.id=x.room_pool_id and p.active group by x.room_pool_id,x.weekday,x.period,p.max_simultaneous_activities,p.capacity having count(*)>p.max_simultaneous_activities or sum(public.student_count_for_schedule(x.class_id,x.subgroup_id))>p.capacity)
 select count(*) into v_bad from bad;if v_bad>0 then raise exception 'COMPOSITE_ROOM_POOL_LIMIT_EXCEEDED: %',v_bad;end if;
end$$;

create or replace function public.assert_composite_room_current_v1() returns void language plpgsql security definer set search_path=public as $$
declare v_bad integer;
begin
 select count(*) into v_bad from public.teacher_schedule t where t.active and t.institution_code=public.current_tenant_code() and exists(select 1 from public.schedule_assignment_room_bundle_options o where o.teacher_assignment_id=t.teacher_assignment_id and o.institution_code=t.institution_code) and t.room_bundle_id is null;
 if v_bad>0 then raise exception 'CURRENT_COMPOSITE_ROOM_REQUIRED: %',v_bad;end if;
 select count(*) into v_bad from public.teacher_schedule t join public.schedule_room_bundles b on b.id=t.room_bundle_id join public.schedule_room_bundle_members p on p.bundle_id=b.id and p.member_role='PRIMARY' where t.active and t.institution_code=public.current_tenant_code() and(not b.active or b.institution_code<>t.institution_code or p.classroom_id<>t.classroom_id or not exists(select 1 from public.schedule_assignment_room_bundle_options o where o.teacher_assignment_id=t.teacher_assignment_id and o.bundle_id=t.room_bundle_id and o.institution_code=t.institution_code));
 if v_bad>0 then raise exception 'CURRENT_COMPOSITE_ROOM_INVALID: %',v_bad;end if;
 with resources as(select t.id,t.teacher_assignment_id,t.weekday,t.period,coalesce(m.classroom_id,t.classroom_id)classroom_id from public.teacher_schedule t left join public.schedule_room_bundle_members m on m.bundle_id=t.room_bundle_id where t.active and t.institution_code=public.current_tenant_code())
 select count(*) into v_bad from resources a join resources b on b.id>a.id and b.weekday=a.weekday and b.period=a.period and b.classroom_id=a.classroom_id and public.schedule_assignment_scopes_overlap_v1(a.teacher_assignment_id,b.teacher_assignment_id);
 if v_bad>0 then raise exception 'CURRENT_COMPOSITE_ROOM_TIME_CONFLICT: %',v_bad;end if;
 with resources as(select distinct t.id,t.class_id,t.subgroup_id,t.weekday,t.period,c.room_pool_id from public.teacher_schedule t left join public.schedule_room_bundle_members m on m.bundle_id=t.room_bundle_id join public.classrooms c on c.id=coalesce(m.classroom_id,t.classroom_id) where t.active and t.institution_code=public.current_tenant_code() and c.room_pool_id is not null),bad as(select x.room_pool_id from resources x join public.schedule_room_pools p on p.id=x.room_pool_id and p.active group by x.room_pool_id,x.weekday,x.period,p.max_simultaneous_activities,p.capacity having count(*)>p.max_simultaneous_activities or sum(public.student_count_for_schedule(x.class_id,x.subgroup_id))>p.capacity)
 select count(*) into v_bad from bad;if v_bad>0 then raise exception 'CURRENT_COMPOSITE_ROOM_POOL_LIMIT_EXCEEDED: %',v_bad;end if;
end$$;

create or replace function public.guard_teacher_schedule_composite_room_v1() returns trigger language plpgsql security definer set search_path=public as $$begin if new.active and new.room_bundle_id is not null then perform public.assert_room_bundle_definition_v1(new.room_bundle_id);perform public.assert_composite_room_current_v1();end if;return new;end$$;
drop trigger if exists trg_teacher_schedule_composite_room_v1 on public.teacher_schedule;
create constraint trigger trg_teacher_schedule_composite_room_v1 after insert or update of room_bundle_id,classroom_id,weekday,period,active on public.teacher_schedule deferrable initially deferred for each row execute function public.guard_teacher_schedule_composite_room_v1();

create or replace function public.import_composite_room_candidate_v1(p_rows jsonb,p_title text default 'Bileşik derslik adayı') returns uuid language plpgsql security definer set search_path=public as $$
declare v_scenario uuid;v record;
begin
 perform public.open_permission_context('schedule.generate');
 v_scenario:=public.import_local_schedule_candidate_v1(p_rows,p_title);
 for v in select * from jsonb_to_recordset(p_rows)as x(assignment_id uuid,weekday smallint,period smallint,classroom_id uuid,room_bundle_id uuid) loop
  if v.room_bundle_id is not null then update public.schedule_scenario_rows set room_bundle_id=v.room_bundle_id where scenario_id=v_scenario and teacher_assignment_id=v.assignment_id and weekday=v.weekday and period=v.period and classroom_id is not distinct from v.classroom_id;end if;
 end loop;
 perform public.assert_composite_room_scenario_v1(v_scenario);
 return v_scenario;
exception when others then if v_scenario is not null then delete from public.schedule_scenarios where id=v_scenario and institution_code=public.current_tenant_code();end if;raise;
end$$;

create or replace function public.apply_composite_room_candidate_v1(p_scenario_id uuid) returns integer language plpgsql security definer set search_path=public as $$
declare v_applied integer;
begin
 perform public.open_permission_context('schedule.apply');
 perform pg_advisory_xact_lock(hashtextextended(public.current_tenant_code()||':composite-room',0));
 perform public.assert_composite_room_scenario_v1(p_scenario_id);
 v_applied:=public.apply_schedule_scenario(p_scenario_id);
 update public.teacher_schedule t set room_bundle_id=r.room_bundle_id from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.institution_code=public.current_tenant_code() and t.active and t.institution_code=r.institution_code and t.teacher_assignment_id=r.teacher_assignment_id and t.weekday=r.weekday and t.period=r.period and t.classroom_id is not distinct from r.classroom_id;
 perform public.assert_composite_room_current_v1();
 return v_applied;
end$$;

create or replace function public.import_joint_composite_schedule_candidate_v1(p_rows jsonb,p_enrollments jsonb,p_title text default 'Joint bileşik derslik adayı') returns uuid language plpgsql security definer set search_path=public as $$
declare v_scenario uuid;v record;
begin
 perform public.open_permission_context('schedule.generate');v_scenario:=public.import_joint_schedule_candidate_v1(p_rows,p_enrollments,p_title);
 for v in select * from jsonb_to_recordset(p_rows)as x(assignment_id uuid,weekday smallint,period smallint,classroom_id uuid,room_bundle_id uuid) loop if v.room_bundle_id is not null then update public.schedule_scenario_rows set room_bundle_id=v.room_bundle_id where scenario_id=v_scenario and teacher_assignment_id=v.assignment_id and weekday=v.weekday and period=v.period and classroom_id is not distinct from v.classroom_id;end if;end loop;
 perform public.assert_composite_room_scenario_v1(v_scenario);return v_scenario;
exception when others then if v_scenario is not null then delete from public.schedule_scenarios where id=v_scenario and institution_code=public.current_tenant_code();end if;raise;end$$;

create or replace function public.apply_joint_composite_schedule_candidate_v1(p_scenario_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_result jsonb;
begin
 perform public.open_permission_context('schedule.apply');perform pg_advisory_xact_lock(hashtextextended(public.current_tenant_code()||':joint-composite-room',0));perform public.assert_composite_room_scenario_v1(p_scenario_id);v_result:=public.apply_joint_schedule_candidate_v1(p_scenario_id);
 update public.teacher_schedule t set room_bundle_id=r.room_bundle_id from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.institution_code=public.current_tenant_code() and t.active and t.institution_code=r.institution_code and t.teacher_assignment_id=r.teacher_assignment_id and t.weekday=r.weekday and t.period=r.period and t.classroom_id is not distinct from r.classroom_id;
 perform public.assert_composite_room_current_v1();return v_result;end$$;

create or replace function public.get_schedule_composite_room_issues_v1() returns table(severity text,code text,affected_count integer,detail text) language sql stable security definer set search_path=public as $$
with bad as(select count(*)::int n from public.teacher_schedule t join public.schedule_room_bundles b on b.id=t.room_bundle_id left join public.schedule_room_bundle_members p on p.bundle_id=b.id and p.member_role='PRIMARY' where t.active and public.tenant_row_allowed(t.institution_code) and(not b.active or p.classroom_id is distinct from t.classroom_id)),resources as(select t.id,t.teacher_assignment_id,t.weekday,t.period,coalesce(m.classroom_id,t.classroom_id)classroom_id from public.teacher_schedule t left join public.schedule_room_bundle_members m on m.bundle_id=t.room_bundle_id where t.active and public.tenant_row_allowed(t.institution_code)),conflicts as(select count(*)::int n from resources a join resources b on b.id>a.id and b.weekday=a.weekday and b.period=a.period and b.classroom_id=a.classroom_id and public.schedule_assignment_scopes_overlap_v1(a.teacher_assignment_id,b.teacher_assignment_id))
select 'error','COMPOSITE_ROOM_INVALID',n,'Bileşik derslik seçimi aktif/ana oda kuralını sağlamıyor' from bad where n>0 union all select 'error','COMPOSITE_ROOM_TIME_CONFLICT',n,'Aynı fiziksel derslik bileşeni eşzamanlı iki etkinlikte kullanılıyor' from conflicts where n>0
$$;

create or replace function public.upsert_schedule_room_bundle_v1(p_name text,p_primary_classroom_id uuid,p_component_classroom_ids uuid[]) returns uuid language plpgsql security definer set search_path=public as $$
declare v_bundle uuid;v_room uuid;v_ordinal smallint:=2;v_components uuid[]:=array(select distinct x from unnest(coalesce(p_component_classroom_ids,'{}'::uuid[]))x where x<>p_primary_classroom_id);
begin
 if not(public.has_permission('classrooms.manage') or public.has_permission('schedule.rules') or public.is_manager_or_admin())then raise exception 'PERMISSION_DENIED: classrooms.manage/schedule.rules';end if;
 if nullif(trim(p_name),'')is null or cardinality(v_components)<1 then raise exception 'ROOM_BUNDLE_NAME_AND_SUPPORT_REQUIRED';end if;
 if not exists(select 1 from public.classrooms where id=p_primary_classroom_id and active and institution_code=public.current_tenant_code())then raise exception 'PRIMARY_CLASSROOM_INVALID';end if;
 if exists(select 1 from unnest(v_components)x where not exists(select 1 from public.classrooms c where c.id=x and c.active and c.institution_code=public.current_tenant_code()))then raise exception 'SUPPORT_CLASSROOM_INVALID';end if;
 insert into public.schedule_room_bundles(institution_code,name,active)values(public.current_tenant_code(),trim(p_name),true)on conflict(institution_code,name)do update set active=true,updated_at=now()returning id into v_bundle;
 if exists(select 1 from public.teacher_schedule where active and room_bundle_id=v_bundle)then raise exception 'ROOM_BUNDLE_IN_ACTIVE_SCHEDULE';end if;
 delete from public.schedule_room_bundle_members where bundle_id=v_bundle;
 insert into public.schedule_room_bundle_members(bundle_id,classroom_id,member_role,ordinal)values(v_bundle,p_primary_classroom_id,'PRIMARY',1);
 foreach v_room in array v_components loop insert into public.schedule_room_bundle_members(bundle_id,classroom_id,member_role,ordinal)values(v_bundle,v_room,'SUPPORT',v_ordinal);v_ordinal:=v_ordinal+1;end loop;
 perform public.assert_room_bundle_definition_v1(v_bundle);return v_bundle;
end$$;

create or replace function public.set_assignment_room_bundle_option_v1(p_teacher_assignment_id uuid,p_bundle_id uuid,p_enabled boolean default true) returns void language plpgsql security definer set search_path=public as $$
begin
 if not(public.has_permission('schedule.rules') or public.is_manager_or_admin())then raise exception 'PERMISSION_DENIED: schedule.rules';end if;
 if p_enabled then insert into public.schedule_assignment_room_bundle_options(teacher_assignment_id,bundle_id,institution_code)values(p_teacher_assignment_id,p_bundle_id,public.current_tenant_code())on conflict do nothing;else delete from public.schedule_assignment_room_bundle_options where teacher_assignment_id=p_teacher_assignment_id and bundle_id=p_bundle_id and institution_code=public.current_tenant_code();end if;
end$$;

create or replace function public.get_schedule_room_bundle_assignment_choices_v1() returns table(assignment_id uuid,class_name text,subject text) language sql stable security definer set search_path=public as $$
select a.id,c.class_name,cc.name from public.teacher_course_assignments a join public.class_course_requirements r on r.id=a.class_course_requirement_id and r.institution_code=a.institution_code join public.school_classes c on c.id=r.class_id join public.course_catalog cc on cc.id=r.course_id where a.institution_code=public.current_tenant_code() order by c.class_name,cc.name,a.id
$$;

revoke all on function public.assert_room_bundle_definition_v1(uuid),public.guard_room_bundle_config_v1(),public.guard_room_bundle_lifecycle_v1(),public.guard_bundle_classroom_lifecycle_v1(),public.assert_composite_room_scenario_v1(uuid),public.assert_composite_room_current_v1(),public.guard_teacher_schedule_composite_room_v1(),public.import_composite_room_candidate_v1(jsonb,text),public.apply_composite_room_candidate_v1(uuid),public.import_joint_composite_schedule_candidate_v1(jsonb,jsonb,text),public.apply_joint_composite_schedule_candidate_v1(uuid),public.get_schedule_composite_room_issues_v1(),public.upsert_schedule_room_bundle_v1(text,uuid,uuid[]),public.set_assignment_room_bundle_option_v1(uuid,uuid,boolean),public.get_schedule_room_bundle_assignment_choices_v1() from public,anon,authenticated;
grant execute on function public.import_composite_room_candidate_v1(jsonb,text),public.apply_composite_room_candidate_v1(uuid),public.import_joint_composite_schedule_candidate_v1(jsonb,jsonb,text),public.apply_joint_composite_schedule_candidate_v1(uuid),public.get_schedule_composite_room_issues_v1(),public.upsert_schedule_room_bundle_v1(text,uuid,uuid[]),public.set_assignment_room_bundle_option_v1(uuid,uuid,boolean),public.get_schedule_room_bundle_assignment_choices_v1() to authenticated;
