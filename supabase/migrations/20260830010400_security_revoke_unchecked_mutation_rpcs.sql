-- These administrative/worker routines had no caller authorization check.
-- They are not called by the client application and remain available to the
-- explicitly granted service_role only.
revoke execute on function public.drop_unique_constraint_by_columns(text,text[]) from authenticated;
revoke execute on function public.ensure_tenant_composite_pk_v1(text,text[]) from authenticated;
revoke execute on function public.approve_official_source_change_v1(uuid,text,text) from authenticated;
revoke execute on function public.mark_official_source_change_parsed_v1(uuid,jsonb,date,boolean) from authenticated;
revoke execute on function public.register_official_source_snapshot_v1(text,text,text,text,text,integer,date,date,date,text,text,jsonb,text) from authenticated;
revoke execute on function public.seed_timetable_defaults_for_tenant_v1(text) from authenticated;
revoke execute on function public.upsert_official_vocational_catalog_batch(jsonb) from authenticated;
revoke execute on function public.upsert_official_vocational_framework_sources_batch(jsonb) from authenticated;
