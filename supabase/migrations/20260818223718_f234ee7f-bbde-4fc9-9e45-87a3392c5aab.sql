revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_manager_or_admin() from public, anon;
revoke all on function public.assign_substitutes_for_day(date) from public, anon;
revoke all on function public.prevent_role_self_change() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_manager_or_admin() to authenticated;
grant execute on function public.assign_substitutes_for_day(date) to authenticated;