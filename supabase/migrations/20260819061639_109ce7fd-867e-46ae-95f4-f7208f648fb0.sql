drop policy if exists "users can insert own profile" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;

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

  if v_pre.email is not null and lower(trim(v_pre.email)) <> v_email then
    raise exception 'EMAIL_DOES_NOT_MATCH_PRE_REGISTRATION';
  end if;

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

create or replace function public.enforce_profile_insert_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pre public.pre_registered_teachers%rowtype;
  v_auth_email text;
begin
  if auth.uid() is null or new.user_id <> auth.uid() then
    raise exception 'PROFILE_INSERT_NOT_OWN_USER';
  end if;
  if new.tckn is null or new.tckn !~ '^\d{11}$' then
    raise exception 'INVALID_TCKN';
  end if;

  select * into v_pre
  from public.pre_registered_teachers
  where tckn = new.tckn and active = true
  limit 1;
  if not found then raise exception 'PRE_REGISTERED_TEACHER_NOT_FOUND'; end if;

  select lower(email) into v_auth_email from auth.users where id = auth.uid();
  if v_auth_email is null then raise exception 'AUTH_EMAIL_REQUIRED'; end if;
  if v_pre.email is not null and lower(trim(v_pre.email)) <> v_auth_email then
    raise exception 'EMAIL_DOES_NOT_MATCH_PRE_REGISTRATION';
  end if;

  new.tckn := v_pre.tckn;
  new.email := v_auth_email;
  new.full_name := v_pre.full_name;
  new.role := v_pre.role;
  new.updated_at := now();

  update public.pre_registered_teachers
  set email = coalesce(email, v_auth_email)
  where id = v_pre.id;

  return new;
end;
$$;

drop trigger if exists trg_enforce_profile_insert_identity on public.profiles;
create trigger trg_enforce_profile_insert_identity
before insert on public.profiles
for each row execute function public.enforce_profile_insert_identity();

create policy "users can insert own profile guarded"
on public.profiles for insert to authenticated
with check (auth.uid() = user_id);

create policy "users can update own safe profile fields"
on public.profiles for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);