begin;
create table if not exists public.official_vocational_framework_sources(
 id uuid primary key default gen_random_uuid(),
 institution_type text not null check(institution_type in ('MTAL','MESEM')),
 grade_level smallint not null check(grade_level between 9 and 12),
 portal_program_name text not null,
 field_id uuid references public.official_vocational_fields(id) on delete set null,
 program_year smallint,
 decision_no text,
 source_url text not null,
 applicability_status text not null default 'CURRENTLY_VALID' check(applicability_status in ('CURRENTLY_VALID','TRANSITIONALLY_VALID','REVIEW_REQUIRED')),
 needs_review boolean not null default false,
 source_note text,
 active boolean not null default true,
 updated_at timestamptz not null default now(),
 unique(institution_type,grade_level,portal_program_name,source_url)
);
create index if not exists idx_voc_framework_sources_live on public.official_vocational_framework_sources(institution_type,grade_level,portal_program_name) where active;
alter table public.official_vocational_framework_sources enable row level security;
drop policy if exists authenticated_read_voc_framework_sources on public.official_vocational_framework_sources;
create policy authenticated_read_voc_framework_sources on public.official_vocational_framework_sources for select to authenticated using(true);
create or replace function public.upsert_official_vocational_framework_sources_batch(p_rows jsonb)
returns integer language plpgsql security definer set search_path=public as $$
declare r jsonb; n int:=0; f uuid;
begin
 if jsonb_typeof(p_rows)<>'array' then raise exception 'ROWS_MUST_BE_ARRAY'; end if;
 for r in select value from jsonb_array_elements(p_rows) loop
  f:=null;
  if nullif(r->>'fieldName','') is not null then select id into f from public.official_vocational_fields where institution_type=r->>'institutionType' and field_name=r->>'fieldName' and source_scope='CURRENT' and active limit 1; end if;
  insert into public.official_vocational_framework_sources(institution_type,grade_level,portal_program_name,field_id,program_year,decision_no,source_url,applicability_status,needs_review,source_note,active,updated_at)
  values(r->>'institutionType',(r->>'gradeLevel')::smallint,r->>'portalProgramName',f,nullif(r->>'programYear','')::smallint,r->>'decisionNo',r->>'sourceUrl',coalesce(r->>'applicabilityStatus','CURRENTLY_VALID'),coalesce((r->>'needsReview')::boolean,false),r->>'sourceNote',true,now())
  on conflict(institution_type,grade_level,portal_program_name,source_url) do update set field_id=excluded.field_id,program_year=excluded.program_year,decision_no=excluded.decision_no,applicability_status=excluded.applicability_status,needs_review=excluded.needs_review,source_note=excluded.source_note,active=true,updated_at=now();
  n:=n+1;
 end loop;
 return n;
end $$;
commit;
