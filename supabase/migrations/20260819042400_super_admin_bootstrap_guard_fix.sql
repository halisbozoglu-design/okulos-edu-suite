-- Allow only the verified allow-listed bootstrap account to convert its own existing profile.
-- All other self-service identity/role changes remain blocked.

create or replace function public.protect_profile_identity_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_email text;
  v_bootstrap_allowed boolean := false;
begin
  if auth.uid() is not null then
    select lower(email) into v_auth_email from auth.users where id=auth.uid();
    select exists(
      select 1 from public.super_admin_bootstrap b
      where b.email=v_auth_email and b.active=true
    ) into v_bootstrap_allowed;
  end if;

  -- A claimed super admin may administer other profiles.
  if public.is_super_admin() and auth.uid() <> old.user_id then
    return new;
  end if;

  -- One-time bootstrap conversion: verified allow-listed account may convert only its own row.
  if auth.uid() = old.user_id
     and v_bootstrap_allowed
     and new.user_id = old.user_id
     and new.email = v_auth_email
     and new.role = 'admin'
     and new.is_super_admin = true
     and new.tckn is null then
    return new;
  end if;

  if auth.uid() = old.user_id then
    if new.user_id is distinct from old.user_id
      or new.tckn is distinct from old.tckn
      or new.email is distinct from old.email
      or new.full_name is distinct from old.full_name
      or new.role is distinct from old.role
      or new.is_super_admin is distinct from old.is_super_admin then
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

-- NULL TCKN is reserved for admin bootstrap/system admin accounts.
alter table public.profiles
  drop constraint if exists profiles_non_admin_tckn_required;
alter table public.profiles
  add constraint profiles_non_admin_tckn_required
  check (role = 'admin' or (tckn is not null and tckn ~ '^\d{11}$')) not valid;
