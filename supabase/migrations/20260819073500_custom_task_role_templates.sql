-- Reusable school-defined task/role templates. These do not replace cadre roles;
-- they are reusable bundles of operational permissions assigned to personnel.

create table if not exists public.task_role_templates(
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  active boolean not null default true,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_role_template_permissions(
  template_id uuid not null references public.task_role_templates(id) on delete cascade,
  permission_code text not null references public.permission_catalog(code) on delete cascade,
  scope jsonb not null default '{}'::jsonb,
  primary key(template_id,permission_code)
);

create table if not exists public.user_task_role_assignments(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  template_id uuid not null references public.task_role_templates(id) on delete cascade,
  valid_from date,
  valid_until date,
  active boolean not null default true,
  assigned_by uuid references public.profiles(user_id) on delete set null,
  assigned_at timestamptz not null default now(),
  note text,
  check(valid_until is null or valid_from is null or valid_until>=valid_from)
);
create unique index if not exists uq_user_task_role_assignment_period
on public.user_task_role_assignments(user_id,template_id,coalesce(valid_from,'0001-01-01'::date));

alter table public.task_role_templates enable row level security;
alter table public.task_role_template_permissions enable row level security;
alter table public.user_task_role_assignments enable row level security;
grant select,insert,update,delete on public.task_role_templates,public.task_role_template_permissions,public.user_task_role_assignments to authenticated;

create policy "permission admins read task role templates" on public.task_role_templates for select to authenticated using(public.can_manage_permissions());
create policy "permission admins manage task role templates" on public.task_role_templates for all to authenticated using(public.can_manage_permissions()) with check(public.can_manage_permissions());
create policy "permission admins read task role permissions" on public.task_role_template_permissions for select to authenticated using(public.can_manage_permissions());
create policy "permission admins manage task role permissions" on public.task_role_template_permissions for all to authenticated using(public.can_manage_permissions()) with check(public.can_manage_permissions());
create policy "permission admins read user task roles" on public.user_task_role_assignments for select to authenticated using(public.can_manage_permissions() or user_id=auth.uid());
create policy "permission admins manage user task roles" on public.user_task_role_assignments for all to authenticated using(public.can_manage_permissions()) with check(public.can_manage_permissions());

create or replace function public.save_task_role_template(
  p_template_id uuid,
  p_name text,
  p_description text default null,
  p_permission_codes text[] default array[]::text[]
)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;v_code text;
begin
  if not public.can_manage_permissions() then raise exception 'NOT_AUTHORIZED';end if;
  if nullif(trim(p_name),'') is null then raise exception 'TASK_ROLE_NAME_REQUIRED';end if;
  if exists(select 1 from unnest(coalesce(p_permission_codes,array[]::text[])) c where not exists(select 1 from public.permission_catalog pc where pc.code=c and pc.active)) then raise exception 'UNKNOWN_PERMISSION_IN_TEMPLATE';end if;
  if not(public.is_super_admin() or exists(select 1 from public.profiles where user_id=auth.uid() and role='admin'))
     and 'permissions.manage'=any(coalesce(p_permission_codes,array[]::text[])) then raise exception 'CANNOT_TEMPLATE_PERMISSION_ADMIN';end if;

  if p_template_id is null then
    insert into public.task_role_templates(name,description,created_by) values(trim(p_name),p_description,auth.uid()) returning id into v_id;
  else
    update public.task_role_templates set name=trim(p_name),description=p_description,updated_at=now() where id=p_template_id returning id into v_id;
    if v_id is null then raise exception 'TASK_ROLE_TEMPLATE_NOT_FOUND';end if;
  end if;
  delete from public.task_role_template_permissions where template_id=v_id;
  foreach v_code in array coalesce(p_permission_codes,array[]::text[]) loop
    insert into public.task_role_template_permissions(template_id,permission_code) values(v_id,v_code) on conflict do nothing;
  end loop;
  return v_id;
end;$$;

create or replace function public.assign_task_role_template(
  p_user_id uuid,p_template_id uuid,p_valid_from date default null,p_valid_until date default null,p_note text default null
)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer:=0;v_rec record;v_assignment_id uuid;
begin
  if not public.can_manage_permissions() then raise exception 'NOT_AUTHORIZED';end if;
  if p_user_id=auth.uid() and not public.is_super_admin() then raise exception 'CANNOT_CHANGE_OWN_PERMISSIONS';end if;
  if p_valid_until is not null and p_valid_from is not null and p_valid_until<p_valid_from then raise exception 'INVALID_VALIDITY_RANGE';end if;
  if not exists(select 1 from public.task_role_templates where id=p_template_id and active) then raise exception 'TASK_ROLE_TEMPLATE_NOT_FOUND';end if;

  perform public.set_user_permission_mode(p_user_id,'delegated');

  select id into v_assignment_id from public.user_task_role_assignments
  where user_id=p_user_id and template_id=p_template_id and valid_from is not distinct from p_valid_from
  limit 1;
  if v_assignment_id is null then
    insert into public.user_task_role_assignments(user_id,template_id,valid_from,valid_until,assigned_by,note)
    values(p_user_id,p_template_id,p_valid_from,p_valid_until,auth.uid(),p_note)
    returning id into v_assignment_id;
  else
    update public.user_task_role_assignments
    set valid_until=p_valid_until,active=true,assigned_by=auth.uid(),assigned_at=now(),note=p_note
    where id=v_assignment_id;
  end if;

  for v_rec in select permission_code,scope from public.task_role_template_permissions where template_id=p_template_id loop
    perform public.set_user_permission(p_user_id,v_rec.permission_code,true,v_rec.scope,p_valid_from,p_valid_until,coalesce(p_note,'Görev şablonu: '||(select name from public.task_role_templates where id=p_template_id)));
    v_count:=v_count+1;
  end loop;
  return v_count;
end;$$;

create or replace function public.revoke_task_role_template(p_user_id uuid,p_template_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer:=0;v_code text;
begin
  if not public.can_manage_permissions() then raise exception 'NOT_AUTHORIZED';end if;
  update public.user_task_role_assignments set active=false where user_id=p_user_id and template_id=p_template_id and active;
  for v_code in select permission_code from public.task_role_template_permissions where template_id=p_template_id loop
    perform public.set_user_permission(p_user_id,v_code,false,'{}'::jsonb,null,null,'Görev şablonu kaldırıldı');
    v_count:=v_count+1;
  end loop;
  return v_count;
end;$$;

revoke all on function public.save_task_role_template(uuid,text,text,text[]),public.assign_task_role_template(uuid,uuid,date,date,text),public.revoke_task_role_template(uuid,uuid) from public;
grant execute on function public.save_task_role_template(uuid,text,text,text[]),public.assign_task_role_template(uuid,uuid,date,date,text),public.revoke_task_role_template(uuid,uuid) to authenticated;
