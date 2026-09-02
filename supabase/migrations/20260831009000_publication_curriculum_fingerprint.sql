alter table public.schedule_publications add column if not exists curriculum_hash text;

create or replace function public.capture_publication_curriculum_fingerprint_v1()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_payload text;
begin
  select string_agg(concat_ws('|',r.class_id::text,r.course_id::text,r.weekly_hours::text,r.category,coalesce(r.source_template_id::text,''),coalesce(r.note,''),r.locked::text),E'\n' order by r.class_id,r.course_id)
  into v_payload
  from public.class_course_requirements r
  where public.tenant_row_allowed(r.institution_code);
  new.curriculum_hash := encode(digest(coalesce(v_payload,''),'sha256'),'hex');
  return new;
end $$;
drop trigger if exists trg_capture_publication_curriculum_fingerprint_v1 on public.schedule_publications;
create trigger trg_capture_publication_curriculum_fingerprint_v1
before insert on public.schedule_publications for each row execute function public.capture_publication_curriculum_fingerprint_v1();
revoke all on function public.capture_publication_curriculum_fingerprint_v1() from public;