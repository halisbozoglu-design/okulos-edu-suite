-- Parallel subgroup rows represent multiple teacher loads in one class time slot.
-- Teacher assignment hours are row-based; curriculum/class hours are DISTINCT weekday+period based.

create or replace function public.get_schedule_integrity_report_core_v2()
returns table(severity text,code text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
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
  from public.teacher_course_assignments a
  left join public.teacher_schedule ts on ts.teacher_assignment_id=a.id and ts.active=true
  group by a.id,a.assigned_hours
),
assignment_bad as (select count(*)::integer n from assignment_hours where placed<>assigned_hours),
requirement_hours as (
  select r.id,r.weekly_hours,count(distinct (ts.weekday,ts.period))::integer placed
  from public.class_course_requirements r
  left join public.teacher_schedule ts on ts.class_course_requirement_id=r.id and ts.active=true
  group by r.id,r.weekly_hours
),
requirement_bad as (select count(*)::integer n from requirement_hours where placed<>weekly_hours),
class_hours as (
  select c.id,c.expected_weekly_hours,count(distinct (ts.weekday,ts.period))::integer placed
  from public.school_classes c
  left join public.teacher_schedule ts on ts.class_id=c.id and ts.active=true
  where c.active=true group by c.id,c.expected_weekly_hours
),
class_bad as (select count(*)::integer n from class_hours where expected_weekly_hours is null or placed<>expected_weekly_hours),
ttkb_bad as (
  select count(*)::integer n from public.teacher_course_assignments a
  join public.class_course_requirements r on r.id=a.class_course_requirement_id
  where public.teacher_course_permission_status(a.teacher_id,r.course_id,current_date)<>'ALLOWED'
),
time_profile_bad as (
  select count(*)::integer n
  from public.teacher_schedule ts
  cross join lateral (select * from public.schedule_time_profiles where active=true limit 1) p
  where ts.active=true and (not(ts.weekday=any(p.teaching_days)) or ts.period>p.periods_per_day)
),
teacher_double as (
  select count(*)::integer n from (
    select teacher_id,weekday,period,count(*) from public.teacher_schedule where active=true
    group by teacher_id,weekday,period having count(*)>1
  ) q
),
class_conflict as (
  select count(*)::integer n from (
    select a.id
    from public.teacher_schedule a
    join public.teacher_schedule b on b.id>a.id and a.active and b.active and a.class_id=b.class_id and a.weekday=b.weekday and a.period=b.period
    where a.class_id is not null and (
      a.subgroup_id is null or b.subgroup_id is null or a.subgroup_id=b.subgroup_id or exists(
        select 1 from public.class_subgroup_students x
        join public.class_subgroup_students y on y.student_id=x.student_id
        where x.subgroup_id=a.subgroup_id and y.subgroup_id=b.subgroup_id
      )
    )
  ) q
),
room_bad as (
  select count(*)::integer n from public.teacher_schedule ts,room_config rc
  where ts.active=true and rc.yes and ts.classroom_id is null
),
room_double as (
  select count(*)::integer n from (
    select classroom_id,weekday,period,count(*) from public.teacher_schedule
    where active=true and classroom_id is not null
    group by classroom_id,weekday,period having count(*)>1
  ) q
),
room_mismatch as (
  select count(*)::integer n
  from public.teacher_schedule ts
  left join public.classrooms c on c.id=ts.classroom_id
  left join lateral (
    select lr.required_room_type,lr.required_department,lr.required_hardware
    from public.lesson_room_rules lr
    where lr.active=true and ts.subject ilike lr.subject_pattern
    order by length(lr.subject_pattern) desc limit 1
  ) rr on true
  where ts.active=true and ts.classroom_id is not null and (
    c.id is null or not c.active
    or c.capacity<coalesce(public.student_count_for_schedule(ts.class_id,ts.subgroup_id),0)
    or (rr.required_room_type is not null and c.room_type<>rr.required_room_type)
    or (rr.required_department is not null and coalesce(c.department,'')<>rr.required_department)
    or (rr.required_hardware is not null and rr.required_hardware<>'{}'::jsonb and not(c.hardware @> rr.required_hardware))
  )
),
teacher_unavailable_bad as (
  select count(*)::integer n
  from public.teacher_schedule ts
  join public.teacher_unavailability u on u.teacher_id=ts.teacher_id and u.weekday=ts.weekday and u.period=ts.period and u.active
  where ts.active
),
daily_limit_bad as (
  select count(*)::integer n from (
    select ts.teacher_id,ts.weekday,count(*) c,max(tc.max_daily_hours) lim
    from public.teacher_schedule ts join public.teacher_schedule_constraints tc on tc.teacher_id=ts.teacher_id
    where ts.active=true and tc.max_daily_hours is not null
    group by ts.teacher_id,ts.weekday having count(*)>max(tc.max_daily_hours)
  ) q
),
weekly_limit_bad as (
  select count(*)::integer n from (
    select ts.teacher_id,count(*) c,max(tc.max_weekly_hours) lim
    from public.teacher_schedule ts join public.teacher_schedule_constraints tc on tc.teacher_id=ts.teacher_id
    where ts.active=true and tc.max_weekly_hours is not null
    group by ts.teacher_id having count(*)>max(tc.max_weekly_hours)
  ) q
),
working_days_bad as (
  select count(*)::integer n from (
    select ts.teacher_id,count(distinct ts.weekday) d,max(tc.max_working_days) mx,max(tc.min_working_days) mn
    from public.teacher_schedule ts join public.teacher_schedule_constraints tc on tc.teacher_id=ts.teacher_id where ts.active=true
    group by ts.teacher_id
    having (max(tc.max_working_days) is not null and count(distinct ts.weekday)>max(tc.max_working_days))
       or (max(tc.min_working_days) is not null and count(distinct ts.weekday)<max(tc.min_working_days))
  ) q
),
teacher_runs as (
  select teacher_id,weekday,count(*)::integer len
  from (
    select teacher_id,weekday,period,period-row_number() over(partition by teacher_id,weekday order by period)::integer grp
    from (select distinct teacher_id,weekday,period from public.teacher_schedule where active=true) d
  ) x group by teacher_id,weekday,grp
),
consecutive_bad as (
  select count(*)::integer n
  from teacher_runs r join public.teacher_schedule_constraints tc on tc.teacher_id=r.teacher_id
  where tc.max_consecutive_hours is not null and r.len>tc.max_consecutive_hours
),
course_time_bad as (
  select count(*)::integer n from public.teacher_schedule ts
  join public.course_schedule_rules cr on cr.course_id=ts.course_id and cr.active
  where ts.active=true and (
    (cardinality(cr.prohibited_days)>0 and ts.weekday=any(cr.prohibited_days))
    or (cardinality(cr.prohibited_periods)>0 and ts.period=any(cr.prohibited_periods))
  )
),
course_spread_bad as (
  select count(*)::integer n from (
    select ts.class_id,ts.course_id,count(distinct ts.weekday) d,max(cr.min_distinct_days) minimum
    from public.teacher_schedule ts join public.course_schedule_rules cr on cr.course_id=ts.course_id and cr.active
    where ts.active=true and cr.min_distinct_days is not null
    group by ts.class_id,ts.course_id having count(distinct ts.weekday)<max(cr.min_distinct_days)
  ) q
),
course_daily_bad as (
  select count(*)::integer n from (
    select ts.class_id,ts.course_id,ts.weekday,count(distinct ts.period) c,max(cr.max_per_day) mx
    from public.teacher_schedule ts join public.course_schedule_rules cr on cr.course_id=ts.course_id and cr.active
    where ts.active=true and cr.max_per_day is not null
    group by ts.class_id,ts.course_id,ts.weekday having count(distinct ts.period)>max(cr.max_per_day)
  ) q
),
block_bad as (
  select count(*)::integer n from public.teacher_course_assignments a
  join public.class_course_requirements r on r.id=a.class_course_requirement_id
  join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active and cardinality(cr.block_pattern)>0
  where public.schedule_assignment_run_lengths(a.id)<>(select array_agg(x.block_hours order by x.block_hours desc) from unnest(cr.block_pattern) as x(block_hours))
),
sync_bad as (
  select count(*)::integer n from public.schedule_sync_groups g
  where g.active and g.required_simultaneous and exists(
    select 1 from public.schedule_sync_group_members m
    where m.sync_group_id=g.id and (
      select count(*) from public.teacher_schedule ts
      where ts.active and ts.sync_group_id=g.id and ts.teacher_assignment_id=m.teacher_assignment_id
    )<>m.block_hours
  )
),
sync_slot_bad as (
  select count(*)::integer n from public.schedule_sync_groups g
  where g.active and g.required_simultaneous and exists(
    select 1 from public.schedule_sync_group_members m1
    join public.schedule_sync_group_members m2 on m2.sync_group_id=m1.sync_group_id and m2.id>m1.id
    where m1.sync_group_id=g.id and (
      exists((select weekday,period from public.teacher_schedule where active and sync_group_id=g.id and teacher_assignment_id=m1.teacher_assignment_id)
             except
             (select weekday,period from public.teacher_schedule where active and sync_group_id=g.id and teacher_assignment_id=m2.teacher_assignment_id))
      or exists((select weekday,period from public.teacher_schedule where active and sync_group_id=g.id and teacher_assignment_id=m2.teacher_assignment_id)
             except
             (select weekday,period from public.teacher_schedule where active and sync_group_id=g.id and teacher_assignment_id=m1.teacher_assignment_id))
    )
  )
),
soft_pref as (
  select coalesce(sum(case p.preference when 'avoid' then p.weight else 0 end),0)::integer n
  from public.teacher_schedule ts
  join public.teacher_schedule_preferences p on p.teacher_id=ts.teacher_id and p.weekday=ts.weekday and p.period=ts.period and p.active
  where ts.active=true
)
select * from (
  select 'error','UNLINKED_SCHEDULE_ROWS',n,'Program satırları müfredat/öğretmen atamasına bağlı olmalıdır.' from unlinked where n>0 union all
  select 'error','SEMANTIC_LINK_MISMATCH',n,'Program satırı ile öğretmen ataması/sınıf/ders ilişkisi uyuşmuyor.' from semantic_mismatch where n>0 union all
  select 'error','ASSIGNMENT_HOURS_MISMATCH',n,'Öğretmen-ders atama saatleri programda eksik veya fazla.' from assignment_bad where n>0 union all
  select 'error','REQUIREMENT_HOURS_MISMATCH',n,'Sınıf-ders haftalık saati benzersiz zaman dilimleri üzerinden hedefle uyuşmuyor.' from requirement_bad where n>0 union all
  select 'error','CLASS_WEEKLY_HOURS_MISMATCH',n,'Sınıf toplam haftalık ders saati benzersiz zaman dilimleri üzerinden hedefle uyuşmuyor.' from class_bad where n>0 union all
  select 'error','TTKB_PERMISSION_PROBLEM',n,'Öğretmen alan-ders uygunluğu ALLOWED değil.' from ttkb_bad where n>0 union all
  select 'error','TIME_PROFILE_VIOLATION',n,'Ders aktif okul zaman şablonu dışında.' from time_profile_bad where n>0 union all
  select 'error','TEACHER_DOUBLE_BOOKING',n,'Öğretmen aynı anda birden fazla derste.' from teacher_double where n>0 union all
  select 'error','CLASS_OR_STUDENT_GROUP_CONFLICT',n,'Sınıf veya öğrenci grubu aynı anda çakışıyor.' from class_conflict where n>0 union all
  select 'error','CLASSROOM_REQUIRED',n,'Derslik envanteri kullanılıyor ancak bazı program satırlarında derslik yok.' from room_bad where n>0 union all
  select 'error','CLASSROOM_DOUBLE_BOOKING',n,'Aynı derslik aynı saatte birden fazla derse atanmış.' from room_double where n>0 union all
  select 'error','CLASSROOM_CONFIGURATION_MISMATCH',n,'Atanan derslik kapasite, tip, bölüm veya donanım kuralını karşılamıyor.' from room_mismatch where n>0 union all
  select 'error','TEACHER_UNAVAILABLE',n,'Programda öğretmenin kesin uygun olmadığı saat kullanılmış.' from teacher_unavailable_bad where n>0 union all
  select 'error','TEACHER_DAILY_LIMIT',n,'Öğretmenin günlük azami ders saati aşılmış.' from daily_limit_bad where n>0 union all
  select 'error','TEACHER_WEEKLY_LIMIT',n,'Öğretmenin haftalık azami ders saati aşılmış.' from weekly_limit_bad where n>0 union all
  select 'error','TEACHER_WORKING_DAYS',n,'Öğretmenin çalışma günü sınırı ihlal edilmiş.' from working_days_bad where n>0 union all
  select 'error','TEACHER_CONSECUTIVE_LIMIT',n,'Öğretmenin ardışık ders saati sınırı aşılmış.' from consecutive_bad where n>0 union all
  select 'error','COURSE_TIME_RULE',n,'Ders yasaklanan gün/saatte.' from course_time_bad where n>0 union all
  select 'error','COURSE_MINIMUM_SPREAD',n,'Ders haftaya gereken sayıda güne yayılmamış.' from course_spread_bad where n>0 union all
  select 'error','COURSE_DAILY_LIMIT',n,'Dersin aynı sınıftaki günlük azami zaman dilimi aşılmış.' from course_daily_bad where n>0 union all
  select 'error','COURSE_BLOCK_PATTERN',n,'Dersin ardışık blok dağılımı tanımlı desenle uyuşmuyor.' from block_bad where n>0 union all
  select 'error','SYNC_GROUP_HOURS',n,'Eşzamanlı grup üyelerinin saat sayısı eksik/fazla.' from sync_bad where n>0 union all
  select 'error','SYNC_GROUP_SLOT_MISMATCH',n,'Eşzamanlı grup üyeleri aynı zaman dilimlerinde değil.' from sync_slot_bad where n>0 union all
  select 'warning','SOFT_PREFERENCE_PENALTY',n,'Kaçınılması tercih edilen öğretmen zamanlarında oluşan toplam kalite cezası.' from soft_pref where n>0
) r;
$$;

create or replace function public.get_schedule_scenario_hard_issues_v2(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
with
room_config as (select exists(select 1 from public.classrooms where active=true) yes),
semantic_bad as (
  select count(*)::integer n
  from public.schedule_scenario_rows sr
  left join public.teacher_course_assignments a on a.id=sr.teacher_assignment_id
  left join public.class_course_requirements r on r.id=sr.requirement_id
  where sr.scenario_id=p_scenario_id and (
    sr.teacher_assignment_id is null or sr.requirement_id is null or sr.course_id is null
    or a.id is null or r.id is null or a.teacher_id<>sr.teacher_id or a.class_course_requirement_id<>r.id
    or r.class_id is distinct from sr.class_id or r.course_id<>sr.course_id
  )
),
assignment_bad as (
  select count(*)::integer n from (
    select a.id,a.assigned_hours,count(sr.id)::integer placed
    from public.teacher_course_assignments a
    left join public.schedule_scenario_rows sr on sr.scenario_id=p_scenario_id and sr.teacher_assignment_id=a.id
    group by a.id,a.assigned_hours having count(sr.id)<>a.assigned_hours
  ) q
),
requirement_bad as (
  select count(*)::integer n from (
    select r.id,r.weekly_hours,count(distinct (sr.weekday,sr.period))::integer placed
    from public.class_course_requirements r
    left join public.schedule_scenario_rows sr on sr.scenario_id=p_scenario_id and sr.requirement_id=r.id
    group by r.id,r.weekly_hours having count(distinct (sr.weekday,sr.period))<>r.weekly_hours
  ) q
),
class_bad as (
  select count(*)::integer n from (
    select c.id,c.expected_weekly_hours,count(distinct (sr.weekday,sr.period))::integer placed
    from public.school_classes c
    left join public.schedule_scenario_rows sr on sr.scenario_id=p_scenario_id and sr.class_id=c.id
    where c.active=true group by c.id,c.expected_weekly_hours
    having c.expected_weekly_hours is null or count(distinct (sr.weekday,sr.period))<>c.expected_weekly_hours
  ) q
),
ttkb_bad as (
  select count(distinct sr.teacher_assignment_id)::integer n
  from public.schedule_scenario_rows sr
  join public.teacher_course_assignments a on a.id=sr.teacher_assignment_id
  join public.class_course_requirements r on r.id=a.class_course_requirement_id
  where sr.scenario_id=p_scenario_id and public.teacher_course_permission_status(a.teacher_id,r.course_id,current_date)<>'ALLOWED'
),
time_bad as (
  select count(*)::integer n
  from public.schedule_scenario_rows sr
  cross join lateral (select * from public.schedule_time_profiles where active=true limit 1) p
  where sr.scenario_id=p_scenario_id and (not(sr.weekday=any(p.teaching_days)) or sr.period>p.periods_per_day)
),
teacher_double as (
  select count(*)::integer n from (
    select teacher_id,weekday,period,count(*) from public.schedule_scenario_rows
    where scenario_id=p_scenario_id group by teacher_id,weekday,period having count(*)>1
  ) q
),
class_conflict as (
  select count(*)::integer n from (
    select a.id
    from public.schedule_scenario_rows a
    join public.schedule_scenario_rows b on b.id>a.id and a.scenario_id=b.scenario_id and a.class_id=b.class_id and a.weekday=b.weekday and a.period=b.period
    where a.scenario_id=p_scenario_id and a.class_id is not null and (
      a.subgroup_id is null or b.subgroup_id is null or a.subgroup_id=b.subgroup_id or exists(
        select 1 from public.class_subgroup_students x join public.class_subgroup_students y on y.student_id=x.student_id
        where x.subgroup_id=a.subgroup_id and y.subgroup_id=b.subgroup_id
      )
    )
  ) q
),
room_bad as (
  select count(*)::integer n from public.schedule_scenario_rows sr,room_config rc
  where sr.scenario_id=p_scenario_id and rc.yes and sr.classroom_id is null
),
room_double as (
  select count(*)::integer n from (
    select classroom_id,weekday,period,count(*) from public.schedule_scenario_rows
    where scenario_id=p_scenario_id and classroom_id is not null
    group by classroom_id,weekday,period having count(*)>1
  ) q
),
room_mismatch as (
  select count(*)::integer n
  from public.schedule_scenario_rows sr
  left join public.classrooms c on c.id=sr.classroom_id
  left join lateral (
    select lr.required_room_type,lr.required_department,lr.required_hardware
    from public.lesson_room_rules lr
    where lr.active=true and sr.subject ilike lr.subject_pattern
    order by length(lr.subject_pattern) desc limit 1
  ) rr on true
  where sr.scenario_id=p_scenario_id and sr.classroom_id is not null and (
    c.id is null or not c.active
    or c.capacity<coalesce(public.student_count_for_schedule(sr.class_id,sr.subgroup_id),0)
    or (rr.required_room_type is not null and c.room_type<>rr.required_room_type)
    or (rr.required_department is not null and coalesce(c.department,'')<>rr.required_department)
    or (rr.required_hardware is not null and rr.required_hardware<>'{}'::jsonb and not(c.hardware @> rr.required_hardware))
  )
),
unavailable_bad as (
  select count(*)::integer n from public.schedule_scenario_rows sr
  join public.teacher_unavailability u on u.teacher_id=sr.teacher_id and u.weekday=sr.weekday and u.period=sr.period and u.active
  where sr.scenario_id=p_scenario_id
),
daily_bad as (
  select count(*)::integer n from (
    select sr.teacher_id,sr.weekday,count(*) c,max(tc.max_daily_hours) lim
    from public.schedule_scenario_rows sr join public.teacher_schedule_constraints tc on tc.teacher_id=sr.teacher_id
    where sr.scenario_id=p_scenario_id and tc.max_daily_hours is not null
    group by sr.teacher_id,sr.weekday having count(*)>max(tc.max_daily_hours)
  ) q
),
weekly_bad as (
  select count(*)::integer n from (
    select sr.teacher_id,count(*) c,max(tc.max_weekly_hours) lim
    from public.schedule_scenario_rows sr join public.teacher_schedule_constraints tc on tc.teacher_id=sr.teacher_id
    where sr.scenario_id=p_scenario_id and tc.max_weekly_hours is not null
    group by sr.teacher_id having count(*)>max(tc.max_weekly_hours)
  ) q
),
working_days_bad as (
  select count(*)::integer n from (
    select sr.teacher_id,count(distinct sr.weekday) d,max(tc.max_working_days) mx,max(tc.min_working_days) mn
    from public.schedule_scenario_rows sr join public.teacher_schedule_constraints tc on tc.teacher_id=sr.teacher_id
    where sr.scenario_id=p_scenario_id group by sr.teacher_id
    having (max(tc.max_working_days) is not null and count(distinct sr.weekday)>max(tc.max_working_days))
       or (max(tc.min_working_days) is not null and count(distinct sr.weekday)<max(tc.min_working_days))
  ) q
),
teacher_runs as (
  select teacher_id,weekday,count(*)::integer len
  from (
    select teacher_id,weekday,period,period-row_number() over(partition by teacher_id,weekday order by period)::integer grp
    from (select distinct teacher_id,weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id) d
  ) x group by teacher_id,weekday,grp
),
consecutive_bad as (
  select count(*)::integer n from teacher_runs r
  join public.teacher_schedule_constraints tc on tc.teacher_id=r.teacher_id
  where tc.max_consecutive_hours is not null and r.len>tc.max_consecutive_hours
),
course_time_bad as (
  select count(*)::integer n from public.schedule_scenario_rows sr
  join public.course_schedule_rules cr on cr.course_id=sr.course_id and cr.active
  where sr.scenario_id=p_scenario_id and (
    (cardinality(cr.prohibited_days)>0 and sr.weekday=any(cr.prohibited_days))
    or (cardinality(cr.prohibited_periods)>0 and sr.period=any(cr.prohibited_periods))
  )
),
course_spread_bad as (
  select count(*)::integer n from (
    select sr.class_id,sr.course_id,count(distinct sr.weekday) d,max(cr.min_distinct_days) minimum
    from public.schedule_scenario_rows sr join public.course_schedule_rules cr on cr.course_id=sr.course_id and cr.active
    where sr.scenario_id=p_scenario_id and cr.min_distinct_days is not null
    group by sr.class_id,sr.course_id having count(distinct sr.weekday)<max(cr.min_distinct_days)
  ) q
),
course_daily_bad as (
  select count(*)::integer n from (
    select sr.class_id,sr.course_id,sr.weekday,count(distinct sr.period) c,max(cr.max_per_day) mx
    from public.schedule_scenario_rows sr join public.course_schedule_rules cr on cr.course_id=sr.course_id and cr.active
    where sr.scenario_id=p_scenario_id and cr.max_per_day is not null
    group by sr.class_id,sr.course_id,sr.weekday having count(distinct sr.period)>max(cr.max_per_day)
  ) q
),
block_bad as (
  select count(*)::integer n from public.teacher_course_assignments a
  join public.class_course_requirements r on r.id=a.class_course_requirement_id
  join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active and cardinality(cr.block_pattern)>0
  where public.scenario_assignment_run_lengths(p_scenario_id,a.id)<>(select array_agg(x.block_hours order by x.block_hours desc) from unnest(cr.block_pattern) as x(block_hours))
),
sync_hours_bad as (
  select count(*)::integer n from public.schedule_sync_groups g
  where g.active and g.required_simultaneous and exists(
    select 1 from public.schedule_sync_group_members m where m.sync_group_id=g.id and (
      select count(*) from public.schedule_scenario_rows sr
      where sr.scenario_id=p_scenario_id and sr.sync_group_id=g.id and sr.teacher_assignment_id=m.teacher_assignment_id
    )<>m.block_hours
  )
),
sync_slot_bad as (
  select count(*)::integer n from public.schedule_sync_groups g
  where g.active and g.required_simultaneous and exists(
    select 1 from public.schedule_sync_group_members m1
    join public.schedule_sync_group_members m2 on m2.sync_group_id=m1.sync_group_id and m2.id>m1.id
    where m1.sync_group_id=g.id and (
      exists((select weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and sync_group_id=g.id and teacher_assignment_id=m1.teacher_assignment_id)
             except
             (select weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and sync_group_id=g.id and teacher_assignment_id=m2.teacher_assignment_id))
      or exists((select weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and sync_group_id=g.id and teacher_assignment_id=m2.teacher_assignment_id)
             except
             (select weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and sync_group_id=g.id and teacher_assignment_id=m1.teacher_assignment_id))
    )
  )
),
room_issue_bad as (select count(*)::integer n from public.schedule_room_assignment_issues where scenario_id=p_scenario_id)
select * from (
  select 'SEMANTIC_LINK_MISMATCH',n,'Senaryo satırının sınıf/ders/öğretmen semantik bağı geçersiz.' from semantic_bad where n>0 union all
  select 'ASSIGNMENT_HOURS_MISMATCH',n,'Öğretmen-ders atama saatleri senaryoda eksik veya fazla.' from assignment_bad where n>0 union all
  select 'REQUIREMENT_HOURS_MISMATCH',n,'Sınıf-ders haftalık saati benzersiz zaman dilimleri üzerinden hedefle uyuşmuyor.' from requirement_bad where n>0 union all
  select 'CLASS_WEEKLY_HOURS_MISMATCH',n,'Sınıf haftalık saati benzersiz zaman dilimleri üzerinden hedefle uyuşmuyor.' from class_bad where n>0 union all
  select 'TTKB_PERMISSION_PROBLEM',n,'Senaryoda öğretmen alan-ders uygunluğu ALLOWED değil.' from ttkb_bad where n>0 union all
  select 'TIME_PROFILE_VIOLATION',n,'Senaryoda okul zaman şablonu dışında ders var.' from time_bad where n>0 union all
  select 'TEACHER_DOUBLE_BOOKING',n,'Senaryoda öğretmen aynı anda birden fazla derste.' from teacher_double where n>0 union all
  select 'CLASS_OR_STUDENT_GROUP_CONFLICT',n,'Senaryoda sınıf veya öğrenci alt grubu çakışıyor.' from class_conflict where n>0 union all
  select 'CLASSROOM_REQUIRED',n,'Derslik envanteri kullanılıyor ancak senaryoda derslik atanmamış satır var.' from room_bad where n>0 union all
  select 'CLASSROOM_DOUBLE_BOOKING',n,'Senaryoda aynı derslik aynı saatte birden fazla derse atanmış.' from room_double where n>0 union all
  select 'CLASSROOM_CONFIGURATION_MISMATCH',n,'Senaryoda atanmış derslik kapasite/tip/bölüm/donanım kuralını karşılamıyor.' from room_mismatch where n>0 union all
  select 'TEACHER_UNAVAILABLE',n,'Senaryoda öğretmenin kesin uygun olmadığı saat kullanılmış.' from unavailable_bad where n>0 union all
  select 'TEACHER_DAILY_LIMIT',n,'Senaryoda öğretmenin günlük azami ders saati aşılmış.' from daily_bad where n>0 union all
  select 'TEACHER_WEEKLY_LIMIT',n,'Senaryoda öğretmenin haftalık azami ders saati aşılmış.' from weekly_bad where n>0 union all
  select 'TEACHER_WORKING_DAYS',n,'Senaryoda öğretmenin çalışma günü sınırı ihlal edilmiş.' from working_days_bad where n>0 union all
  select 'TEACHER_CONSECUTIVE_LIMIT',n,'Senaryoda öğretmenin ardışık ders limiti aşılmış.' from consecutive_bad where n>0 union all
  select 'COURSE_TIME_RULE',n,'Senaryoda ders yasak gün/saatte.' from course_time_bad where n>0 union all
  select 'COURSE_MINIMUM_SPREAD',n,'Senaryoda ders gereken asgari gün sayısına yayılmamış.' from course_spread_bad where n>0 union all
  select 'COURSE_DAILY_LIMIT',n,'Senaryoda dersin aynı sınıftaki günlük azami zaman dilimi aşılmış.' from course_daily_bad where n>0 union all
  select 'COURSE_BLOCK_PATTERN',n,'Senaryoda dersin ardışık blok deseni geçersiz.' from block_bad where n>0 union all
  select 'SYNC_GROUP_HOURS',n,'Senaryoda paralel blok üyelerinin saat sayısı eksik/fazla.' from sync_hours_bad where n>0 union all
  select 'SYNC_GROUP_SLOT_MISMATCH',n,'Senaryoda paralel blok üyeleri tam aynı saatlerde değil.' from sync_slot_bad where n>0 union all
  select 'CLASSROOM_ISSUE',n,'Senaryoda uygun derslik bulunamayan satır var.' from room_issue_bad where n>0
) q;
$$;
revoke all on function public.get_schedule_scenario_hard_issues_v2(uuid) from public;
grant execute on function public.get_schedule_scenario_hard_issues_v2(uuid) to authenticated;

create or replace function public.validate_schedule_scenario_v2(p_scenario_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  i record;
  v_count integer:=0;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND';end if;

  delete from public.schedule_scenario_integrity_issues where scenario_id=p_scenario_id;
  for i in select * from public.get_schedule_scenario_hard_issues_v2(p_scenario_id) loop
    insert into public.schedule_scenario_integrity_issues(scenario_id,code,affected_count,detail)
    values(p_scenario_id,i.code,i.affected_count,i.detail)
    on conflict(scenario_id,code) do update set affected_count=excluded.affected_count,detail=excluded.detail,created_at=now();
    v_count:=v_count+i.affected_count;
  end loop;
  return v_count;
end;
$$;
revoke all on function public.validate_schedule_scenario_v2(uuid) from public;
grant execute on function public.validate_schedule_scenario_v2(uuid) to authenticated;
