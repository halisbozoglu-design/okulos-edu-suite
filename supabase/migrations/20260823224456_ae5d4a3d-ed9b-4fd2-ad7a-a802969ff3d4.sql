-- 1) RLS for reference/config tables
alter table public.metropolitan_provinces enable row level security;
alter table public.official_vocational_fields enable row level security;
alter table public.official_vocational_branches enable row level security;
alter table public.vocational_program_schedule_policies enable row level security;
alter table public.tenant_scope_registry enable row level security;

grant select on public.metropolitan_provinces to authenticated;
grant select on public.official_vocational_fields to authenticated;
grant select on public.official_vocational_branches to authenticated;
grant select on public.vocational_program_schedule_policies to authenticated;
grant select on public.tenant_scope_registry to authenticated;
grant all on public.metropolitan_provinces to service_role;
grant all on public.official_vocational_fields to service_role;
grant all on public.official_vocational_branches to service_role;
grant all on public.vocational_program_schedule_policies to service_role;
grant all on public.tenant_scope_registry to service_role;

do $$
declare t text;
begin
  foreach t in array array['metropolitan_provinces','official_vocational_fields','official_vocational_branches','vocational_program_schedule_policies'] loop
    execute format('drop policy if exists %I on public.%I', t||'_read', t);
    execute format('drop policy if exists %I on public.%I', t||'_manage', t);
    execute format('create policy %I on public.%I for select to authenticated using (true)', t||'_read', t);
    execute format($f$create policy %I on public.%I for all to authenticated using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'))$f$, t||'_manage', t);
  end loop;
end $$;

drop policy if exists tenant_scope_registry_read on public.tenant_scope_registry;
drop policy if exists tenant_scope_registry_manage on public.tenant_scope_registry;
create policy tenant_scope_registry_read on public.tenant_scope_registry
for select to authenticated using (public.has_permission('settings.manage'));
create policy tenant_scope_registry_manage on public.tenant_scope_registry
for all to authenticated
using (public.has_permission('settings.manage'))
with check (public.has_permission('settings.manage'));

-- 2) View must run with caller privileges
alter view public.official_course_schedule_effective set (security_invoker = true);

-- 3) Legislation storage reads limited to files owned by the caller institution
drop policy if exists legislation_storage_read on storage.objects;
create policy legislation_storage_read on storage.objects
for select to authenticated
using (
  bucket_id = 'legislation'
  and (
    owner = auth.uid()
    or exists (
      select 1 from public.legislation_library l
      where l.institution_code = public.current_tenant_code()
        and l.file_url is not null
        and l.file_url like '%' || storage.objects.name
    )
    or exists (
      select 1 from public.legislation_shares s
      join public.legislation_library l2 on l2.id = s.legislation_id
      where s.user_id = auth.uid()
        and l2.file_url is not null
        and l2.file_url like '%' || storage.objects.name
    )
  )
);

-- 4) Pin search_path on remaining helper functions
alter function public.normalize_class_key(text,text) set search_path = public;
alter function public.schedule_subject_matches_edge_rule_v1(text,text) set search_path = public;
alter function public.infer_school_type_for_class_v1(smallint,text,text) set search_path = public;
alter function public.vocational_suggest_group_count(smallint,integer,integer) set search_path = public;
alter function public.validate_vocational_lead_assignment() set search_path = public;
alter function public.vocational_coordination_weekly_cap(text,boolean) set search_path = public;
alter function public.vocational_enterprise_days_from_hours(integer) set search_path = public;
alter function public.vocational_coordination_program_applicable(text,smallint,boolean,boolean) set search_path = public;
alter function public.workshop_block_patterns(smallint,smallint) set search_path = public;
alter function public.is_metropolitan_province(text) set search_path = public;