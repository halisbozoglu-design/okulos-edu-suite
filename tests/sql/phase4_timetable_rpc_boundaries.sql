\set ON_ERROR_STOP on
begin;

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
 ('33333333-3333-4333-8333-333333333333','00000000-0000-0000-0000-000000000000','authenticated','authenticated','phase4-manager@example.test','',now(),'{}','{}',now(),now()),
 ('44444444-4444-4444-8444-444444444444','00000000-0000-0000-0000-000000000000','authenticated','authenticated','phase4-teacher@example.test','',now(),'{}','{}',now(),now());

insert into public.institutions(institution_code,school_name,created_by)
values('990003','Phase 4 RPC Tenant','33333333-3333-4333-8333-333333333333');
insert into public.institution_memberships(institution_code,user_id,membership_role,is_owner,active)
values
 ('990003','33333333-3333-4333-8333-333333333333','principal',true,true),
 ('990003','44444444-4444-4444-8444-444444444444','teacher',false,true);
insert into public.profiles(user_id,email,full_name,role,institution_code)
values
 ('33333333-3333-4333-8333-333333333333','phase4-manager@example.test','Phase 4 Manager','admin','990003'),
 ('44444444-4444-4444-8444-444444444444','phase4-teacher@example.test','Phase 4 Teacher','teacher','990003');

set local role authenticated;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
select set_config('request.jwt.claim.role','authenticated',true);

do $$
begin
  begin perform public.validate_schedule_scenario_v2('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'); raise exception 'validate accepted foreign/missing scenario';
  exception when others then if sqlerrm not like '%SCENARIO_NOT_FOUND_IN_TENANT%' then raise; end if; end;
  begin perform public.apply_schedule_scenario('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'); raise exception 'apply accepted foreign/missing scenario';
  exception when others then if sqlerrm not like '%SCENARIO_NOT_FOUND_IN_TENANT%' then raise; end if; end;
  begin perform public.repair_schedule_scenario_v2('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'); raise exception 'repair accepted foreign/missing scenario';
  exception when others then if sqlerrm not like '%SCENARIO_NOT_FOUND_IN_TENANT%' then raise; end if; end;
  begin perform public.rescore_schedule_scenario_v2('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'); raise exception 'rescore accepted foreign/missing scenario';
  exception when others then if sqlerrm not like '%SCENARIO_NOT_FOUND_IN_TENANT%' then raise; end if; end;
end $$;

-- A plain teacher must not cross the generate/publish permission gateways.
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
do $$
begin
  begin perform public.generate_schedule_scenarios_v2(); raise exception 'teacher generated timetable without delegated permission';
  exception when others then if sqlerrm not like '%PERMISSION_DENIED%' and sqlerrm not like '%NOT_AUTHORIZED%' then raise; end if; end;
  begin perform public.publish_current_schedule(current_date,null,'Phase 4 unauthorized publish',null); raise exception 'teacher published timetable without delegated permission';
  exception when others then if sqlerrm not like '%PERMISSION_DENIED%' and sqlerrm not like '%NOT_AUTHORIZED%' then raise; end if; end;
end $$;

reset role;
rollback;
select 'phase4_timetable_rpc_boundaries_ok' as result;
