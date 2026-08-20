-- Phase 2 foundation: timetable optimization/rule configuration must be institution-local.
-- The 202608201800 tenant retrofit added institution_code + RLS, but legacy single-school
-- primary/unique keys could still make settings global. This migration repairs those keys
-- without rewriting applied history.

-- System optimization profiles are immutable/shared presets, like course_catalog.
insert into public.tenant_scope_registry(table_name,scope,note)
values('schedule_optimization_profiles','global','Shared system timetable optimization presets')
on conflict(table_name) do update set scope='global',note=excluded.note,updated_at=now();
drop policy if exists tenant_boundary_schedule_optimization_profiles on public.schedule_optimization_profiles;
drop trigger if exists trg_tenant_guard_schedule_optimization_profiles on public.schedule_optimization_profiles;

-- Generic helper: replace a legacy PK with a tenant composite PK when needed.
create or replace function public.ensure_tenant_composite_pk_v1(p_table text,p_columns text[])
returns void language plpgsql security definer set search_path=public as $$
declare v_pk text;v_existing text[];v_sql text;
begin
  select c.conname,
    (select array_agg(a.attname order by x.ord)
     from unnest(c.conkey) with ordinality x(attnum,ord)
     join pg_attribute a on a.attrelid=t.oid and a.attnum=x.attnum)
  into v_pk,v_existing
  from pg_constraint c join pg_class t on t.oid=c.conrelid join pg_namespace n on n.oid=t.relnamespace
  where n.nspname='public' and t.relname=p_table and c.contype='p' limit 1;
  if v_existing=p_columns then return; end if;
  if v_pk is not null then execute format('alter table public.%I drop constraint %I',p_table,v_pk); end if;
  v_sql:='alter table public.'||quote_ident(p_table)||' add primary key('||
    array_to_string(array(select quote_ident(x) from unnest(p_columns) x),',')||')';
  execute v_sql;
end $$;
revoke all on function public.ensure_tenant_composite_pk_v1(text,text[]) from public;

-- Singleton settings are singleton PER institution.
alter table public.schedule_generation_settings alter column institution_code set not null;
alter table public.schedule_optimization_settings alter column institution_code set not null;
alter table public.schedule_rule_modes alter column institution_code set not null;
alter table public.course_pedagogy_profiles alter column institution_code set not null;
alter table public.schedule_workshop_policies alter column institution_code set not null;
alter table public.schedule_duty_optimization alter column institution_code set not null;
alter table public.schedule_rule_overrides alter column institution_code set not null;

select public.ensure_tenant_composite_pk_v1('schedule_generation_settings',array['institution_code','id']);
select public.ensure_tenant_composite_pk_v1('schedule_optimization_settings',array['institution_code','id']);
select public.ensure_tenant_composite_pk_v1('schedule_rule_modes',array['institution_code','rule_code']);
select public.ensure_tenant_composite_pk_v1('course_pedagogy_profiles',array['institution_code','course_id']);
select public.ensure_tenant_composite_pk_v1('schedule_workshop_policies',array['institution_code','course_id']);
select public.ensure_tenant_composite_pk_v1('schedule_duty_optimization',array['institution_code','teacher_id','weekday']);

-- Global course/classroom business keys from the original single-school schema become tenant-local.
select public.drop_unique_constraint_by_columns('course_schedule_rules',array['course_id']);
select public.drop_unique_constraint_by_columns('classrooms',array['name']);
select public.drop_unique_constraint_by_columns('lesson_room_rules',array['subject_pattern']);

do $$ declare r record;
begin
  for r in
    select i.indexrelid::regclass::text index_name
    from pg_index i
    join pg_class t on t.oid=i.indrelid join pg_namespace n on n.oid=t.relnamespace
    where n.nspname='public' and t.relname='course_schedule_rules' and i.indisunique and not i.indisprimary
      and (select array_agg(a.attname order by x.ord)
           from unnest(i.indkey) with ordinality x(attnum,ord)
           join pg_attribute a on a.attrelid=t.oid and a.attnum=x.attnum where x.attnum>0)=array['course_id']::text[]
  loop execute 'drop index if exists '||r.index_name; end loop;
end $$;

create unique index if not exists uq_course_schedule_rules_tenant_course
  on public.course_schedule_rules(institution_code,course_id);
create unique index if not exists uq_classrooms_tenant_name
  on public.classrooms(institution_code,name);
create unique index if not exists uq_lesson_room_rules_tenant_subject
  on public.lesson_room_rules(institution_code,subject_pattern);

drop index if exists public.uq_schedule_rule_override_requirement;
drop index if exists public.uq_schedule_rule_override_assignment;
create unique index if not exists uq_schedule_rule_override_tenant_requirement
  on public.schedule_rule_overrides(institution_code,class_course_requirement_id)
  where class_course_requirement_id is not null;
create unique index if not exists uq_schedule_rule_override_tenant_assignment
  on public.schedule_rule_overrides(institution_code,teacher_assignment_id)
  where teacher_assignment_id is not null;

-- Seed one generation/settings row and one rule-mode catalog per institution.
insert into public.schedule_generation_settings(
  institution_code,id,teaching_days,periods_per_day,max_same_course_per_day,gap_penalty,late_period_penalty,repeated_course_penalty,updated_at
)
select i.institution_code,true,array[1,2,3,4,5]::smallint[],8,2,8,2,12,now()
from public.institutions i
on conflict(institution_code,id) do nothing;

insert into public.schedule_optimization_settings(institution_code,id,active_profile_key,explain_scenarios,record_repairs,updated_at)
select i.institution_code,true,'balanced',true,true,now() from public.institutions i
on conflict(institution_code,id) do nothing;

insert into public.schedule_rule_modes(institution_code,rule_code,label,category,mode,weight,config,system_rule,updated_at)
select i.institution_code,v.rule_code,v.label,v.category,v.mode,v.weight,v.config,true,now()
from public.institutions i cross join (values
 ('teacher_class_consecutive','Aynı öğretmen-sınıf ardışık ders sınırı','hard','hard',0,'{"max":3,"high_hour_threshold":9,"max_triple_blocks_per_day":1,"workshop_exempt":true}'::jsonb),
 ('same_course_repeat_day','Aynı dersin aynı gün ayrı bloklarda tekrarı','pedagogy','soft',20,'{"allow_official_block":true}'::jsonb),
 ('duty_light_day','Nöbet gününde hafif program','duty','soft',20,'{"default_max_hours":5}'::jsonb),
 ('duty_adjacent_lesson','Nöbet saatine bitişik ders','duty','soft',15,'{}'::jsonb),
 ('heavy_course_consecutive','Zor derslerin arka arkaya yığılması','pedagogy','soft',22,'{"difficulty_threshold":4}'::jsonb),
 ('pedagogic_daily_balance','Günlük pedagojik yük dengesi','pedagogy','soft',15,'{}'::jsonb),
 ('workshop_min_block','Atölye dersinde küçük blok','workshop','soft',30,'{"default_min_block":3}'::jsonb),
 ('workshop_large_block','Atölye büyük blok tercihi','workshop','soft',-10,'{}'::jsonb),
 ('physical_education_edge_slots','Beden Eğitimi: Pazartesi 1. ders + Cuma son ders','placement','hard',0,'{"monday_first":true,"friday_last":true,"subject":"beden"}'::jsonb),
 ('music_edge_slots','Müzik: Pazartesi 1. ders + Cuma son ders','placement','hard',0,'{"monday_first":true,"friday_last":true,"subject":"muzik"}'::jsonb)
) as v(rule_code,label,category,mode,weight,config)
on conflict(institution_code,rule_code) do nothing;

-- Future institutions receive timetable settings without a follow-up migration.
create or replace function public.seed_timetable_defaults_for_tenant_v1(p_code text)
returns void language plpgsql security definer set search_path=public as $$
begin
  insert into public.schedule_generation_settings(institution_code,id) values(p_code,true)
  on conflict(institution_code,id) do nothing;
  insert into public.schedule_optimization_settings(institution_code,id) values(p_code,true)
  on conflict(institution_code,id) do nothing;
  insert into public.schedule_rule_modes(institution_code,rule_code,label,category,mode,weight,config,system_rule)
  select p_code,v.rule_code,v.label,v.category,v.mode,v.weight,v.config,true from (values
   ('teacher_class_consecutive','Aynı öğretmen-sınıf ardışık ders sınırı','hard','hard',0,'{"max":3,"high_hour_threshold":9,"max_triple_blocks_per_day":1,"workshop_exempt":true}'::jsonb),
   ('same_course_repeat_day','Aynı dersin aynı gün ayrı bloklarda tekrarı','pedagogy','soft',20,'{"allow_official_block":true}'::jsonb),
   ('duty_light_day','Nöbet gününde hafif program','duty','soft',20,'{"default_max_hours":5}'::jsonb),
   ('duty_adjacent_lesson','Nöbet saatine bitişik ders','duty','soft',15,'{}'::jsonb),
   ('heavy_course_consecutive','Zor derslerin arka arkaya yığılması','pedagogy','soft',22,'{"difficulty_threshold":4}'::jsonb),
   ('pedagogic_daily_balance','Günlük pedagojik yük dengesi','pedagogy','soft',15,'{}'::jsonb),
   ('workshop_min_block','Atölye dersinde küçük blok','workshop','soft',30,'{"default_min_block":3}'::jsonb),
   ('workshop_large_block','Atölye büyük blok tercihi','workshop','soft',-10,'{}'::jsonb),
   ('physical_education_edge_slots','Beden Eğitimi: Pazartesi 1. ders + Cuma son ders','placement','hard',0,'{"monday_first":true,"friday_last":true,"subject":"beden"}'::jsonb),
   ('music_edge_slots','Müzik: Pazartesi 1. ders + Cuma son ders','placement','hard',0,'{"monday_first":true,"friday_last":true,"subject":"muzik"}'::jsonb)
  ) as v(rule_code,label,category,mode,weight,config)
  on conflict(institution_code,rule_code) do nothing;
end $$;
revoke all on function public.seed_timetable_defaults_for_tenant_v1(text) from public;

create or replace function public.seed_timetable_defaults_after_institution_v1()
returns trigger language plpgsql security definer set search_path=public as $$
begin perform public.seed_timetable_defaults_for_tenant_v1(new.institution_code);return new;end $$;
drop trigger if exists trg_seed_timetable_defaults_after_institution on public.institutions;
create trigger trg_seed_timetable_defaults_after_institution
after insert on public.institutions for each row execute function public.seed_timetable_defaults_after_institution_v1();

-- Tenant-aware authoritative rule lookup used by repair/validation/optimizer wrappers.
create or replace function public.schedule_rule_mode_v1(p_rule_code text)
returns text language sql stable security definer set search_path=public as $$
  select coalesce((select mode from public.schedule_rule_modes
    where institution_code=public.current_tenant_code() and rule_code=p_rule_code),'off');
$$;

create or replace function public.schedule_rule_weight_v1(p_rule_code text,p_profile_weight_key text,p_default integer)
returns integer language sql stable security definer set search_path=public as $$
  select coalesce(
    (select weight from public.schedule_rule_modes where institution_code=public.current_tenant_code() and rule_code=p_rule_code and weight<>0),
    (select (p.weights->>p_profile_weight_key)::integer
       from public.schedule_optimization_settings s
       join public.schedule_optimization_profiles p on p.profile_key=s.active_profile_key
       where s.institution_code=public.current_tenant_code() and s.id=true),
    p_default
  );
$$;

create or replace function public.apply_schedule_optimization_profile_v1(p_profile_key text)
returns void language plpgsql security definer set search_path=public as $$
declare w jsonb;v_tenant text:=public.current_tenant_code();
begin
  if not public.has_permission('schedule.rules') then raise exception 'PERMISSION_DENIED: schedule.rules';end if;
  if v_tenant is null then raise exception 'TENANT_CONTEXT_REQUIRED';end if;
  select weights into w from public.schedule_optimization_profiles where profile_key=p_profile_key and active=true;
  if w is null then raise exception 'OPTIMIZATION_PROFILE_NOT_FOUND';end if;
  update public.schedule_optimization_settings set active_profile_key=p_profile_key,updated_by=auth.uid(),updated_at=now()
    where institution_code=v_tenant and id=true;
  update public.schedule_generation_settings set
    gap_penalty=coalesce((w->>'teacher_gap')::integer,gap_penalty),
    late_period_penalty=coalesce((w->>'late_period')::integer,late_period_penalty),
    repeated_course_penalty=coalesce((w->>'same_course_repeat')::integer,repeated_course_penalty),updated_at=now()
    where institution_code=v_tenant and id=true;
end $$;
revoke all on function public.apply_schedule_optimization_profile_v1(text) from public;
grant execute on function public.apply_schedule_optimization_profile_v1(text) to authenticated;

-- Time-profile changes update only the caller institution's solver settings.
create or replace function public.sync_active_time_profile_to_solver_settings()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.active=true then
    update public.schedule_generation_settings
    set teaching_days=new.teaching_days,periods_per_day=new.periods_per_day,updated_at=now()
    where institution_code=new.institution_code and id=true;
  end if;
  return new;
end $$;

-- Workshop policy writes are per tenant and preserve per-tenant course rules.
create or replace function public.materialize_workshop_block_rule_v1(p_course_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare p public.schedule_workshop_policies%rowtype;existing public.course_schedule_rules%rowtype;v_tenant text:=public.current_tenant_code();
begin
  select * into p from public.schedule_workshop_policies where institution_code=v_tenant and course_id=p_course_id and active=true;
  if not found then return;end if;
  select * into existing from public.course_schedule_rules where institution_code=v_tenant and course_id=p_course_id;
  if found and cardinality(existing.block_pattern)>0 then return;end if;
  insert into public.course_schedule_rules(institution_code,course_id,block_pattern,active,updated_at)
  values(v_tenant,p_course_id,array[p.preferred_block,p.preferred_block]::smallint[],true,now())
  on conflict(institution_code,course_id) do update set
    block_pattern=case when cardinality(public.course_schedule_rules.block_pattern)=0 then excluded.block_pattern else public.course_schedule_rules.block_pattern end,
    active=true,updated_at=now();
end $$;

create or replace function public.schedule_workshop_policy_sync_trigger_v1()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  perform public.materialize_workshop_block_rule_v1(new.course_id);
  insert into public.course_pedagogy_profiles(institution_code,course_id,is_workshop,is_vocational_practice,practical_load,physical_load)
  values(new.institution_code,new.course_id,true,true,5,3)
  on conflict(institution_code,course_id) do update set is_workshop=true,is_vocational_practice=true,updated_at=now();
  return new;
end $$;

-- Scoped inheritance is tenant-explicit even inside SECURITY DEFINER execution.
create or replace function public.get_effective_schedule_rule_v2(p_requirement_id uuid,p_teacher_assignment_id uuid default null)
returns public.course_schedule_rules language plpgsql stable security definer set search_path=public as $$
declare v_tenant text:=public.current_tenant_code();v_course uuid;v_override public.schedule_rule_overrides%rowtype;v_base public.course_schedule_rules%rowtype;v_result public.course_schedule_rules%rowtype;v_found boolean:=false;
begin
  if v_tenant is null then return null;end if;
  select course_id into v_course from public.class_course_requirements where id=p_requirement_id and institution_code=v_tenant;
  if v_course is null then return null;end if;
  if p_teacher_assignment_id is not null then
    select * into v_override from public.schedule_rule_overrides where institution_code=v_tenant and teacher_assignment_id=p_teacher_assignment_id and active=true limit 1;v_found:=found;
  end if;
  if not v_found then
    select * into v_override from public.schedule_rule_overrides where institution_code=v_tenant and class_course_requirement_id=p_requirement_id and active=true limit 1;v_found:=found;
  end if;
  if v_found then
    v_result.id:=v_override.id;v_result.course_id:=v_course;v_result.block_pattern:=v_override.block_pattern;v_result.max_per_day:=v_override.max_per_day;
    v_result.min_distinct_days:=v_override.min_distinct_days;v_result.preferred_days:=v_override.preferred_days;v_result.prohibited_days:=v_override.prohibited_days;
    v_result.preferred_periods:=v_override.preferred_periods;v_result.prohibited_periods:=v_override.prohibited_periods;v_result.avoid_last_period:=v_override.avoid_last_period;
    v_result.note:=v_override.note;v_result.active:=v_override.active;v_result.updated_at:=v_override.updated_at;v_result.institution_code:=v_tenant;return v_result;
  end if;
  select * into v_base from public.course_schedule_rules where institution_code=v_tenant and course_id=v_course and active=true limit 1;return v_base;
end $$;
revoke all on function public.get_effective_schedule_rule_v2(uuid,uuid) from public;
grant execute on function public.get_effective_schedule_rule_v2(uuid,uuid) to authenticated;
