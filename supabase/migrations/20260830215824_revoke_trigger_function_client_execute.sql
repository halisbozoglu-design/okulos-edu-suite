-- Trigger functions execute inside PostgreSQL and are not part of the client
-- RPC surface. Remove inherited client execution without affecting triggers.
revoke all on function public.audit_schedule_daily_overlay_v1() from anon, authenticated;
revoke all on function public.bump_schedule_engine_revision() from anon, authenticated;
revoke all on function public.clear_payroll_dirty_after_recalc() from anon, authenticated;
revoke all on function public.ensure_teacher_schedule_constraint() from anon, authenticated;
revoke all on function public.mark_payroll_dirty_from_schedule() from anon, authenticated;
revoke all on function public.notify_duty_vp_of_absence() from anon, authenticated;
revoke all on function public.notify_schedule_change() from anon, authenticated;
revoke all on function public.notify_substitute_assignment() from anon, authenticated;
revoke all on function public.schedule_workshop_policy_sync_trigger_v1() from anon, authenticated;
