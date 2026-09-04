-- Stage 1: institution, user, role and authorization hardening
-- Canonical rule: RLS must enforce tenant + role/scope at the database boundary.

alter type public.app_role add value if not exists 'student';
alter type public.app_role add value if not exists 'guardian';

alter table public.students
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
create unique index if not exists students_auth_user_id_uidx
  on public.students(auth_user_id) where auth_user_id is not null;

create table if not exists public.student_guardians (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null references public.institutions(institution_code) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  guardian_user_id uuid not null references auth.users(id) on delete cascade,
  relationship text not null default 'guardian',
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, guardian_user_id)
);
create index if not exists student_guardians_guardian_idx on public.student_guardians(guardian_user_id) where active;
create index if not exists student_guardians_student_idx on public.student_guardians(student_id) where active;

create table if not exists public.security_audit_log (
  id uuid primary key default gen_random_uuid(),
  institution_code text,
  actor_user_id uuid,
  event_type text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists security_audit_log_tenant_time_idx on public.security_audit_log(institution_code, created_at desc);

create or replace function public.is_system_admin()
returns boolean
language sql stable security definer set search_path=public
as $$ select coalesce(public.is_super_admin(), false); $$;

create or replace function public.is_institution_admin(p_institution_code text default null)
returns boolean
language sql stable security definer set search_path=public
as $$
  select public.is_system_admin() or exists (
    select 1 from public.institution_memberships m
    where m.user_id=auth.uid() and m.active
      and m.institution_code=coalesce(p_institution_code, public.current_tenant_code())
      and m.membership_role in ('principal','admin','institution_admin','manager')
  );
$$;

create or replace function public.teacher_can_access_class(p_class_id uuid)
returns boolean
language sql stable security definer set search_path=public
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.school_classes sc
    where sc.id=p_class_id
      and sc.institution_code=public.current_tenant_code()
      and (
        sc.advisor_teacher_id=auth.uid()
        or exists (
          select 1
          from public.class_course_requirements ccr
          join public.teacher_course_assignments tca on tca.class_course_requirement_id=ccr.id
          where ccr.class_id=sc.id
            and tca.teacher_id=auth.uid()
            and tca.institution_code=sc.institution_code
            and (tca.valid_from is null or tca.valid_from<=current_date)
            and (tca.valid_to is null or tca.valid_to>=current_date)
        )
      )
  );
$$;

create or replace function public.is_student_owner(p_student_id uuid)
returns boolean
language sql stable security definer set search_path=public
as $$
  select auth.uid() is not null and exists (
    select 1 from public.students s
    where s.id=p_student_id and s.auth_user_id=auth.uid() and s.active
      and s.institution_code=public.current_tenant_code()
  );
$$;

create or replace function public.is_guardian_of(p_student_id uuid)
returns boolean
language sql stable security definer set search_path=public
as $$
  select auth.uid() is not null and exists (
    select 1 from public.student_guardians g
    where g.student_id=p_student_id and g.guardian_user_id=auth.uid() and g.active
      and g.institution_code=public.current_tenant_code()
  );
$$;

create or replace function public.can_access_class(p_class_id uuid)
returns boolean
language sql stable security definer set search_path=public
as $$
  select public.is_system_admin() or exists (
    select 1 from public.school_classes sc
    where sc.id=p_class_id
      and sc.institution_code=public.current_tenant_code()
      and (
        public.is_institution_admin(sc.institution_code)
        or public.teacher_can_access_class(sc.id)
        or exists(select 1 from public.students s where s.class_id=sc.id and s.auth_user_id=auth.uid() and s.active)
        or exists(select 1 from public.student_guardians g join public.students s on s.id=g.student_id where g.guardian_user_id=auth.uid() and g.active and g.institution_code=sc.institution_code and s.class_id=sc.id)
      )
  );
$$;

create or replace function public.can_access_student(p_student_id uuid)
returns boolean
language sql stable security definer set search_path=public
as $$
  select public.is_system_admin() or exists (
    select 1 from public.students s
    where s.id=p_student_id
      and s.institution_code=public.current_tenant_code()
      and (
        public.is_institution_admin(s.institution_code)
        or s.auth_user_id=auth.uid()
        or public.is_guardian_of(s.id)
        or public.teacher_can_access_class(s.class_id)
      )
  );
$$;

create or replace function public.current_access_context()
returns jsonb
language sql stable security definer set search_path=public
as $$
  select jsonb_build_object(
    'userId', auth.uid(),
    'institutionCode', public.current_tenant_code(),
    'systemAdmin', public.is_system_admin(),
    'institutionAdmin', public.is_institution_admin(public.current_tenant_code()),
    'profileRole', (select p.role::text from public.profiles p where p.user_id=auth.uid()),
    'membershipRoles', coalesce((select jsonb_agg(m.membership_role order by m.membership_role) from public.institution_memberships m where m.user_id=auth.uid() and m.active and m.institution_code=public.current_tenant_code()), '[]'::jsonb)
  );
$$;

grant execute on function public.current_access_context() to authenticated;
grant execute on function public.can_access_class(uuid) to authenticated;
grant execute on function public.can_access_student(uuid) to authenticated;

alter table public.student_guardians enable row level security;
alter table public.security_audit_log enable row level security;

-- Remove permissive policies that would OR around the scoped policies below.
drop policy if exists "authenticated can read school classes" on public.school_classes;
drop policy if exists "tenant_boundary_school_classes" on public.school_classes;
drop policy if exists "delegated class managers manage classes" on public.school_classes;
drop policy if exists "authenticated can read students" on public.students;
drop policy if exists "tenant_boundary_students" on public.students;
drop policy if exists "authenticated read teacher course assignments" on public.teacher_course_assignments;
drop policy if exists "tenant guard teacher course assignments" on public.teacher_course_assignments;
drop policy if exists "tenant_boundary_teacher_course_assignments" on public.teacher_course_assignments;
drop policy if exists "delegated curriculum managers manage teacher course assignments" on public.teacher_course_assignments;
drop policy if exists "managers manage teacher course assignments" on public.teacher_course_assignments;
drop policy if exists "admins can read all profiles" on public.profiles;
drop policy if exists "admins can update all profiles" on public.profiles;
drop policy if exists "managers can read operational profiles" on public.profiles;
drop policy if exists "delegated operators read operational profiles" on public.profiles;
drop policy if exists "tenant_boundary_profiles" on public.profiles;

create policy school_classes_scoped_read on public.school_classes
for select to authenticated using (public.can_access_class(id));
create policy school_classes_admin_write on public.school_classes
for all to authenticated using (
  public.is_system_admin() or (institution_code=public.current_tenant_code() and (public.is_institution_admin(institution_code) or public.has_permission('classes.manage')))
) with check (
  public.is_system_admin() or (institution_code=public.current_tenant_code() and (public.is_institution_admin(institution_code) or public.has_permission('classes.manage')))
);

create policy students_scoped_read on public.students
for select to authenticated using (public.can_access_student(id));
create policy students_admin_write on public.students
for all to authenticated using (
  public.is_system_admin() or (institution_code=public.current_tenant_code() and (public.is_institution_admin(institution_code) or public.has_permission('classes.manage')))
) with check (
  public.is_system_admin() or (institution_code=public.current_tenant_code() and (public.is_institution_admin(institution_code) or public.has_permission('classes.manage')))
);

create policy teacher_assignments_scoped_read on public.teacher_course_assignments
for select to authenticated using (
  public.is_system_admin() or (
    institution_code=public.current_tenant_code()
    and (teacher_id=auth.uid() or public.is_institution_admin(institution_code) or public.has_permission('curriculum.manage'))
  )
);
create policy teacher_assignments_scoped_write on public.teacher_course_assignments
for all to authenticated using (
  public.is_system_admin() or (institution_code=public.current_tenant_code() and (public.is_institution_admin(institution_code) or public.has_permission('curriculum.manage')))
) with check (
  public.is_system_admin() or (institution_code=public.current_tenant_code() and (public.is_institution_admin(institution_code) or public.has_permission('curriculum.manage')))
);

create policy profiles_scoped_read on public.profiles
for select to authenticated using (
  user_id=auth.uid() or public.is_system_admin() or (
    institution_code=public.current_tenant_code()
    and (public.is_institution_admin(institution_code) or public.has_permission('personnel.manage'))
  )
);
create policy profiles_scoped_admin_update on public.profiles
for update to authenticated using (
  public.is_system_admin() or (institution_code=public.current_tenant_code() and public.is_institution_admin(institution_code))
) with check (
  public.is_system_admin() or (institution_code=public.current_tenant_code() and public.is_institution_admin(institution_code))
);

create policy student_guardians_read on public.student_guardians
for select to authenticated using (
  public.is_system_admin() or (
    institution_code=public.current_tenant_code()
    and (guardian_user_id=auth.uid() or public.is_institution_admin(institution_code))
  )
);
create policy student_guardians_manage on public.student_guardians
for all to authenticated using (
  public.is_system_admin() or (institution_code=public.current_tenant_code() and public.is_institution_admin(institution_code))
) with check (
  public.is_system_admin() or (institution_code=public.current_tenant_code() and public.is_institution_admin(institution_code))
);

create policy security_audit_read on public.security_audit_log
for select to authenticated using (
  public.is_system_admin() or (institution_code=public.current_tenant_code() and public.is_institution_admin(institution_code))
);

create or replace function public.audit_access_change()
returns trigger
language plpgsql security definer set search_path=public
as $$
declare
  v_new jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) else '{}'::jsonb end;
  v_old jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) else '{}'::jsonb end;
begin
  insert into public.security_audit_log(institution_code,actor_user_id,event_type,target_type,target_id,metadata)
  values(
    coalesce(v_new->>'institution_code', v_old->>'institution_code', public.current_tenant_code()),
    auth.uid(),
    tg_op,
    tg_table_name,
    coalesce(v_new->>'id', v_old->>'id', v_new->>'user_id', v_old->>'user_id'),
    jsonb_build_object('old', v_old, 'new', v_new)
  );
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists audit_institution_memberships_access on public.institution_memberships;
create trigger audit_institution_memberships_access after insert or update or delete on public.institution_memberships
for each row execute function public.audit_access_change();
drop trigger if exists audit_student_guardians_access on public.student_guardians;
create trigger audit_student_guardians_access after insert or update or delete on public.student_guardians
for each row execute function public.audit_access_change();

-- Membership management remains tenant-bound; a principal/institution admin can manage only their institution.
drop policy if exists memberships_admin_manage on public.institution_memberships;
create policy memberships_admin_manage on public.institution_memberships
for all to authenticated using (public.is_system_admin() or public.is_institution_admin(institution_code))
with check (public.is_system_admin() or public.is_institution_admin(institution_code));
