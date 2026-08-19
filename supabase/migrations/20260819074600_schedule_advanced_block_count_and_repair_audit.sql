-- Correct contiguous block counting and make repair/backtracking explainable.

create or replace function public.get_schedule_scenario_quality_breakdown_v1(p_scenario_id uuid)
returns table(metric text,score integer,detail text)
language sql stable security definer set search_path=public as $$
with
course_runs as (
  select class_id,course_id,weekday,grp,count(*)::integer len from (
    select class_id,course_id,weekday,period,
      period-row_number() over(partition by class_id,course_id,weekday order by period)::integer grp
    from (select distinct class_id,course_id,weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and class_id is not null and course_id is not null) d
  ) x group by class_id,course_id,weekday,grp
),
course_blocks as (select class_id,course_id,weekday,count(*)::integer blocks from course_runs group by class_id,course_id,weekday),
duty_daily as (
  select d.teacher_id,d.weekday,d.max_duty_day_hours,d.anchor_period,d.overload_weight,d.adjacent_weight,
    count(r.id)::integer hours,
    count(r.id) filter(where d.anchor_period is not null and r.period in (d.anchor_period-1,d.anchor_period+1))::integer adjacent
  from public.schedule_duty_optimization d
  left join public.schedule_scenario_rows r on r.scenario_id=p_scenario_id and r.teacher_id=d.teacher_id and r.weekday=d.weekday
  group by d.teacher_id,d.weekday,d.max_duty_day_hours,d.anchor_period,d.overload_weight,d.adjacent_weight
),
heavy_pairs as (
  select count(*)::integer n from public.schedule_scenario_rows a
  join public.schedule_scenario_rows b on b.scenario_id=a.scenario_id and b.class_id=a.class_id and b.weekday=a.weekday and b.period=a.period+1
  left join public.course_pedagogy_profiles pa on pa.course_id=a.course_id
  left join public.course_pedagogy_profiles pb on pb.course_id=b.course_id
  where a.scenario_id=p_scenario_id and coalesce(pa.difficulty,3)>=4 and coalesce(pb.difficulty,3)>=4
),
class_day_load as (
  select r.class_id,r.weekday,sum(coalesce(pp.academic_load,3)+coalesce(pp.attention_load,3))::integer load
  from public.schedule_scenario_rows r left join public.course_pedagogy_profiles pp on pp.course_id=r.course_id
  where r.scenario_id=p_scenario_id and r.class_id is not null group by r.class_id,r.weekday
),
load_imbalance as (select coalesce(sum(mx-mn),0)::integer n from (select class_id,max(load) mx,min(load) mn from class_day_load group by class_id) q),
workshop_runs as (
  select teacher_assignment_id,course_id,weekday,grp,count(*)::integer len from (
    select r.teacher_assignment_id,r.course_id,r.weekday,r.period,
      r.period-row_number() over(partition by r.teacher_assignment_id,r.weekday order by r.period)::integer grp
    from public.schedule_scenario_rows r join public.course_pedagogy_profiles pp on pp.course_id=r.course_id and pp.is_workshop=true
    where r.scenario_id=p_scenario_id
  ) q group by teacher_assignment_id,course_id,weekday,grp
),
workshop_quality as (
  select coalesce(sum(case when wr.len<coalesce(wp.min_block,3) then 1 else 0 end),0)::integer small_blocks,
         coalesce(sum(case when wr.len>=coalesce(wp.preferred_block,5) then 1 else 0 end),0)::integer large_blocks
  from workshop_runs wr left join public.schedule_workshop_policies wp on wp.course_id=wr.course_id and wp.active=true
)
select 'same_course_repeat',case when public.schedule_rule_mode_v1('same_course_repeat_day')='off' then 0 else coalesce(sum(greatest(blocks-1,0)),0)::integer*public.schedule_rule_weight_v1('same_course_repeat_day','same_course_repeat',20) end,'Aynı sınıf-dersin aynı gün ayrı blok tekrarı.' from course_blocks
union all select 'duty_overload',case when public.schedule_rule_mode_v1('duty_light_day')='off' then 0 else coalesce(sum(greatest(hours-max_duty_day_hours,0)*overload_weight),0)::integer end,'Nöbet günündeki hedef üstü öğretmen ders yükü.' from duty_daily
union all select 'duty_adjacent',case when public.schedule_rule_mode_v1('duty_adjacent_lesson')='off' then 0 else coalesce(sum(adjacent*adjacent_weight),0)::integer end,'Nöbet referans saatine bitişik dersler.' from duty_daily
union all select 'heavy_consecutive',case when public.schedule_rule_mode_v1('heavy_course_consecutive')='off' then 0 else n*public.schedule_rule_weight_v1('heavy_course_consecutive','heavy_consecutive',22) end,'Zorluk seviyesi yüksek derslerin ardışık gelmesi.' from heavy_pairs
union all select 'pedagogic_imbalance',case when public.schedule_rule_mode_v1('pedagogic_daily_balance')='off' then 0 else n*public.schedule_rule_weight_v1('pedagogic_daily_balance','pedagogic_imbalance',15) end,'Sınıfların günler arasındaki bilişsel/dikkat yükü farkı.' from load_imbalance
union all select 'workshop_small_block',case when public.schedule_rule_mode_v1('workshop_min_block')='off' then 0 else small_blocks*public.schedule_rule_weight_v1('workshop_min_block','workshop_small_block',30) end,'Atölye/meslek uygulamasında tercih edilenden küçük blok.' from workshop_quality
union all select 'workshop_large_block_reward',case when public.schedule_rule_mode_v1('workshop_large_block')='off' then 0 else large_blocks*public.schedule_rule_weight_v1('workshop_large_block','preferred_large_block',-10) end,'Tercih edilen büyük atölye blokları için ödül.' from workshop_quality;
$$;

create or replace function public.get_schedule_scenario_advanced_hard_issues_v1(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
teacher_class_runs as (
  select teacher_id,class_id,weekday,grp,count(*)::integer len from (
    select teacher_id,class_id,weekday,period,period-row_number() over(partition by teacher_id,class_id,weekday order by period)::integer grp
    from (select distinct teacher_id,class_id,weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and class_id is not null) d
  ) q group by teacher_id,class_id,weekday,grp
),
consecutive_bad as (select count(*)::integer n from teacher_class_runs where len>coalesce((select (config->>'max')::integer from public.schedule_rule_modes where rule_code='teacher_class_consecutive'),3)),
triple_runs as (
  select teacher_assignment_id,weekday,grp,count(*)::integer len from (
    select s.teacher_assignment_id,s.weekday,s.period,s.period-row_number() over(partition by s.teacher_assignment_id,s.weekday order by s.period)::integer grp
    from public.schedule_scenario_rows s left join public.course_pedagogy_profiles pp on pp.course_id=s.course_id
    join public.teacher_course_assignments a on a.id=s.teacher_assignment_id
    where s.scenario_id=p_scenario_id and a.assigned_hours>=coalesce((select (config->>'high_hour_threshold')::integer from public.schedule_rule_modes where rule_code='teacher_class_consecutive'),9)
      and not coalesce(pp.is_workshop,false) and not coalesce(pp.is_vocational_practice,false)
  ) q group by teacher_assignment_id,weekday,grp
),
triple_bad as (select count(*)::integer n from (select teacher_assignment_id,weekday,count(*) c from triple_runs where len>=3 group by teacher_assignment_id,weekday having count(*)>coalesce((select (config->>'max_triple_blocks_per_day')::integer from public.schedule_rule_modes where rule_code='teacher_class_consecutive'),1)) x),
course_runs as (
  select class_id,course_id,weekday,grp,count(*)::integer len from (
    select class_id,course_id,weekday,period,period-row_number() over(partition by class_id,course_id,weekday order by period)::integer grp
    from (select distinct class_id,course_id,weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and class_id is not null and course_id is not null) d
  ) q group by class_id,course_id,weekday,grp
),
course_blocks as (select class_id,course_id,weekday,count(*)::integer blocks from course_runs group by class_id,course_id,weekday),
repeat_bad as (select count(*)::integer n from course_blocks where blocks>1),
duty_bad as (
  select count(*)::integer n from (
    select d.teacher_id,d.weekday,count(r.id) hours,d.max_duty_day_hours
    from public.schedule_duty_optimization d left join public.schedule_scenario_rows r on r.scenario_id=p_scenario_id and r.teacher_id=d.teacher_id and r.weekday=d.weekday
    where d.hard_max=true or public.schedule_rule_mode_v1('duty_light_day')='hard'
    group by d.teacher_id,d.weekday,d.max_duty_day_hours having count(r.id)>d.max_duty_day_hours
  ) q
),
workshop_runs as (
  select teacher_assignment_id,course_id,weekday,grp,count(*)::integer len from (
    select r.teacher_assignment_id,r.course_id,r.weekday,r.period,r.period-row_number() over(partition by r.teacher_assignment_id,r.weekday order by r.period)::integer grp
    from public.schedule_scenario_rows r join public.course_pedagogy_profiles pp on pp.course_id=r.course_id and pp.is_workshop=true where r.scenario_id=p_scenario_id
  ) q group by teacher_assignment_id,course_id,weekday,grp
),
workshop_bad as (select count(*)::integer n from workshop_runs wr left join public.schedule_workshop_policies wp on wp.course_id=wr.course_id and wp.active=true where wr.len<coalesce(wp.min_block,3))
select 'TEACHER_CLASS_CONSECUTIVE_LIMIT',n,'Aynı öğretmen-sınıf için izin verilen ardışık ders sınırı aşılıyor.' from consecutive_bad where public.schedule_rule_mode_v1('teacher_class_consecutive')='hard' and n>0
union all select 'HIGH_HOUR_TRIPLE_BLOCK_LIMIT',n,'9+ saatlik öğretmen-ders atamasında bir günde birden fazla üçlü blok oluşuyor.' from triple_bad where public.schedule_rule_mode_v1('teacher_class_consecutive')='hard' and n>0
union all select 'SAME_COURSE_REPEAT_DAY',n,'Aynı sınıf-ders aynı gün birden fazla ayrı blokta bulunuyor.' from repeat_bad where public.schedule_rule_mode_v1('same_course_repeat_day')='hard' and n>0
union all select 'DUTY_DAY_LOAD_LIMIT',n,'Nöbet gününde tanımlanan azami ders yükü aşılıyor.' from duty_bad where n>0
union all select 'WORKSHOP_MIN_BLOCK',n,'Atölye/meslek uygulama dersi minimum blok süresinin altında.' from workshop_bad where public.schedule_rule_mode_v1('workshop_min_block')='hard' and n>0;
$$;

-- Make every repair invocation auditable with before/after validation and score context.
alter function public.repair_schedule_scenario_permission_core_v2(uuid)
rename to repair_schedule_scenario_audit_core_v3;
create or replace function public.repair_schedule_scenario_permission_core_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare
  v_result integer;v_before_hard integer;v_after_hard integer;v_before_score integer;v_after_score integer;v_no integer;
  v_before jsonb;v_after jsonb;
begin
  select count(*),public.calculate_schedule_scenario_score_v2(p_scenario_id),
         jsonb_build_object('rows',(select count(*) from public.schedule_scenario_rows where scenario_id=p_scenario_id),'unplaced',(select count(*) from public.schedule_unplaced_items where scenario_id=p_scenario_id))
  into v_before_hard,v_before_score,v_before from public.get_schedule_scenario_hard_issues_v2(p_scenario_id);

  v_result:=public.repair_schedule_scenario_audit_core_v3(p_scenario_id);

  select count(*),public.calculate_schedule_scenario_score_v2(p_scenario_id),
         jsonb_build_object('rows',(select count(*) from public.schedule_scenario_rows where scenario_id=p_scenario_id),'unplaced',(select count(*) from public.schedule_unplaced_items where scenario_id=p_scenario_id))
  into v_after_hard,v_after_score,v_after from public.get_schedule_scenario_hard_issues_v2(p_scenario_id);
  select coalesce(max(action_no),0)+1 into v_no from public.schedule_repair_audit where scenario_id=p_scenario_id;
  insert into public.schedule_repair_audit(scenario_id,action_no,issue_code,description,before_state,after_state,score_delta,hard_issues_before,hard_issues_after)
  values(p_scenario_id,v_no,'REPAIR_BACKTRACK',format('Repair/backtracking %s değişiklik/yerleştirme üretti.',coalesce(v_result,0)),v_before,v_after,v_after_score-v_before_score,v_before_hard,v_after_hard);
  return v_result;
end;$$;

revoke all on function public.get_schedule_scenario_quality_breakdown_v1(uuid),public.get_schedule_scenario_advanced_hard_issues_v1(uuid) from public;
grant execute on function public.get_schedule_scenario_quality_breakdown_v1(uuid),public.get_schedule_scenario_advanced_hard_issues_v1(uuid) to authenticated;
