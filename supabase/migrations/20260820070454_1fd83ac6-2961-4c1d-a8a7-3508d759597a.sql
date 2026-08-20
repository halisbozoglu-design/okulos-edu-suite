create or replace function public.schedule_rule_mode_v1(p_rule_code text)
returns text language sql stable security definer set search_path=public as $$
  select coalesce((select mode from public.schedule_rule_modes where rule_code=p_rule_code),'off');
$$;

create or replace function public.schedule_rule_weight_v1(p_rule_code text,p_profile_weight_key text,p_default integer)
returns integer language sql stable security definer set search_path=public as $$
  select coalesce(
    (select weight from public.schedule_rule_modes where rule_code=p_rule_code and weight<>0),
    (select (p.weights->>p_profile_weight_key)::integer
       from public.schedule_optimization_settings s join public.schedule_optimization_profiles p on p.profile_key=s.active_profile_key where s.id=true),
    p_default
  );
$$;

create or replace function public.apply_schedule_optimization_profile_v1(p_profile_key text)
returns void language plpgsql security definer set search_path=public as $$
declare w jsonb;
begin
  if not public.has_permission('schedule.rules') then raise exception 'PERMISSION_DENIED: schedule.rules';end if;
  select weights into w from public.schedule_optimization_profiles where profile_key=p_profile_key and active=true;
  if w is null then raise exception 'OPTIMIZATION_PROFILE_NOT_FOUND';end if;
  update public.schedule_optimization_settings set active_profile_key=p_profile_key,updated_by=auth.uid(),updated_at=now() where id=true;
  update public.schedule_generation_settings set
    gap_penalty=coalesce((w->>'teacher_gap')::integer,gap_penalty),
    late_period_penalty=coalesce((w->>'late_period')::integer,late_period_penalty),
    repeated_course_penalty=coalesce((w->>'same_course_repeat')::integer,repeated_course_penalty),
    updated_at=now()
  where id=true;
end;$$;

create or replace function public.materialize_workshop_block_rule_v1(p_course_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare p public.schedule_workshop_policies%rowtype; existing public.course_schedule_rules%rowtype;
begin
  select * into p from public.schedule_workshop_policies where course_id=p_course_id and active=true;
  if not found then return;end if;
  select * into existing from public.course_schedule_rules where course_id=p_course_id;
  if found and cardinality(existing.block_pattern)>0 then return;end if;
  insert into public.course_schedule_rules(course_id,block_pattern,active,updated_at)
  values(p_course_id,array[p.preferred_block,p.preferred_block]::smallint[],true,now())
  on conflict(course_id) do update set
    block_pattern=case when cardinality(public.course_schedule_rules.block_pattern)=0 then excluded.block_pattern else public.course_schedule_rules.block_pattern end,
    active=true,updated_at=now();
end;$$;

create or replace function public.schedule_workshop_policy_sync_trigger_v1()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  perform public.materialize_workshop_block_rule_v1(new.course_id);
  insert into public.course_pedagogy_profiles(course_id,is_workshop,is_vocational_practice,practical_load,physical_load)
  values(new.course_id,true,true,5,3)
  on conflict(course_id) do update set is_workshop=true,is_vocational_practice=true,updated_at=now();
  return new;
end;$$;
drop trigger if exists trg_schedule_workshop_policy_sync on public.schedule_workshop_policies;
create trigger trg_schedule_workshop_policy_sync after insert or update of min_block,preferred_block,max_block,active
on public.schedule_workshop_policies for each row execute function public.schedule_workshop_policy_sync_trigger_v1();

create or replace function public.get_schedule_scenario_quality_breakdown_v1(p_scenario_id uuid)
returns table(metric text,score integer,detail text)
language sql stable security definer set search_path=public as $$
with
profile as (
  select p.weights from public.schedule_optimization_settings s join public.schedule_optimization_profiles p on p.profile_key=s.active_profile_key where s.id=true
),
course_blocks as (
  select class_id,course_id,weekday,count(*) blocks from (
    select class_id,course_id,weekday,period,
      period-row_number() over(partition by class_id,course_id,weekday order by period)::integer grp
    from (select distinct class_id,course_id,weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and class_id is not null and course_id is not null) d
  ) x group by class_id,course_id,weekday
),
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
  select r.class_id,r.weekday,
    sum(coalesce(pp.academic_load,3)+coalesce(pp.attention_load,3))::integer load
  from public.schedule_scenario_rows r left join public.course_pedagogy_profiles pp on pp.course_id=r.course_id
  where r.scenario_id=p_scenario_id and r.class_id is not null group by r.class_id,r.weekday
),
load_imbalance as (
  select coalesce(sum(mx-mn),0)::integer n from (select class_id,max(load) mx,min(load) mn from class_day_load group by class_id) q
),
workshop_runs as (
  select teacher_assignment_id,course_id,weekday,count(*)::integer len from (
    select r.teacher_assignment_id,r.course_id,r.weekday,r.period,
      r.period-row_number() over(partition by r.teacher_assignment_id,r.weekday order by r.period)::integer grp
    from public.schedule_scenario_rows r join public.course_pedagogy_profiles pp on pp.course_id=r.course_id and pp.is_workshop=true
    where r.scenario_id=p_scenario_id
  ) q group by teacher_assignment_id,course_id,weekday,grp
),
workshop_quality as (
  select
    coalesce(sum(case when wr.len<coalesce(wp.min_block,3) then 1 else 0 end),0)::integer small_blocks,
    coalesce(sum(case when wr.len>=coalesce(wp.preferred_block,5) then 1 else 0 end),0)::integer large_blocks
  from workshop_runs wr left join public.schedule_workshop_policies wp on wp.course_id=wr.course_id and wp.active=true
)
select 'same_course_repeat',
  case when public.schedule_rule_mode_v1('same_course_repeat_day')='off' then 0 else coalesce(sum(greatest(blocks-1,0)),0)::integer*public.schedule_rule_weight_v1('same_course_repeat_day','same_course_repeat',20) end,
  'Aynı sınıf-dersin aynı gün ayrı blok tekrarı.' from course_blocks
union all
select 'duty_overload',
  case when public.schedule_rule_mode_v1('duty_light_day')='off' then 0 else coalesce(sum(greatest(hours-max_duty_day_hours,0)*overload_weight),0)::integer end,
  'Nöbet günündeki hedef üstü öğretmen ders yükü.' from duty_daily
union all
select 'duty_adjacent',
  case when public.schedule_rule_mode_v1('duty_adjacent_lesson')='off' then 0 else coalesce(sum(adjacent*adjacent_weight),0)::integer end,
  'Nöbet referans saatine bitişik dersler.' from duty_daily
union all
select 'heavy_consecutive',
  case when public.schedule_rule_mode_v1('heavy_course_consecutive')='off' then 0 else n*public.schedule_rule_weight_v1('heavy_course_consecutive','heavy_consecutive',22) end,
  'Zorluk seviyesi yüksek derslerin ardışık gelmesi.' from heavy_pairs
union all
select 'pedagogic_imbalance',
  case when public.schedule_rule_mode_v1('pedagogic_daily_balance')='off' then 0 else n*public.schedule_rule_weight_v1('pedagogic_daily_balance','pedagogic_imbalance',15) end,
  'Sınıfların günler arasındaki bilişsel/dikkat yükü farkı.' from load_imbalance
union all
select 'workshop_small_block',
  case when public.schedule_rule_mode_v1('workshop_min_block')='off' then 0 else small_blocks*public.schedule_rule_weight_v1('workshop_min_block','workshop_small_block',30) end,
  'Atölye/meslek uygulamasında tercih edilenden küçük blok.' from workshop_quality
union all
select 'workshop_large_block_reward',
  case when public.schedule_rule_mode_v1('workshop_large_block')='off' then 0 else large_blocks*public.schedule_rule_weight_v1('workshop_large_block','preferred_large_block',-10) end,
  'Tercih edilen büyük atölye blokları için ödül.' from workshop_quality;
$$;

alter function public.calculate_schedule_scenario_score_v2(uuid)
rename to calculate_schedule_scenario_score_base_v3;

create or replace function public.calculate_schedule_scenario_score_v2(p_scenario_id uuid)
returns integer language sql stable security definer set search_path=public as $$
  select greatest(least(
    public.calculate_schedule_scenario_score_base_v3(p_scenario_id)::bigint
    +coalesce((select sum(score)::bigint from public.get_schedule_scenario_quality_breakdown_v1(p_scenario_id)),0),
    2147483647),-2147483648)::integer;
$$;

create or replace function public.get_schedule_scenario_advanced_hard_issues_v1(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
teacher_class_runs as (
  select teacher_id,class_id,weekday,count(*)::integer len from (
    select r.teacher_id,r.class_id,r.weekday,r.period,
      r.period-row_number() over(partition by r.teacher_id,r.class_id,r.weekday order by r.period)::integer grp
    from (select distinct teacher_id,class_id,weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and class_id is not null) r
  ) q group by teacher_id,class_id,weekday,grp
),
consecutive_bad as (select count(*)::integer n from teacher_class_runs where len>coalesce((select (config->>'max')::integer from public.schedule_rule_modes where rule_code='teacher_class_consecutive'),3)),
triple_runs as (
  select r.teacher_assignment_id,r.weekday,count(*)::integer len from (
    select s.teacher_assignment_id,s.weekday,s.period,
      s.period-row_number() over(partition by s.teacher_assignment_id,s.weekday order by s.period)::integer grp
    from public.schedule_scenario_rows s
    left join public.course_pedagogy_profiles pp on pp.course_id=s.course_id
    join public.teacher_course_assignments a on a.id=s.teacher_assignment_id
    where s.scenario_id=p_scenario_id and a.assigned_hours>=coalesce((select (config->>'high_hour_threshold')::integer from public.schedule_rule_modes where rule_code='teacher_class_consecutive'),9)
      and not coalesce(pp.is_workshop,false) and not coalesce(pp.is_vocational_practice,false)
  ) r group by teacher_assignment_id,weekday,grp
),
triple_bad as (select count(*)::integer n from (select teacher_assignment_id,weekday,count(*) c from triple_runs where len>=3 group by teacher_assignment_id,weekday having count(*)>coalesce((select (config->>'max_triple_blocks_per_day')::integer from public.schedule_rule_modes where rule_code='teacher_class_consecutive'),1)) q),
course_blocks as (
  select class_id,course_id,weekday,count(*) blocks from (
    select class_id,course_id,weekday,period,period-row_number() over(partition by class_id,course_id,weekday order by period)::integer grp
    from (select distinct class_id,course_id,weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and class_id is not null and course_id is not null) d
  ) x group by class_id,course_id,weekday
),
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
  select course_id,weekday,count(*)::integer len from (
    select r.teacher_assignment_id,r.course_id,r.weekday,r.period,
      r.period-row_number() over(partition by r.teacher_assignment_id,r.weekday order by r.period)::integer grp
    from public.schedule_scenario_rows r join public.course_pedagogy_profiles pp on pp.course_id=r.course_id and pp.is_workshop=true
    where r.scenario_id=p_scenario_id
  ) q group by teacher_assignment_id,course_id,weekday,grp
),
workshop_bad as (
  select count(*)::integer n from workshop_runs wr left join public.schedule_workshop_policies wp on wp.course_id=wr.course_id and wp.active=true where wr.len<coalesce(wp.min_block,3)
)
select 'TEACHER_CLASS_CONSECUTIVE_LIMIT',n,'Aynı öğretmen-sınıf için izin verilen ardışık ders sınırı aşılıyor.' from consecutive_bad where public.schedule_rule_mode_v1('teacher_class_consecutive')='hard' and n>0
union all
select 'HIGH_HOUR_TRIPLE_BLOCK_LIMIT',n,'9+ saatlik öğretmen-ders atamasında bir günde birden fazla üçlü blok oluşuyor.' from triple_bad where public.schedule_rule_mode_v1('teacher_class_consecutive')='hard' and n>0
union all
select 'SAME_COURSE_REPEAT_DAY',n,'Aynı sınıf-ders aynı gün birden fazla ayrı blokta bulunuyor.' from repeat_bad where public.schedule_rule_mode_v1('same_course_repeat_day')='hard' and n>0
union all
select 'DUTY_DAY_LOAD_LIMIT',n,'Nöbet gününde tanımlanan azami ders yükü aşılıyor.' from duty_bad where n>0
union all
select 'WORKSHOP_MIN_BLOCK',n,'Atölye/meslek uygulama dersi minimum blok süresinin altında.' from workshop_bad where public.schedule_rule_mode_v1('workshop_min_block')='hard' and n>0;
$$;

alter function public.get_schedule_scenario_hard_issues_v2(uuid)
rename to get_schedule_scenario_hard_issues_pre_advanced_v2;
create or replace function public.get_schedule_scenario_hard_issues_v2(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
  select * from public.get_schedule_scenario_hard_issues_pre_advanced_v2(p_scenario_id)
  union all
  select * from public.get_schedule_scenario_advanced_hard_issues_v1(p_scenario_id);
$$;

create or replace function public.refresh_schedule_scenario_explanation_v1(p_scenario_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare total integer;metrics jsonb;pos jsonb;neg jsonb;
begin
  total:=public.calculate_schedule_scenario_score_v2(p_scenario_id);
  select coalesce(jsonb_object_agg(metric,jsonb_build_object('score',score,'detail',detail)),'{}'::jsonb),
         coalesce(jsonb_agg(jsonb_build_object('metric',metric,'score',score,'detail',detail)) filter(where score<0),'[]'::jsonb),
         coalesce(jsonb_agg(jsonb_build_object('metric',metric,'score',score,'detail',detail)) filter(where score>0),'[]'::jsonb)
  into metrics,pos,neg from public.get_schedule_scenario_quality_breakdown_v1(p_scenario_id);
  insert into public.schedule_scenario_explanations(scenario_id,total_score,pedagogic_score,teacher_score,duty_score,workshop_score,positives,negatives,metrics,generated_at)
  values(
    p_scenario_id,total,
    coalesce((metrics->'heavy_consecutive'->>'score')::integer,0)+coalesce((metrics->'pedagogic_imbalance'->>'score')::integer,0)+coalesce((metrics->'same_course_repeat'->>'score')::integer,0),
    0,
    coalesce((metrics->'duty_overload'->>'score')::integer,0)+coalesce((metrics->'duty_adjacent'->>'score')::integer,0),
    coalesce((metrics->'workshop_small_block'->>'score')::integer,0)+coalesce((metrics->'workshop_large_block_reward'->>'score')::integer,0),
    pos,neg,metrics,now()
  ) on conflict(scenario_id) do update set total_score=excluded.total_score,pedagogic_score=excluded.pedagogic_score,teacher_score=excluded.teacher_score,duty_score=excluded.duty_score,workshop_score=excluded.workshop_score,positives=excluded.positives,negatives=excluded.negatives,metrics=excluded.metrics,generated_at=now();
end;$$;

alter function public.rescore_schedule_scenario_permission_core_v2(uuid)
rename to rescore_schedule_scenario_score_core_v3;
create or replace function public.rescore_schedule_scenario_permission_core_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v integer;
begin
  v:=public.rescore_schedule_scenario_score_core_v3(p_scenario_id);
  perform public.refresh_schedule_scenario_explanation_v1(p_scenario_id);
  return v;
end;$$;

revoke all on function public.schedule_rule_mode_v1(text),public.schedule_rule_weight_v1(text,text,integer),public.apply_schedule_optimization_profile_v1(text),public.materialize_workshop_block_rule_v1(uuid),public.get_schedule_scenario_quality_breakdown_v1(uuid),public.get_schedule_scenario_advanced_hard_issues_v1(uuid),public.refresh_schedule_scenario_explanation_v1(uuid) from public;
grant execute on function public.schedule_rule_mode_v1(text),public.schedule_rule_weight_v1(text,text,integer),public.get_schedule_scenario_quality_breakdown_v1(uuid),public.get_schedule_scenario_advanced_hard_issues_v1(uuid) to authenticated;
grant execute on function public.apply_schedule_optimization_profile_v1(text),public.materialize_workshop_block_rule_v1(uuid),public.refresh_schedule_scenario_explanation_v1(uuid) to authenticated;
revoke all on function public.get_schedule_scenario_hard_issues_v2(uuid) from public;
grant execute on function public.get_schedule_scenario_hard_issues_v2(uuid) to authenticated;