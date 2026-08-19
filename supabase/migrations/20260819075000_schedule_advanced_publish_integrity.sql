-- Apply the same advanced HARD rules to the active working timetable so manual edits cannot bypass publish validation.

create or replace function public.get_schedule_advanced_integrity_issues_v1()
returns table(code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
normal_rows as (
  select distinct r.teacher_id,r.class_id,r.weekday,r.period
  from public.teacher_schedule r left join public.course_pedagogy_profiles pp on pp.course_id=r.course_id
  where r.active=true and r.class_id is not null
    and not coalesce(pp.is_workshop,false) and not coalesce(pp.is_vocational_practice,false)
),
teacher_class_runs as (
  select teacher_id,class_id,weekday,grp,count(*)::integer len from (
    select teacher_id,class_id,weekday,period,period-row_number() over(partition by teacher_id,class_id,weekday order by period)::integer grp from normal_rows
  ) q group by teacher_id,class_id,weekday,grp
),
consecutive_bad as (select count(*)::integer n from teacher_class_runs where len>coalesce((select (config->>'max')::integer from public.schedule_rule_modes where rule_code='teacher_class_consecutive'),3)),
triple_runs as (
  select teacher_assignment_id,weekday,grp,count(*)::integer len from (
    select s.teacher_assignment_id,s.weekday,s.period,s.period-row_number() over(partition by s.teacher_assignment_id,s.weekday order by s.period)::integer grp
    from public.teacher_schedule s left join public.course_pedagogy_profiles pp on pp.course_id=s.course_id
    join public.teacher_course_assignments a on a.id=s.teacher_assignment_id
    where s.active=true and a.assigned_hours>=coalesce((select (config->>'high_hour_threshold')::integer from public.schedule_rule_modes where rule_code='teacher_class_consecutive'),9)
      and not coalesce(pp.is_workshop,false) and not coalesce(pp.is_vocational_practice,false)
  ) q group by teacher_assignment_id,weekday,grp
),
triple_bad as (select count(*)::integer n from (select teacher_assignment_id,weekday,count(*) c from triple_runs where len>=3 group by teacher_assignment_id,weekday having count(*)>coalesce((select (config->>'max_triple_blocks_per_day')::integer from public.schedule_rule_modes where rule_code='teacher_class_consecutive'),1)) x),
course_runs as (
  select class_id,course_id,weekday,grp,count(*)::integer len from (
    select class_id,course_id,weekday,period,period-row_number() over(partition by class_id,course_id,weekday order by period)::integer grp
    from (select distinct class_id,course_id,weekday,period from public.teacher_schedule where active=true and class_id is not null and course_id is not null) d
  ) q group by class_id,course_id,weekday,grp
),
course_blocks as (select class_id,course_id,weekday,count(*)::integer blocks from course_runs group by class_id,course_id,weekday),
repeat_bad as (select count(*)::integer n from course_blocks where blocks>1),
duty_daily as (
  select d.teacher_id,d.weekday,d.max_duty_day_hours,d.anchor_period,count(r.id)::integer hours,
         count(r.id) filter(where d.anchor_period is not null and r.period in(d.anchor_period-1,d.anchor_period+1))::integer adjacent,d.hard_max
  from public.schedule_duty_optimization d left join public.teacher_schedule r on r.active=true and r.teacher_id=d.teacher_id and r.weekday=d.weekday
  group by d.teacher_id,d.weekday,d.max_duty_day_hours,d.anchor_period,d.hard_max
),
duty_bad as (select count(*)::integer n from duty_daily where (hard_max or public.schedule_rule_mode_v1('duty_light_day')='hard') and hours>max_duty_day_hours),
duty_adjacent_bad as (select count(*)::integer n from duty_daily where public.schedule_rule_mode_v1('duty_adjacent_lesson')='hard' and adjacent>0),
heavy_bad as (
  select count(*)::integer n from public.teacher_schedule a join public.teacher_schedule b
    on b.active=true and b.class_id=a.class_id and b.weekday=a.weekday and b.period=a.period+1
  left join public.course_pedagogy_profiles pa on pa.course_id=a.course_id left join public.course_pedagogy_profiles pb on pb.course_id=b.course_id
  where a.active=true and coalesce(pa.difficulty,3)>=coalesce((select (config->>'difficulty_threshold')::integer from public.schedule_rule_modes where rule_code='heavy_course_consecutive'),4)
    and coalesce(pb.difficulty,3)>=coalesce((select (config->>'difficulty_threshold')::integer from public.schedule_rule_modes where rule_code='heavy_course_consecutive'),4)
),
class_day_load as (
  select r.class_id,r.weekday,sum(coalesce(pp.academic_load,3)+coalesce(pp.attention_load,3))::integer load
  from public.teacher_schedule r left join public.course_pedagogy_profiles pp on pp.course_id=r.course_id
  where r.active=true and r.class_id is not null group by r.class_id,r.weekday
),
load_bad as (
  select count(*)::integer n from (select class_id,max(load)-min(load) spread from class_day_load group by class_id) q
  where spread>coalesce((select (config->>'max_daily_load_spread')::integer from public.schedule_rule_modes where rule_code='pedagogic_daily_balance'),10)
),
workshop_runs as (
  select teacher_assignment_id,course_id,weekday,grp,count(*)::integer len from (
    select r.teacher_assignment_id,r.course_id,r.weekday,r.period,r.period-row_number() over(partition by r.teacher_assignment_id,r.weekday order by r.period)::integer grp
    from public.teacher_schedule r join public.course_pedagogy_profiles pp on pp.course_id=r.course_id and pp.is_workshop=true where r.active=true
  ) q group by teacher_assignment_id,course_id,weekday,grp
),
workshop_min_bad as (select count(*)::integer n from workshop_runs wr left join public.schedule_workshop_policies wp on wp.course_id=wr.course_id and wp.active=true where wr.len<coalesce(wp.min_block,3)),
workshop_pref_bad as (select count(*)::integer n from workshop_runs wr left join public.schedule_workshop_policies wp on wp.course_id=wr.course_id and wp.active=true where wr.len<coalesce(wp.preferred_block,5)),
time_pref_bad as (
  select count(*)::integer n from public.teacher_schedule r join public.course_pedagogy_profiles pp on pp.course_id=r.course_id
  where r.active=true and ((pp.prefer_early and r.period>4) or (pp.avoid_early and r.period<=2) or (cardinality(pp.prefer_weekdays)>0 and not(r.weekday=any(pp.prefer_weekdays))))
)
select 'TEACHER_CLASS_CONSECUTIVE_LIMIT',n,'Aynı öğretmen-sınıf için izin verilen ardışık ders sınırı aşılıyor.' from consecutive_bad where public.schedule_rule_mode_v1('teacher_class_consecutive')='hard' and n>0
union all select 'HIGH_HOUR_TRIPLE_BLOCK_LIMIT',n,'9+ saatlik öğretmen-ders atamasında bir günde birden fazla üçlü blok oluşuyor.' from triple_bad where public.schedule_rule_mode_v1('teacher_class_consecutive')='hard' and n>0
union all select 'SAME_COURSE_REPEAT_DAY',n,'Aynı sınıf-ders aynı gün birden fazla ayrı blokta bulunuyor.' from repeat_bad where public.schedule_rule_mode_v1('same_course_repeat_day')='hard' and n>0
union all select 'DUTY_DAY_LOAD_LIMIT',n,'Nöbet gününde tanımlanan azami ders yükü aşılıyor.' from duty_bad where n>0
union all select 'DUTY_ADJACENT_LESSON',n,'Nöbet referans saatine bitişik ders bulunuyor.' from duty_adjacent_bad where n>0
union all select 'HEAVY_COURSE_CONSECUTIVE',n,'Zorluk seviyesi yüksek dersler ardışık yığılmış.' from heavy_bad where public.schedule_rule_mode_v1('heavy_course_consecutive')='hard' and n>0
union all select 'PEDAGOGIC_DAILY_IMBALANCE',n,'Sınıfın günler arası pedagojik yük farkı tanımlı sınırı aşıyor.' from load_bad where public.schedule_rule_mode_v1('pedagogic_daily_balance')='hard' and n>0
union all select 'WORKSHOP_MIN_BLOCK',n,'Atölye/meslek uygulama dersi minimum blok süresinin altında.' from workshop_min_bad where public.schedule_rule_mode_v1('workshop_min_block')='hard' and n>0
union all select 'WORKSHOP_PREFERRED_BLOCK',n,'Atölye dersi tercih edilen büyük blok süresinin altında.' from workshop_pref_bad where public.schedule_rule_mode_v1('workshop_large_block')='hard' and n>0
union all select 'COURSE_TIME_PREFERENCE',n,'Dersin tanımlı sabah/gün tercihi HARD kural olarak ihlal ediliyor.' from time_pref_bad where public.schedule_rule_mode_v1('course_time_preference')='hard' and n>0;
$$;

alter function public.get_schedule_integrity_report()
rename to get_schedule_integrity_report_pre_advanced_v3;
create or replace function public.get_schedule_integrity_report()
returns table(severity text,code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
  select * from public.get_schedule_integrity_report_pre_advanced_v3()
  union all
  select 'error'::text,i.code,i.affected_count,i.detail from public.get_schedule_advanced_integrity_issues_v1() i;
$$;

revoke all on function public.get_schedule_advanced_integrity_issues_v1(),public.get_schedule_integrity_report() from public;
grant execute on function public.get_schedule_advanced_integrity_issues_v1(),public.get_schedule_integrity_report() to authenticated;
