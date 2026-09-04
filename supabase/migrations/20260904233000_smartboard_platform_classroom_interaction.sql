-- SmartBoard cross-platform runtime + classroom interaction foundation.
-- Goals:
-- * Pardus/ETAP remains the primary Türkiye classroom runtime, but FATIH/ETAP phase generations must degrade gracefully.
-- * Windows is a first-class independent runtime for international/non-Pardus deployments.
-- * Teacher tablet/laptop casting is the primary presentation path for now.
-- * Student phones participate in low-friction polls / multiple-choice / quick checks without requiring full screen casting.
-- * Resolution/layout decisions are capability-driven; never hard-code one display size.
-- * Runtime integration never uses a Lovable token.

create table if not exists public.smartboard_platform_profiles (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  smartboard_device_key text not null,
  operating_system text not null check (operating_system in ('PARDUS','WINDOWS')),
  os_version text,
  hardware_family text,
  fatih_phase text check (fatih_phase is null or fatih_phase in ('PHASE_1','PHASE_2','PHASE_3','PHASE_4','OTHER')),
  architecture text,
  display_width integer,
  display_height integer,
  display_scale numeric(6,3) not null default 1,
  refresh_rate_hz numeric(6,2),
  touch_points integer,
  has_touch boolean not null default true,
  has_camera boolean not null default false,
  has_microphone boolean not null default false,
  has_speakers boolean not null default true,
  has_wifi boolean not null default true,
  has_ethernet boolean not null default true,
  has_gpu_acceleration boolean not null default false,
  supports_rtc_wake boolean not null default false,
  supports_wol boolean not null default false,
  supports_s5_wol boolean not null default false,
  supports_ac_restore boolean not null default false,
  supports_webrtc boolean not null default true,
  supports_miracast boolean not null default false,
  supports_airplay_bridge boolean not null default false,
  supports_google_cast_bridge boolean not null default false,
  supports_screen_capture boolean not null default true,
  supports_remote_control boolean not null default true,
  capability_tier text not null default 'STANDARD' check (capability_tier in ('LEGACY','STANDARD','ENHANCED','PREMIUM')),
  capabilities jsonb not null default '{}'::jsonb,
  last_probe_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(institution_code,smartboard_device_key),
  check (display_width is null or display_width between 640 and 16384),
  check (display_height is null or display_height between 480 and 16384),
  check (display_scale > 0 and display_scale <= 8)
);

create table if not exists public.smartboard_runtime_feature_matrix (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  smartboard_device_key text not null,
  feature_code text not null,
  support_level text not null check (support_level in ('NATIVE','FALLBACK','DISABLED')),
  fallback_strategy text,
  reason text,
  evaluated_at timestamptz not null default now(),
  unique(institution_code,smartboard_device_key,feature_code)
);

create table if not exists public.smartboard_app_catalog (
  id uuid primary key default gen_random_uuid(),
  app_code text not null unique,
  display_name text not null,
  category text not null check (category in ('WHITEBOARD','MATH','SCIENCE','LANGUAGE','OFFICE','MEDIA','PDF','UTILITY','EDUCATION','SYSTEM')),
  pardus_package text,
  windows_package text,
  launch_uri text,
  required boolean not null default false,
  default_enabled boolean not null default true,
  min_capability_tier text not null default 'LEGACY' check (min_capability_tier in ('LEGACY','STANDARD','ENHANCED','PREMIUM')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.smartboard_app_catalog(app_code,display_name,category,pardus_package,windows_package,required,min_capability_tier,metadata)
values
  ('SMARTBOARD_WHITEBOARD','SmartBoard Beyaz Tahta','WHITEBOARD','smartboard-whiteboard','smartboard-whiteboard',true,'LEGACY','{"features":["pen","eraser","shapes","layers","export","annotation"]}'::jsonb),
  ('MATH_TOOLS','Matematik Araçları','MATH','smartboard-math-tools','smartboard-math-tools',true,'LEGACY','{"features":["ruler","protractor","compass","coordinate_plane","geometry","graphing"]}'::jsonb),
  ('LIBREOFFICE_WRITER','LibreOffice Writer','OFFICE','libreoffice-writer','LibreOffice',true,'LEGACY','{}'::jsonb),
  ('LIBREOFFICE_CALC','LibreOffice Calc','OFFICE','libreoffice-calc','LibreOffice',true,'LEGACY','{}'::jsonb),
  ('LIBREOFFICE_IMPRESS','LibreOffice Impress','OFFICE','libreoffice-impress','LibreOffice',true,'LEGACY','{"extensions":["ppt","pptx","odp"]}'::jsonb),
  ('XOURNALPP','Xournal++','PDF','xournalpp','Xournal++',false,'LEGACY','{"features":["pdf_annotation"]}'::jsonb),
  ('VLC','VLC Media Player','MEDIA','vlc','VLC',true,'LEGACY','{}'::jsonb),
  ('GEOGEBRA','GeoGebra','MATH','geogebra','GeoGebra',false,'STANDARD','{"features":["geometry","algebra","graphing"]}'::jsonb)
on conflict(app_code) do update set
  display_name=excluded.display_name,
  category=excluded.category,
  pardus_package=excluded.pardus_package,
  windows_package=excluded.windows_package,
  required=excluded.required,
  min_capability_tier=excluded.min_capability_tier,
  metadata=excluded.metadata;

create table if not exists public.smartboard_ota_channels (
  id uuid primary key default gen_random_uuid(),
  institution_code text,
  platform text not null check (platform in ('PARDUS','WINDOWS')),
  channel text not null check (channel in ('PILOT','BETA','STABLE')),
  package_kind text not null check (package_kind in ('SMARTBOARD_APP','OS_SYSTEM','APP_BUNDLE')),
  version text not null,
  artifact_url text,
  sha256 text,
  signature text,
  release_notes text,
  min_capability_tier text not null default 'LEGACY' check (min_capability_tier in ('LEGACY','STANDARD','ENHANCED','PREMIUM')),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique(institution_code,platform,channel,package_kind,version)
);

create table if not exists public.smartboard_cast_sessions (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  smartboard_device_key text not null,
  teacher_user_id uuid not null references public.profiles(user_id) on delete cascade,
  schedule_id uuid references public.teacher_schedule(id) on delete set null,
  source_device_kind text not null check (source_device_kind in ('TABLET','PHONE','LAPTOP','DESKTOP')),
  transport text not null check (transport in ('WEBRTC','MIRACAST','AIRPLAY','GOOGLE_CAST','LOCAL_HUB')),
  mode text not null default 'TEACHER_ONLY' check (mode in ('TEACHER_ONLY','MODERATED_PARTICIPANT')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'STARTING' check (status in ('STARTING','ACTIVE','ENDED','FAILED')),
  negotiated_width integer,
  negotiated_height integer,
  negotiated_fps integer,
  metadata jsonb not null default '{}'::jsonb,
  check (ended_at is null or ended_at >= started_at)
);

create index if not exists idx_smartboard_cast_active
  on public.smartboard_cast_sessions(institution_code,smartboard_device_key,status,started_at desc);

create table if not exists public.classroom_response_sessions (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  schedule_id uuid references public.teacher_schedule(id) on delete set null,
  smartboard_device_key text,
  teacher_user_id uuid not null references public.profiles(user_id) on delete cascade,
  section_instance_id uuid references public.section_instances(id) on delete set null,
  session_kind text not null check (session_kind in ('POLL','MULTIPLE_CHOICE','QUICK_CHECK','SURVEY')),
  title text not null,
  prompt text,
  join_code text not null,
  anonymous_allowed boolean not null default true,
  show_live_results boolean not null default true,
  starts_at timestamptz not null default now(),
  closes_at timestamptz,
  status text not null default 'OPEN' check (status in ('DRAFT','OPEN','CLOSED','ARCHIVED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(institution_code,join_code),
  check (join_code ~ '^[0-9A-Z]{4,8}$'),
  check (closes_at is null or closes_at >= starts_at)
);

create index if not exists idx_classroom_response_open
  on public.classroom_response_sessions(institution_code,status,starts_at desc);

create table if not exists public.classroom_response_options (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.classroom_response_sessions(id) on delete cascade,
  option_key text not null,
  option_label text not null,
  sort_order integer not null default 0,
  is_correct boolean,
  unique(session_id,option_key)
);

create table if not exists public.classroom_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.classroom_response_sessions(id) on delete cascade,
  respondent_user_id uuid references public.profiles(user_id) on delete set null,
  participant_key text,
  option_id uuid references public.classroom_response_options(id) on delete set null,
  text_response text,
  submitted_at timestamptz not null default now(),
  client_context jsonb not null default '{}'::jsonb,
  check (respondent_user_id is not null or nullif(btrim(coalesce(participant_key,'')),'') is not null),
  check (option_id is not null or nullif(btrim(coalesce(text_response,'')),'') is not null)
);

create unique index if not exists uq_classroom_response_authenticated
  on public.classroom_responses(session_id,respondent_user_id)
  where respondent_user_id is not null;
create unique index if not exists uq_classroom_response_participant
  on public.classroom_responses(session_id,participant_key)
  where participant_key is not null;

create or replace function public.smartboard_resolution_profile(p_institution_code text,p_device_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v public.smartboard_platform_profiles%rowtype;
  v_aspect numeric;
  v_bucket text;
begin
  if auth.role()<>'service_role' and not public.has_institution_access(p_institution_code) then
    raise exception 'TENANT_ACCESS_DENIED';
  end if;
  select * into v from public.smartboard_platform_profiles
  where institution_code=p_institution_code and smartboard_device_key=p_device_key;
  if not found then
    return jsonb_build_object('mode','RESPONSIVE_SAFE','width',null,'height',null,'scale',1,'aspectBucket','UNKNOWN','touchTargetPx',48);
  end if;
  if v.display_width is null or v.display_height is null then
    v_bucket:='UNKNOWN';
  else
    v_aspect:=v.display_width::numeric/greatest(v.display_height,1);
    v_bucket:=case when v_aspect>=2 then 'ULTRAWIDE' when v_aspect>=1.65 then 'WIDE' when v_aspect>=1.3 then 'LANDSCAPE' else 'SQUARE_OR_PORTRAIT' end;
  end if;
  return jsonb_build_object(
    'mode','RESPONSIVE_CAPABILITY_DRIVEN',
    'width',v.display_width,
    'height',v.display_height,
    'scale',v.display_scale,
    'aspectBucket',v_bucket,
    'touchPoints',v.touch_points,
    'capabilityTier',v.capability_tier,
    'touchTargetPx',case when v.display_scale>=1.5 then 56 else 48 end,
    'preferGpu',v.has_gpu_acceleration
  );
end $$;

create or replace function public.smartboard_evaluate_runtime_features(p_institution_code text,p_device_key text)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v public.smartboard_platform_profiles%rowtype;
begin
  if auth.role()<>'service_role' and not public.has_institution_access(p_institution_code) then raise exception 'TENANT_ACCESS_DENIED'; end if;
  select * into v from public.smartboard_platform_profiles where institution_code=p_institution_code and smartboard_device_key=p_device_key;
  if not found then raise exception 'PLATFORM_PROFILE_NOT_FOUND'; end if;

  delete from public.smartboard_runtime_feature_matrix where institution_code=p_institution_code and smartboard_device_key=p_device_key;

  insert into public.smartboard_runtime_feature_matrix(institution_code,smartboard_device_key,feature_code,support_level,fallback_strategy,reason)
  values
    (p_institution_code,p_device_key,'WHITEBOARD','NATIVE',null,'Core SmartBoard application'),
    (p_institution_code,p_device_key,'MATH_TOOLS','NATIVE',null,'Core SmartBoard application'),
    (p_institution_code,p_device_key,'TEACHER_CAST',case when v.supports_webrtc or v.supports_miracast or v.supports_airplay_bridge or v.supports_google_cast_bridge then 'NATIVE' else 'FALLBACK' end,'LOCAL_HUB_FRAME_STREAM',case when v.operating_system='PARDUS' then coalesce(v.fatih_phase,'PARDUS_GENERIC') else 'WINDOWS_RUNTIME' end),
    (p_institution_code,p_device_key,'REMOTE_SCREEN_VIEW',case when v.supports_screen_capture then 'NATIVE' else 'DISABLED' end,null,'Capability probe'),
    (p_institution_code,p_device_key,'REMOTE_CONTROL',case when v.supports_remote_control then 'NATIVE' else 'DISABLED' end,null,'Capability probe'),
    (p_institution_code,p_device_key,'RTC_WAKE',case when v.supports_rtc_wake then 'NATIVE' else 'FALLBACK' end,'LOCAL_HUB_WOL','Firmware capability'),
    (p_institution_code,p_device_key,'WOL',case when v.supports_wol then 'NATIVE' else 'DISABLED' end,null,'NIC/firmware capability'),
    (p_institution_code,p_device_key,'GPU_EFFECTS',case when v.has_gpu_acceleration and v.capability_tier in ('ENHANCED','PREMIUM') then 'NATIVE' else 'FALLBACK' end,'CPU_SAFE_RENDERER','Legacy FATIH phases must remain functional');
end $$;

create or replace function public.classroom_response_summary(p_session_id uuid)
returns table(option_id uuid,option_key text,option_label text,response_count bigint,percent numeric)
language sql
stable
security definer
set search_path=public
as $$
  with s as (
    select * from public.classroom_response_sessions where id=p_session_id
  ), allowed as (
    select 1 from s where teacher_user_id=auth.uid() or public.has_institution_access(institution_code)
  ), totals as (
    select count(*)::numeric total from public.classroom_responses r where r.session_id=p_session_id
  )
  select o.id,o.option_key,o.option_label,count(r.id),
         case when t.total=0 then 0 else round((count(r.id)::numeric*100)/t.total,2) end
  from public.classroom_response_options o
  join allowed a on true
  cross join totals t
  left join public.classroom_responses r on r.option_id=o.id and r.session_id=o.session_id
  where o.session_id=p_session_id
  group by o.id,o.option_key,o.option_label,o.sort_order,t.total
  order by o.sort_order,o.option_key;
$$;

alter table public.smartboard_platform_profiles enable row level security;
alter table public.smartboard_runtime_feature_matrix enable row level security;
alter table public.smartboard_ota_channels enable row level security;
alter table public.smartboard_cast_sessions enable row level security;
alter table public.classroom_response_sessions enable row level security;
alter table public.classroom_response_options enable row level security;
alter table public.classroom_responses enable row level security;

-- Tenant read; management write for platform and OTA data.
do $$ begin create policy "tenant read smartboard platform profiles" on public.smartboard_platform_profiles for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;
do $$ begin create policy "managers manage smartboard platform profiles" on public.smartboard_platform_profiles for all to authenticated using(public.has_institution_access(institution_code) and public.is_manager_or_admin()) with check(public.has_institution_access(institution_code) and public.is_manager_or_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "tenant read smartboard runtime matrix" on public.smartboard_runtime_feature_matrix for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;
do $$ begin create policy "tenant read smartboard ota" on public.smartboard_ota_channels for select to authenticated using(institution_code is null or public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;
do $$ begin create policy "managers manage institution smartboard ota" on public.smartboard_ota_channels for all to authenticated using(institution_code is not null and public.has_institution_access(institution_code) and public.is_manager_or_admin()) with check(institution_code is not null and public.has_institution_access(institution_code) and public.is_manager_or_admin()); exception when duplicate_object then null; end $$;

-- Teacher cast sessions are visible inside the institution; teachers manage their own session, managers may manage all.
do $$ begin create policy "tenant read smartboard cast sessions" on public.smartboard_cast_sessions for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;
do $$ begin create policy "teacher creates own smartboard cast session" on public.smartboard_cast_sessions for insert to authenticated with check(public.has_institution_access(institution_code) and teacher_user_id=auth.uid()); exception when duplicate_object then null; end $$;
do $$ begin create policy "teacher updates own smartboard cast session" on public.smartboard_cast_sessions for update to authenticated using(public.has_institution_access(institution_code) and (teacher_user_id=auth.uid() or public.is_manager_or_admin())) with check(public.has_institution_access(institution_code) and (teacher_user_id=auth.uid() or public.is_manager_or_admin())); exception when duplicate_object then null; end $$;

-- Classroom response authoring is teacher-owned. Reading raw responses is limited to teacher/management.
do $$ begin create policy "teacher reads classroom response sessions" on public.classroom_response_sessions for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;
do $$ begin create policy "teacher creates classroom response sessions" on public.classroom_response_sessions for insert to authenticated with check(public.has_institution_access(institution_code) and teacher_user_id=auth.uid()); exception when duplicate_object then null; end $$;
do $$ begin create policy "teacher updates own classroom response sessions" on public.classroom_response_sessions for update to authenticated using(public.has_institution_access(institution_code) and (teacher_user_id=auth.uid() or public.is_manager_or_admin())) with check(public.has_institution_access(institution_code) and (teacher_user_id=auth.uid() or public.is_manager_or_admin())); exception when duplicate_object then null; end $$;
do $$ begin create policy "tenant reads classroom response options" on public.classroom_response_options for select to authenticated using(exists(select 1 from public.classroom_response_sessions s where s.id=session_id and public.has_institution_access(s.institution_code))); exception when duplicate_object then null; end $$;
do $$ begin create policy "teacher manages classroom response options" on public.classroom_response_options for all to authenticated using(exists(select 1 from public.classroom_response_sessions s where s.id=session_id and public.has_institution_access(s.institution_code) and (s.teacher_user_id=auth.uid() or public.is_manager_or_admin()))) with check(exists(select 1 from public.classroom_response_sessions s where s.id=session_id and public.has_institution_access(s.institution_code) and (s.teacher_user_id=auth.uid() or public.is_manager_or_admin()))); exception when duplicate_object then null; end $$;
do $$ begin create policy "teacher reads classroom responses" on public.classroom_responses for select to authenticated using(exists(select 1 from public.classroom_response_sessions s where s.id=session_id and public.has_institution_access(s.institution_code) and (s.teacher_user_id=auth.uid() or public.is_manager_or_admin()))); exception when duplicate_object then null; end $$;
do $$ begin create policy "authenticated respondent submits classroom response" on public.classroom_responses for insert to authenticated with check(exists(select 1 from public.classroom_response_sessions s where s.id=session_id and s.status='OPEN' and public.has_institution_access(s.institution_code)) and (respondent_user_id=auth.uid() or respondent_user_id is null)); exception when duplicate_object then null; end $$;

grant select on public.smartboard_app_catalog to authenticated,service_role;
grant select on public.smartboard_platform_profiles,public.smartboard_runtime_feature_matrix,public.smartboard_ota_channels,public.smartboard_cast_sessions,public.classroom_response_sessions,public.classroom_response_options to authenticated;
grant select,insert,update on public.smartboard_cast_sessions,public.classroom_response_sessions to authenticated;
grant select,insert,update,delete on public.classroom_response_options to authenticated;
grant select,insert on public.classroom_responses to authenticated;
grant all on public.smartboard_platform_profiles,public.smartboard_runtime_feature_matrix,public.smartboard_ota_channels,public.smartboard_cast_sessions,public.classroom_response_sessions,public.classroom_response_options,public.classroom_responses to service_role;
grant execute on function public.smartboard_resolution_profile(text,text) to authenticated,service_role;
grant execute on function public.smartboard_evaluate_runtime_features(text,text) to authenticated,service_role;
grant execute on function public.classroom_response_summary(uuid) to authenticated,service_role;
