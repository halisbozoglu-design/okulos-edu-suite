begin;
create or replace function public.audit_mesem_catalog_completeness_v1()
returns table(issue_type text,field_name text,branch_name text,reason text)
language sql stable set search_path=public as $$
 with f as (select id,field_name from official_vocational_fields where active and institution_type='MESEM'),
 b as (select f.field_name,b.branch_name from f join official_vocational_branches b on b.field_id=f.id and b.active)
 select 'MISSING_FIELD',f.field_name,null::text,'39 alan referansında var, aktif MESEM profili yok' from f where not exists(select 1 from official_curriculum_profiles p where p.active and p.school_type='MESEM' and p.field_name=f.field_name)
 union all
 select 'MISSING_BRANCH',b.field_name,b.branch_name,'193 dal referansında var, aktif MESEM profili yok' from b where not exists(select 1 from official_curriculum_profiles p where p.active and p.school_type='MESEM' and p.field_name=b.field_name and p.branch_name=b.branch_name)
 order by 1,2,3;
$$;
insert into supabase_migrations.schema_migrations(version,name,created_by,statements) values('20260824031000','mesem_catalog_completeness_audit','chatgpt-direct-cloud',array['39/193 MESEM canonical catalog completeness audit']) on conflict(version) do nothing;
commit;
