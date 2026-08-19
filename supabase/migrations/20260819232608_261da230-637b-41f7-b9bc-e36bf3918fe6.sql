-- OkulOS dynamic task/permission delegation engine.
-- Identity role stays separate from operational authority.

create table if not exists public.permission_catalog(
  code text primary key,
  module_code text not null,
  module_label text not null,
  label text not null,
  action text not null,
  description text,
  dangerous boolean not null default false,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_permission_grants(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  permission_code text not null references public.permission_catalog(code) on delete cascade,
  scope jsonb not null default '{}'::jsonb,
  valid_from date,
  valid_until date,
  active boolean not null default true,
  note text,
  granted_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(valid_until is null or valid_from is null or valid_until>=valid_from)
);
create unique index if not exists uq_user_permission_active_scope
on public.user_permission_grants(user_id,permission_code,(scope::text)) where active;
create index if not exists idx_user_permission_grants_user on public.user_permission_grants(user_id) where active;

create table if not exists public.permission_audit_log(
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references public.profiles(user_id) on delete cascade,
  permission_code text not null,
  operation text not null check(operation in ('grant','revoke','update')),
  scope jsonb not null default '{}'::jsonb,
  note text,
  actor_user_id uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

insert into public.permission_catalog(code,module_code,module_label,label,action,description,dangerous,sort_order) values
('dashboard.view','dashboard','Genel','Paneli görüntüle','view','Ana yönetim panelini görüntüler.',false,10),
('management.access','management','Genel','Yönetim merkezine eriş','access','Yönetim merkezini ve atanmış yönetim araçlarını açar.',false,20),
('permissions.manage','permissions','Ayarlar','Görev ve yetki ata','manage','Kullanıcılara görev/yetki verir veya kaldırır.',true,30),
('schedule.view','schedule','Ders Programı','Ders programını görüntüle','view','Çalışma ve yayın programını görüntüler.',false,100),
('schedule.edit','schedule','Ders Programı','Ders programını düzenle','edit','Manuel ders/program değişikliği yapar.',true,110),
('schedule.rules','schedule','Ders Programı','Program kurallarını yönet','rules','Öğretmen, ders, blok ve eşzamanlı kuralları yönetir.',true,120),
('schedule.generate','schedule','Ders Programı','Program senaryosu üret','generate','Otomatik ders programı senaryoları üretir.',true,130),
('schedule.apply','schedule','Ders Programı','Program senaryosu uygula','apply','Seçilen senaryoyu çalışma programına uygular.',true,140),
('schedule.publish','schedule','Ders Programı','Ders programını yayınla','publish','Programı yürürlüğe alır ve arşivler.',true,150),
('schedule.restore','schedule','Ders Programı','Program geçmişini geri yükle','restore','Önceki çalışma programına geri döner.',true,160),
('classrooms.manage','classrooms','Derslikler','Derslikleri yönet','manage','Derslik, kapasite ve donanım tanımlarını yönetir.',true,170),
('curriculum.manage','curriculum','Müfredat','Müfredat ve ders yükünü yönet','manage','Sınıf ders yükü ve öğretmen atamalarını yönetir.',true,180),
('duty.view','duty','Nöbet','Nöbet planını görüntüle','view','Aylık/günlük nöbet planlarını görüntüler.',false,200),
('duty.manage','duty','Nöbet','Nöbet planını yönet','manage','Nöbet havuzu, yerleri ve atamaları yönetir.',true,210),
('duty.generate','duty','Nöbet','Aylık nöbet üret','generate','Aylık idareci/öğretmen nöbetini oluşturur.',true,220),
('duty.lock','duty','Nöbet','Nöbet ayını kilitle/aç','lock','Aylık nöbet planını kilitler veya yeniden açar.',true,230),
('payroll.view','payroll','Ek Ders','Ek ders verisini görüntüle','view','Ek ders hesap ve çizelgelerini görüntüler.',false,300),
('payroll.calculate','payroll','Ek Ders','Ek ders hesapla','calculate','Ek ders hesaplama motorunu çalıştırır.',true,310),
('payroll.edit','payroll','Ek Ders','Ek ders düzelt','edit','Ek ders verilerinde yetkili düzeltme yapar.',true,320),
('payroll.approve','payroll','Ek Ders','Ek dersi onayla','approve','Ek ders dönemini/onay akışını onaylar.',true,330),
('payroll.publish','payroll','Ek Ders','Ek ders çıktısını kesinleştir','publish','Kesin ek ders çıktısını oluşturur/yayınlar.',true,340),
('substitutes.view','substitutes','Vekalet','Vekaletleri görüntüle','view','Ders vekalet/boş ders durumunu görüntüler.',false,400),
('substitutes.manage','substitutes','Vekalet','Vekalet ata ve yönet','manage','Vekalet önerisi ve ataması yapar.',true,410),
('classes.manage','classes','Sınıflar','Sınıf/öğrenci yapısını yönet','manage','Sınıf ve ilgili öğrenci yapılarını yönetir.',true,500),
('personnel.view','personnel','Personel','Personeli görüntüle','view','Personel listesini görüntüler.',false,600),
('personnel.manage','personnel','Personel','Personel kaydını yönet','manage','Personel ön kayıt ve görev bilgilerini yönetir.',true,610),
('norm.view','norm','Norm','Norm analizini görüntüle','view','Norm analizini görüntüler.',false,700),
('norm.manage','norm','Norm','Norm kurallarını yönet','manage','Norm kural/kaynak tanımlarını yönetir.',true,710),
('quran.manage','quran','Kur’an Grupları','Kur’an grup planını yönet','manage','Kur’an paralel grup planlarını yönetir.',true,800),
('notifications.manage','notifications','Bildirim','Sistem bildirimlerini yönet','manage','Kurumsal bildirim işlemlerini yönetir.',true,900),
('settings.manage','settings','Ayarlar','Sistem ayarlarını yönet','manage','Genel sistem ayarlarını yönetir.',true,1000)
on conflict(code) do update set module_code=excluded.module_code,module_label=excluded.module_label,label=excluded.label,action=excluded.action,description=excluded.description,dangerous=excluded.dangerous,sort_order=excluded.sort_order,active=true;

create or replace function public.can_manage_permissions()
returns boolean
language sql stable security definer set search_path=public as $$
  select public.is_super_admin()
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin')
    or exists(
      select 1 from public.user_permission_grants g
      where g.user_id=auth.uid() and g.permission_code='permissions.manage' and g.active
        and (g.valid_from is null or g.valid_from<=current_date)
        and (g.valid_until is null or g.valid_until>=current_date)
    );
$$;

create or replace function public.has_permission(p_code text,p_scope jsonb default '{}'::jsonb)
returns boolean
language sql stable security definer set search_path=public as $$
  select public.is_super_admin()
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin')
    or exists(
      select 1 from public.user_permission_grants g
      where g.user_id=auth.uid() and g.permission_code=p_code and g.active
        and (g.valid_from is null or g.valid_from<=current_date)
        and (g.valid_until is null or g.valid_until>=current_date)
        and (g.scope='{}'::jsonb or p_scope='{}'::jsonb or g.scope @> p_scope)
    );
$$;

create or replace function public.has_any_module_permission(p_module text)
returns boolean
language sql stable security definer set search_path=public as $$
  select public.is_super_admin()
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin')
    or exists(
      select 1 from public.user_permission_grants g join public.permission_catalog c on c.code=g.permission_code
      where g.user_id=auth.uid() and c.module_code=p_module and g.active and c.active
        and (g.valid_from is null or g.valid_from<=current_date)
        and (g.valid_until is null or g.valid_until>=current_date)
    );
$$;

create or replace function public.get_my_permissions()
returns table(code text,module_code text,module_label text,label text,action text,scope jsonb,dangerous boolean)
language sql stable security definer set search_path=public as $$
  select c.code,c.module_code,c.module_label,c.label,c.action,g.scope,c.dangerous
  from public.user_permission_grants g join public.permission_catalog c on c.code=g.permission_code
  where g.user_id=auth.uid() and g.active and c.active
    and (g.valid_from is null or g.valid_from<=current_date)
    and (g.valid_until is null or g.valid_until>=current_date)
  union all
  select c.code,c.module_code,c.module_label,c.label,c.action,'{}'::jsonb,c.dangerous
  from public.permission_catalog c
  where c.active and (public.is_super_admin() or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin'))
    and not exists(select 1 from public.user_permission_grants g where g.user_id=auth.uid() and g.permission_code=c.code and g.active)
  order by module_label,label;
$$;

create or replace function public.set_user_permission(
  p_user_id uuid,p_permission_code text,p_enabled boolean,
  p_scope jsonb default '{}'::jsonb,p_valid_from date default null,p_valid_until date default null,p_note text default null
)
returns boolean
language plpgsql security definer set search_path=public as $$
declare v_existing uuid;
begin
  if not public.can_manage_permissions() then raise exception 'NOT_AUTHORIZED';end if;
  if p_user_id=auth.uid() and not public.is_super_admin() then raise exception 'CANNOT_CHANGE_OWN_PERMISSION';end if;
  if not exists(select 1 from public.profiles where user_id=p_user_id) then raise exception 'USER_NOT_FOUND';end if;
  if not exists(select 1 from public.permission_catalog where code=p_permission_code and active) then raise exception 'PERMISSION_NOT_FOUND';end if;
  if p_permission_code='permissions.manage' and not (public.is_super_admin() or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin')) then raise exception 'CANNOT_DELEGATE_PERMISSION_ADMIN';end if;

  select id into v_existing from public.user_permission_grants
  where user_id=p_user_id and permission_code=p_permission_code and scope=p_scope and active limit 1;
  if p_enabled then
    if v_existing is null then
      insert into public.user_permission_grants(user_id,permission_code,scope,valid_from,valid_until,note,granted_by)
      values(p_user_id,p_permission_code,coalesce(p_scope,'{}'::jsonb),p_valid_from,p_valid_until,p_note,auth.uid());
      insert into public.permission_audit_log(target_user_id,permission_code,operation,scope,note,actor_user_id)
      values(p_user_id,p_permission_code,'grant',coalesce(p_scope,'{}'::jsonb),p_note,auth.uid());
    else
      update public.user_permission_grants set valid_from=p_valid_from,valid_until=p_valid_until,note=p_note,updated_at=now() where id=v_existing;
      insert into public.permission_audit_log(target_user_id,permission_code,operation,scope,note,actor_user_id)
      values(p_user_id,p_permission_code,'update',coalesce(p_scope,'{}'::jsonb),p_note,auth.uid());
    end if;
  elsif v_existing is not null then
    update public.user_permission_grants set active=false,updated_at=now() where id=v_existing;
    insert into public.permission_audit_log(target_user_id,permission_code,operation,scope,note,actor_user_id)
    values(p_user_id,p_permission_code,'revoke',coalesce(p_scope,'{}'::jsonb),p_note,auth.uid());
  end if;
  return true;
end;
$$;

create or replace function public.get_permission_admin_matrix()
returns table(user_id uuid,full_name text,role public.app_role,permission_code text,scope jsonb,valid_from date,valid_until date)
language sql stable security definer set search_path=public as $$
  select p.user_id,p.full_name,p.role,g.permission_code,g.scope,g.valid_from,g.valid_until
  from public.profiles p left join public.user_permission_grants g on g.user_id=p.user_id and g.active
  where public.can_manage_permissions()
  order by p.full_name,g.permission_code;
$$;

alter table public.permission_catalog enable row level security;
alter table public.user_permission_grants enable row level security;
alter table public.permission_audit_log enable row level security;
grant select on public.permission_catalog to authenticated;
grant select on public.user_permission_grants to authenticated;
grant select on public.permission_audit_log to authenticated;
create policy "authenticated read permission catalog" on public.permission_catalog for select to authenticated using(true);
create policy "users read own or managers read grants" on public.user_permission_grants for select to authenticated using(user_id=auth.uid() or public.can_manage_permissions());
create policy "permission managers read audit" on public.permission_audit_log for select to authenticated using(public.can_manage_permissions());

revoke all on function public.can_manage_permissions() from public;
revoke all on function public.has_permission(text,jsonb) from public;
revoke all on function public.has_any_module_permission(text) from public;
revoke all on function public.get_my_permissions() from public;
revoke all on function public.set_user_permission(uuid,text,boolean,jsonb,date,date,text) from public;
revoke all on function public.get_permission_admin_matrix() from public;
grant execute on function public.can_manage_permissions(),public.has_permission(text,jsonb),public.has_any_module_permission(text),public.get_my_permissions(),public.set_user_permission(uuid,text,boolean,jsonb,date,date,text),public.get_permission_admin_matrix() to authenticated;