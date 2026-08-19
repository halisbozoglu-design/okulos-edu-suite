-- Lock identity/authorization fields behind server-side RPCs.
-- Ordinary users may read their profile but cannot directly INSERT/UPDATE profile rows.

-- Remove permissive self-write policies created by the initial auth migration.
drop policy if exists "users can insert own profile" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;

-- Keep table UPDATE privilege for manager/admin RLS policy, but ordinary users no longer
-- have a matching direct UPDATE policy. Registration and self-service updates use RPCs.

create or replace function public.finalize_my_registration(
  p_tckn text,
  p_email text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_pre public.pre_registered_teachers%rowtype;
  v_email text := lower(trim(p_email));
  v_result public.profiles%rowtype;
begin
  if v_user_id is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if p_tckn is null or p_tckn !~ '^\d{11}$' then raise exception 'INVALID_TCKN'; end if;
  if v_email is null or v_email = '' then raise exception 'INVALID_EMAIL'; end if;

  select * into v_pre
  from public.pre_registered_teachers
  where tckn = p_tckn and active = true
  limit 1;

  if not found then raise exception 'PRE_REGISTERED_TEACHER_NOT_FOUND'; end if;

  -- If the institution pre-registered an email, it is authoritative.
  if v_pre.email is not null and lower(trim(v_pre.email)) <> v_email then
    raise exception 'EMAIL_DOES_NOT_MATCH_PRE_REGISTRATION';
  end if;

  -- The authenticated Supabase identity must also be the email being bound.
  if lower(coalesce((select email from auth.users where id = v_user_id), '')) <> v_email then
    raise exception 'AUTH_EMAIL_MISMATCH';
  end if;

  insert into public.profiles(user_id, tckn, email, full_name, role, updated_at)
  values (v_user_id, v_pre.tckn, v_email, v_pre.full_name, v_pre.role, now())
  on conflict (user_id) do update
    set tckn = excluded.tckn,
        email = excluded.email,
        full_name = excluded.full_name,
        role = excluded.role,
        updated_at = now()
  returning * into v_result;

  -- Bind the email to the institutional pre-registration when it was initially empty.
  update public.pre_registered_teachers
  set email = coalesce(email, v_email)
  where id = v_pre.id;

  return v_result;
end;
$$;

revoke all on function public.finalize_my_registration(text,text) from public;
grant execute on function public.finalize_my_registration(text,text) to authenticated;

create or replace function public.update_my_profile_safe(
  p_blood_type text default null,
  p_phone text default null,
  p_emergency_contact text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_result public.profiles%rowtype;
begin
  if v_user_id is null then raise exception 'NOT_AUTHENTICATED'; end if;

  update public.profiles
  set blood_type = nullif(trim(p_blood_type), ''),
      phone = nullif(trim(p_phone), ''),
      emergency_contact = nullif(trim(p_emergency_contact), ''),
      updated_at = now()
  where user_id = v_user_id
  returning * into v_result;

  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  return v_result;
end;
$$;

revoke all on function public.update_my_profile_safe(text,text,text) from public;
grant execute on function public.update_my_profile_safe(text,text,text) to authenticated;

-- Additional defense-in-depth: even if a future policy accidentally re-opens self UPDATE,
-- protected identity fields cannot be changed by a non-admin through direct table writes.
create or replace function public.protect_profile_identity_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.user_id and not public.is_admin() then
    if new.user_id is distinct from old.user_id
       or new.tckn is distinct from old.tckn
       or new.email is distinct from old.email
       or new.full_name is distinct from old.full_name
       or new.role is distinct from old.role then
      raise exception 'PROTECTED_PROFILE_FIELD';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_identity_fields on public.profiles;
create trigger trg_protect_profile_identity_fields
before update on public.profiles
for each row execute function public.protect_profile_identity_fields();
