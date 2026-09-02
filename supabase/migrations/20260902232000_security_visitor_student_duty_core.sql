begin;

alter table public.duty_locations
  add column if not exists visitor_entry_enabled boolean not null default false,
  add column if not exists student_duty_enabled boolean not null default false,
  add column if not exists gender_rule text not null default 'any',
  add column if not exists student_capacity smallint not null default 0,
  add column if not exists code text,
  add column if not exists kind text;

alter table public.students add column if not exists gender text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname='students_gender_chk') then
    alter table public.students add constraint students_gender_chk check (gender is null or gender in ('male','female'));
  end if;
  if not exists (select 1 from pg_constraint where conname='duty_locations_gender_rule_chk') then
    alter table public.duty_locations add constraint duty_locations_gender_rule_chk check (gender_rule in ('any','male','female'));
  end if;
end $$;

create table if not exists public.visitor_people (
  id uuid primary key default gen_random_uuid(), institution_code text default current_tenant_code() references public.institutions(institution_code) on delete restrict,
  full_name text not null, phone text, tc_hash text, tc_last4 text, source text not null default 'manual',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.visitor_people add column if not exists tc_hash text;
create unique index if not exists visitor_people_tenant_tc_hash_uq on public.visitor_people(institution_code,tc_hash) where tc_hash is not null;

create table if not exists public.visitor_student_relations (
  id uuid primary key default gen_random_uuid(), institution_code text not null default current_tenant_code() references public.institutions(institution_code) on delete restrict,
  visitor_person_id uuid not null references public.visitor_people(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relation_type text not null default 'guardian', pickup_allowed boolean not null default false, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(institution_code,visitor_person_id,student_id)
);

create table if not exists public.visitor_visits (
  id uuid primary key default gen_random_uuid(), institution_code text default current_tenant_code() references public.institutions(institution_code) on delete restrict,
  visitor_person_id uuid not null references public.visitor_people(id) on delete restrict,
  entry_location_id uuid references public.duty_locations(id) on delete set null, exit_location_id uuid references public.duty_locations(id) on delete set null,
  related_student_id uuid references public.students(id) on delete set null, person_to_meet_user_id uuid references public.profiles(user_id) on delete set null,
  visit_reason text, card_no text, status text not null default 'pending_approval', entry_at timestamptz not null default now(), exit_at timestamptz,
  entered_by uuid references public.profiles(user_id) on delete set null, exited_by uuid references public.profiles(user_id) on delete set null,
  physical_id_seen boolean not null default false, identity_method text not null default 'manual', identity_verified_at timestamptz,
  identity_verified_by uuid references public.profiles(user_id) on delete set null, phone_used text, cancellation_reason text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname='visitor_visits_status_chk') then
    alter table public.visitor_visits add constraint visitor_visits_status_chk check(status in ('pending_approval','inside','exited','cancelled','rejected'));
  end if;
  if not exists (select 1 from pg_constraint where conname='visitor_visits_identity_method_chk') then
    alter table public.visitor_visits add constraint visitor_visits_identity_method_chk check(identity_method in ('camera_live','manual'));
  end if;
  if not exists (select 1 from pg_constraint where conname='visitor_visits_physical_id_chk') then
    alter table public.visitor_visits add constraint visitor_visits_physical_id_chk check(status <> 'inside' or (physical_id_seen and entered_by is not null and identity_verified_by is not null and identity_verified_at is not null));
  end if;
end $$;

create table if not exists public.visitor_access_restrictions (
  id uuid primary key default gen_random_uuid(), institution_code text default current_tenant_code() references public.institutions(institution_code) on delete restrict,
  visitor_person_id uuid references public.visitor_people(id) on delete cascade, related_student_id uuid references public.students(id) on delete cascade,
  restriction_type text not null default 'general', decision text not null default 'deny', starts_at timestamptz, ends_at timestamptz,
  legal_basis_type text, legal_basis_note text, is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.student_duty_settings (
  id uuid primary key default gen_random_uuid(), institution_code text default current_tenant_code() references public.institutions(institution_code) on delete restrict,
  academic_year_id uuid references public.academic_years(id) on delete cascade, included_grade_levels smallint[] not null default '{}', included_class_ids uuid[] not null default '{}',
  gender_rule_enabled boolean not null default false, daily_student_per_location smallint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists student_duty_settings_tenant_year_uq on public.student_duty_settings(institution_code,academic_year_id);

create table if not exists public.student_duty_exemptions (
  id uuid primary key default gen_random_uuid(), institution_code text default current_tenant_code() references public.institutions(institution_code) on delete restrict,
  student_id uuid not null references public.students(id) on delete cascade, starts_on date not null, ends_on date, reason text, is_active boolean not null default true,
  created_by uuid references public.profiles(user_id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.student_duty_assignments (
  id uuid primary key default gen_random_uuid(), institution_code text default current_tenant_code() references public.institutions(institution_code) on delete restrict,
  academic_year_id uuid references public.academic_years(id) on delete set null, duty_date date not null, student_id uuid not null references public.students(id) on delete cascade,
  location_id uuid references public.duty_locations(id) on delete set null, assignment_source text not null default 'auto', responsible_teacher_user_id uuid references public.profiles(user_id) on delete set null,
  vice_principal_user_id uuid references public.profiles(user_id) on delete set null, presence_state text, checked_at timestamptz, checked_by uuid references public.profiles(user_id) on delete set null,
  manual_changed_by uuid references public.profiles(user_id) on delete set null, manual_changed_at timestamptz, manual_change_reason text, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.student_duty_assignments add column if not exists responsible_teacher_user_id uuid references public.profiles(user_id) on delete set null;
create unique index if not exists student_duty_one_place_per_day_uq on public.student_duty_assignments(institution_code,duty_date,student_id) where active;
create index if not exists student_duty_date_location_idx on public.student_duty_assignments(institution_code,duty_date,location_id) where active;

create table if not exists public.student_duty_generation_state (
  id uuid primary key default gen_random_uuid(), institution_code text default current_tenant_code() references public.institutions(institution_code) on delete restrict,
  academic_year_id uuid references public.academic_years(id) on delete cascade, last_generated_on date, rotation_cursor jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists student_duty_generation_state_tenant_year_uq on public.student_duty_generation_state(institution_code,academic_year_id);

create index if not exists visitor_visits_inside_idx on public.visitor_visits(institution_code,status,entry_at desc);
create index if not exists visitor_rel_student_idx on public.visitor_student_relations(institution_code,student_id) where active;
create index if not exists visitor_restriction_active_idx on public.visitor_access_restrictions(institution_code,visitor_person_id,related_student_id) where is_active;

alter table public.visitor_people enable row level security;
alter table public.visitor_student_relations enable row level security;
alter table public.visitor_visits enable row level security;
alter table public.visitor_access_restrictions enable row level security;
alter table public.student_duty_settings enable row level security;
alter table public.student_duty_exemptions enable row level security;
alter table public.student_duty_assignments enable row level security;
alter table public.student_duty_generation_state enable row level security;

do $$ declare t text; begin
  foreach t in array array['visitor_people','visitor_student_relations','visitor_visits','visitor_access_restrictions','student_duty_settings','student_duty_exemptions','student_duty_assignments','student_duty_generation_state'] loop
    if not exists(select 1 from pg_policies where schemaname='public' and tablename=t and policyname='tenant_boundary_'||t) then
      execute format('create policy %I on public.%I for all to authenticated using (tenant_row_allowed(institution_code)) with check (tenant_row_allowed(institution_code))','tenant_boundary_'||t,t);
    end if;
  end loop;
end $$;

do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='visitor_people' and policyname='security_ops_visitor_people') then
    create policy security_ops_visitor_people on public.visitor_people for all to authenticated using (has_permission('security.checkin') or has_permission('security.manage') or is_manager_or_admin()) with check (has_permission('security.checkin') or has_permission('security.manage') or is_manager_or_admin());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='visitor_student_relations' and policyname='security_ops_visitor_relations') then
    create policy security_ops_visitor_relations on public.visitor_student_relations for all to authenticated using (has_permission('security.checkin') or has_permission('security.manage') or is_manager_or_admin()) with check (has_permission('security.checkin') or has_permission('security.manage') or is_manager_or_admin());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='visitor_visits' and policyname='security_ops_visitor_visits') then
    create policy security_ops_visitor_visits on public.visitor_visits for all to authenticated using (has_permission('security.checkin') or has_permission('security.manage') or is_manager_or_admin()) with check (has_permission('security.checkin') or has_permission('security.manage') or is_manager_or_admin());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='visitor_access_restrictions' and policyname='security_manage_restrictions') then
    create policy security_manage_restrictions on public.visitor_access_restrictions for all to authenticated using (has_permission('security.manage') or is_manager_or_admin()) with check (has_permission('security.manage') or is_manager_or_admin());
  end if;
end $$;

insert into public.permission_catalog(code,module_code,module_label,label,action,description,dangerous,sort_order,active) values
 ('security.view','security','Güvenlik & Ziyaretçi','Güvenlik kayıtlarını görüntüle','view','Ziyaretçi ve nöbet kayıtlarını görüntüler',false,10,true),
 ('security.checkin','security','Güvenlik & Ziyaretçi','Ziyaretçi giriş/çıkış işlemi','operate','Fiziksel kimlik doğrulaması sonrası ziyaretçi giriş/çıkışı yapar',false,20,true),
 ('security.student_duty','security','Güvenlik & Ziyaretçi','Nöbetçi öğrenci yönetimi','manage','Öğrenci nöbet planını üretir ve kontrol eder',false,30,true),
 ('security.manage','security','Güvenlik & Ziyaretçi','Güvenlik yönetimi','manage','Kısıtlar, noktalar ve tüm güvenlik ayarlarını yönetir',true,40,true)
on conflict(code) do update set module_code=excluded.module_code,module_label=excluded.module_label,label=excluded.label,action=excluded.action,description=excluded.description,dangerous=excluded.dangerous,sort_order=excluded.sort_order,active=true;

create or replace function public.generate_student_duties_permission_core_v1(p_start date,p_end date,p_overwrite boolean default false)
returns integer language plpgsql security invoker set search_path=public as $$
declare v_tenant text:=current_tenant_code(); v_year uuid; v_settings public.student_duty_settings%rowtype; d date; l record; slot int; picked uuid; teacher uuid; made int:=0;
begin
  if p_start is null or p_end is null or p_end<p_start then raise exception 'Geçersiz tarih aralığı'; end if;
  if not (has_permission('security.student_duty') or has_permission('security.manage') or is_manager_or_admin()) then raise exception 'Yetkisiz işlem'; end if;
  select id into v_year from public.academic_years where active and p_start between starts_on and ends_on and (institution_code is null or institution_code=v_tenant) order by institution_code nulls last limit 1;
  if v_year is null then raise exception 'Aktif eğitim öğretim yılı bulunamadı'; end if;
  select * into v_settings from public.student_duty_settings where institution_code=v_tenant and academic_year_id=v_year limit 1;
  if v_settings.id is null then insert into public.student_duty_settings(institution_code,academic_year_id) values(v_tenant,v_year) returning * into v_settings; end if;
  if p_overwrite then delete from public.student_duty_assignments where institution_code=v_tenant and duty_date between p_start and p_end and assignment_source='auto'; end if;
  for d in select g::date from generate_series(p_start,p_end,interval '1 day') g where extract(isodow from g)<6 loop
    if exists(select 1 from public.school_calendar_events e where (e.institution_code is null or e.institution_code=v_tenant) and e.blocks_teaching and d between e.starts_on and e.ends_on) then continue; end if;
    for l in select * from public.duty_locations where active and student_duty_enabled and tenant_row_allowed(institution_code) order by sort_order,name loop
      for slot in 1..greatest(case when l.student_capacity>0 then l.student_capacity else v_settings.daily_student_per_location end,1) loop
        select s.id into picked
        from public.students s join public.school_classes c on c.id=s.class_id
        where s.active and c.active and tenant_row_allowed(s.institution_code) and tenant_row_allowed(c.institution_code)
          and (cardinality(v_settings.included_grade_levels)=0 or c.grade_level=any(v_settings.included_grade_levels))
          and (cardinality(v_settings.included_class_ids)=0 or s.class_id=any(v_settings.included_class_ids))
          and (not v_settings.gender_rule_enabled or l.gender_rule='any' or s.gender=l.gender_rule)
          and not exists(select 1 from public.student_duty_exemptions x where x.student_id=s.id and x.is_active and x.starts_on<=d and (x.ends_on is null or x.ends_on>=d))
          and not exists(select 1 from public.student_duty_assignments a where a.student_id=s.id and a.duty_date=d and a.active)
        order by (select count(*) from public.student_duty_assignments a where a.student_id=s.id and a.active),
                 (select max(a.duty_date) from public.student_duty_assignments a where a.student_id=s.id and a.active) nulls first,
                 c.grade_level nulls last,c.class_name,s.school_number,s.full_name,s.id
        limit 1;
        exit when picked is null;
        select t.teacher_id into teacher from public.teacher_duty_assignments t where t.duty_date=d and tenant_row_allowed(t.institution_code) and (t.duty_location=l.name or t.duty_location is null) order by (t.duty_location=l.name) desc limit 1;
        insert into public.student_duty_assignments(institution_code,academic_year_id,duty_date,student_id,location_id,responsible_teacher_user_id,assignment_source)
        values(v_tenant,v_year,d,picked,l.id,teacher,'auto') on conflict do nothing;
        if found then made:=made+1; end if;
      end loop;
    end loop;
  end loop;
  insert into public.student_duty_generation_state(institution_code,academic_year_id,last_generated_on,rotation_cursor)
  values(v_tenant,v_year,p_end,jsonb_build_object('generated_from',p_start,'generated_to',p_end))
  on conflict(institution_code,academic_year_id) do update set last_generated_on=excluded.last_generated_on,rotation_cursor=excluded.rotation_cursor,updated_at=now();
  return made;
end $$;

grant execute on function public.generate_student_duties_permission_core_v1(date,date,boolean) to authenticated;

commit;
