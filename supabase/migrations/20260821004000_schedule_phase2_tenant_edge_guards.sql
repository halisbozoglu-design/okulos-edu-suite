-- Phase 2 follow-up: close tenant-sensitive rule lookups that pre-date tenantization.

-- PostgREST conflict targets used by rule UI. Teacher UUIDs are globally unique, but
-- composite indexes make tenant ownership explicit and let client upserts use one standard.
create unique index if not exists uq_teacher_constraints_tenant_teacher
  on public.teacher_schedule_constraints(institution_code,teacher_id);
create unique index if not exists uq_teacher_unavailability_tenant_slot
  on public.teacher_unavailability(institution_code,teacher_id,weekday,period);
create unique index if not exists uq_teacher_preferences_tenant_slot_kind
  on public.teacher_schedule_preferences(institution_code,teacher_id,weekday,period,preference);

-- The original edge-slot validators were SECURITY DEFINER and queried rule/time tables
-- without an institution predicate. Make all lookups explicitly tenant-local.
create or replace function public.get_schedule_scenario_edge_slot_issues_v1(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language plpgsql stable security definer set search_path=public as $$
declare
 v_tenant text:=public.current_tenant_code();
 v_last_period integer;
 v_rule record;
 v_monday_ok boolean;
 v_friday_ok boolean;
 v_missing integer;
begin
 if v_tenant is null then raise exception 'TENANT_CONTEXT_REQUIRED';end if;
 if not exists(select 1 from public.schedule_scenarios s where s.id=p_scenario_id and s.institution_code=v_tenant) then
   raise exception 'SCENARIO_NOT_FOUND';
 end if;
 select periods_per_day into v_last_period
 from public.schedule_time_profiles
 where institution_code=v_tenant and active=true
 order by updated_at desc limit 1;
 if v_last_period is null then
   select max(r.period) into v_last_period from public.schedule_scenario_rows r
   where r.institution_code=v_tenant and r.scenario_id=p_scenario_id and r.weekday=5;
 end if;
 if v_last_period is null then v_last_period:=8;end if;

 for v_rule in
   select rule_code,label from public.schedule_rule_modes
   where institution_code=v_tenant
     and rule_code in('physical_education_edge_slots','music_edge_slots')
     and mode='hard'
 loop
   select exists(select 1 from public.schedule_scenario_rows r
     where r.institution_code=v_tenant and r.scenario_id=p_scenario_id and r.weekday=1 and r.period=1
       and public.schedule_subject_matches_edge_rule_v1(r.subject,v_rule.rule_code)) into v_monday_ok;
   select exists(select 1 from public.schedule_scenario_rows r
     where r.institution_code=v_tenant and r.scenario_id=p_scenario_id and r.weekday=5 and r.period=v_last_period
       and public.schedule_subject_matches_edge_rule_v1(r.subject,v_rule.rule_code)) into v_friday_ok;
   v_missing:=(case when v_monday_ok then 0 else 1 end)+(case when v_friday_ok then 0 else 1 end);
   if v_missing>0 then
     code:=upper(v_rule.rule_code);affected_count:=v_missing;
     detail:=v_rule.label||' şartı sağlanmıyor. Eksik hedef: '||
       case when not v_monday_ok and not v_friday_ok then 'Pazartesi 1. ders ve Cuma son ders'
            when not v_monday_ok then 'Pazartesi 1. ders' else 'Cuma son ders' end||'.';
     return next;
   end if;
 end loop;
end $$;

create or replace function public.get_schedule_edge_slot_integrity_issues_v1()
returns table(severity text,code text,affected_count integer,detail text)
language plpgsql stable security definer set search_path=public as $$
declare
 v_tenant text:=public.current_tenant_code();
 v_last_period integer;
 v_rule record;
 v_monday_ok boolean;
 v_friday_ok boolean;
 v_missing integer;
begin
 if v_tenant is null then raise exception 'TENANT_CONTEXT_REQUIRED';end if;
 select periods_per_day into v_last_period from public.schedule_time_profiles
 where institution_code=v_tenant and active=true order by updated_at desc limit 1;
 if v_last_period is null then select max(period) into v_last_period from public.teacher_schedule where institution_code=v_tenant and weekday=5 and active=true;end if;
 if v_last_period is null then v_last_period:=8;end if;

 for v_rule in select rule_code,label from public.schedule_rule_modes
   where institution_code=v_tenant and rule_code in('physical_education_edge_slots','music_edge_slots') and mode='hard'
 loop
   select exists(select 1 from public.teacher_schedule r
     where r.institution_code=v_tenant and r.active=true and r.weekday=1 and r.period=1
       and public.schedule_subject_matches_edge_rule_v1(r.subject,v_rule.rule_code)) into v_monday_ok;
   select exists(select 1 from public.teacher_schedule r
     where r.institution_code=v_tenant and r.active=true and r.weekday=5 and r.period=v_last_period
       and public.schedule_subject_matches_edge_rule_v1(r.subject,v_rule.rule_code)) into v_friday_ok;
   v_missing:=(case when v_monday_ok then 0 else 1 end)+(case when v_friday_ok then 0 else 1 end);
   if v_missing>0 then severity:='error';code:=upper(v_rule.rule_code);affected_count:=v_missing;detail:=v_rule.label||' yayın koşulu sağlanmıyor.';return next;end if;
 end loop;
end $$;

-- Tenant-safe active time-profile reader; older implementation relied on broad RLS.
create or replace function public.get_active_schedule_time_profile()
returns public.schedule_time_profiles
language sql stable security definer set search_path=public as $$
  select p from public.schedule_time_profiles p
  where p.institution_code=public.current_tenant_code() and p.active=true
  order by p.updated_at desc limit 1;
$$;
revoke all on function public.get_active_schedule_time_profile() from public;
grant execute on function public.get_active_schedule_time_profile() to authenticated;

-- Keep the active time profile unique per institution, not globally.
drop index if exists public.uq_schedule_time_profile_one_active;
drop index if exists public.uq_schedule_time_profiles_one_active;
create unique index if not exists uq_schedule_time_profile_active_per_tenant
  on public.schedule_time_profiles(institution_code) where active=true;
