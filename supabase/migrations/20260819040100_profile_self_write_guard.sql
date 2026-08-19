-- Keep the existing client flows functional while making identity fields database-authoritative.

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

-- Re-enable own INSERT/UPDATE only behind the insert and protected-field triggers.
create policy "users can insert own profile guarded"
on public.profiles for insert to authenticated
with check (auth.uid() = user_id);

create policy "users can update own safe profile fields"
on public.profiles for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
