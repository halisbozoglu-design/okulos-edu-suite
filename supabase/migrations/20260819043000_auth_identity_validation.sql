-- Stronger identity validation for normal OkulOS users.
-- Super Admin may have NULL TCKN; normal TCKNs must satisfy the official checksum structure.

create or replace function public.is_valid_tckn(p_tckn text)
returns boolean
language plpgsql
immutable
strict
set search_path = public
as $$
declare
  d integer[];
  v_tenth integer;
  v_eleventh integer;
begin
  if p_tckn !~ '^\d{11}$' or left(p_tckn, 1) = '0' then
    return false;
  end if;

  d := array[
    substr(p_tckn,1,1)::integer, substr(p_tckn,2,1)::integer,
    substr(p_tckn,3,1)::integer, substr(p_tckn,4,1)::integer,
    substr(p_tckn,5,1)::integer, substr(p_tckn,6,1)::integer,
    substr(p_tckn,7,1)::integer, substr(p_tckn,8,1)::integer,
    substr(p_tckn,9,1)::integer, substr(p_tckn,10,1)::integer,
    substr(p_tckn,11,1)::integer
  ];

  v_tenth := (((d[1]+d[3]+d[5]+d[7]+d[9]) * 7 - (d[2]+d[4]+d[6]+d[8])) % 10 + 10) % 10;
  v_eleventh := (d[1]+d[2]+d[3]+d[4]+d[5]+d[6]+d[7]+d[8]+d[9]+d[10]) % 10;

  return d[10] = v_tenth and d[11] = v_eleventh;
end;
$$;

revoke all on function public.is_valid_tckn(text) from public;
grant execute on function public.is_valid_tckn(text) to authenticated;

alter table public.pre_registered_teachers
  drop constraint if exists pre_registered_teachers_tckn_algorithm_chk;
alter table public.pre_registered_teachers
  add constraint pre_registered_teachers_tckn_algorithm_chk
  check (public.is_valid_tckn(tckn)) not valid;

alter table public.profiles
  drop constraint if exists profiles_tckn_algorithm_chk;
alter table public.profiles
  add constraint profiles_tckn_algorithm_chk
  check (tckn is null or public.is_valid_tckn(tckn)) not valid;

alter table public.profiles
  drop constraint if exists profiles_phone_tr_mobile_chk;
alter table public.profiles
  add constraint profiles_phone_tr_mobile_chk
  check (phone is null or phone ~ '^05\d{9}$') not valid;
