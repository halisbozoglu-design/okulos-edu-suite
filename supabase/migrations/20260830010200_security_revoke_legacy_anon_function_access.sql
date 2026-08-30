-- The legacy baseline granted EXECUTE directly to anon on privileged RPCs.
-- Keep explicit authenticated and service_role grants intact.
do $$
declare
  fn regprocedure;
begin
  for fn in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
  loop
    execute format('revoke all on function %s from anon', fn);
  end loop;
end
$$;

alter table public.schedule_compute_workers enable row level security;
revoke all on table public.schedule_compute_workers from authenticated;
