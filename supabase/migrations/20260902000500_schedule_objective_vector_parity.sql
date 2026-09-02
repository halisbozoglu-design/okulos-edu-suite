-- Canonical objective ordering shared by Cloud, Web and native clients.
create or replace function public.get_schedule_objective_contract_v1()
returns jsonb language sql immutable set search_path=public
as $$ select '{"schema":"okulos.schedule-objective-vector.v1","order":["hard","unplaced","medium","soft"]}'::jsonb $$;

create or replace function public.compare_schedule_objective_vectors_v1(p_left jsonb,p_right jsonb)
returns smallint language plpgsql immutable strict set search_path=public
as $$
declare k text;l numeric;r numeric;
begin
 foreach k in array array['hard','unplaced','medium','soft'] loop
  if coalesce(jsonb_typeof(p_left->k),'null')<>'number' or coalesce(jsonb_typeof(p_right->k),'null')<>'number' then raise exception 'SCHEDULE_OBJECTIVE_%_INVALID',upper(k);end if;
  l:=(p_left->>k)::numeric;r:=(p_right->>k)::numeric;
  if l<0 or r<0 then raise exception 'SCHEDULE_OBJECTIVE_%_INVALID',upper(k);end if;
  if l<r then return -1;elsif l>r then return 1;end if;
 end loop;
 return 0;
end $$;

revoke all on function public.get_schedule_objective_contract_v1() from public;
revoke all on function public.compare_schedule_objective_vectors_v1(jsonb,jsonb) from public;
grant execute on function public.get_schedule_objective_contract_v1() to authenticated;
grant execute on function public.compare_schedule_objective_vectors_v1(jsonb,jsonb) to authenticated;
