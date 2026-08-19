-- Permission gateways that open a transaction-local security context must be VOLATILE.
-- Their read-only core functions may remain STABLE; the public wrapper mutates transaction settings.

alter function public.payroll_month_matrix(int,int) volatile;
alter function public.kbs_payroll_export(int,int) volatile;
alter function public.suggest_substitutes_for_day(date) volatile;
alter function public.get_daily_duty_book(date) volatile;
