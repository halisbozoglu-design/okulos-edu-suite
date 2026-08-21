alter table public.institutions add column if not exists approval_status text not null default 'pending'
  check (approval_status in ('pending','approved','rejected'));
alter table public.institutions add column if not exists approval_note text;
alter table public.institutions add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
alter table public.institutions add column if not exists reviewed_at timestamptz;

create table if not exists public.tenant_messages (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null references public.institutions(institution_code) on delete cascade,
  sender_user_id uuid references auth.users(id) on delete set null,
  title text not null,
  message text not null,
  severity text not null default 'info' check (severity in ('info','warning','critical')),
  created_at timestamptz not null default now()
);

create table if not exists public.system_feature_catalog (
  feature_key text primary key,
  parent_key text references public.system_feature_catalog(feature_key) on delete cascade,
  label text not null,
  route_prefix text,
  enabled boolean not null default true,
  maintenance boolean not null default false,
  maintenance_message text,
  sort_order integer not null default 100,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.system_runtime_settings (
  singleton boolean primary key default true check (singleton),
  maintenance boolean not null default false,
  maintenance_message text not null default 'Sistem bakımı yapılmaktadır. En kısa sürede tekrar hizmete açılacaktır.',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into public.system_runtime_settings(singleton) values(true) on conflict do nothing;

insert into public.system_feature_catalog(feature_key,parent_key,label,route_prefix,sort_order) values
 ('dashboard',null,'Ana Panel','/dashboard',10),
 ('management',null,'Yönetim Merkezi','/management',20),
 ('personnel',null,'Personel',null,30),
 ('personnel.import','personnel','Personel İçe Aktarma','/personnel-import',31),
 ('personnel.manage','personnel','Personel Yönetimi','/personnel-admin',32),
 ('classes',null,'Sınıflar ve Şubeler','/classes',40),
 ('calendar',null,'Çalışma Takvimi','/calendar',50),
 ('curriculum',null,'Ders Havuzu ve Atamalar','/curriculum',60),
 ('schedule',null,'Ders Programı',null,70),
 ('schedule.rules','schedule','Program Kuralları','/schedule-rules',71),
 ('schedule.solver','schedule','Program Oluştur','/schedule-solver',72),
 ('schedule.view','schedule','Program Görüntüleme','/schedule',73),
 ('schedule.validation','schedule','Program Kontrol','/schedule-validation',74),
 ('schedule.archive','schedule','Program Arşivi','/schedule-archive',75),
 ('classrooms',null,'Derslikler','/classrooms',80),
 ('norm',null,'Norm Kadro','/norm-analysis',90),
 ('payroll',null,'Ek Ders','/payroll',100),
 ('substitutes',null,'Vekalet','/substitutes',110),
 ('duty',null,'Nöbet','/duty-book',120),
 ('notifications',null,'Bildirimler','/notifications',130),
 ('legislation',null,'Mevzuat Kütüphanesi','/legislation',140),
 ('permissions',null,'Görev ve Yetkiler','/settings-permissions',150),
 ('settings',null,'Ayarlar','/settings',160)
on conflict(feature_key) do update set parent_key=excluded.parent_key,label=excluded.label,route_prefix=excluded.route_prefix,sort_order=excluded.sort_order;

insert into public.institutions(institution_code,school_name,status,approval_status)
values('774380','Borsa İstanbul Muhsin Yazıcıoğlu Anadolu İmam Hatip Lisesi','active','pending')
on conflict(institution_code) do update set school_name=excluded.school_name;

do $$
declare v_uid uuid;
begin
  select user_id into v_uid from public.profiles where lower(email)=lower('halisbozoglu@yahoo.com') limit 1;
  if v_uid is not null then
    insert into public.institution_memberships(institution_code,user_id,membership_role,is_owner,active)
    values('774380',v_uid,'principal',true,true)
    on conflict(institution_code,user_id) do update set membership_role='principal',is_owner=true,active=true,updated_at=now();
    insert into public.institution_principals(institution_code,user_id,active)
    values('774380',v_uid,true)
    on conflict(institution_code,user_id) do update set active=true;
    update public.profiles set institution_code='774380' where user_id=v_uid;
  end if;
end $$;

alter table public.tenant_messages enable row level security;
alter table public.system_feature_catalog enable row level security;
alter table public.system_runtime_settings enable row level security;

drop policy if exists tenant_messages_principal_read on public.tenant_messages;
create policy tenant_messages_principal_read on public.tenant_messages for select to authenticated
using(public.can_access_institution(institution_code));
drop policy if exists system_feature_authenticated_read on public.system_feature_catalog;
create policy system_feature_authenticated_read on public.system_feature_catalog for select to authenticated using(true);
drop policy if exists system_runtime_authenticated_read on public.system_runtime_settings;
create policy system_runtime_authenticated_read on public.system_runtime_settings for select to authenticated using(true);

grant select on public.system_feature_catalog,public.system_runtime_settings to authenticated;
grant select on public.tenant_messages to authenticated;
grant all on public.system_feature_catalog,public.system_runtime_settings,public.tenant_messages to service_role;

create or replace function public.is_principal_user()
returns boolean language sql stable security definer set search_path=public as $$
  select auth.uid() is not null and (
    public.is_institution_principal()
    or (not public.is_super_admin() and exists(select 1 from public.personnel_registry r where r.linked_user_id=auth.uid() and r.system_role='principal' and r.active))
    or (not public.is_super_admin() and exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin'))
  );
$$;
revoke all on function public.is_principal_user() from public, anon;
grant execute on function public.is_principal_user() to authenticated, service_role;

create or replace function public.super_admin_list_tenants()
returns table(institution_code text,school_name text,approval_status text,approval_note text,reviewed_at timestamptz,principal_name text,principal_email text,principal_phone text)
language sql stable security definer set search_path=public as $$
 select i.institution_code,i.school_name,i.approval_status,i.approval_note,i.reviewed_at,
        p.full_name,p.email,p.phone
 from public.institutions i
 left join public.institution_memberships m on m.institution_code=i.institution_code and m.active and m.membership_role='principal' and m.is_owner
 left join public.profiles p on p.user_id=m.user_id
 where public.is_super_admin()
 order by case i.approval_status when 'pending' then 0 when 'approved' then 1 else 2 end,i.created_at desc;
$$;
revoke all on function public.super_admin_list_tenants() from public, anon;
grant execute on function public.super_admin_list_tenants() to authenticated, service_role;

create or replace function public.notify_tenant_principals(p_institution_code text,p_title text,p_message text,p_priority text default 'normal')
returns void language plpgsql security definer set search_path=public as $$
begin
 insert into public.notifications(user_id,type,priority,title,message,action_label,action_url)
 select m.user_id,'system',case when p_priority in ('normal','high','critical') then p_priority else 'normal' end,p_title,p_message,'Bildirimleri Aç','/notifications'
 from public.institution_memberships m
 where m.institution_code=p_institution_code and m.active and m.membership_role='principal';
end $$;
revoke all on function public.notify_tenant_principals(text,text,text,text) from public, anon, authenticated;

create or replace function public.super_admin_review_tenant(p_institution_code text,p_decision text,p_note text default null)
returns void language plpgsql security definer set search_path=public as $$
declare v_label text;
begin
 if not public.is_super_admin() then raise exception 'FORBIDDEN'; end if;
 if p_decision not in ('approved','rejected') then raise exception 'INVALID_DECISION'; end if;
 update public.institutions set approval_status=p_decision,approval_note=nullif(trim(coalesce(p_note,'')),''),reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now()
 where institution_code=p_institution_code;
 if not found then raise exception 'TENANT_NOT_FOUND'; end if;
 v_label:=case when p_decision='approved' then 'OkulOS kullanımınız onaylandı' else 'OkulOS kurum kaydı reddedildi' end;
 perform public.notify_tenant_principals(p_institution_code,v_label,coalesce(nullif(trim(coalesce(p_note,'')),''),case when p_decision='approved' then 'Kurumunuz için OkulOS erişimi açıldı.' else 'Kurum kaydınız Süper Admin tarafından reddedildi.' end),case when p_decision='approved' then 'high' else 'critical' end);
end $$;
revoke all on function public.super_admin_review_tenant(text,text,text) from public, anon;
grant execute on function public.super_admin_review_tenant(text,text,text) to authenticated, service_role;

create or replace function public.super_admin_send_tenant_message(p_institution_code text,p_title text,p_message text,p_severity text default 'info')
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_super_admin() then raise exception 'FORBIDDEN'; end if;
 if trim(coalesce(p_title,''))='' or trim(coalesce(p_message,''))='' then raise exception 'EMPTY_MESSAGE'; end if;
 insert into public.tenant_messages(institution_code,sender_user_id,title,message,severity)
 values(p_institution_code,auth.uid(),trim(p_title),trim(p_message),case when p_severity in ('info','warning','critical') then p_severity else 'info' end);
 perform public.notify_tenant_principals(p_institution_code,trim(p_title),trim(p_message),case when p_severity='critical' then 'critical' when p_severity='warning' then 'high' else 'normal' end);
end $$;
revoke all on function public.super_admin_send_tenant_message(text,text,text,text) from public, anon;
grant execute on function public.super_admin_send_tenant_message(text,text,text,text) to authenticated, service_role;

create or replace function public.super_admin_set_feature(p_feature_key text,p_enabled boolean,p_maintenance boolean default false,p_message text default null)
returns void language plpgsql security definer set search_path=public as $$
declare r record;v_title text;v_msg text;
begin
 if not public.is_super_admin() then raise exception 'FORBIDDEN'; end if;
 update public.system_feature_catalog set enabled=p_enabled,maintenance=p_maintenance,maintenance_message=nullif(trim(coalesce(p_message,'')),''),updated_by=auth.uid(),updated_at=now() where feature_key=p_feature_key returning label into v_title;
 if not found then raise exception 'FEATURE_NOT_FOUND'; end if;
 v_msg:=coalesce(nullif(trim(coalesce(p_message,'')),''),case when p_enabled and not p_maintenance then v_title||' yeniden kullanıma açıldı.' else v_title||' geçici olarak kullanıma kapatıldı.' end);
 for r in select institution_code from public.institutions where approval_status='approved' loop
   perform public.notify_tenant_principals(r.institution_code,case when p_enabled and not p_maintenance then v_title||' açıldı' else v_title||' kullanıma kapatıldı' end,v_msg,case when p_enabled and not p_maintenance then 'normal' else 'high' end);
 end loop;
end $$;
revoke all on function public.super_admin_set_feature(text,boolean,boolean,text) from public, anon;
grant execute on function public.super_admin_set_feature(text,boolean,boolean,text) to authenticated, service_role;

create or replace function public.super_admin_set_system_maintenance(p_maintenance boolean,p_message text default null)
returns void language plpgsql security definer set search_path=public as $$
declare r record;v_msg text;
begin
 if not public.is_super_admin() then raise exception 'FORBIDDEN'; end if;
 v_msg:=coalesce(nullif(trim(coalesce(p_message,'')),''),'Sistem bakımı yapılmaktadır. En kısa sürede tekrar hizmete açılacaktır.');
 update public.system_runtime_settings set maintenance=p_maintenance,maintenance_message=v_msg,updated_by=auth.uid(),updated_at=now() where singleton;
 for r in select institution_code from public.institutions where approval_status='approved' loop
   perform public.notify_tenant_principals(r.institution_code,case when p_maintenance then 'Sistem bakımı başladı' else 'Sistem yeniden açıldı' end,case when p_maintenance then v_msg else 'OkulOS sistem bakımı tamamlandı. Sistem yeniden kullanıma açıldı.' end,case when p_maintenance then 'critical' else 'high' end);
 end loop;
end $$;
revoke all on function public.super_admin_set_system_maintenance(boolean,text) from public, anon;
grant execute on function public.super_admin_set_system_maintenance(boolean,text) to authenticated, service_role;

create or replace function public.get_system_access_state(p_path text default null)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_super boolean;v_code text;v_approval text;v_global record;v_feature record;
begin
 v_super:=public.is_super_admin();
 if v_super then return jsonb_build_object('allowed',true,'super_admin',true,'approval_status','approved','maintenance',false); end if;
 v_code:=public.get_my_institution_code();
 if v_code is null then return jsonb_build_object('allowed',true,'super_admin',false,'approval_status','none','maintenance',false); end if;
 select approval_status into v_approval from public.institutions where institution_code=v_code;
 if coalesce(v_approval,'pending')<>'approved' then return jsonb_build_object('allowed',false,'reason','tenant_'||coalesce(v_approval,'pending'),'approval_status',coalesce(v_approval,'pending'),'maintenance',false); end if;
 select maintenance,maintenance_message into v_global from public.system_runtime_settings where singleton;
 if coalesce(v_global.maintenance,false) then return jsonb_build_object('allowed',false,'reason','system_maintenance','approval_status',v_approval,'maintenance',true,'message',v_global.maintenance_message); end if;
 if p_path is not null then
   select * into v_feature from public.system_feature_catalog f where f.route_prefix is not null and (p_path=f.route_prefix or p_path like f.route_prefix||'/%') order by char_length(f.route_prefix) desc limit 1;
   if found and (not v_feature.enabled or v_feature.maintenance) then return jsonb_build_object('allowed',false,'reason','feature_maintenance','approval_status',v_approval,'maintenance',v_feature.maintenance,'feature_key',v_feature.feature_key,'feature_label',v_feature.label,'message',coalesce(v_feature.maintenance_message,v_feature.label||' geçici olarak kullanıma kapalıdır.')); end if;
 end if;
 return jsonb_build_object('allowed',true,'super_admin',false,'approval_status',v_approval,'maintenance',false);
end $$;
revoke all on function public.get_system_access_state(text) from public, anon;
grant execute on function public.get_system_access_state(text) to authenticated, service_role;

create or replace function public.get_system_feature_matrix()
returns table(feature_key text,parent_key text,label text,route_prefix text,enabled boolean,maintenance boolean,maintenance_message text,sort_order integer)
language sql stable security definer set search_path=public as $$
 select feature_key,parent_key,label,route_prefix,enabled,maintenance,maintenance_message,sort_order from public.system_feature_catalog order by sort_order,label;
$$;
revoke all on function public.get_system_feature_matrix() from public, anon;
grant execute on function public.get_system_feature_matrix() to authenticated, service_role;