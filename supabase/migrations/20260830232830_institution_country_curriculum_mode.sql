-- Institution curriculum source is deliberately independent from the solver.
-- Türkiye starts with the verified MEB catalog; every other country starts in
-- fully manual mode until a country-specific adapter is formally released.
alter table public.institutions
  add column if not exists country_code text not null default 'TR'
    check (country_code ~ '^[A-Z]{2}$'),
  add column if not exists curriculum_source_mode text not null default 'OFFICIAL_CATALOG'
    check (curriculum_source_mode in ('OFFICIAL_CATALOG','IMPORT','MANUAL'));

update public.institutions
set country_code = 'TR', curriculum_source_mode = 'OFFICIAL_CATALOG'
where country_code is null or curriculum_source_mode is null;

drop function if exists public.super_admin_list_tenants();
create function public.super_admin_list_tenants()
returns table(institution_code text,school_name text,approval_status text,approval_note text,reviewed_at timestamptz,principal_name text,principal_email text,principal_phone text,country_code text,curriculum_source_mode text)
language sql stable security definer set search_path=public as $$
 select i.institution_code,i.school_name,i.approval_status,i.approval_note,i.reviewed_at,
        p.full_name,p.email,p.phone,i.country_code,i.curriculum_source_mode
 from public.institutions i
 left join public.institution_memberships m on m.institution_code=i.institution_code and m.active and m.membership_role='principal' and m.is_owner
 left join public.profiles p on p.user_id=m.user_id
 where public.is_super_admin()
 order by case i.approval_status when 'pending' then 0 when 'approved' then 1 else 2 end,i.created_at desc;
$$;
revoke all on function public.super_admin_list_tenants() from public, anon;
grant execute on function public.super_admin_list_tenants() to authenticated, service_role;

create or replace function public.super_admin_set_institution_curriculum_profile(
  p_institution_code text,
  p_country_code text,
  p_curriculum_source_mode text default 'MANUAL'
) returns void
language plpgsql security definer set search_path=public as $$
declare
  v_country text := upper(trim(coalesce(p_country_code,'')));
  v_mode text := upper(trim(coalesce(p_curriculum_source_mode,'')));
begin
  if not public.is_super_admin() then raise exception 'SUPER_ADMIN_REQUIRED'; end if;
  if v_country !~ '^[A-Z]{2}$' then raise exception 'COUNTRY_CODE_INVALID'; end if;
  if v_mode not in ('OFFICIAL_CATALOG','IMPORT','MANUAL') then raise exception 'CURRICULUM_SOURCE_MODE_INVALID'; end if;

  -- No non-Türkiye institution may accidentally receive MEB curriculum data.
  if v_country <> 'TR' then v_mode := 'MANUAL'; end if;

  update public.institutions
  set country_code=v_country, curriculum_source_mode=v_mode, updated_at=now()
  where institution_code=p_institution_code;
  if not found then raise exception 'INSTITUTION_NOT_FOUND'; end if;
end;
$$;
revoke all on function public.super_admin_set_institution_curriculum_profile(text,text,text) from public, anon;
grant execute on function public.super_admin_set_institution_curriculum_profile(text,text,text) to authenticated, service_role;
