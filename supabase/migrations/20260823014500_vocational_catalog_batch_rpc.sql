begin;
create or replace function public.upsert_official_vocational_catalog_batch(p_rows jsonb)
returns table(field_count integer,branch_count integer)
language plpgsql security definer set search_path=public as $$
declare r jsonb; b jsonb; f_id uuid; fc int:=0; bc int:=0;
begin
 if jsonb_typeof(p_rows)<>'array' then raise exception 'ROWS_MUST_BE_ARRAY'; end if;
 for r in select value from jsonb_array_elements(p_rows) loop
  insert into public.official_vocational_fields(institution_type,field_name,source_scope,source_url,source_note,active,updated_at)
  values(r->>'institutionType',r->>'fieldName',coalesce(r->>'sourceScope','CURRENT'),r->>'sourceUrl',r->>'sourceNote',true,now())
  on conflict(institution_type,field_name,source_scope) do update set source_url=excluded.source_url,source_note=excluded.source_note,active=true,updated_at=now()
  returning id into f_id; fc:=fc+1;
  for b in select value from jsonb_array_elements(coalesce(r->'branches','[]'::jsonb)) loop
   insert into public.official_vocational_branches(field_id,branch_name,source_url,source_note,active,updated_at)
   values(f_id,b->>'name',coalesce(b->>'sourceUrl',r->>'sourceUrl'),coalesce(b->>'sourceNote',r->>'sourceNote'),true,now())
   on conflict(field_id,branch_name) do update set source_url=excluded.source_url,source_note=excluded.source_note,active=true,updated_at=now();
   bc:=bc+1;
  end loop;
 end loop;
 field_count:=fc;branch_count:=bc;return next;
end $$;
commit;
