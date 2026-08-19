-- Workshop/vocational lessons are exempt from normal teacher-class consecutive limits.
-- Seed conservative pedagogic defaults for common course families; schools can override them.

create or replace function public.seed_course_pedagogy_defaults_v1()
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  if not public.has_permission('schedule.rules') then raise exception 'PERMISSION_DENIED: schedule.rules';end if;
  insert into public.course_pedagogy_profiles(course_id,academic_load,physical_load,practical_load,attention_load,difficulty,lesson_family,is_workshop,is_vocational_practice,prefer_early,prefer_weekdays)
  select c.id,
    case when lower(c.name) ~ '(matematik|fizik|kimya|biyoloji|fen|edebiyat|türkçe)' then 5 when lower(c.name) ~ '(beden|müzik|görsel|sanat)' then 2 else 3 end,
    case when lower(c.name) ~ '(beden|spor)' then 5 when lower(c.name) ~ '(atölye|uygulama)' then 3 else 1 end,
    case when lower(c.name) ~ '(atölye|uygulama|laboratuvar|lab)' then 5 else 1 end,
    case when lower(c.name) ~ '(matematik|fizik|kimya|biyoloji|fen|türkçe|edebiyat)' then 5 else 3 end,
    case when lower(c.name) ~ '(matematik|fizik|kimya)' then 5 when lower(c.name) ~ '(biyoloji|fen|türkçe|edebiyat)' then 4 else 3 end,
    case when lower(c.name) ~ '(beden|spor)' then 'spor' when lower(c.name) ~ '(müzik|görsel|sanat)' then 'sanat' when lower(c.name) ~ '(atölye|uygulama)' then 'atölye' when lower(c.name) ~ '(ingilizce|arapça|almanca|fransızca|dil)' then 'dil' when lower(c.name) ~ '(matematik|fizik|kimya|biyoloji|fen)' then 'sayısal' else null end,
    lower(c.name) ~ '(atölye|meslek uygulama|mesleki uygulama)',
    lower(c.name) ~ '(atölye|meslek uygulama|mesleki uygulama)',
    lower(c.name) ~ '(matematik|fizik|kimya|biyoloji|fen)',
    case when lower(c.name) ~ '(beden|müzik)' then array[1,5]::smallint[] else '{}'::smallint[] end
  from public.course_catalog c where c.active=true
  on conflict(course_id) do nothing;
  get diagnostics v_count=row_count;
  return v_count;
end;$$;

-- Run once for courses that have no explicit pedagogy profile yet.
insert into public.course_pedagogy_profiles(course_id,academic_load,physical_load,practical_load,attention_load,difficulty,lesson_family,is_workshop,is_vocational_practice,prefer_early,prefer_weekdays)
select c.id,
  case when lower(c.name) ~ '(matematik|fizik|kimya|biyoloji|fen|edebiyat|türkçe)' then 5 when lower(c.name) ~ '(beden|müzik|görsel|sanat)' then 2 else 3 end,
  case when lower(c.name) ~ '(beden|spor)' then 5 when lower(c.name) ~ '(atölye|uygulama)' then 3 else 1 end,
  case when lower(c.name) ~ '(atölye|uygulama|laboratuvar|lab)' then 5 else 1 end,
  case when lower(c.name) ~ '(matematik|fizik|kimya|biyoloji|fen|türkçe|edebiyat)' then 5 else 3 end,
  case when lower(c.name) ~ '(matematik|fizik|kimya)' then 5 when lower(c.name) ~ '(biyoloji|fen|türkçe|edebiyat)' then 4 else 3 end,
  case when lower(c.name) ~ '(beden|spor)' then 'spor' when lower(c.name) ~ '(müzik|görsel|sanat)' then 'sanat' when lower(c.name) ~ '(atölye|uygulama)' then 'atölye' when lower(c.name) ~ '(ingilizce|arapça|almanca|fransızca|dil)' then 'dil' when lower(c.name) ~ '(matematik|fizik|kimya|biyoloji|fen)' then 'sayısal' else null end,
  lower(c.name) ~ '(atölye|meslek uygulama|mesleki uygulama)',
  lower(c.name) ~ '(atölye|meslek uygulama|mesleki uygulama)',
  lower(c.name) ~ '(matematik|fizik|kimya|biyoloji|fen)',
  case when lower(c.name) ~ '(beden|müzik)' then array[1,5]::smallint[] else '{}'::smallint[] end
from public.course_catalog c where c.active=true
on conflict(course_id) do nothing;

create or replace function public.get_schedule_scenario_advanced_hard_issues_v1(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
normal_rows as (
  select distinct r.teacher_id,r.class_id,r.weekday,r.period
  from public.schedule_scenario_rows r left join public.course_pedagogy_profiles pp on pp.course_id=r.course_id
  where r.scenario_id=p_scenario_id and r.class_id is not null
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

revoke all on function public.seed_course_pedagogy_defaults_v1() from public;
grant execute on function public.seed_course_pedagogy_defaults_v1() to authenticated;
