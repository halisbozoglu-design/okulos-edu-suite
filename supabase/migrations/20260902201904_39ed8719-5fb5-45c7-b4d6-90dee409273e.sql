-- duty_locations additive fields
ALTER TABLE public.duty_locations
  ADD COLUMN IF NOT EXISTS visitor_entry_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS student_duty_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gender_rule text NOT NULL DEFAULT 'any',
  ADD COLUMN IF NOT EXISTS student_capacity smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS code text,
  ADD COLUMN IF NOT EXISTS kind text;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='duty_locations_gender_rule_chk') THEN
    ALTER TABLE public.duty_locations ADD CONSTRAINT duty_locations_gender_rule_chk CHECK (gender_rule IN ('any','male','female'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.security_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- visitor_people
CREATE TABLE IF NOT EXISTS public.visitor_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_code text DEFAULT current_tenant_code() REFERENCES public.institutions(institution_code) ON DELETE RESTRICT,
  full_name text NOT NULL,
  phone text,
  tc_last4 text,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT visitor_people_tc_last4_chk CHECK (tc_last4 IS NULL OR tc_last4 ~ '^\d{4}$'),
  CONSTRAINT visitor_people_source_chk CHECK (source IN ('camera_live','manual','student_lookup','phone_lookup'))
);
CREATE INDEX IF NOT EXISTS idx_visitor_people_tenant ON public.visitor_people(institution_code);
CREATE INDEX IF NOT EXISTS idx_visitor_people_phone ON public.visitor_people(institution_code, phone);
GRANT SELECT, INSERT, UPDATE ON public.visitor_people TO authenticated;
GRANT ALL ON public.visitor_people TO service_role;
ALTER TABLE public.visitor_people ENABLE ROW LEVEL SECURITY;

-- visitor_visits
CREATE TABLE IF NOT EXISTS public.visitor_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_code text DEFAULT current_tenant_code() REFERENCES public.institutions(institution_code) ON DELETE RESTRICT,
  visitor_person_id uuid NOT NULL REFERENCES public.visitor_people(id) ON DELETE RESTRICT,
  entry_location_id uuid REFERENCES public.duty_locations(id) ON DELETE SET NULL,
  exit_location_id uuid REFERENCES public.duty_locations(id) ON DELETE SET NULL,
  related_student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  person_to_meet_user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  visit_reason text,
  card_no text,
  status text NOT NULL DEFAULT 'pending_approval',
  entry_at timestamptz NOT NULL DEFAULT now(),
  exit_at timestamptz,
  entered_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  exited_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  physical_id_seen boolean NOT NULL DEFAULT false,
  identity_method text NOT NULL DEFAULT 'manual',
  identity_verified_at timestamptz,
  identity_verified_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  phone_used text,
  cancellation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT visitor_visits_status_chk CHECK (status IN ('pending_approval','inside','exited','cancelled','rejected')),
  CONSTRAINT visitor_visits_identity_method_chk CHECK (identity_method IN ('camera_live','manual')),
  CONSTRAINT visitor_visits_physical_id_chk CHECK (
    status <> 'inside'
    OR (physical_id_seen = true AND entered_by IS NOT NULL AND identity_verified_by IS NOT NULL AND identity_verified_at IS NOT NULL)
  ),
  CONSTRAINT visitor_visits_exit_chk CHECK (status <> 'exited' OR (exit_at IS NOT NULL AND exited_by IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_visitor_visits_tenant_status ON public.visitor_visits(institution_code, status);
CREATE INDEX IF NOT EXISTS idx_visitor_visits_entry_at ON public.visitor_visits(institution_code, entry_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.visitor_visits TO authenticated;
GRANT ALL ON public.visitor_visits TO service_role;
ALTER TABLE public.visitor_visits ENABLE ROW LEVEL SECURITY;

-- visitor_access_restrictions
CREATE TABLE IF NOT EXISTS public.visitor_access_restrictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_code text DEFAULT current_tenant_code() REFERENCES public.institutions(institution_code) ON DELETE RESTRICT,
  visitor_person_id uuid REFERENCES public.visitor_people(id) ON DELETE CASCADE,
  related_student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  restriction_type text NOT NULL DEFAULT 'general',
  decision text NOT NULL DEFAULT 'deny',
  starts_at timestamptz,
  ends_at timestamptz,
  legal_basis_type text,
  legal_basis_note text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT visitor_restriction_decision_chk CHECK (decision IN ('allow','deny','approval_required')),
  CONSTRAINT visitor_restriction_target_chk CHECK (visitor_person_id IS NOT NULL OR related_student_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_visitor_restrictions_tenant ON public.visitor_access_restrictions(institution_code, is_active);
GRANT SELECT, INSERT, UPDATE ON public.visitor_access_restrictions TO authenticated;
GRANT ALL ON public.visitor_access_restrictions TO service_role;
ALTER TABLE public.visitor_access_restrictions ENABLE ROW LEVEL SECURITY;

-- student duty settings
CREATE TABLE IF NOT EXISTS public.student_duty_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_code text DEFAULT current_tenant_code() REFERENCES public.institutions(institution_code) ON DELETE RESTRICT,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE CASCADE,
  included_grade_levels smallint[] NOT NULL DEFAULT '{}',
  included_class_ids uuid[] NOT NULL DEFAULT '{}',
  gender_rule_enabled boolean NOT NULL DEFAULT false,
  daily_student_per_location smallint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_duty_settings ON public.student_duty_settings(institution_code, academic_year_id);
GRANT SELECT, INSERT, UPDATE ON public.student_duty_settings TO authenticated;
GRANT ALL ON public.student_duty_settings TO service_role;
ALTER TABLE public.student_duty_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.student_duty_exemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_code text DEFAULT current_tenant_code() REFERENCES public.institutions(institution_code) ON DELETE RESTRICT,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  starts_on date NOT NULL,
  ends_on date,
  reason text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_duty_exemptions_tenant ON public.student_duty_exemptions(institution_code, student_id);
GRANT SELECT, INSERT, UPDATE ON public.student_duty_exemptions TO authenticated;
GRANT ALL ON public.student_duty_exemptions TO service_role;
ALTER TABLE public.student_duty_exemptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.student_duty_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_code text DEFAULT current_tenant_code() REFERENCES public.institutions(institution_code) ON DELETE RESTRICT,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  duty_date date NOT NULL,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.duty_locations(id) ON DELETE SET NULL,
  assignment_source text NOT NULL DEFAULT 'auto',
  vice_principal_user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  presence_state text,
  checked_at timestamptz,
  checked_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  manual_changed_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  manual_changed_at timestamptz,
  manual_change_reason text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_duty_source_chk CHECK (assignment_source IN ('auto','manual')),
  CONSTRAINT student_duty_presence_chk CHECK (presence_state IS NULL OR presence_state IN ('present','absent'))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_duty_assignment_day ON public.student_duty_assignments(institution_code, duty_date, student_id);
CREATE INDEX IF NOT EXISTS idx_student_duty_assignments_date ON public.student_duty_assignments(institution_code, duty_date);
GRANT SELECT, INSERT, UPDATE ON public.student_duty_assignments TO authenticated;
GRANT ALL ON public.student_duty_assignments TO service_role;
ALTER TABLE public.student_duty_assignments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.student_duty_generation_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_code text DEFAULT current_tenant_code() REFERENCES public.institutions(institution_code) ON DELETE RESTRICT,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE CASCADE,
  last_generated_on date,
  rotation_cursor jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_duty_generation_state ON public.student_duty_generation_state(institution_code, academic_year_id);
GRANT SELECT, INSERT, UPDATE ON public.student_duty_generation_state TO authenticated;
GRANT ALL ON public.student_duty_generation_state TO service_role;
ALTER TABLE public.student_duty_generation_state ENABLE ROW LEVEL SECURITY;

-- Tenant fences, updated_at triggers, policies
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['visitor_people','visitor_visits','visitor_access_restrictions','student_duty_settings','student_duty_exemptions','student_duty_assignments','student_duty_generation_state']
  LOOP
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP TRIGGER IF EXISTS trg_tenant_guard_%1$s ON public.%1$s', t);
    EXECUTE format('CREATE TRIGGER trg_tenant_guard_%1$s BEFORE INSERT OR UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_row()', t);
    EXECUTE format('DROP TRIGGER IF EXISTS trg_touch_%1$s ON public.%1$s', t);
    EXECUTE format('CREATE TRIGGER trg_touch_%1$s BEFORE UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.security_touch_updated_at()', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_boundary_%1$s ON public.%1$s', t);
    EXECUTE format('CREATE POLICY tenant_boundary_%1$s ON public.%1$s AS RESTRICTIVE TO authenticated USING (public.tenant_row_allowed(institution_code)) WITH CHECK (public.tenant_row_allowed(institution_code))', t);
    EXECUTE format('DROP POLICY IF EXISTS security_read_%1$s ON public.%1$s', t);
    EXECUTE format('CREATE POLICY security_read_%1$s ON public.%1$s FOR SELECT TO authenticated USING (public.has_permission(''security.view'') OR public.has_permission(''security.checkin'') OR public.has_permission(''security.manage'') OR public.has_permission(''security.student_duty'') OR public.is_manager_or_admin())', t);
    EXECUTE format('DROP POLICY IF EXISTS security_write_%1$s ON public.%1$s', t);
  END LOOP;
END $$;

CREATE POLICY security_write_visitor_people ON public.visitor_people TO authenticated
  USING (public.has_permission('security.checkin') OR public.has_permission('security.manage') OR public.is_manager_or_admin())
  WITH CHECK (public.has_permission('security.checkin') OR public.has_permission('security.manage') OR public.is_manager_or_admin());
CREATE POLICY security_write_visitor_visits ON public.visitor_visits TO authenticated
  USING (public.has_permission('security.checkin') OR public.has_permission('security.manage') OR public.is_manager_or_admin())
  WITH CHECK (public.has_permission('security.checkin') OR public.has_permission('security.manage') OR public.is_manager_or_admin());
CREATE POLICY security_write_visitor_access_restrictions ON public.visitor_access_restrictions TO authenticated
  USING (public.has_permission('security.manage') OR public.is_manager_or_admin())
  WITH CHECK (public.has_permission('security.manage') OR public.is_manager_or_admin());
CREATE POLICY security_write_student_duty_settings ON public.student_duty_settings TO authenticated
  USING (public.has_permission('security.student_duty') OR public.has_permission('security.manage') OR public.is_manager_or_admin())
  WITH CHECK (public.has_permission('security.student_duty') OR public.has_permission('security.manage') OR public.is_manager_or_admin());
CREATE POLICY security_write_student_duty_exemptions ON public.student_duty_exemptions TO authenticated
  USING (public.has_permission('security.student_duty') OR public.has_permission('security.manage') OR public.is_manager_or_admin())
  WITH CHECK (public.has_permission('security.student_duty') OR public.has_permission('security.manage') OR public.is_manager_or_admin());
CREATE POLICY security_write_student_duty_assignments ON public.student_duty_assignments TO authenticated
  USING (public.has_permission('security.student_duty') OR public.has_permission('security.manage') OR public.is_manager_or_admin())
  WITH CHECK (public.has_permission('security.student_duty') OR public.has_permission('security.manage') OR public.is_manager_or_admin());
CREATE POLICY security_write_student_duty_generation_state ON public.student_duty_generation_state TO authenticated
  USING (public.has_permission('security.student_duty') OR public.has_permission('security.manage') OR public.is_manager_or_admin())
  WITH CHECK (public.has_permission('security.student_duty') OR public.has_permission('security.manage') OR public.is_manager_or_admin());

-- Permission catalog (additive)
INSERT INTO public.permission_catalog(code,module_code,module_label,label,action,description,dangerous,sort_order)
VALUES
  ('security.view','security','Güvenlik & Ziyaretçi','Ziyaretçi kayıtlarını görüntüle','view','Ziyaretçi defteri ve içeridekiler listesini okur.',false,910),
  ('security.checkin','security','Güvenlik & Ziyaretçi','Ziyaretçi giriş/çıkış işlemi','operate','Ziyaretçi girişi ve çıkışı kaydeder.',false,920),
  ('security.manage','security','Güvenlik & Ziyaretçi','Güvenlik ayarlarını yönet','manage','Giriş yerleri ve erişim kısıtlamalarını yönetir.',true,930),
  ('security.student_duty','security','Güvenlik & Ziyaretçi','Nöbetçi öğrenci yönetimi','manage','Nöbetçi öğrenci ayarları, üretimi ve kontrolü.',false,940)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.system_feature_catalog(feature_key,parent_key,label,route_prefix,sort_order)
VALUES ('security',NULL,'Güvenlik & Ziyaretçi','/security',910)
ON CONFLICT (feature_key) DO NOTHING;
INSERT INTO public.system_feature_catalog(feature_key,parent_key,label,route_prefix,sort_order)
VALUES
  ('security.visitors.check_in','security','Hızlı Ziyaretçi Girişi','/security/visitors/check-in',911),
  ('security.visitors.inside','security','İçeridekiler','/security/visitors/inside',912),
  ('security.visitors.ledger','security','Ziyaretçi Defteri','/security/visitors/ledger',913),
  ('security.locations','security','Giriş/Nöbet Yerleri','/security/locations',914),
  ('security.student_duty','security','Nöbetçi Öğrenci','/security/student-duty',915)
ON CONFLICT (feature_key) DO NOTHING;