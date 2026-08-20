-- Beden Eğitimi ve Müzik için okul genelinde zorunlu kenar-saat politikası.
-- Default: AÇIK / HARD. Kullanıcı schedule.rules yetkisiyle ayrı ayrı kapatabilir.

insert into public.schedule_rule_modes(rule_code,label,category,mode,weight,config,system_rule,updated_at)
values
 ('physical_education_edge_slots','Beden Eğitimi: Pazartesi 1. ders + Cuma son ders','placement','hard',0,'{"monday_first":true,"friday_last":true,"subject":"beden"}'::jsonb,true,now()),
 ('music_edge_slots','Müzik: Pazartesi 1. ders + Cuma son ders','placement','hard',0,'{"monday_first":true,"friday_last":true,"subject":"muzik"}'::jsonb,true,now())
on conflict(rule_code) do update set
 label=excluded.label,
 category=excluded.category,
 config=excluded.config,
 system_rule=true,
 updated_at=now();

create or replace function public.schedule_subject_matches_edge_rule_v1(p_subject text,p_rule_code text)
returns boolean
language sql immutable as $$
 select case p_rule_code
   when 'physical_education_edge_slots' then lower(coalesce(p_subject,'')) like '%beden%'
   when 'music_edge_slots' then lower(translate(coalesce(p_subject,''),'ÜİŞĞÇÖüışğçö','UISGCOuisgco')) like '%muzik%'
   else false
 end;
$$;

create or replace function public.get_schedule_scenario_edge_slot_issues_v1(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language plpgsql stable security definer set search_path=public as $$
declare
 v_last_period integer;
 v_rule record;
 v_monday_ok boolean;
 v_friday_ok boolean;
 v_missing integer;
begin
 select periods_per_day into v_last_period
 from public.schedule_time_profiles
 where active=true
 order by updated_at desc
 limit 1;
 if v_last_period is null then
   select max(period) into v_last_period from public.schedule_scenario_rows where scenario_id=p_scenario_id and weekday=5;
 end if;
 if v_last_period is null then v_last_period:=8; end if;

 for v_rule in
   select rule_code,label from public.schedule_rule_modes
   where rule_code in('physical_education_edge_slots','music_edge_slots') and mode='hard'
 loop
   select exists(
     select 1 from public.schedule_scenario_rows r
     where r.scenario_id=p_scenario_id and r.weekday=1 and r.period=1
       and public.schedule_subject_matches_edge_rule_v1(r.subject,v_rule.rule_code)
   ) into v_monday_ok;
   select exists(
     select 1 from public.schedule_scenario_rows r
     where r.scenario_id=p_scenario_id and r.weekday=5 and r.period=v_last_period
       and public.schedule_subject_matches_edge_rule_v1(r.subject,v_rule.rule_code)
   ) into v_friday_ok;
   v_missing:=(case when v_monday_ok then 0 else 1 end)+(case when v_friday_ok then 0 else 1 end);
   if v_missing>0 then
     code:=upper(v_rule.rule_code);
     affected_count:=v_missing;
     detail:=v_rule.label||' şartı sağlanmıyor. Eksik hedef: '
       ||case when not v_monday_ok and not v_friday_ok then 'Pazartesi 1. ders ve Cuma son ders'
               when not v_monday_ok then 'Pazartesi 1. ders'
               else 'Cuma son ders' end
       ||'. Öğretmen/sınıf/derslik veya başka HARD kuralla çakışıyorsa çözüm üretim ekranında açıkça raporlanmalıdır.';
     return next;
   end if;
 end loop;
end;$$;

alter function public.get_schedule_scenario_hard_issues_v2(uuid)
rename to get_schedule_scenario_hard_issues_pre_edge_v2;

create or replace function public.get_schedule_scenario_hard_issues_v2(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
 select * from public.get_schedule_scenario_hard_issues_pre_edge_v2(p_scenario_id)
 union all
 select * from public.get_schedule_scenario_edge_slot_issues_v1(p_scenario_id);
$$;

create or replace function public.get_schedule_edge_slot_integrity_issues_v1()
returns table(severity text,code text,affected_count integer,detail text)
language plpgsql stable security definer set search_path=public as $$
declare
 v_last_period integer;
 v_rule record;
 v_monday_ok boolean;
 v_friday_ok boolean;
 v_missing integer;
begin
 select periods_per_day into v_last_period from public.schedule_time_profiles where active=true order by updated_at desc limit 1;
 if v_last_period is null then select max(period) into v_last_period from public.teacher_schedule where weekday=5; end if;
 if v_last_period is null then v_last_period:=8; end if;

 for v_rule in select rule_code,label from public.schedule_rule_modes where rule_code in('physical_education_edge_slots','music_edge_slots') and mode='hard'
 loop
   select exists(select 1 from public.teacher_schedule r where r.weekday=1 and r.period=1 and public.schedule_subject_matches_edge_rule_v1(r.subject,v_rule.rule_code)) into v_monday_ok;
   select exists(select 1 from public.teacher_schedule r where r.weekday=5 and r.period=v_last_period and public.schedule_subject_matches_edge_rule_v1(r.subject,v_rule.rule_code)) into v_friday_ok;
   v_missing:=(case when v_monday_ok then 0 else 1 end)+(case when v_friday_ok then 0 else 1 end);
   if v_missing>0 then
     severity:='error'; code:=upper(v_rule.rule_code); affected_count:=v_missing;
     detail:=v_rule.label||' yayın koşulu sağlanmıyor.'; return next;
   end if;
 end loop;
end;$$;

alter function public.get_schedule_integrity_report()
rename to get_schedule_integrity_report_pre_edge_v1;

create or replace function public.get_schedule_integrity_report()
returns table(severity text,code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
 select * from public.get_schedule_integrity_report_pre_edge_v1()
 union all
 select * from public.get_schedule_edge_slot_integrity_issues_v1();
$$;

revoke all on function public.schedule_subject_matches_edge_rule_v1(text,text) from public;
revoke all on function public.get_schedule_scenario_edge_slot_issues_v1(uuid) from public;
revoke all on function public.get_schedule_edge_slot_integrity_issues_v1() from public;
grant execute on function public.get_schedule_scenario_edge_slot_issues_v1(uuid) to authenticated;
grant execute on function public.get_schedule_edge_slot_integrity_issues_v1() to authenticated;
