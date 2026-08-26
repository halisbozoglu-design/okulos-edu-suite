-- Room/building parity v2: canonical scenario room feasibility, travel-aware assignment and room objective.
-- Canonical simultaneous physical-space authority is schedule_room_pools. classrooms.max_simultaneous_activities remains compatibility metadata.

alter table public.lesson_room_rules
  add column if not exists preferred_room_type text,
  add column if not exists preferred_department text,
  add column if not exists preferred_hardware jsonb not null default '{}'::jsonb,
  add column if not exists preferred_building_id uuid references public.schedule_buildings(id),
  add column if not exists preferred_room_ids uuid[] not null default '{}'::uuid[],
  add column if not exists avoided_room_ids uuid[] not null default '{}'::uuid[];

alter table public.schedule_generation_settings
  add column if not exists room_preference_penalty integer not null default 10,
  add column if not exists building_change_penalty integer not null default 5,
  add column if not exists capacity_waste_penalty integer not null default 1;

create or replace function public.get_schedule_scenario_room_candidates_v2(p_scenario_id uuid,p_row_id uuid)
returns table(classroom_id uuid,soft_penalty integer)
language sql stable security definer set search_path=public as $$
with r as (
  select * from public.schedule_scenario_rows where id=p_row_id and scenario_id=p_scenario_id
), rr as (
  select lr.* from r
  left join lateral (
    select * from public.lesson_room_rules x
    where x.active and tenant_row_allowed(x.institution_code) and r.subject ilike x.subject_pattern
    order by length(x.subject_pattern) desc limit 1
  ) lr on true
), s as (
  select coalesce(public.student_count_for_schedule(r.class_id,r.subgroup_id),0)::int students from r
), prof as (
  select id from public.schedule_time_profiles
  where active and tenant_row_allowed(institution_code)
  order by updated_at desc limit 1
), cfg as (
  select room_preference_penalty,building_change_penalty
  from public.schedule_generation_settings where id=true limit 1
), cand as (
  select c.*,coalesce(p.capacity,0) pool_capacity,p.max_simultaneous_activities pool_max
  from public.classrooms c
  left join public.schedule_room_pools p on p.id=c.room_pool_id and p.active
  where c.active and tenant_row_allowed(c.institution_code)
)
select c.id,
  (case when rr.preferred_room_type is not null and c.room_type is distinct from rr.preferred_room_type then coalesce(cfg.room_preference_penalty,10) else 0 end
  +case when rr.preferred_department is not null and coalesce(c.department,'')<>rr.preferred_department then coalesce(cfg.room_preference_penalty,10) else 0 end
  +case when rr.preferred_hardware<>'{}'::jsonb and not(c.hardware@>rr.preferred_hardware) then coalesce(cfg.room_preference_penalty,10) else 0 end
  +case when rr.preferred_building_id is not null and c.building_id is distinct from rr.preferred_building_id then coalesce(cfg.room_preference_penalty,10) else 0 end
  +case when cardinality(rr.preferred_room_ids)>0 and not(c.id=any(rr.preferred_room_ids)) then coalesce(cfg.room_preference_penalty,10) else 0 end
  +greatest(c.capacity-s.students,0)*coalesce((select capacity_waste_penalty from public.schedule_generation_settings where id=true limit 1),1)
  +coalesce((select sum(case when oc.building_id is distinct from c.building_id then coalesce(cfg.building_change_penalty,5) else 0 end)::int
    from public.schedule_scenario_rows x join public.classrooms oc on oc.id=x.classroom_id
    where x.scenario_id=p_scenario_id and x.teacher_id=r.teacher_id and x.weekday=r.weekday and x.period in(r.period-1,r.period+1)),0))::int
from r cross join rr cross join s cross join cfg cross join cand c
where c.capacity>=s.students
  and (rr.required_room_type is null or c.room_type=rr.required_room_type)
  and (rr.required_department is null or coalesce(c.department,'')=rr.required_department)
  and (coalesce(rr.required_hardware,'{}'::jsonb)='{}'::jsonb or c.hardware@>rr.required_hardware)
  and (cardinality(rr.avoided_room_ids)=0 or not(c.id=any(rr.avoided_room_ids)))
  and not exists(select 1 from public.schedule_scenario_rows x
    where x.scenario_id=p_scenario_id and x.weekday=r.weekday and x.period=r.period and x.classroom_id=c.id and x.id<>r.id)
  and (c.room_pool_id is null or (
    (select count(*) from public.schedule_scenario_rows x join public.classrooms cx on cx.id=x.classroom_id
      where x.scenario_id=p_scenario_id and x.weekday=r.weekday and x.period=r.period and cx.room_pool_id=c.room_pool_id and x.id<>r.id)<coalesce(c.pool_max,1)
    and (select coalesce(sum(public.student_count_for_schedule(x.class_id,x.subgroup_id)),0)
      from public.schedule_scenario_rows x join public.classrooms cx on cx.id=x.classroom_id
      where x.scenario_id=p_scenario_id and x.weekday=r.weekday and x.period=r.period and cx.room_pool_id=c.room_pool_id and x.id<>r.id)+s.students<=c.pool_capacity
  ))
  and not exists(
    select 1 from public.schedule_scenario_rows x
    join public.classrooms oc on oc.id=x.classroom_id cross join prof
    where x.scenario_id=p_scenario_id and x.teacher_id=r.teacher_id and x.weekday=r.weekday
      and x.period in(r.period-1,r.period+1) and x.id<>r.id and x.classroom_id is not null
      and oc.building_id is not null and c.building_id is not null and oc.building_id<>c.building_id
      and (case when x.period=r.period-1 then
        coalesce((select transfer_allowed from public.schedule_period_breaks b where b.time_profile_id=prof.id and b.after_period=x.period and tenant_row_allowed(b.institution_code)),false)=false
        or coalesce((select minutes from public.schedule_period_breaks b where b.time_profile_id=prof.id and b.after_period=x.period and tenant_row_allowed(b.institution_code)),0)<public.get_schedule_building_travel_minutes_v1(oc.building_id,c.building_id)
      else
        coalesce((select transfer_allowed from public.schedule_period_breaks b where b.time_profile_id=prof.id and b.after_period=r.period and tenant_row_allowed(b.institution_code)),false)=false
        or coalesce((select minutes from public.schedule_period_breaks b where b.time_profile_id=prof.id and b.after_period=r.period and tenant_row_allowed(b.institution_code)),0)<public.get_schedule_building_travel_minutes_v1(c.building_id,oc.building_id)
      end)
  )
order by 2,c.name
$$;

create or replace function public.get_schedule_scenario_room_issues_v2(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with cfg as(select exists(select 1 from public.classrooms where active and tenant_row_allowed(institution_code)) has_rooms),
u as(select count(*)::int n from public.schedule_scenario_rows r,cfg where r.scenario_id=p_scenario_id and cfg.has_rooms and r.classroom_id is null),
bad as(select count(*)::int n from public.schedule_scenario_rows r,cfg where r.scenario_id=p_scenario_id and cfg.has_rooms and r.classroom_id is not null and not exists(select 1 from public.get_schedule_scenario_room_candidates_v2(p_scenario_id,r.id) c where c.classroom_id=r.classroom_id))
select 'ROOM_UNASSIGNED',u.n,'Oda tanımlı olmasına rağmen dersliğe atanmamış ders' from u where u.n>0
union all
select 'ROOM_INFEASIBLE',bad.n,'Atanmış derslik kapasite/özellik/pool/bina geçiş koşullarını sağlamıyor' from bad where bad.n>0
$$;

create or replace function public.get_schedule_scenario_room_summary_v2(p_scenario_id uuid)
returns table(hard integer,soft numeric)
language sql stable security definer set search_path=public as $$
select coalesce((select sum(affected_count) from public.get_schedule_scenario_room_issues_v2(p_scenario_id)),0)::int,
       coalesce((select sum(c.soft_penalty)::numeric
         from public.schedule_scenario_rows r
         join lateral public.get_schedule_scenario_room_candidates_v2(p_scenario_id,r.id) c on c.classroom_id=r.classroom_id
         where r.scenario_id=p_scenario_id and r.classroom_id is not null),0)
$$;

create or replace function public.assign_classrooms_to_scenario_core_v2(p_scenario_id uuid)
returns table(assigned_count integer,unassigned_count integer)
language plpgsql security definer set search_path=public as $$
declare v_row record;v_room uuid;v_assigned int:=0;v_unassigned int:=0;v_has_rooms boolean;v_seen uuid[]:='{}'::uuid[];
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND';end if;
  select exists(select 1 from public.classrooms where active and tenant_row_allowed(institution_code)) into v_has_rooms;
  delete from public.schedule_room_assignment_issues where scenario_id=p_scenario_id;
  if not v_has_rooms then return query select 0,0;return;end if;
  loop
    select r.* into v_row from public.schedule_scenario_rows r
    where r.scenario_id=p_scenario_id and r.classroom_id is null and not(r.id=any(v_seen))
    order by (select count(*) from public.get_schedule_scenario_room_candidates_v2(p_scenario_id,r.id)),r.weekday,r.period,r.class_name,r.subject limit 1;
    exit when not found;
    v_seen:=array_append(v_seen,v_row.id);
    select c.classroom_id into v_room from public.get_schedule_scenario_room_candidates_v2(p_scenario_id,v_row.id) c order by c.soft_penalty,c.classroom_id limit 1;
    if v_room is null then
      insert into public.schedule_room_assignment_issues(scenario_id,scenario_row_id,reason,detail)
      values(p_scenario_id,v_row.id,'NO_SUITABLE_CLASSROOM','Kapasite/özellik/shared-pool/bina geçiş koşullarını sağlayan derslik bulunamadı')
      on conflict(scenario_id,scenario_row_id) do update set reason=excluded.reason,detail=excluded.detail,created_at=now();
      v_unassigned:=v_unassigned+1;
    else
      update public.schedule_scenario_rows set classroom_id=v_room where id=v_row.id;
      v_assigned:=v_assigned+1;
    end if;
    v_room:=null;
  end loop;
  return query select v_assigned,v_unassigned;
end $$;

create or replace function public.validate_schedule_building_transfer_v1()
returns trigger language plpgsql security definer set search_path=public as $$
declare nb uuid;ob uuid;req smallint;avail smallint;allow_transfer boolean;prof uuid;r record;
begin
  if not new.active or new.classroom_id is null then return new;end if;
  select building_id into nb from public.classrooms where id=new.classroom_id and active;
  if nb is null then return new;end if;
  select id into prof from public.schedule_time_profiles where active and tenant_row_allowed(institution_code) order by updated_at desc limit 1;
  if prof is null then return new;end if;
  for r in select ts.period,ts.classroom_id from public.teacher_schedule ts
    where ts.active and ts.teacher_id=new.teacher_id and ts.weekday=new.weekday
      and ts.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid)
      and ts.classroom_id is not null and ts.period in(new.period-1,new.period+1)
  loop
    select building_id into ob from public.classrooms where id=r.classroom_id and active;
    if ob is null or ob=nb then continue;end if;
    req:=public.get_schedule_building_travel_minutes_v1(ob,nb);
    if r.period=new.period-1 then
      select minutes,transfer_allowed into avail,allow_transfer from public.schedule_period_breaks
      where time_profile_id=prof and after_period=r.period and tenant_row_allowed(institution_code);
    else
      select minutes,transfer_allowed into avail,allow_transfer from public.schedule_period_breaks
      where time_profile_id=prof and after_period=new.period and tenant_row_allowed(institution_code);
    end if;
    if not coalesce(allow_transfer,false) then raise exception 'BUILDING_TRANSFER_NOT_ALLOWED';end if;
    if coalesce(avail,0)<req then raise exception 'BUILDING_TRANSFER_TIME_INSUFFICIENT';end if;
  end loop;
  return new;
end $$;

create or replace function public.get_schedule_scenario_hard_issues_v2(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
select * from public.get_schedule_scenario_hard_issues_pre_phase3(p_scenario_id)
union all select * from public.get_schedule_phase3_scenario_issues_v1(p_scenario_id)
union all select * from public.get_schedule_scenario_custom_rule_issues_v1(p_scenario_id)
union all select * from public.get_schedule_scenario_generic_relation_issues_v1(p_scenario_id)
union all select * from public.get_schedule_scenario_room_issues_v2(p_scenario_id)
$$;

create or replace function public.get_schedule_scenario_objective_vector_v1(p_scenario_id uuid)
returns table(hard integer,unplaced integer,medium numeric,soft numeric,legacy_score integer)
language sql stable security definer set search_path=public as $$
with g as(select * from public.get_schedule_scenario_generic_relation_summary_v1(p_scenario_id)),
s as(select * from public.get_schedule_scenario_student_conflict_summary_v1(p_scenario_id)),
r as(select * from public.get_schedule_scenario_room_summary_v2(p_scenario_id)),
h as(select coalesce(sum(affected_count),0)::int n from public.get_schedule_scenario_hard_issues_v2(p_scenario_id)),
u as(select count(*)::int n from public.schedule_unplaced_items where scenario_id=p_scenario_id)
select h.n,u.n,coalesce(g.medium,0)+coalesce(s.weighted_conflict,0),coalesce(g.soft,0)+coalesce(r.soft,0),public.calculate_schedule_scenario_score_v2(p_scenario_id)
from g,s,r,h,u
$$;
