-- Product integration for the separate break/area supervision solver.
-- Browser output is only a proposal: server validation is authoritative and fail-closed.

insert into public.system_feature_catalog(feature_key,parent_key,label,route_prefix,enabled,maintenance,sort_order)
values('duty.supervision','duty','Gözetim ve Alan Nöbeti','/schedule-supervision',true,false,123)
on conflict(feature_key) do update set parent_key=excluded.parent_key,label=excluded.label,route_prefix=excluded.route_prefix,sort_order=excluded.sort_order;

create table if not exists public.schedule_supervision_requirements(
  id uuid primary key default gen_random_uuid(),
  institution_code text not null references public.institutions(institution_code) on delete restrict default public.current_tenant_code(),
  label text not null check(length(btrim(label)) between 2 and 120),
  weekday smallint not null check(weekday between 1 and 7),
  period smallint not null check(period between 1 and 24),
  required_count smallint not null default 1 check(required_count between 1 and 20),
  active boolean not null default true,
  created_by uuid references public.profiles(user_id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique(institution_code,label,weekday,period),
  unique(institution_code,id)
);

create table if not exists public.schedule_supervision_teacher_limits(
  institution_code text not null references public.institutions(institution_code) on delete restrict default public.current_tenant_code(),
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  min_load smallint not null default 0 check(min_load between 0 and 100),
  max_load smallint not null default 5 check(max_load between 0 and 100 and max_load>=min_load),
  active boolean not null default true,
  updated_by uuid references public.profiles(user_id) on delete set null default auth.uid(),
  updated_at timestamptz not null default now(),
  primary key(institution_code,teacher_id)
);

create table if not exists public.schedule_supervision_plans(
  id uuid primary key default gen_random_uuid(),
  institution_code text not null references public.institutions(institution_code) on delete restrict default public.current_tenant_code(),
  title text not null check(length(btrim(title)) between 2 and 160),
  seed integer not null,
  status text not null default 'DRAFT' check(status in('DRAFT','APPROVED','PUBLISHED','REJECTED','SUPERSEDED')),
  basis_signature text not null,
  hard_score integer not null default 0 check(hard_score>=0),
  unplaced_score integer not null default 0 check(unplaced_score>=0),
  medium_score integer not null default 0 check(medium_score>=0),
  soft_score integer not null default 0 check(soft_score>=0),
  created_by uuid not null references public.profiles(user_id) on delete restrict default auth.uid(),
  created_at timestamptz not null default now(),
  approved_by uuid references public.profiles(user_id) on delete restrict,
  approved_at timestamptz,
  published_by uuid references public.profiles(user_id) on delete restrict,
  published_at timestamptz,
  rejected_by uuid references public.profiles(user_id) on delete restrict,
  rejected_at timestamptz,
  decision_note text,
  unique(institution_code,id)
);

create table if not exists public.schedule_supervision_plan_rows(
  id uuid primary key default gen_random_uuid(),
  institution_code text not null references public.institutions(institution_code) on delete restrict default public.current_tenant_code(),
  plan_id uuid not null,
  requirement_id uuid not null,
  teacher_id uuid not null references public.profiles(user_id) on delete restrict,
  weekday smallint not null check(weekday between 1 and 7),
  period smallint not null check(period between 1 and 24),
  created_at timestamptz not null default now(),
  foreign key(institution_code,plan_id) references public.schedule_supervision_plans(institution_code,id) on delete cascade,
  foreign key(institution_code,requirement_id) references public.schedule_supervision_requirements(institution_code,id) on delete restrict,
  unique(plan_id,requirement_id,teacher_id),
  unique(plan_id,teacher_id,weekday,period)
);

create table if not exists public.schedule_supervision_plan_events(
  id bigint generated always as identity primary key,
  institution_code text not null references public.institutions(institution_code) on delete restrict,
  plan_id uuid not null,
  action text not null check(action in('CREATED','APPROVED','PUBLISHED','REJECTED','SUPERSEDED')),
  actor_user_id uuid references public.profiles(user_id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  foreign key(institution_code,plan_id) references public.schedule_supervision_plans(institution_code,id) on delete cascade
);

create index if not exists idx_supervision_plans_tenant_created on public.schedule_supervision_plans(institution_code,created_at desc);
create index if not exists idx_supervision_plans_published on public.schedule_supervision_plans(institution_code,published_at desc) where status='PUBLISHED';
create index if not exists idx_supervision_rows_plan on public.schedule_supervision_plan_rows(institution_code,plan_id,weekday,period);
create index if not exists idx_supervision_rows_requirement on public.schedule_supervision_plan_rows(institution_code,requirement_id);
create index if not exists idx_supervision_rows_teacher on public.schedule_supervision_plan_rows(institution_code,teacher_id,weekday,period);
create index if not exists idx_supervision_events_plan on public.schedule_supervision_plan_events(institution_code,plan_id,created_at);

alter table public.schedule_supervision_requirements enable row level security;
alter table public.schedule_supervision_teacher_limits enable row level security;
alter table public.schedule_supervision_plans enable row level security;
alter table public.schedule_supervision_plan_rows enable row level security;
alter table public.schedule_supervision_plan_events enable row level security;

revoke all on public.schedule_supervision_requirements,public.schedule_supervision_teacher_limits,
  public.schedule_supervision_plans,public.schedule_supervision_plan_rows,public.schedule_supervision_plan_events
  from public,anon,authenticated;
grant select,insert,update,delete on public.schedule_supervision_requirements,public.schedule_supervision_teacher_limits to authenticated;
grant select on public.schedule_supervision_plans,public.schedule_supervision_plan_rows,public.schedule_supervision_plan_events to authenticated;

create policy supervision_requirements_read on public.schedule_supervision_requirements for select to authenticated
using(public.tenant_row_allowed(institution_code) and public.has_permission('duty.view'));
create policy supervision_requirements_manage on public.schedule_supervision_requirements for all to authenticated
using(public.tenant_row_allowed(institution_code) and public.has_permission('duty.manage'))
with check(public.tenant_row_allowed(institution_code) and public.has_permission('duty.manage'));
create policy supervision_limits_read on public.schedule_supervision_teacher_limits for select to authenticated
using(public.tenant_row_allowed(institution_code) and public.has_permission('duty.view'));
create policy supervision_limits_manage on public.schedule_supervision_teacher_limits for all to authenticated
using(public.tenant_row_allowed(institution_code) and public.has_permission('duty.manage'))
with check(public.tenant_row_allowed(institution_code) and public.has_permission('duty.manage'));
create policy supervision_plans_read on public.schedule_supervision_plans for select to authenticated
using(public.tenant_row_allowed(institution_code) and public.has_permission('duty.view'));
create policy supervision_rows_read on public.schedule_supervision_plan_rows for select to authenticated
using(public.tenant_row_allowed(institution_code) and public.has_permission('duty.view'));
create policy supervision_events_read on public.schedule_supervision_plan_events for select to authenticated
using(public.tenant_row_allowed(institution_code) and public.has_permission('duty.view'));

create or replace function public.schedule_supervision_signature_v1()
returns text language sql stable security definer set search_path=public as $$
  with fragments as(
    select concat_ws('|','L',ts.teacher_id,ts.weekday,ts.period,ts.teacher_assignment_id) value
    from public.teacher_schedule ts where ts.active and public.tenant_row_allowed(ts.institution_code)
    union all
    select concat_ws('|','A',x.teacher_id,ts.weekday,ts.period,x.teacher_assignment_id)
    from public.schedule_assignment_additional_teachers x
    join public.teacher_schedule ts on ts.teacher_assignment_id=x.teacher_assignment_id and ts.active and ts.institution_code=x.institution_code
    where public.tenant_row_allowed(x.institution_code)
    union all
    select concat_ws('|','U',u.teacher_id,u.weekday,u.period) from public.teacher_unavailability u
    where u.active and public.tenant_row_allowed(u.institution_code)
    union all
    select concat_ws('|','R',r.id,r.label,r.weekday,r.period,r.required_count) from public.schedule_supervision_requirements r
    where r.active and public.tenant_row_allowed(r.institution_code)
    union all
    select concat_ws('|','M',l.teacher_id,l.min_load,l.max_load) from public.schedule_supervision_teacher_limits l
    where l.active and public.tenant_row_allowed(l.institution_code)
  ) select md5(coalesce(string_agg(value,';;' order by value),'')) from fragments
$$;

create or replace function public.get_schedule_supervision_problem_v1()
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_result jsonb;
begin
  if not(public.has_permission('duty.view') or public.has_permission('duty.manage') or public.has_permission('duty.generate') or public.has_permission('duty.lock')) then raise exception 'PERMISSION_DENIED: duty.view';end if;
  select jsonb_build_object(
    'signature',public.schedule_supervision_signature_v1(),
    'positions',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'label',r.label,'weekday',r.weekday,'period',r.period,'required_count',r.required_count) order by r.weekday,r.period,r.label)
      from public.schedule_supervision_requirements r where r.active and public.tenant_row_allowed(r.institution_code)),'[]'::jsonb),
    'teachers',coalesce((select jsonb_agg(jsonb_build_object('id',p.user_id,'name',p.full_name,'min_load',coalesce(l.min_load,0),'max_load',coalesce(l.max_load,5)) order by p.full_name,p.user_id)
      from public.profiles p left join public.schedule_supervision_teacher_limits l on l.teacher_id=p.user_id and l.institution_code=p.institution_code and l.active
      where p.role='teacher' and public.tenant_row_allowed(p.institution_code)),'[]'::jsonb),
    'occupied_slots',coalesce((select jsonb_agg(jsonb_build_object('teacher_id',q.teacher_id,'weekday',q.weekday,'period',q.period,'source',q.source) order by q.teacher_id,q.weekday,q.period,q.source)
      from(select ts.teacher_id,ts.weekday,ts.period,'LESSON'::text source from public.teacher_schedule ts where ts.active and public.tenant_row_allowed(ts.institution_code)
        union select x.teacher_id,ts.weekday,ts.period,'LESSON' from public.schedule_assignment_additional_teachers x join public.teacher_schedule ts on ts.teacher_assignment_id=x.teacher_assignment_id and ts.active and ts.institution_code=x.institution_code where public.tenant_row_allowed(x.institution_code)
        union select u.teacher_id,u.weekday,u.period,'UNAVAILABLE' from public.teacher_unavailability u where u.active and public.tenant_row_allowed(u.institution_code))q),'[]'::jsonb)
  ) into v_result;
  return v_result;
end $$;

create or replace function public.validate_schedule_supervision_plan_v1(p_plan_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_hard integer:=0;v_unplaced integer:=0;v_signature text;v_basis text;
begin
  if not exists(select 1 from public.schedule_supervision_plans p where p.id=p_plan_id and public.tenant_row_allowed(p.institution_code)) then raise exception 'SUPERVISION_PLAN_NOT_FOUND';end if;
  select basis_signature into v_basis from public.schedule_supervision_plans where id=p_plan_id and public.tenant_row_allowed(institution_code);
  v_signature:=public.schedule_supervision_signature_v1();
  select count(*)::integer into v_hard from public.schedule_supervision_plan_rows x
  left join public.schedule_supervision_requirements r on r.id=x.requirement_id and r.institution_code=x.institution_code and r.active
  left join public.profiles p on p.user_id=x.teacher_id and p.institution_code=x.institution_code and p.role='teacher'
  where x.plan_id=p_plan_id and public.tenant_row_allowed(x.institution_code) and(
    r.id is null or p.user_id is null or x.weekday<>r.weekday or x.period<>r.period
    or exists(select 1 from public.teacher_schedule ts where ts.active and ts.institution_code=x.institution_code and ts.weekday=x.weekday and ts.period=x.period and(ts.teacher_id=x.teacher_id or exists(select 1 from public.schedule_assignment_additional_teachers a where a.institution_code=x.institution_code and a.teacher_assignment_id=ts.teacher_assignment_id and a.teacher_id=x.teacher_id)))
    or exists(select 1 from public.teacher_unavailability u where u.active and u.institution_code=x.institution_code and u.teacher_id=x.teacher_id and u.weekday=x.weekday and u.period=x.period)
  );
  v_hard:=v_hard+(select count(*)::integer from(select teacher_id,weekday,period from public.schedule_supervision_plan_rows where plan_id=p_plan_id and public.tenant_row_allowed(institution_code) group by teacher_id,weekday,period having count(*)>1)d);
  v_hard:=v_hard+(select count(*)::integer from(select x.requirement_id from public.schedule_supervision_plan_rows x join public.schedule_supervision_requirements r on r.id=x.requirement_id and r.institution_code=x.institution_code where x.plan_id=p_plan_id and public.tenant_row_allowed(x.institution_code) group by x.requirement_id,r.required_count having count(*)>r.required_count)d);
  v_hard:=v_hard+(select count(*)::integer from(select x.teacher_id from public.schedule_supervision_plan_rows x join public.schedule_supervision_plans p on p.id=x.plan_id and p.institution_code=x.institution_code left join public.schedule_supervision_teacher_limits l on l.institution_code=x.institution_code and l.teacher_id=x.teacher_id and l.active where x.plan_id=p_plan_id and public.tenant_row_allowed(x.institution_code) group by x.teacher_id,l.max_load having count(*)>coalesce(l.max_load,5))d);
  select coalesce(sum(greatest(r.required_count-coalesce(x.assigned,0),0)),0)::integer into v_unplaced
  from public.schedule_supervision_requirements r left join(
    select requirement_id,count(*) assigned from public.schedule_supervision_plan_rows where plan_id=p_plan_id group by requirement_id
  )x on x.requirement_id=r.id where r.active and public.tenant_row_allowed(r.institution_code);
  return jsonb_build_object('hard',v_hard,'unplaced',v_unplaced,'basis_signature',v_basis,'current_signature',v_signature,'stale',v_basis<>v_signature,'valid',v_hard=0 and v_unplaced=0 and v_basis=v_signature);
end $$;

create or replace function public.create_schedule_supervision_plan_v1(p_title text,p_seed integer,p_assignments jsonb,p_score jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_plan uuid:=gen_random_uuid();v_row record;v_validation jsonb;v_code text;v_medium integer;v_soft integer:=0;
begin
  perform public.open_permission_context('duty.generate');v_code:=public.current_tenant_code();
  if v_code is null then raise exception 'TENANT_CONTEXT_REQUIRED';end if;
  if jsonb_typeof(p_assignments)<>'array' then raise exception 'SUPERVISION_ASSIGNMENTS_ARRAY_REQUIRED';end if;
  insert into public.schedule_supervision_plans(id,institution_code,title,seed,basis_signature)
  values(v_plan,v_code,coalesce(nullif(btrim(p_title),''),'Gözetim planı'),p_seed,public.schedule_supervision_signature_v1());
  for v_row in select * from jsonb_to_recordset(p_assignments) as x(position_id uuid,teacher_id uuid,weekday smallint,period smallint) loop
    insert into public.schedule_supervision_plan_rows(institution_code,plan_id,requirement_id,teacher_id,weekday,period)
    values(v_code,v_plan,v_row.position_id,v_row.teacher_id,v_row.weekday,v_row.period);
  end loop;
  v_validation:=public.validate_schedule_supervision_plan_v1(v_plan);
  with loads as(select p.user_id,coalesce(count(x.id),0)::integer load,coalesce(l.min_load,0)::integer min_load
    from public.profiles p left join public.schedule_supervision_plan_rows x on x.plan_id=v_plan and x.teacher_id=p.user_id and x.institution_code=p.institution_code
    left join public.schedule_supervision_teacher_limits l on l.institution_code=p.institution_code and l.teacher_id=p.user_id and l.active
    where p.role='teacher' and public.tenant_row_allowed(p.institution_code) group by p.user_id,l.min_load)
  select coalesce(sum(greatest(min_load-load,0)),0)+coalesce(max(load)-min(load),0) into v_medium from loads;
  if coalesce((p_score->>'hard')::integer,-1)<>(v_validation->>'hard')::integer
    or coalesce((p_score->>'unplaced')::integer,-1)<>(v_validation->>'unplaced')::integer
    or coalesce((p_score->>'medium')::integer,-1)<>v_medium
    or coalesce((p_score->>'soft')::integer,-1)<>v_soft then raise exception 'SUPERVISION_SCORE_VECTOR_MISMATCH';end if;
  update public.schedule_supervision_plans set hard_score=(v_validation->>'hard')::integer,unplaced_score=(v_validation->>'unplaced')::integer,medium_score=v_medium,soft_score=v_soft where id=v_plan;
  insert into public.schedule_supervision_plan_events(institution_code,plan_id,action,actor_user_id,note) values(v_code,v_plan,'CREATED',auth.uid(),'Canlı ders doluluğu ile sunucuda doğrulandı');
  return v_plan;
end $$;

create or replace function public.decide_schedule_supervision_plan_v1(p_plan_id uuid,p_approve boolean,p_note text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_validation jsonb;v_code text:=public.current_tenant_code();
begin
  perform public.open_permission_context('duty.lock');
  perform 1 from public.schedule_supervision_plans where id=p_plan_id and institution_code=v_code and status='DRAFT' for update;
  if not found then raise exception 'DRAFT_SUPERVISION_PLAN_NOT_FOUND';end if;
  v_validation:=public.validate_schedule_supervision_plan_v1(p_plan_id);
  if p_approve and not coalesce((v_validation->>'valid')::boolean,false) then raise exception 'SUPERVISION_PLAN_HAS_HARD_OR_STALE_ISSUES';end if;
  update public.schedule_supervision_plans set status=case when p_approve then 'APPROVED' else 'REJECTED' end,
    approved_by=case when p_approve then auth.uid() end,approved_at=case when p_approve then now() end,
    rejected_by=case when not p_approve then auth.uid() end,rejected_at=case when not p_approve then now() end,decision_note=nullif(btrim(p_note),'') where id=p_plan_id;
  insert into public.schedule_supervision_plan_events(institution_code,plan_id,action,actor_user_id,note) values(v_code,p_plan_id,case when p_approve then 'APPROVED' else 'REJECTED' end,auth.uid(),nullif(btrim(p_note),''));
  return v_validation;
end $$;

create or replace function public.publish_schedule_supervision_plan_v1(p_plan_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_validation jsonb;v_code text:=public.current_tenant_code();
begin
  perform public.open_permission_context('duty.lock');
  perform pg_advisory_xact_lock(hashtext(v_code||':schedule-supervision'));
  perform 1 from public.schedule_supervision_plans where id=p_plan_id and institution_code=v_code and status='APPROVED' for update;
  if not found then raise exception 'APPROVED_SUPERVISION_PLAN_NOT_FOUND';end if;
  v_validation:=public.validate_schedule_supervision_plan_v1(p_plan_id);
  if not coalesce((v_validation->>'valid')::boolean,false) then raise exception 'SUPERVISION_PLAN_HAS_HARD_OR_STALE_ISSUES';end if;
  update public.schedule_supervision_plans set status='SUPERSEDED' where institution_code=v_code and status='PUBLISHED' and id<>p_plan_id;
  insert into public.schedule_supervision_plan_events(institution_code,plan_id,action,actor_user_id,note)
    select v_code,id,'SUPERSEDED',auth.uid(),'Yeni onaylı plan yayımlandı' from public.schedule_supervision_plans where institution_code=v_code and status='SUPERSEDED' and id<>p_plan_id and published_at is not null
    and not exists(select 1 from public.schedule_supervision_plan_events e where e.plan_id=schedule_supervision_plans.id and e.action='SUPERSEDED');
  update public.schedule_supervision_plans set status='PUBLISHED',published_by=auth.uid(),published_at=now() where id=p_plan_id;
  insert into public.schedule_supervision_plan_events(institution_code,plan_id,action,actor_user_id,note) values(v_code,p_plan_id,'PUBLISHED',auth.uid(),'İdari onaylı plan yürürlüğe alındı');
  return v_validation||jsonb_build_object('published',true,'plan_id',p_plan_id);
end $$;

revoke all on function public.schedule_supervision_signature_v1(),public.get_schedule_supervision_problem_v1(),
  public.validate_schedule_supervision_plan_v1(uuid),public.create_schedule_supervision_plan_v1(text,integer,jsonb,jsonb),
  public.decide_schedule_supervision_plan_v1(uuid,boolean,text),public.publish_schedule_supervision_plan_v1(uuid) from public,anon,authenticated;
grant execute on function public.get_schedule_supervision_problem_v1() to authenticated;
grant execute on function public.create_schedule_supervision_plan_v1(text,integer,jsonb,jsonb),public.decide_schedule_supervision_plan_v1(uuid,boolean,text),public.publish_schedule_supervision_plan_v1(uuid) to authenticated;
