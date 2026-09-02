-- SınavOS / OkulOS Stage 1 access-control post-migration audit.
-- READ ONLY: returns zero rows when the known legacy RLS bypasses are absent.

with dangerous(table_name, policy_name) as (
  values
    ('school_classes'::text, 'authenticated can read school classes'::text),
    ('school_classes', 'delegated class managers manage classes'),
    ('students', 'authenticated can read students'),
    ('teacher_course_assignments', 'authenticated read teacher course assignments'),
    ('teacher_course_assignments', 'delegated curriculum managers manage teacher course assignments'),
    ('teacher_course_assignments', 'managers manage teacher course assignments'),
    ('profiles', 'admins can read all profiles'),
    ('profiles', 'admins can update all profiles'),
    ('profiles', 'managers can read operational profiles'),
    ('profiles', 'delegated operators read operational profiles')
)
select
  'DANGEROUS_POLICY_PRESENT' as finding,
  p.tablename,
  p.policyname,
  p.cmd,
  p.qual,
  p.with_check
from pg_policies p
join dangerous d
  on d.table_name = p.tablename
 and d.policy_name = p.policyname
where p.schemaname = 'public'
order by p.tablename, p.policyname;

-- Expected replacement policies. Missing rows indicate an incomplete migration.
with required(table_name, policy_name) as (
  values
    ('school_classes'::text, 'school_classes_scoped_read'::text),
    ('school_classes', 'school_classes_admin_write'),
    ('students', 'students_scoped_read'),
    ('students', 'students_admin_write'),
    ('teacher_course_assignments', 'teacher_assignments_scoped_read'),
    ('teacher_course_assignments', 'teacher_assignments_scoped_write'),
    ('profiles', 'profiles_scoped_read'),
    ('profiles', 'profiles_scoped_admin_update'),
    ('student_guardians', 'student_guardians_read'),
    ('student_guardians', 'student_guardians_manage'),
    ('security_audit_log', 'security_audit_read')
)
select
  'REQUIRED_POLICY_MISSING' as finding,
  r.table_name,
  r.policy_name
from required r
where not exists (
  select 1
  from pg_policies p
  where p.schemaname = 'public'
    and p.tablename = r.table_name
    and p.policyname = r.policy_name
)
order by r.table_name, r.policy_name;
