-- Preserve curriculum history when a formal decision renames, splits or merges courses.
create table if not exists public.official_course_transition_mappings (
  id uuid primary key default gen_random_uuid(),
  source_course_id uuid not null references public.course_catalog(id) on delete restrict,
  target_course_id uuid not null references public.course_catalog(id) on delete restrict,
  transition_kind text not null check (transition_kind in ('RENAME','SPLIT','MERGE','REPLACED','RETIRED')),
  effective_from date not null,
  decision_no text not null,
  reason text not null check (length(btrim(reason)) >= 10),
  approved_by uuid not null references public.profiles(user_id) on delete restrict,
  approved_at timestamptz not null default now(),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(source_course_id,target_course_id,transition_kind,effective_from)
);
alter table public.official_course_transition_mappings enable row level security;
revoke all on table public.official_course_transition_mappings from anon, authenticated;

create or replace function public.upsert_official_course_transition_mapping_v1(p_source_course_id uuid,p_target_course_id uuid,p_transition_kind text,p_effective_from date,p_decision_no text,p_reason text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
  if not public.is_super_admin() then raise exception 'SUPER_ADMIN_REQUIRED'; end if;
  if p_source_course_id=p_target_course_id and p_transition_kind<>'RETIRED' then raise exception 'COURSE_TRANSITION_REQUIRES_DIFFERENT_COURSES'; end if;
  if length(btrim(coalesce(p_reason,'')))<10 or nullif(btrim(p_decision_no),'') is null then raise exception 'COURSE_TRANSITION_REASON_AND_DECISION_REQUIRED'; end if;
  insert into public.official_course_transition_mappings(source_course_id,target_course_id,transition_kind,effective_from,decision_no,reason,approved_by)
  values(p_source_course_id,p_target_course_id,p_transition_kind,p_effective_from,btrim(p_decision_no),btrim(p_reason),auth.uid())
  on conflict(source_course_id,target_course_id,transition_kind,effective_from) do update set decision_no=excluded.decision_no,reason=excluded.reason,approved_by=auth.uid(),approved_at=now(),active=true
  returning id into v_id;
  return v_id;
end $$;
revoke all on function public.upsert_official_course_transition_mapping_v1(uuid,uuid,text,date,text,text) from public;
grant execute on function public.upsert_official_course_transition_mapping_v1(uuid,uuid,text,date,text,text) to authenticated;