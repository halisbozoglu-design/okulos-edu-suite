\set ON_ERROR_STOP on
begin;

-- Minimal authenticated identities for real RLS evaluation.
insert into auth.users(id,aud,role,email,created_at,updated_at)
values
 ('11111111-1111-4111-8111-111111111111','authenticated','authenticated','phase4-a@example.test',now(),now()),
 ('22222222-2222-4222-8222-222222222222','authenticated','authenticated','phase4-b@example.test',now(),now());

insert into public.institutions(institution_code,school_name,created_by)
values
 ('990001','Phase 4 Tenant A','11111111-1111-4111-8111-111111111111'),
 ('990002','Phase 4 Tenant B','22222222-2222-4222-8222-222222222222');

insert into public.institution_memberships(institution_code,user_id,membership_role,is_owner,active)
values
 ('990001','11111111-1111-4111-8111-111111111111','principal',true,true),
 ('990002','22222222-2222-4222-8222-222222222222','principal',true,true);

set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select set_config('request.jwt.claim.role','authenticated',true);

do $$
declare n integer;
begin
  if public.current_tenant_code() is distinct from '990001' then raise exception 'tenant context resolution failed'; end if;
  if not public.tenant_row_allowed('990001') then raise exception 'own tenant unexpectedly denied'; end if;
  if public.tenant_row_allowed('990002') then raise exception 'cross-tenant core fence failed'; end if;

  select count(*) into n from public.institutions;
  if n<>1 then raise exception 'institutions RLS leak: visible rows=%',n; end if;
  if not exists(select 1 from public.institutions where institution_code='990001') then raise exception 'own institution hidden'; end if;
  if exists(select 1 from public.institutions where institution_code='990002') then raise exception 'foreign institution visible'; end if;

  select count(*) into n from public.institution_memberships;
  if n<>1 then raise exception 'membership RLS leak: visible rows=%',n; end if;
  if exists(select 1 from public.institution_memberships where institution_code='990002') then raise exception 'foreign membership visible'; end if;
end $$;

reset role;
rollback;
select 'phase4_tenant_isolation_ok' as result;
