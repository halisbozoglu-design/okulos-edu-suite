-- Comprehensive timetable integrity report and publication gate.

alter table public.teacher_schedule
  add column if not exists sync_group_id uuid references public.schedule_sync_groups(id) on delete set null,
  add column if not exists block_key uuid;

create or replace function public.schedule_assignment_run_lengths(p_assignment uuid)
returns smallint[]
language sql stable security definer set search_path=public as $$
with ordered as (
  select weekday,period,period-row_number() over(partition by weekday order by period)::integer grp
  from public.teacher_schedule where active=true and teacher_assignment_id=p_assignment
), runs as (
  select count(*)::smallint len from ordered group by weekday,grp
)
select coalesce(array_agg(len order by len desc),'{}'::smallint[]) from runs;
$$;

create or replace function public.get_schedule_integrity_report()
returns table(severity text,code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
room_config as (select exists(select 1 from public.classrooms where active=true) yes),
unlinked as (
  select count(*)::integer n from public.teacher_schedule where active=true and (course_id is null or class_course_requirement_id is null or teacher_assignment_id is null)
),
semantic_mismatch as (
  select count(*)::integer n
  from public.teacher_schedule ts
  left join public.teacher_course_assignments a on a.id=ts.teacher_assignment_id
  left join public.class_course_requirements r on r.id=ts.class_course_requirement_id
  where ts.active=true and ts.teacher_assignment_id is not null and (
    a.id is null or r.id is null or a.class_course_requirement_id<>r.id or a.teacher_id<>ts.teacher_id or r.class_id is distinct from ts.class_id or r.course_id<>ts.course_id)
),
assignment_hours as (
  select a.id,a.assigned_hours,count(ts.id)::integer placed
  from public.teacher_course_assignments a left join public.teacher_schedule ts on ts.teacher_assignment_id=a.id and ts.active=true
  group by a.id,a.assigned_hours
),
assignment_bad as (select count(*)::integer n from assignment_hours where placed<>assigned_hours),
requirement_hours as (
  select r.id,r.weekly_hours,count(ts.id)::integer placed
  from public.class_course_requirements r left join public.teacher_schedule ts on ts.class_course_requirement_id=r.id and ts.active=true
  group by r.id,r.weekly_hours
),
requirement_bad as (select count(*)::integer n from requirement_hours where placed<>weekly_hours),
class_hours as (
  select c.id,c.expected_weekly_hours,count(ts.id)::integer placed
  from public.school_classes c left join public.teacher_schedule ts on ts.class_id=c.id and ts.active=true
  where c.active=true group by c.id,c.expected_weekly_hours
),
class_bad as (select count(*)::integer n from class_hours where expected_weekly_hours is null or placed<>expected_weekly_hours),
ttkb_bad as (
  select count(*)::integer n from public.teacher_course_assignments a
  join public.class_course_requirements r on r.id=a.class_course_requirement_id
  where public.teacher_course_permission_status(a.teacher_id,r.course_id,current_date)<>'ALLOWED'
),
time_profile_bad as (
  select count(*)::integer n from public.teacher_schedule ts cross join lateral (select * from public.schedule_time_profiles where active=true limit 1) p
  where ts.active=true and (not(ts.weekday=any(p.teaching_days)) or ts.period>p.periods_per_day)
),
teacher_double as (
  select count(*)::integer n from (select teacher_id,weekday,period,count(*) from public.teacher_schedule where active=true group by teacher_id,weekday,period having count(*)>1) q
),
class_conflict as (
  select count(*)::integer n from (
    select a.id
    from public.teacher_schedule a join public.teacher_schedule b on b.id>a.id and a.active and b.active and a.class_id=b.class_id and a.weekday=b.weekday and a.period=b.period
    where a.class_id is not null and (
      a.subgroup_id is null or b.subgroup_id is null or a.subgroup_id=b.subgroup_id or exists(
        select 1 from public.class_subgroup_students x join public.class_subgroup_students y on y.student_id=x.student_id where x.subgroup_id=a.subgroup_id and y.subgroup_id=b.subgroup_id))
  ) q
),
room_bad as (
  select count(*)::integer n from public.teacher_schedule ts,room_config rc where ts.active=true and rc.yes and ts.classroom_id is null
),
room_double as (
  select count(*)::integer n from (select classroom_id,weekday,period,count(*) from public.teacher_schedule where active=true and classroom_id is not null group by classroom_id,weekday,period having count(*)>1) q
),
daily_limit_bad as (
  select count(*)::integer n from (
    select ts.teacher_id,ts.weekday,count(*) c,max(tc.max_daily_hours) lim
    from public.teacher_schedule ts join public.teacher_schedule_constraints tc on tc.teacher_id=ts.teacher_id
    where ts.active=true and tc.max_daily_hours is not null group by ts.teacher_id,ts.weekday having count(*)>max(tc.max_daily_hours)
  ) q
),
working_days_bad as (
  select count(*)::integer n from (
    select ts.teacher_id,count(distinct ts.weekday) d,max(tc.max_working_days) mx,max(tc.min_working_days) mn
    from public.teacher_schedule ts join public.teacher_schedule_constraints tc on tc.teacher_id=ts.teacher_id where ts.active=true
    group by ts.teacher_id having (max(tc.max_working_days) is not null and count(distinct ts.weekday)>max(tc.max_working_days)) or (max(tc.min_working_days) is not null and count(distinct ts.weekday)<max(tc.min_working_days))
  ) q
),
course_time_bad as (
  select count(*)::integer n from public.teacher_schedule ts join public.course_schedule_rules cr on cr.course_id=ts.course_id and cr.active
  where ts.active=true and ((cardinality(cr.prohibited_days)>0 and ts.weekday=any(cr.prohibited_days)) or (cardinality(cr.prohibited_periods)>0 and ts.period=any(cr.prohibited_periods)))
),
course_spread_bad as (
  select count(*)::integer n from (
    select ts.class_id,ts.course_id,count(distinct ts.weekday) d,max(cr.min_distinct_days) minimum
    from public.teacher_schedule ts join public.course_schedule_rules cr on cr.course_id=ts.course_id and cr.active
    where ts.active=true and cr.min_distinct_days is not null group by ts.class_id,ts.course_id having count(distinct ts.weekday)<max(cr.min_distinct_days)
  ) q
),
block_bad as (
  select count(*)::integer n from public.teacher_course_assignments a
  join public.class_course_requirements r on r.id=a.class_course_requirement_id
  join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active and cardinality(cr.block_pattern)>0
  where public.schedule_assignment_run_lengths(a.id)<> (select array_agg(x order by x desc) from unnest(cr.block_pattern) x)
),
sync_bad as (
  select count(*)::integer n from public.schedule_sync_groups g
  where g.active and g.required_simultaneous and exists(
    select 1 from public.schedule_sync_group_members m
    where m.sync_group_id=g.id and (
      select count(*) from public.teacher_schedule ts where ts.active and ts.sync_group_id=g.id and ts.teacher_assignment_id=m.teacher_assignment_id
    )<>m.block_hours
  )
),
sync_slot_bad as (
  select count(*)::integer n from public.schedule_sync_groups g where g.active and g.required_simultaneous and exists(
    select 1 from public.schedule_sync_group_members m1 join public.schedule_sync_group_members m2 on m2.sync_group_id=m1.sync_group_id and m2.id>m1.id
    where m1.sync_group_id=g.id and exists(
      (select weekday,period from public.teacher_schedule where active and sync_group_id=g.id and teacher_assignment_id=m1.teacher_assignment_id)
      except
      (select weekday,period from public.teacher_schedule where active and sync_group_id=g.id and teacher_assignment_id=m2.teacher_assignment_id)
    )
  )
),
soft_pref as (
  select coalesce(sum(case p.preference when 'avoid' then p.weight else 0 end),0)::integer n
  from public.teacher_schedule ts join public.teacher_schedule_preferences p on p.teacher_id=ts.teacher_id and p.weekday=ts.weekday and p.period=ts.period and p.active
  where ts.active=true
)
select * from (
  select 'error','UNLINKED_SCHEDULE_ROWS',n,'Program satırları müfredat/öğretmen atamasına bağlı olmalıdır.' from unlinked where n>0 union all
  select 'error','SEMANTIC_LINK_MISMATCH',n,'Program satırı ile öğretmen ataması/sınıf/ders ilişkisi uyuşmuyor.' from semantic_mismatch where n>0 union all
  select 'error','ASSIGNMENT_HOURS_MISMATCH',n,'Öğretmen-ders atama saatleri programda eksik veya fazla.' from assignment_bad where n>0 union all
  select 'error','REQUIREMENT_HOURS_MISMATCH',n,'Sınıf-ders haftalık saatleri programda eksik veya fazla.' from requirement_bad where n>0 union all
  select 'error','CLASS_WEEKLY_HOURS_MISMATCH',n,'Sınıf toplam haftalık ders saati hedefle uyuşmuyor.' from class_bad where n>0 union all
  select 'error','TTKB_PERMISSION_PROBLEM',n,'Öğretmen alan-ders uygunluğu ALLOWED değil.' from ttkb_bad where n>0 union all
  select 'error','TIME_PROFILE_VIOLATION',n,'Ders aktif okul zaman şablonu dışında.' from time_profile_bad where n>0 union all
  select 'error','TEACHER_DOUBLE_BOOKING',n,'Öğretmen aynı anda birden fazla derste.' from teacher_double where n>0 union all
  select 'error','CLASS_OR_STUDENT_GROUP_CONFLICT',n,'Sınıf veya öğrenci grubu aynı anda çakışıyor.' from class_conflict where n>0 union all
  select 'error','CLASSROOM_REQUIRED',n,'Derslik envanteri kullanılıyor ancak bazı program satırlarında derslik yok.' from room_bad where n>0 union all
  select 'error','CLASSROOM_DOUBLE_BOOKING',n,'Aynı derslik aynı saatte birden fazla derse atanmış.' from room_double where n>0 union all
  select 'error','TEACHER_DAILY_LIMIT',n,'Öğretmenin günlük azami ders saati aşılmış.' from daily_limit_bad where n>0 union all
  select 'error','TEACHER_WORKING_DAYS',n,'Öğretmenin çalışma günü sınırı ihlal edilmiş.' from working_days_bad where n>0 union all
  select 'error','COURSE_TIME_RULE',n,'Ders yasaklanan gün/saatte.' from course_time_bad where n>0 union all
  select 'error','COURSE_MINIMUM_SPREAD',n,'Ders haftaya gereken sayıda güne yayılmamış.' from course_spread_bad where n>0 union all
  select 'error','COURSE_BLOCK_PATTERN',n,'Dersin ardışık blok dağılımı tanımlı desenle uyuşmuyor.' from block_bad where n>0 union all
  select 'error','SYNC_GROUP_HOURS',n,'Eşzamanlı grup üyelerinin saat sayısı eksik/fazla.' from sync_bad where n>0 union all
  select 'error','SYNC_GROUP_SLOT_MISMATCH',n,'Eşzamanlı grup üyeleri aynı zaman dilimlerinde değil.' from sync_slot_bad where n>0 union all
  select 'warning','SOFT_PREFERENCE_PENALTY',n,'Kaçınılması tercih edilen öğretmen zamanlarında oluşan toplam kalite cezası.' from soft_pref where n>0
) r;
$$;

revoke all on function public.get_schedule_integrity_report() from public;
grant execute on function public.get_schedule_integrity_report() to authenticated;

create or replace function public.assert_schedule_publishable()
returns boolean language plpgsql stable security definer set search_path=public as $$
declare v_bad record;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  perform public.assert_curriculum_ready_for_timetable();
  select * into v_bad from public.get_schedule_integrity_report() where severity='error' limit 1;
  if found then raise exception 'SCHEDULE_NOT_PUBLISHABLE: % (% kayıt) - %',v_bad.code,v_bad.affected_count,v_bad.detail;end if;
  return true;
end;$$;
revoke all on function public.assert_schedule_publishable() from public;
grant execute on function public.assert_schedule_publishable() to authenticated;

create or replace function public.publish_current_schedule(
  p_effective_from date,p_academic_year text default null,p_title text default 'Haftalık Ders Programı',p_note text default null
)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_publication_id uuid;v_hash text;v_count integer;v_payload text;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if p_effective_from is null then raise exception 'EFFECTIVE_DATE_REQUIRED';end if;
  perform public.assert_schedule_publishable();
  select count(*)::integer into v_count from public.teacher_schedule where active=true;
  if v_count=0 then raise exception 'EMPTY_SCHEDULE_CANNOT_BE_PUBLISHED';end if;
  select string_agg(concat_ws('|',ts.teacher_id::text,coalesce(ts.class_id::text,''),coalesce(ts.course_id::text,''),coalesce(ts.class_course_requirement_id::text,''),coalesce(ts.teacher_assignment_id::text,''),ts.weekday,ts.period,ts.class_name,ts.subject,coalesce(ts.classroom_id::text,''),coalesce(ts.subgroup_id::text,''),coalesce(ts.sync_group_id::text,''),coalesce(ts.block_key::text,'')),E'\n' order by ts.teacher_id,ts.weekday,ts.period,ts.id)
  into v_payload from public.teacher_schedule ts where ts.active=true;
  v_hash:=encode(digest(coalesce(v_payload,''),'sha256'),'hex');
  insert into public.schedule_publications(effective_from,academic_year,title,note,schedule_hash,row_count,published_by)
  values(p_effective_from,nullif(trim(p_academic_year),''),coalesce(nullif(trim(p_title),''),'Haftalık Ders Programı'),nullif(trim(p_note),''),v_hash,v_count,auth.uid()) returning id into v_publication_id;
  insert into public.schedule_publication_rows(publication_id,source_schedule_id,teacher_id,class_id,weekday,period,class_name,subject,classroom,classroom_id,subgroup_id,subgroup_key,is_group_split,snapshot)
  select v_publication_id,ts.id,ts.teacher_id,ts.class_id,ts.weekday,ts.period,ts.class_name,ts.subject,ts.classroom,ts.classroom_id,ts.subgroup_id,ts.subgroup_key,ts.is_group_split,to_jsonb(ts)
  from public.teacher_schedule ts where ts.active=true order by ts.teacher_id,ts.weekday,ts.period,ts.id;
  return v_publication_id;
end;$$;
revoke all on function public.publish_current_schedule(date,text,text,text) from public;
grant execute on function public.publish_current_schedule(date,text,text,text) to authenticated;
