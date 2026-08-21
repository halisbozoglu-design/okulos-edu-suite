-- One-time production ledger reconciliation.
-- Historical SQL is NOT replayed. We only record versions whose effects are already present.
DO $$ BEGIN
  IF to_regclass('public.legislation_library') IS NULL
     OR to_regclass('public.personnel_registry') IS NULL
     OR to_regclass('public.institutions') IS NULL
     OR to_regclass('public.academic_years') IS NULL
     OR to_regprocedure('public.get_schedule_phase3_preflight_issues_v1()') IS NULL
     OR to_regprocedure('public.apply_schedule_edge_slot_repairs_v1(uuid)') IS NULL
  THEN
    RAISE EXCEPTION 'Cloud schema baseline signature incomplete; ledger reconciliation aborted';
  END IF;
END $$;

INSERT INTO supabase_migrations.schema_migrations(version,name,created_by,statements)
SELECT v,n,'chatgpt-baseline-reconcile',ARRAY['schema already present; ledger reconciled']::text[]
FROM (VALUES
('20260820150000','data_management_import_workflow'),
('20260820151500','legislation_library'),
('20260820160000','personnel_dynamic_columns'),
('20260820160010','personnel_module_field_access_guard'),
('20260820163000','personnel_principal_privacy_and_roles'),
('20260820163100','personnel_role_tags'),
('20260820170000','tenant_school_registration'),
('20260820173000','tenant_approval_feature_maintenance'),
('20260820173100','keep_notifications_available_during_approval'),
('20260820180000','tenant_schema_consolidation'),
('20260820180100','tenant_keys_rpc_consolidation'),
('20260820180200','tenant_auth_admin_compat_consolidation'),
('20260820190000','existing_module_tenant_entry_hardening'),
('20260820192500','schedule_edge_slot_policy'),
('20260820193500','schedule_edge_slot_repair'),
('20260820193800','schedule_edge_slot_repair_return_contract'),
('20260821002000','academic_year_tenant_authority'),
('20260821003000','schedule_phase2_tenant_scope'),
('20260821004000','schedule_phase2_tenant_edge_guards'),
('20260821015500','schedule_phase3_authority_closure'),
('20260821020000','schedule_phase3_block_scope_completion'),
('20260821020500','schedule_phase3_scoped_quality_score'),
('20260821021000','schedule_phase3_rpc_tenant_guards')) x(v,n)
WHERE NOT EXISTS (
  SELECT 1 FROM supabase_migrations.schema_migrations m WHERE m.version=x.v
);

INSERT INTO supabase_migrations.schema_migrations(version,name,created_by,statements)
VALUES (
  '20260821153000','cloud_ledger_reconciliation','chatgpt-baseline-reconcile',
  ARRAY['verified cloud baseline; reconciled historical migration ledger']::text[]
)
ON CONFLICT (version) DO NOTHING;
