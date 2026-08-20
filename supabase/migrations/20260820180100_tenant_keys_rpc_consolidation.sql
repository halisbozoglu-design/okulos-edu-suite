-- OkulOS tenant business-key and SECURITY DEFINER consolidation.
-- Kept as one companion migration to the schema-wide tenant fence instead of dozens
-- of table-by-table patches.

-- Drop UNIQUE constraints that were valid in the original single-school schema but
-- would incorrectly block the same school number/class/date/person in another tenant.
create or replace function public.drop_unique_constraint_by_columns(p_table text,p_columns text[])
returns void language plpgsql security definer set search_path=public as $$
declare r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid=c.conrelid
    join pg_namespace n on n.oid=t.relnamespace
    where n.nspname='public' and t.relname=p_table and c.contype='u'
      and (select array_agg(a.attname order by x.ord)
           from unnest(c.conkey) with ordinality x(attnum,ord)
           join pg_attribute a on a.attrelid=t.oid and a.attnum=x.attnum)=p_columns
  loop
    execute format('alter table public.%I drop constraint %I',p_table,r.conname);
  end loop;
end $$;
revoke all on function public.drop_unique_constraint_by_columns(text,text[]) from public;

select public.drop_unique_constraint_by_columns('school_classes',array['class_name','program_type']);
select public.drop_unique_constraint_by_columns('students',array['school_number']);
select public.drop_unique_constraint_by_columns('pre_registered_teachers',array['tckn']);
select public.drop_unique_constraint_by_columns('personnel_registry',array['full_name','teaching_area_raw','duty_title']);
select public.drop_unique_constraint_by_columns('teacher_schedule',array['teacher_id','weekday','period']);
select public.drop_unique_constraint_by_columns('crisis_reports',array['teacher_id','report_date']);
select public.drop_unique_constraint_by_columns('absences',array['teacher_id','absence_date']);
select public.drop_unique_constraint_by_columns('absence_lessons',array['teacher_id','lesson_date','period']);

-- The e-Okul composite-key unique index was an index rather than a constraint.
drop index if exists public.uq_school_classes_composite_key;

create unique index if not exists uq_school_classes_tenant_composite_key
  on public.school_classes(institution_code,composite_key) where composite_key is not null;
create unique index if not exists uq_school_classes_tenant_name_program
  on public.school_classes(institution_code,class_name,coalesce(program_type,''));
create unique index if not exists uq_students_tenant_school_number
  on public.students(institution_code,school_number);
create unique index if not exists uq_pre_registered_teachers_tenant_tckn
  on public.pre_registered_teachers(institution_code,tckn);
create unique index if not exists uq_personnel_registry_tenant_identity
  on public.personnel_registry(institution_code,full_name,coalesce(teaching_area_raw,''),coalesce(duty_title,''));
create unique index if not exists uq_teacher_schedule_tenant_slot
  on public.teacher_schedule(institution_code,teacher_id,weekday,period);
create unique index if not exists uq_crisis_reports_tenant_day
  on public.crisis_reports(institution_code,teacher_id,report_date);
create unique index if not exists uq_absences_tenant_day
  on public.absences(institution_code,teacher_id,absence_date);
create unique index if not exists uq_absence_lessons_tenant_slot
  on public.absence_lessons(institution_code,teacher_id,lesson_date,period);

-- duty_rotation used the DATE itself as a primary key. Make the date reusable by every tenant.
do $$
declare v_pk text;
begin
  select c.conname into v_pk
  from pg_constraint c join pg_class t on t.oid=c.conrelid join pg_namespace n on n.oid=t.relnamespace
  where n.nspname='public' and t.relname='duty_rotation' and c.contype='p' limit 1;
  if v_pk is not null then
    execute format('alter table public.duty_rotation drop constraint %I',v_pk);
  end if;
  if not exists(select 1 from pg_constraint c join pg_class t on t.oid=c.conrelid join pg_namespace n on n.oid=t.relnamespace
                where n.nspname='public' and t.relname='duty_rotation' and c.contype='p') then
    alter table public.duty_rotation add constraint duty_rotation_pkey primary key(institution_code,duty_date);
  end if;
end $$;

-- Student roster import: every write and conflict target is tenant-scoped.
create or replace function public.import_eokul_roster(p_file_name text,p_file_type text,p_rows jsonb)
returns table(import_batch_id uuid,imported_students integer,affected_classes integer)
language plpgsql security definer set search_path=public as $$
declare
  v_code text;v_batch uuid;v_row jsonb;v_class_id uuid;v_key text;v_class_name text;
  v_program text;v_grade smallint;v_section text;v_students integer:=0;v_classes text[]:='{}';
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  v_code:=public.get_my_institution_code();
  if v_code is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if not exists(select 1 from public.institutions i where i.institution_code=v_code and i.status='active' and i.approval_status='approved') then raise exception 'TENANT_NOT_APPROVED'; end if;
  if p_file_type not in ('pdf','xlsx','xls') then raise exception 'UNSUPPORTED_FILE_TYPE'; end if;
  if jsonb_typeof(p_rows)<>'array' then raise exception 'INVALID_ROWS'; end if;

  insert into public.eokul_import_batches(institution_code,imported_by,file_name,file_type,row_count)
  values(v_code,auth.uid(),p_file_name,p_file_type,jsonb_array_length(p_rows)) returning id into v_batch;

  for v_row in select value from jsonb_array_elements(p_rows) loop
    v_class_name:=trim(v_row->>'className');v_program:=nullif(trim(v_row->>'programType'),'');
    v_grade:=nullif(v_row->>'gradeLevel','')::smallint;v_section:=nullif(trim(v_row->>'section'),'');
    v_key:=public.normalize_class_key(v_class_name,v_program);
    if coalesce(v_class_name,'')='' or coalesce(trim(v_row->>'schoolNumber'),'')='' or coalesce(trim(v_row->>'fullName'),'')='' then raise exception 'INVALID_STUDENT_ROW'; end if;

    insert into public.school_classes(institution_code,class_name,program_type,grade_level,section,composite_key,source,updated_at)
    values(v_code,v_class_name,v_program,v_grade,v_section,v_key,'eokul',now())
    on conflict(institution_code,composite_key) where composite_key is not null do update set
      class_name=excluded.class_name,program_type=excluded.program_type,
      grade_level=coalesce(excluded.grade_level,public.school_classes.grade_level),
      section=coalesce(excluded.section,public.school_classes.section),source='eokul',updated_at=now()
    returning id into v_class_id;

    insert into public.students(institution_code,school_number,full_name,class_id,active,source,import_batch_id,updated_at)
    values(v_code,trim(v_row->>'schoolNumber'),trim(v_row->>'fullName'),v_class_id,true,'eokul',v_batch,now())
    on conflict(institution_code,school_number) do update set
      full_name=excluded.full_name,class_id=excluded.class_id,active=true,source='eokul',import_batch_id=excluded.import_batch_id,updated_at=now();
    v_students:=v_students+1;if not(v_key=any(v_classes)) then v_classes:=array_append(v_classes,v_key);end if;
  end loop;
  return query select v_batch,v_students,coalesce(array_length(v_classes,1),0);
end $$;
revoke all on function public.import_eokul_roster(text,text,jsonb) from public;
grant execute on function public.import_eokul_roster(text,text,jsonb) to authenticated;

-- MEB class-summary import: zero-student branches remain valid and uniqueness is per tenant.
create or replace function public.import_class_summaries(p_file_name text,p_rows jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r jsonb;v_id uuid;v_count integer:=0;v_code text;
begin
  if not public.has_permission(auth.uid(),'classes.manage') then raise exception 'FORBIDDEN'; end if;
  v_code:=public.get_my_institution_code();if v_code is null then raise exception 'TENANT_CONTEXT_REQUIRED';end if;
  for r in select * from jsonb_array_elements(coalesce(p_rows,'[]'::jsonb)) loop
    insert into public.school_classes(institution_code,class_name,program_type,composite_key,active,source_file_name,imported_student_count)
    values(v_code,nullif(r->>'className',''),nullif(r->>'programType',''),coalesce(nullif(r->>'compositeKey',''),concat_ws(' - ',nullif(r->>'className',''),nullif(r->>'programType',''))),true,p_file_name,coalesce((r->>'studentCount')::integer,0))
    on conflict(institution_code,composite_key) where composite_key is not null do update set
      program_type=excluded.program_type,active=true,source_file_name=excluded.source_file_name,imported_student_count=excluded.imported_student_count,updated_at=now()
    returning id into v_id;v_count:=v_count+1;
  end loop;
  return jsonb_build_object('affected_classes',v_count,'institution_code',v_code);
end $$;
revoke all on function public.import_class_summaries(text,jsonb) from public;
grant execute on function public.import_class_summaries(text,jsonb) to authenticated;

-- Full MEBBİS personnel import: source institution may confirm the tenant, never switch it.
create or replace function public.import_personnel_registry(p_file_name text,p_rows jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r jsonb;n jsonb;v_id uuid;v_uid uuid;v_count int:=0;v_raw jsonb;v_labels jsonb;v_pair record;v_key text;v_label text;v_format text;v_code text;v_source_code text;v_roles text[];
begin
  if not public.is_principal_user() then raise exception 'FORBIDDEN_PRINCIPAL_ONLY'; end if;
  v_code:=public.get_my_principal_institution_code();if v_code is null then raise exception 'TENANT_CONTEXT_REQUIRED';end if;
  v_format:=lower(coalesce(nullif(regexp_replace(p_file_name,'^.*\\.',''),''),'unknown'));
  for r in select * from jsonb_array_elements(coalesce(p_rows,'[]'::jsonb)) loop
    n:=coalesce(r->'normalized','{}'::jsonb);v_source_code:=nullif(n->>'institutionCode','');
    if v_source_code is not null and v_source_code<>v_code then raise exception 'SOURCE_TENANT_MISMATCH';end if;
    v_roles:=array(select jsonb_array_elements_text(coalesce(r->'derivedRoles','[]'::jsonb)));
    insert into public.personnel_registry(institution_code,full_name,title,duty_title,teaching_area_raw,employment_status,system_role,source_file_name,derived_roles)
    values(v_code,nullif(coalesce(n->>'fullName',r->>'fullName'),''),nullif(coalesce(n->>'baseTitle',r->>'title'),''),nullif(coalesce(n->>'dutyTitle',r->>'dutyTitle'),''),nullif(coalesce(n->>'teachingArea',r->>'teachingArea'),''),nullif(coalesce(n->>'personnelStatus',r->>'employmentStatus'),''),nullif(r->>'systemRole',''),p_file_name,coalesce(v_roles,'{}'))
    on conflict(institution_code,full_name,(coalesce(teaching_area_raw,'')),(coalesce(duty_title,''))) do update set
      title=excluded.title,employment_status=excluded.employment_status,system_role=excluded.system_role,source_file_name=excluded.source_file_name,derived_roles=excluded.derived_roles,active=true,updated_at=now()
    returning id into v_id;

    v_raw:=coalesce(r->'rawFields','{}'::jsonb);v_labels:=coalesce(r->'rawLabels','{}'::jsonb);
    insert into public.personnel_private_details(personnel_id,institution_code,province,district,institution_name,tc_identity_no,personnel_status,grade_step,base_title,duty_title,teaching_area,career_stage,education_status,institution_registry_no,retirement_registry_no,archive_no,gender,blood_group,birth_date,first_service_date,raw_data,raw_labels,source_file_name,source_format,imported_at,updated_at)
    values(v_id,v_code,nullif(n->>'province',''),nullif(n->>'district',''),nullif(n->>'institutionName',''),nullif(n->>'tcIdentityNo',''),nullif(n->>'personnelStatus',''),nullif(n->>'gradeStep',''),nullif(n->>'baseTitle',''),nullif(n->>'dutyTitle',''),nullif(n->>'teachingArea',''),nullif(n->>'careerStage',''),nullif(n->>'educationStatus',''),nullif(n->>'institutionRegistryNo',''),nullif(n->>'retirementRegistryNo',''),nullif(n->>'archiveNo',''),nullif(n->>'gender',''),nullif(n->>'bloodGroup',''),nullif(n->>'birthDate','')::date,nullif(n->>'firstServiceDate','')::date,v_raw,v_labels,p_file_name,v_format,now(),now())
    on conflict(personnel_id) do update set institution_code=excluded.institution_code,province=excluded.province,district=excluded.district,institution_name=excluded.institution_name,tc_identity_no=excluded.tc_identity_no,personnel_status=excluded.personnel_status,grade_step=excluded.grade_step,base_title=excluded.base_title,duty_title=excluded.duty_title,teaching_area=excluded.teaching_area,career_stage=excluded.career_stage,education_status=excluded.education_status,institution_registry_no=excluded.institution_registry_no,retirement_registry_no=excluded.retirement_registry_no,archive_no=excluded.archive_no,gender=excluded.gender,blood_group=excluded.blood_group,birth_date=excluded.birth_date,first_service_date=excluded.first_service_date,raw_data=excluded.raw_data,raw_labels=excluded.raw_labels,source_file_name=excluded.source_file_name,source_format=excluded.source_format,imported_at=now(),updated_at=now();

    update public.personnel_import_payloads set is_current=false where institution_code=v_code and personnel_id=v_id and is_current;
    insert into public.personnel_import_payloads(institution_code,personnel_id,source_file_name,source_format,raw_data,is_current) values(v_code,v_id,p_file_name,v_format,v_raw,true);
    for v_pair in select key,value from jsonb_each(v_raw) loop
      v_key:=v_pair.key;v_label:=coalesce(nullif(v_labels->>v_key,''),v_key);
      insert into public.personnel_field_catalog(field_key,display_name,source_headers,last_seen_at) values(v_key,v_label,array[v_label],now())
      on conflict(field_key) do update set source_headers=(select array(select distinct x from unnest(public.personnel_field_catalog.source_headers||excluded.source_headers)x)),last_seen_at=now();
    end loop;

    select user_id into v_uid from public.profiles where institution_code=v_code and tckn=nullif(n->>'tcIdentityNo','') limit 1;
    if v_uid is not null then
      update public.personnel_registry set linked_user_id=v_uid where id=v_id and institution_code=v_code;
      update public.profiles set role=case when r->>'systemRole'='principal' then 'admin'::public.app_role when r->>'systemRole'='vice_principal' then 'manager'::public.app_role else 'teacher'::public.app_role end,updated_at=now() where user_id=v_uid and institution_code=v_code;
      insert into public.institution_memberships(institution_code,user_id,membership_role,is_owner,active)
      values(v_code,v_uid,case when r->>'systemRole'='principal' then 'principal' when r->>'systemRole'='vice_principal' then 'vice_principal' when 'guidance_teacher'=any(v_roles) then 'guidance_teacher' else 'teacher' end,false,true)
      on conflict(institution_code,user_id) do update set membership_role=excluded.membership_role,active=true,updated_at=now();
    end if;
    v_count:=v_count+1;
  end loop;
  return jsonb_build_object('affected_personnel',v_count,'institution_code',v_code);
end $$;
revoke all on function public.import_personnel_registry(text,jsonb) from public;
grant execute on function public.import_personnel_registry(text,jsonb) to authenticated;

-- Permission administration is tenant-local; Super Admin may still inspect/manage globally.
create or replace function public.set_user_permission(p_user_id uuid,p_permission_code text,p_enabled boolean,p_scope jsonb default '{}'::jsonb,p_valid_from date default null,p_valid_until date default null,p_note text default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare v_existing uuid;v_code text;v_target_code text;
begin
  if not public.can_manage_permissions() then raise exception 'NOT_AUTHORIZED';end if;
  if p_user_id=auth.uid() and not public.is_super_admin() then raise exception 'CANNOT_CHANGE_OWN_PERMISSION';end if;
  select institution_code into v_target_code from public.profiles where user_id=p_user_id;
  if not found then raise exception 'USER_NOT_FOUND';end if;
  if not public.is_super_admin() then
    v_code:=public.get_my_institution_code();if v_code is null then raise exception 'TENANT_CONTEXT_REQUIRED';end if;
    if v_target_code is distinct from v_code then raise exception 'CROSS_TENANT_PERMISSION_BLOCKED';end if;
  end if;
  if not exists(select 1 from public.permission_catalog where code=p_permission_code and active) then raise exception 'PERMISSION_NOT_FOUND';end if;
  if p_permission_code='permissions.manage' and not (public.is_super_admin() or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin' and p.institution_code=v_target_code)) then raise exception 'CANNOT_DELEGATE_PERMISSION_ADMIN';end if;
  select id into v_existing from public.user_permission_grants where user_id=p_user_id and permission_code=p_permission_code and scope=p_scope and active limit 1;
  if p_enabled then
    if v_existing is null then
      insert into public.user_permission_grants(institution_code,user_id,permission_code,scope,valid_from,valid_until,note,granted_by)
      values(v_target_code,p_user_id,p_permission_code,coalesce(p_scope,'{}'::jsonb),p_valid_from,p_valid_until,p_note,auth.uid());
      insert into public.permission_audit_log(institution_code,target_user_id,permission_code,operation,scope,note,actor_user_id)
      values(v_target_code,p_user_id,p_permission_code,'grant',coalesce(p_scope,'{}'::jsonb),p_note,auth.uid());
    else
      update public.user_permission_grants set valid_from=p_valid_from,valid_until=p_valid_until,note=p_note,updated_at=now() where id=v_existing and (public.is_super_admin() or institution_code=v_target_code);
      insert into public.permission_audit_log(institution_code,target_user_id,permission_code,operation,scope,note,actor_user_id)
      values(v_target_code,p_user_id,p_permission_code,'update',coalesce(p_scope,'{}'::jsonb),p_note,auth.uid());
    end if;
  elsif v_existing is not null then
    update public.user_permission_grants set active=false,updated_at=now() where id=v_existing and (public.is_super_admin() or institution_code=v_target_code);
    insert into public.permission_audit_log(institution_code,target_user_id,permission_code,operation,scope,note,actor_user_id)
    values(v_target_code,p_user_id,p_permission_code,'revoke',coalesce(p_scope,'{}'::jsonb),p_note,auth.uid());
  end if;
  return true;
end $$;

create or replace function public.get_permission_admin_matrix()
returns table(user_id uuid,full_name text,role public.app_role,permission_code text,scope jsonb,valid_from date,valid_until date)
language sql stable security definer set search_path=public as $$
  select p.user_id,p.full_name,p.role,g.permission_code,g.scope,g.valid_from,g.valid_until
  from public.profiles p left join public.user_permission_grants g on g.user_id=p.user_id and g.active and g.institution_code=p.institution_code
  where public.can_manage_permissions() and (public.is_super_admin() or p.institution_code=public.get_my_institution_code())
  order by p.full_name,g.permission_code;
$$;
revoke all on function public.set_user_permission(uuid,text,boolean,jsonb,date,date,text),public.get_permission_admin_matrix() from public;
grant execute on function public.set_user_permission(uuid,text,boolean,jsonb,date,date,text),public.get_permission_admin_matrix() to authenticated;

-- Tenant-aware manager check used by operational SECURITY DEFINER functions.
create or replace function public.is_manager_or_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_super_admin() or exists(
    select 1 from public.profiles p join public.institution_memberships m on m.user_id=p.user_id and m.institution_code=p.institution_code and m.active
    where p.user_id=auth.uid() and p.institution_code=public.get_my_institution_code() and p.role in ('manager','admin')
  );
$$;
revoke all on function public.is_manager_or_admin() from public;
grant execute on function public.is_manager_or_admin() to authenticated;

-- Substitute suggestion engine cannot inspect another tenant even though it is SECURITY DEFINER.
create or replace function public.suggest_substitutes_for_day(p_date date default current_date)
returns table(absence_lesson_id uuid,period smallint,class_id uuid,class_name text,subject text,candidate_user_id uuid,candidate_name text,candidate_role public.app_role,priority integer,weekly_load bigint,reason text)
language plpgsql stable security definer set search_path=public as $$
declare v_code text;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  v_code:=public.get_my_institution_code();if v_code is null then raise exception 'TENANT_CONTEXT_REQUIRED';end if;
  return query
  with empty_lessons as (
    select al.* from public.absence_lessons al
    left join public.substitute_assignments sa on sa.absence_lesson_id=al.id and sa.institution_code=v_code
    where al.institution_code=v_code and al.lesson_date=p_date and sa.id is null
  ),candidate_pool as (
    select el.id lesson_id,tda.teacher_id user_id,1 priority,'Nöbetçi öğretmen'::text reason
    from empty_lessons el join public.teacher_duty_assignments tda on tda.institution_code=v_code and tda.duty_date=p_date
    join public.profiles p on p.user_id=tda.teacher_id and p.institution_code=v_code and p.role='teacher'
    union all
    select el.id,dr.vice_principal_id,2,'Nöbetçi müdür yardımcısı' from empty_lessons el join public.duty_rotation dr on dr.institution_code=v_code and dr.duty_date=p_date
    union all
    select el.id,vp.user_id,3,'Diğer uygun müdür yardımcısı' from empty_lessons el join public.vice_principals vp on vp.institution_code=v_code and vp.active
    where vp.user_id<>coalesce((select vice_principal_id from public.duty_rotation where institution_code=v_code and duty_date=p_date),'00000000-0000-0000-0000-000000000000'::uuid)
  ),eligible as (
    select cp.lesson_id,cp.user_id,min(cp.priority) priority,min(cp.reason) reason,count(sa_week.id) weekly_load
    from candidate_pool cp join empty_lessons el on el.id=cp.lesson_id
    left join public.substitute_assignments sa_week on sa_week.institution_code=v_code and sa_week.substitute_user_id=cp.user_id and sa_week.assigned_at>=date_trunc('week',p_date::timestamp) and sa_week.assigned_at<date_trunc('week',p_date::timestamp)+interval '7 days'
    where cp.user_id<>el.teacher_id
      and not exists(select 1 from public.absences a where a.institution_code=v_code and a.teacher_id=cp.user_id and a.absence_date=p_date and a.status<>'resolved')
      and not exists(select 1 from public.teacher_schedule ts where ts.institution_code=v_code and ts.teacher_id=cp.user_id and ts.weekday=extract(isodow from p_date)::smallint and ts.period=el.period)
      and not exists(select 1 from public.substitute_assignments sa2 join public.absence_lessons al2 on al2.id=sa2.absence_lesson_id where sa2.institution_code=v_code and al2.institution_code=v_code and sa2.substitute_user_id=cp.user_id and al2.lesson_date=p_date and al2.period=el.period)
    group by cp.lesson_id,cp.user_id
  ),ranked as(select e.*,row_number() over(partition by e.lesson_id order by e.priority,e.weekly_load,e.user_id) rn from eligible e)
  select el.id,el.period,el.class_id,el.class_name,el.subject,r.user_id,p.full_name,p.role,r.priority,r.weekly_load,r.reason
  from empty_lessons el join ranked r on r.lesson_id=el.id and r.rn<=5 join public.profiles p on p.user_id=r.user_id and p.institution_code=v_code
  order by el.period,el.class_name,r.rn;
end $$;
revoke all on function public.suggest_substitutes_for_day(date) from public;
grant execute on function public.suggest_substitutes_for_day(date) to authenticated;

-- Assignment engine is similarly scoped, including workload counts and final return set.
create or replace function public.assign_substitutes_for_day(p_date date default current_date)
returns table(assignment_id uuid,absence_lesson_id uuid,substitute_user_id uuid,substitute_name text,period smallint,class_name text,subject text)
language plpgsql security definer set search_path=public as $$
declare v_code text;v_lesson record;v_candidate uuid;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  v_code:=public.get_my_institution_code();if v_code is null then raise exception 'TENANT_CONTEXT_REQUIRED';end if;
  for v_lesson in select al.* from public.absence_lessons al left join public.substitute_assignments sa on sa.absence_lesson_id=al.id and sa.institution_code=v_code where al.institution_code=v_code and al.lesson_date=p_date and sa.id is null order by al.period,al.class_name loop
    with candidate_pool as(
      select tda.teacher_id user_id,1 priority from public.teacher_duty_assignments tda join public.profiles p on p.user_id=tda.teacher_id and p.institution_code=v_code and p.role='teacher' where tda.institution_code=v_code and tda.duty_date=p_date
      union all select dr.vice_principal_id,2 from public.duty_rotation dr where dr.institution_code=v_code and dr.duty_date=p_date
      union all select vp.user_id,3 from public.vice_principals vp where vp.institution_code=v_code and vp.active and vp.user_id<>coalesce((select dr.vice_principal_id from public.duty_rotation dr where dr.institution_code=v_code and dr.duty_date=p_date),'00000000-0000-0000-0000-000000000000'::uuid)
    ),eligible as(
      select distinct on(cp.user_id) cp.user_id,cp.priority,(select count(*) from public.substitute_assignments sa2 where sa2.institution_code=v_code and sa2.substitute_user_id=cp.user_id and sa2.assigned_at>=date_trunc('month',p_date::timestamp) and sa2.assigned_at<date_trunc('month',p_date::timestamp)+interval '1 month') monthly_load
      from candidate_pool cp where cp.user_id<>v_lesson.teacher_id
       and not exists(select 1 from public.crisis_reports cr where cr.institution_code=v_code and cr.teacher_id=cp.user_id and cr.report_date=p_date and cr.status<>'closed')
       and not exists(select 1 from public.teacher_schedule ts where ts.institution_code=v_code and ts.teacher_id=cp.user_id and ts.weekday=extract(isodow from p_date)::smallint and ts.period=v_lesson.period)
       and not exists(select 1 from public.substitute_assignments sa3 join public.absence_lessons al3 on al3.id=sa3.absence_lesson_id where sa3.institution_code=v_code and al3.institution_code=v_code and sa3.substitute_user_id=cp.user_id and al3.lesson_date=p_date and al3.period=v_lesson.period)
      order by cp.user_id,cp.priority
    ) select e.user_id into v_candidate from eligible e order by e.priority,e.monthly_load,e.user_id limit 1;
    if v_candidate is null then raise exception 'NO_SUBSTITUTE_AVAILABLE: period %, class %',v_lesson.period,v_lesson.class_name;end if;
    insert into public.substitute_assignments(institution_code,absence_lesson_id,substitute_user_id,assigned_by) values(v_code,v_lesson.id,v_candidate,auth.uid());
  end loop;
  update public.crisis_reports cr set status='assigned' where cr.institution_code=v_code and cr.report_date=p_date and not exists(select 1 from public.absence_lessons al left join public.substitute_assignments sa on sa.absence_lesson_id=al.id and sa.institution_code=v_code where al.institution_code=v_code and al.crisis_report_id=cr.id and sa.id is null);
  return query select sa.id,al.id,sa.substitute_user_id,p.full_name,al.period,al.class_name,al.subject from public.substitute_assignments sa join public.absence_lessons al on al.id=sa.absence_lesson_id and al.institution_code=v_code join public.profiles p on p.user_id=sa.substitute_user_id and p.institution_code=v_code where sa.institution_code=v_code and al.lesson_date=p_date order by al.period,al.class_name;
end $$;
revoke all on function public.assign_substitutes_for_day(date) from public;
grant execute on function public.assign_substitutes_for_day(date) to authenticated;

-- Absence notification trigger must select the duty VP from the same institution.
create or replace function public.notify_duty_vp_of_absence()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_vp uuid;v_teacher text;
begin
  select vice_principal_id into v_vp from public.duty_rotation where institution_code=new.institution_code and duty_date=new.absence_date;
  if v_vp is null then return new;end if;
  select coalesce(full_name,'Öğretmen') into v_teacher from public.profiles where user_id=new.teacher_id and institution_code=new.institution_code;
  insert into public.notifications(user_id,type,priority,title,message,action_label,action_url) values(v_vp,'crisis','critical','Sabah devamsızlık bildirimi',format('%s bugün devamsızlık bildirdi%s. Boş dersleri ve vekalet önerilerini kontrol edin.',v_teacher,case when new.has_medical_report then ' (raporu var)' else '' end),'Vekalet Yönetimi','/substitutes');
  return new;
end $$;

-- Audit remaining tenant tables for global UNIQUE/PRIMARY business keys so future modules can be
-- corrected in this same consolidated pattern before production multi-tenant rollout.
create or replace function public.super_admin_tenant_key_audit()
returns table(table_name text,constraint_name text,constraint_type text,columns text[])
language sql stable security definer set search_path=public as $$
 select t.relname,c.conname,case c.contype when 'p' then 'primary' else 'unique' end,
   array(select a.attname from unnest(c.conkey) with ordinality x(attnum,ord) join pg_attribute a on a.attrelid=t.oid and a.attnum=x.attnum order by x.ord)
 from pg_constraint c join pg_class t on t.oid=c.conrelid join pg_namespace n on n.oid=t.relnamespace join public.tenant_scope_registry s on s.table_name=t.relname and s.scope='tenant'
 where n.nspname='public' and c.contype in('p','u')
   and not exists(select 1 from unnest(c.conkey) x(attnum) join pg_attribute a on a.attrelid=t.oid and a.attnum=x.attnum where a.attname='institution_code')
   and not (c.contype='p' and array_length(c.conkey,1)=1 and exists(select 1 from unnest(c.conkey) x(attnum) join pg_attribute a on a.attrelid=t.oid and a.attnum=x.attnum where a.attname='id'))
   and public.is_super_admin()
 order by t.relname,c.conname;
$$;
revoke all on function public.super_admin_tenant_key_audit() from public;
grant execute on function public.super_admin_tenant_key_audit() to authenticated;
