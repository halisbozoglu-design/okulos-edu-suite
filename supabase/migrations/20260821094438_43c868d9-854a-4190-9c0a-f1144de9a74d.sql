-- OkulOS existing-module tenant/access hardening.
-- Scope rule: no new functional modules are introduced here. This migration only
-- completes access, feature-gate and tenant wiring for routes that already exist.

-- 1) Ensure every CURRENT route/module is represented by the feature catalogue.
-- Parent entries with route_prefix=NULL act as aggregate switches; children are route gates.
insert into public.system_feature_catalog(feature_key,parent_key,label,route_prefix,enabled,maintenance,sort_order) values
 ('dashboard',null,'Ana Panel','/dashboard',true,false,10),
 ('management',null,'Yönetim Merkezi','/management',true,false,20),
 ('personnel',null,'Personel',null,true,false,30),
 ('personnel.import','personnel','Personel İçe Aktarma','/personnel-import',true,false,31),
 ('personnel.manage','personnel','Personel Yönetimi','/personnel-admin',true,false,32),
 ('personnel.fields','personnel','Personel Alan Kullanımı','/personnel-field-settings',true,false,33),
 ('classes',null,'Sınıflar ve Şubeler','/classes',true,false,40),
 ('calendar',null,'Çalışma Takvimi','/calendar',true,false,50),
 ('curriculum',null,'Ders Havuzu ve Atamalar','/curriculum',true,false,60),
 ('schedule',null,'Ders Programı',null,true,false,70),
 ('schedule.preparation','schedule','Program Hazırlık','/schedule-preparation',true,false,71),
 ('schedule.rules','schedule','Program Kuralları','/schedule-rules',true,false,72),
 ('schedule.solver','schedule','Program Oluştur','/schedule-solver',true,false,73),
 ('schedule.view','schedule','Program Görüntüleme','/schedule',true,false,74),
 ('schedule.validation','schedule','Program Kontrol','/schedule-validation',true,false,75),
 ('schedule.rooms','schedule','Derslik Atama','/room-assignment',true,false,76),
 ('schedule.history','schedule','Program Geçmişi','/schedule-history',true,false,77),
 ('schedule.archive','schedule','Program Yayın ve Arşiv','/schedule-archive',true,false,78),
 ('classrooms',null,'Derslikler','/classrooms',true,false,80),
 ('norm',null,'Norm Kadro',null,true,false,90),
 ('norm.analysis','norm','Norm Kadro Analizi','/norm-analysis',true,false,91),
 ('norm.settings','norm','Norm Eşleştirmeleri','/norm-settings',true,false,92),
 ('payroll',null,'Ek Ders',null,true,false,100),
 ('payroll.view','payroll','Ek Ders','/payroll',true,false,101),
 ('payroll.rules','payroll','Ek Ders Kuralları','/payroll-rules',true,false,102),
 ('substitutes',null,'Vekalet','/substitutes',true,false,110),
 ('duty',null,'Nöbet',null,true,false,120),
 ('duty.settings','duty','Nöbet Planı ve Ayarları','/settings',true,false,121),
 ('duty.book','duty','Nöbet Defteri','/duty-book',true,false,122),
 ('quran.groups',null,'Kur’an Grupları','/quran-groups',true,false,125),
 ('notifications',null,'Bildirimler','/notifications',true,false,130),
 ('legislation',null,'Mevzuat Kütüphanesi','/legislation',true,false,140),
 ('permissions',null,'Görev ve Yetkiler',null,true,false,150),
 ('permissions.users','permissions','Görev ve Yetki Atama','/settings-permissions',true,false,151),
 ('permissions.roles','permissions','Görev Şablonları','/settings-task-roles',true,false,152),
 ('superadmin',null,'Süper Admin',null,true,false,900),
 ('superadmin.tenants','superadmin','Tenant ve Sistem Kontrolü','/super-admin-tenants',true,false,901),
 ('superadmin.core','superadmin','Süper Admin Merkezi','/super-admin',true,false,902)
on conflict(feature_key) do update set
 parent_key=excluded.parent_key,
 label=excluded.label,
 route_prefix=excluded.route_prefix,
 sort_order=excluded.sort_order;

-- Remove obsolete route ownership from old aggregate keys so a more specific current child
-- consistently wins. Aggregate keys continue to control descendants through ancestry below.
update public.system_feature_catalog set route_prefix=null where feature_key in ('norm','payroll','duty','permissions','schedule','personnel');

-- 2) One helper resolves the caller's ACTIVE tenant. An inactive membership must never establish
-- a data/access context even if profiles.institution_code contains a stale value.
create or replace function public.get_my_active_institution_code()
returns text language sql stable security definer set search_path=public as $$
  select case
    when public.is_super_admin() then coalesce(
      (select p.institution_code from public.profiles p where p.user_id=auth.uid()),
      (select m.institution_code from public.institution_memberships m where m.user_id=auth.uid() and m.active order by m.is_owner desc,m.created_at limit 1)
    )
    else (
      select m.institution_code
      from public.institution_memberships m
      join public.institutions i on i.institution_code=m.institution_code
      where m.user_id=auth.uid() and m.active and i.status='active'
      order by m.is_owner desc,m.created_at
      limit 1
    )
  end;
$$;
revoke all on function public.get_my_active_institution_code() from public;
grant execute on function public.get_my_active_institution_code() to authenticated;

-- Keep the canonical tenant resolver aligned with ACTIVE membership. This is the function used
-- by the tenantized schema/RLS added in the previous consolidation.
create or replace function public.get_my_institution_code()
returns text language sql stable security definer set search_path=public as $$
  select public.get_my_active_institution_code();
$$;
revoke all on function public.get_my_institution_code() from public;
grant execute on function public.get_my_institution_code() to authenticated;

-- 3) Resolve a route's most-specific feature and every parent switch. Closing an aggregate
-- (for example schedule) now really closes all of its existing child routes.
create or replace function public.get_feature_access_state(p_path text)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_feature public.system_feature_catalog%rowtype;v_node public.system_feature_catalog%rowtype;
begin
  if p_path is null or trim(p_path)='' then return jsonb_build_object('allowed',true); end if;
  select * into v_feature
  from public.system_feature_catalog f
  where f.route_prefix is not null and (p_path=f.route_prefix or p_path like f.route_prefix||'/%')
  order by char_length(f.route_prefix) desc limit 1;
  if not found then return jsonb_build_object('allowed',true); end if;

  v_node:=v_feature;
  loop
    if not v_node.enabled or v_node.maintenance then
      return jsonb_build_object(
        'allowed',false,
        'feature_key',v_node.feature_key,
        'feature_label',v_node.label,
        'maintenance',v_node.maintenance,
        'message',coalesce(v_node.maintenance_message,v_node.label||' geçici olarak kullanıma kapalıdır.')
      );
    end if;
    exit when v_node.parent_key is null;
    select * into v_node from public.system_feature_catalog where feature_key=v_node.parent_key;
    exit when not found;
  end loop;
  return jsonb_build_object('allowed',true,'feature_key',v_feature.feature_key,'feature_label',v_feature.label,'maintenance',false);
end $$;
revoke all on function public.get_feature_access_state(text) from public;
grant execute on function public.get_feature_access_state(text) to authenticated;

-- 4) Access is FAIL-CLOSED for authenticated non-Super-Admin users without a tenant.
-- Notifications remain reachable for pending/rejected/maintenance tenants so system notices work.
create or replace function public.get_system_access_state(p_path text default null)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_code text;v_approval text;v_global record;v_feature jsonb;
begin
  if auth.uid() is null then return jsonb_build_object('allowed',false,'reason','not_authenticated'); end if;
  if public.is_super_admin() then return jsonb_build_object('allowed',true,'super_admin',true,'approval_status','approved','maintenance',false); end if;

  v_code:=public.get_my_active_institution_code();
  if v_code is null then
    return jsonb_build_object('allowed',false,'reason','tenant_required','approval_status','none','maintenance',false,'message','Kullanıcı hesabınız aktif bir kuruma bağlı değil. Kurum müdürünüz veya Süper Admin ile iletişime geçin.');
  end if;

  select approval_status into v_approval from public.institutions where institution_code=v_code and status='active';
  if v_approval is null then return jsonb_build_object('allowed',false,'reason','tenant_inactive','approval_status','none','maintenance',false); end if;

  if p_path='/notifications' or p_path like '/notifications/%' then
    v_feature:=public.get_feature_access_state(p_path);
    if not coalesce((v_feature->>'allowed')::boolean,true) then
      return jsonb_build_object('allowed',false,'reason','feature_maintenance','approval_status',coalesce(v_approval,'pending'),'maintenance',coalesce((v_feature->>'maintenance')::boolean,false),'feature_key',v_feature->>'feature_key','feature_label',v_feature->>'feature_label','message',v_feature->>'message');
    end if;
    return jsonb_build_object('allowed',true,'super_admin',false,'institution_code',v_code,'approval_status',coalesce(v_approval,'pending'),'maintenance',false);
  end if;

  if coalesce(v_approval,'pending')<>'approved' then
    return jsonb_build_object('allowed',false,'reason','tenant_'||coalesce(v_approval,'pending'),'institution_code',v_code,'approval_status',coalesce(v_approval,'pending'),'maintenance',false);
  end if;

  select maintenance,maintenance_message into v_global from public.system_runtime_settings where singleton;
  if coalesce(v_global.maintenance,false) then
    return jsonb_build_object('allowed',false,'reason','system_maintenance','institution_code',v_code,'approval_status',v_approval,'maintenance',true,'message',v_global.maintenance_message);
  end if;

  if p_path is not null then
    v_feature:=public.get_feature_access_state(p_path);
    if not coalesce((v_feature->>'allowed')::boolean,true) then
      return jsonb_build_object('allowed',false,'reason','feature_maintenance','institution_code',v_code,'approval_status',v_approval,'maintenance',coalesce((v_feature->>'maintenance')::boolean,false),'feature_key',v_feature->>'feature_key','feature_label',v_feature->>'feature_label','message',v_feature->>'message');
    end if;
  end if;

  return jsonb_build_object('allowed',true,'super_admin',false,'institution_code',v_code,'approval_status',v_approval,'maintenance',false);
end $$;
revoke all on function public.get_system_access_state(text) from public;
grant execute on function public.get_system_access_state(text) to authenticated;

-- 5) Super Admin feature changes inherit safely: a parent switch affects descendants without
-- rewriting child values, so their previous individual state returns when the parent reopens.
create or replace function public.super_admin_set_feature(p_feature_key text,p_enabled boolean,p_maintenance boolean default false,p_message text default null)
returns void language plpgsql security definer set search_path=public as $$
declare r record;v_title text;v_msg text;
begin
  if not public.is_super_admin() then raise exception 'FORBIDDEN'; end if;
  update public.system_feature_catalog
  set enabled=p_enabled,maintenance=p_maintenance,maintenance_message=nullif(trim(coalesce(p_message,'')),''),updated_by=auth.uid(),updated_at=now()
  where feature_key=p_feature_key returning label into v_title;
  if not found then raise exception 'FEATURE_NOT_FOUND'; end if;
  v_msg:=coalesce(nullif(trim(coalesce(p_message,'')),''),case when p_enabled and not p_maintenance then v_title||' yeniden kullanıma açıldı.' else v_title||' geçici olarak kullanıma kapatıldı.' end);
  for r in select institution_code from public.institutions where status='active' and approval_status='approved' loop
    perform public.notify_tenant_principals(r.institution_code,case when p_enabled and not p_maintenance then v_title||' açıldı' else v_title||' kullanıma kapatıldı' end,v_msg,case when p_enabled and not p_maintenance then 'normal' else 'high' end);
  end loop;
end $$;
revoke all on function public.super_admin_set_feature(text,boolean,boolean,text) from public;
grant execute on function public.super_admin_set_feature(text,boolean,boolean,text) to authenticated;

-- 6) Diagnostic endpoint for Super Admin: existing routes that are not feature-mapped are a
-- release-blocking configuration problem. Frontend CI also asserts the current static list.
create or replace function public.super_admin_feature_catalog_audit()
returns table(feature_key text,label text,route_prefix text,parent_key text,enabled boolean,maintenance boolean)
language sql stable security definer set search_path=public as $$
  select f.feature_key,f.label,f.route_prefix,f.parent_key,f.enabled,f.maintenance
  from public.system_feature_catalog f
  where public.is_super_admin()
  order by f.sort_order,f.label;
$$;
revoke all on function public.super_admin_feature_catalog_audit() from public;
grant execute on function public.super_admin_feature_catalog_audit() to authenticated;