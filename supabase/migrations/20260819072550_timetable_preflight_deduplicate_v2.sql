-- The renamed 709 readiness wrapper resolves get_schedule_configuration_issues_v2()
-- at execution time, so scoped configuration issues are already included there.
-- Only remove the obsolete exact block-sum error; do not union configuration twice.
create or replace function public.get_schedule_preparation_readiness()
returns table(category text,code text,status text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
  select *
  from public.get_schedule_preparation_readiness_before_flexible_blocks_v2()
  where code<>'BLOCK_PATTERN_ASSIGNMENT_MISMATCH';
$$;
revoke all on function public.get_schedule_preparation_readiness() from public;
grant execute on function public.get_schedule_preparation_readiness() to authenticated;
