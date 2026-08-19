create table if not exists public.schedule_scenario_integrity_issues(
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.schedule_scenarios(id) on delete cascade,
  code text not null,
  affected_count integer not null default 1,
  detail text not null,
  created_at timestamptz not null default now(),
  unique(scenario_id,code)
);
alter table public.schedule_scenario_integrity_issues enable row level security;
grant select,insert,update,delete on public.schedule_scenario_integrity_issues to authenticated;
create policy "managers read scenario integrity issues" on public.schedule_scenario_integrity_issues for select to authenticated using(public.is_manager_or_admin());
create policy "managers manage scenario integrity issues" on public.schedule_scenario_integrity_issues for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

create or replace function public.scenario_assignment_run_lengths(p_scenario uuid,p_assignment uuid)
returns smallint[] language sql stable security definer set search_path=public as $$
with ordered as (
 select weekday,period,period-row_number() over(partition by weekday order by period)::integer grp
 from public.schedule_scenario_rows where scenario_id=p_scenario and teacher_assignment_id=p_assignment
),runs as(select count(*)::smallint len from ordered group by weekday,grp)
select coalesce(array_agg(len order by len desc),'{}'::smallint[]) from runs;
$$;

create or replace function public.validate_schedule_scenario_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare n integer;v_count integer:=0;
begin
 if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
 if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND';end if;
 delete from public.schedule_scenario_integrity_issues where scenario_id=p_scenario_id;

 select count(*)::integer into n from (
   select a.id from public.teacher_course_assignments a left join public.schedule_scenario_rows r on r.scenario_id=p_scenario_id and r.teacher_assignment_id=a.id
   group by a.id,a.assigned_hours having count(r.id)<>a.assigned_hours
 ) q;
 if n>0 then insert into public.schedule_scenario_integrity_issues(scenario_id,code,affected_count,detail) values(p_scenario_id,'ASSIGNMENT_HOURS_MISMATCH',n,'Öğretmen-ders atama saatleri senaryoda eksik veya fazla.');v_count:=v_count+n;end if;

 select count(*)::integer into n from (
   select req.id from public.class_course_requirements req left join public.schedule_scenario_rows r on r.scenario_id=p_scenario_id and r.requirement_id=req.id
   group by req.id,req.weekly_hours having count(r.id)<>req.weekly_hours
 ) q;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'REQUIREMENT_HOURS_MISMATCH',n,'Sınıf-ders haftalık saati senaryoda hedefle uyuşmuyor.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from (
  select r.class_id,r.course_id from public.schedule_scenario_rows r join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active and cr.min_distinct_days is not null
  where r.scenario_id=p_scenario_id group by r.class_id,r.course_id having count(distinct r.weekday)<max(cr.min_distinct_days)
 ) q;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'COURSE_MINIMUM_SPREAD',n,'Ders gereken asgari gün sayısına yayılmamış.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from public.teacher_course_assignments a
 join public.class_course_requirements req on req.id=a.class_course_requirement_id
 join public.course_schedule_rules cr on cr.course_id=req.course_id and cr.active and cardinality(cr.block_pattern)>0
 where public.scenario_assignment_run_lengths(p_scenario_id,a.id)<>(select array_agg(x order by x desc) from unnest(cr.block_pattern) x);
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'COURSE_BLOCK_PATTERN',n,'Dersin ardışık blok deseni tanımlanan desenle uyuşmuyor.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from (
  select r.teacher_id,r.weekday,count(*) c,max(tc.max_daily_hours) lim from public.schedule_scenario_rows r join public.teacher_schedule_constraints tc on tc.teacher_id=r.teacher_id
  where r.scenario_id=p_scenario_id and tc.max_daily_hours is not null group by r.teacher_id,r.weekday having count(*)>max(tc.max_daily_hours)
 ) q;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'TEACHER_DAILY_LIMIT',n,'Öğretmenin günlük azami ders saati aşılmış.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from (
  select r.teacher_id,count(distinct r.weekday) d,max(tc.max_working_days) mx,max(tc.min_working_days) mn from public.schedule_scenario_rows r join public.teacher_schedule_constraints tc on tc.teacher_id=r.teacher_id
  where r.scenario_id=p_scenario_id group by r.teacher_id having (max(tc.max_working_days) is not null and count(distinct r.weekday)>max(tc.max_working_days)) or (max(tc.min_working_days) is not null and count(distinct r.weekday)<max(tc.min_working_days))
 ) q;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'TEACHER_WORKING_DAYS',n,'Öğretmenin asgari/azami çalışma günü kuralı sağlanmıyor.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from public.schedule_scenario_rows r join public.teacher_unavailability u on u.teacher_id=r.teacher_id and u.weekday=r.weekday and u.period=r.period and u.active where r.scenario_id=p_scenario_id;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'TEACHER_UNAVAILABLE',n,'Senaryoda öğretmenin kesin uygun olmadığı saat kullanılmış.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from public.schedule_scenario_rows r join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active
 where r.scenario_id=p_scenario_id and ((cardinality(cr.prohibited_days)>0 and r.weekday=any(cr.prohibited_days)) or (cardinality(cr.prohibited_periods)>0 and r.period=any(cr.prohibited_periods)));
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'COURSE_TIME_RULE',n,'Ders yasaklanan gün/saatte bulunuyor.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from (
  select r.class_id,r.course_id,r.weekday,count(*) c,max(cr.max_per_day) mx from public.schedule_scenario_rows r join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active
  where r.scenario_id=p_scenario_id and cr.max_per_day is not null group by r.class_id,r.course_id,r.weekday having count(*)>max(cr.max_per_day)
 ) q;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'COURSE_DAILY_LIMIT',n,'Dersin aynı sınıftaki günlük azami saati aşılmış.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from public.schedule_sync_groups g where g.active and g.required_simultaneous and exists(
   select 1 from public.schedule_sync_group_members m where m.sync_group_id=g.id and (
     select count(*) from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.sync_group_id=g.id and r.teacher_assignment_id=m.teacher_assignment_id
   )<>m.block_hours
 );
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'SYNC_GROUP_HOURS',n,'Paralel blok üyelerinin saat sayısı eksik/fazla.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from public.schedule_sync_groups g where g.active and g.required_simultaneous and exists(
   select 1 from public.schedule_sync_group_members m1 join public.schedule_sync_group_members m2 on m2.sync_group_id=m1.sync_group_id and m2.id>m1.id
   where m1.sync_group_id=g.id and (
     exists((select weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and sync_group_id=g.id and teacher_assignment_id=m1.teacher_assignment_id) except (select weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and sync_group_id=g.id and teacher_assignment_id=m2.teacher_assignment_id))
     or exists((select weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and sync_group_id=g.id and teacher_assignment_id=m2.teacher_assignment_id) except (select weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and sync_group_id=g.id and teacher_assignment_id=m1.teacher_assignment_id))
   )
 );
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'SYNC_GROUP_SLOT_MISMATCH',n,'Paralel blok üyeleri tam olarak aynı saatlerde değil.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from public.schedule_room_assignment_issues where scenario_id=p_scenario_id;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'CLASSROOM_ISSUE',n,'Bir veya daha fazla ders için uygun derslik bulunamadı.',now());v_count:=v_count+n;end if;

 return v_count;
end;$$;
revoke all on function public.validate_schedule_scenario_v2(uuid) from public;
grant execute on function public.validate_schedule_scenario_v2(uuid) to authenticated;

-- Application gate also checks scenario integrity explicitly.
create or replace function public.apply_schedule_scenario(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;v_issues integer;
begin
 if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
 v_issues:=public.validate_schedule_scenario_v2(p_scenario_id);
 if v_issues>0 then raise exception 'SCENARIO_HAS_HARD_INTEGRITY_ISSUES: %',v_issues;end if;
 if exists(select 1 from public.schedule_unplaced_items where scenario_id=p_scenario_id) then raise exception 'SCENARIO_HAS_UNPLACED_LESSONS';end if;
 perform public.create_schedule_restore_point('Senaryo uygulanmadan önce otomatik yedek','before_scenario_apply');
 delete from public.teacher_schedule where active=true and locked=false;
 insert into public.teacher_schedule(teacher_id,class_id,weekday,period,class_name,subject,classroom_id,subgroup_id,subgroup_key,is_group_split,active,locked,course_id,class_course_requirement_id,teacher_assignment_id,source_kind,sync_group_id,block_key)
 select r.teacher_id,r.class_id,r.weekday,r.period,r.class_name,r.subject,r.classroom_id,r.subgroup_id,r.subgroup_key,r.is_group_split,true,r.locked,r.course_id,r.requirement_id,r.teacher_assignment_id,'solver',r.sync_group_id,r.block_key
 from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.locked=false order by r.weekday,r.period,r.class_name;
 get diagnostics v_count=row_count;
 update public.schedule_scenarios set status=case when id=p_scenario_id then 'applied' else status end where generation_group=(select generation_group from public.schedule_scenarios where id=p_scenario_id);
 perform public.assert_schedule_publishable();
 return v_count;
end;$$;
revoke all on function public.apply_schedule_scenario(uuid) from public;
grant execute on function public.apply_schedule_scenario(uuid) to authenticated;
