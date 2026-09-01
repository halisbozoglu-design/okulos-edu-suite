-- Immutable diagnostic snapshots are deliberately outside the apply/publish path.
-- They preserve evidence from a scenario without changing the working timetable.

create table if not exists public.schedule_diagnostic_sandboxes (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null references public.institutions(institution_code) on delete cascade,
  source_scenario_id uuid not null references public.schedule_scenarios(id) on delete cascade,
  title text not null,
  source_basis_revision integer,
  source_snapshot jsonb not null,
  diagnostic_summary jsonb not null default '{}'::jsonb,
  non_publishable boolean not null default true check (non_publishable),
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_schedule_diagnostic_sandboxes_tenant_created
  on public.schedule_diagnostic_sandboxes(institution_code, created_at desc);

alter table public.schedule_diagnostic_sandboxes enable row level security;
revoke all on public.schedule_diagnostic_sandboxes from public, anon, authenticated;

create or replace function public.create_schedule_diagnostic_sandbox_v1(
  p_source_scenario_id uuid,
  p_title text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_source public.schedule_scenarios%rowtype;
  v_sandbox_id uuid;
  v_rows jsonb;
  v_unplaced jsonb;
begin
  perform public.open_permission_context('schedule.generate');

  select * into v_source
  from public.schedule_scenarios
  where id=p_source_scenario_id
    and institution_code=public.current_tenant_code();
  if not found then
    raise exception 'SCENARIO_NOT_FOUND';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'requirement_id', r.requirement_id,
    'teacher_assignment_id', r.teacher_assignment_id,
    'teacher_id', r.teacher_id,
    'class_id', r.class_id,
    'weekday', r.weekday,
    'period', r.period,
    'class_name', r.class_name,
    'subject', r.subject,
    'classroom_id', r.classroom_id,
    'subgroup_id', r.subgroup_id,
    'subgroup_key', r.subgroup_key,
    'locked', r.locked
  ) order by r.weekday, r.period, r.class_name, r.subject),'[]'::jsonb)
  into v_rows
  from public.schedule_scenario_rows r
  where r.scenario_id=v_source.id
    and r.institution_code=v_source.institution_code;

  select coalesce(jsonb_agg(jsonb_build_object(
    'requirement_id', u.requirement_id,
    'teacher_assignment_id', u.teacher_assignment_id,
    'class_id', u.class_id,
    'subject', u.subject,
    'reason', u.reason,
    'block_hours', u.block_hours,
    'diagnostic', u.diagnostic
  ) order by u.created_at),'[]'::jsonb)
  into v_unplaced
  from public.schedule_unplaced_items u
  where u.scenario_id=v_source.id
    and u.institution_code=v_source.institution_code;

  insert into public.schedule_diagnostic_sandboxes(
    institution_code,source_scenario_id,title,source_basis_revision,
    source_snapshot,diagnostic_summary,created_by
  ) values (
    v_source.institution_code,
    v_source.id,
    coalesce(nullif(btrim(p_title),''),'Tanı sandboxı · '||v_source.title),
    v_source.basis_revision,
    jsonb_build_object('scenario',jsonb_build_object(
      'id',v_source.id,'title',v_source.title,'score',v_source.score,
      'row_count',v_source.row_count,'unplaced_count',v_source.unplaced_count,
      'generated_at',v_source.generated_at
    ),'rows',v_rows,'unplaced',v_unplaced),
    jsonb_build_object('mode','diagnostic_only','canonical_apply_allowed',false,
      'canonical_publish_allowed',false,'hard_rules_relaxed',false,
      'row_count',jsonb_array_length(v_rows),'unplaced_count',jsonb_array_length(v_unplaced)),
    auth.uid()
  ) returning id into v_sandbox_id;

  return v_sandbox_id;
end;
$$;

create or replace function public.reject_schedule_diagnostic_sandbox_publish_v1(p_sandbox_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  perform public.open_permission_context('schedule.apply');
  if not exists(
    select 1 from public.schedule_diagnostic_sandboxes
    where id=p_sandbox_id and institution_code=public.current_tenant_code()
  ) then
    raise exception 'DIAGNOSTIC_SANDBOX_NOT_FOUND';
  end if;
  raise exception 'DIAGNOSTIC_SANDBOX_NOT_PUBLISHABLE';
end;
$$;

revoke all on function public.create_schedule_diagnostic_sandbox_v1(uuid,text) from public, anon;
revoke all on function public.reject_schedule_diagnostic_sandbox_publish_v1(uuid) from public, anon;
grant execute on function public.create_schedule_diagnostic_sandbox_v1(uuid,text) to authenticated;
grant execute on function public.reject_schedule_diagnostic_sandbox_publish_v1(uuid) to authenticated;
