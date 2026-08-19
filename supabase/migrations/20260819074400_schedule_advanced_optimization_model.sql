-- Advanced timetable optimization model: rule modes, school profiles, pedagogy, duty load,
-- vocational workshop block policies, explainability and repair audit infrastructure.

create table if not exists public.schedule_optimization_profiles (
  profile_key text primary key,
  name text not null,
  description text,
  system_profile boolean not null default false,
  weights jsonb not null default '{}'::jsonb,
  defaults jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.schedule_optimization_profiles(profile_key,name,description,system_profile,weights,defaults)
values
('balanced','Dengeli','Öğretmen, öğrenci ve fiziksel kaynak kalitesini dengeler.',true,
 '{"teacher_gap":8,"class_gap":6,"late_period":2,"same_course_repeat":12,"duty_overload":20,"duty_adjacent":15,"heavy_consecutive":22,"pedagogic_imbalance":15,"workshop_small_block":30,"workshop_gap":25,"preferred_large_block":-10}'::jsonb,
 '{"rule_mode":"soft"}'::jsonb),
('student','Öğrenci Odaklı','Bilişsel yük, zor ders yığılması ve günlük dengeyi önceler.',true,
 '{"teacher_gap":5,"class_gap":10,"late_period":4,"same_course_repeat":16,"duty_overload":15,"duty_adjacent":10,"heavy_consecutive":30,"pedagogic_imbalance":28,"workshop_small_block":25,"workshop_gap":20,"preferred_large_block":-8}'::jsonb,
 '{"rule_mode":"soft"}'::jsonb),
('teacher','Öğretmen Odaklı','Öğretmen boşluklarını, nöbet yükünü ve çalışma günü dengesini önceler.',true,
 '{"teacher_gap":18,"class_gap":4,"late_period":2,"same_course_repeat":10,"duty_overload":32,"duty_adjacent":24,"heavy_consecutive":14,"pedagogic_imbalance":10,"workshop_small_block":25,"workshop_gap":20,"preferred_large_block":-8}'::jsonb,
 '{"rule_mode":"soft"}'::jsonb),
('vocational','Meslek Lisesi','Atölye ve meslek uygulamalarında büyük blokları önceler.',true,
 '{"teacher_gap":8,"class_gap":6,"late_period":1,"same_course_repeat":8,"duty_overload":18,"duty_adjacent":12,"heavy_consecutive":14,"pedagogic_imbalance":12,"workshop_small_block":45,"workshop_gap":35,"preferred_large_block":-20}'::jsonb,
 '{"rule_mode":"soft","workshop_large_blocks":true}'::jsonb),
('intensive_language','Yoğun Dil','Dil derslerinde dağılım ve tekrar aralığını önceler.',true,
 '{"teacher_gap":8,"class_gap":8,"late_period":3,"same_course_repeat":20,"duty_overload":18,"duty_adjacent":12,"heavy_consecutive":18,"pedagogic_imbalance":20,"workshop_small_block":20,"workshop_gap":15,"preferred_large_block":-6}'::jsonb,
 '{"rule_mode":"soft"}'::jsonb),
('imam_hatip','İmam Hatip','Kur’an/grup dersleri ve akademik yük dengesini birlikte önceler.',true,
 '{"teacher_gap":8,"class_gap":8,"late_period":3,"same_course_repeat":14,"duty_overload":20,"duty_adjacent":15,"heavy_consecutive":22,"pedagogic_imbalance":22,"workshop_small_block":22,"workshop_gap":18,"preferred_large_block":-8}'::jsonb,
 '{"rule_mode":"soft"}'::jsonb),
('primary','İlkokul','Sınıf günlük yük dengesi ve yorucu ders yığılmasını önceler.',true,
 '{"teacher_gap":4,"class_gap":10,"late_period":4,"same_course_repeat":18,"duty_overload":15,"duty_adjacent":10,"heavy_consecutive":28,"pedagogic_imbalance":30,"workshop_small_block":20,"workshop_gap":15,"preferred_large_block":-5}'::jsonb,
 '{"rule_mode":"soft"}'::jsonb)
on conflict(profile_key) do update set
  name=excluded.name,description=excluded.description,system_profile=excluded.system_profile,
  weights=excluded.weights,defaults=excluded.defaults,updated_at=now();

create table if not exists public.schedule_optimization_settings (
  id boolean primary key default true check(id=true),
  active_profile_key text not null default 'balanced' references public.schedule_optimization_profiles(profile_key),
  explain_scenarios boolean not null default true,
  record_repairs boolean not null default true,
  updated_by uuid references public.profiles(user_id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into public.schedule_optimization_settings(id) values(true) on conflict(id) do nothing;

create table if not exists public.schedule_rule_modes (
  rule_code text primary key,
  label text not null,
  category text not null,
  mode text not null default 'soft' check(mode in ('off','soft','hard')),
  weight integer not null default 0,
  config jsonb not null default '{}'::jsonb,
  system_rule boolean not null default true,
  updated_by uuid references public.profiles(user_id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.schedule_rule_modes(rule_code,label,category,mode,weight,config)
values
('teacher_class_consecutive','Aynı öğretmen-sınıf ardışık ders sınırı','hard','hard',0,'{"max":3,"high_hour_threshold":9,"max_triple_blocks_per_day":1,"workshop_exempt":true}'::jsonb),
('same_course_repeat_day','Aynı dersin aynı gün ayrı bloklarda tekrarı','pedagogy','soft',20,'{"allow_official_block":true}'::jsonb),
('duty_light_day','Nöbet gününde hafif program','duty','soft',20,'{"default_max_hours":5}'::jsonb),
('duty_adjacent_lesson','Nöbet saatine bitişik ders','duty','soft',15,'{}'::jsonb),
('heavy_course_consecutive','Zor derslerin arka arkaya yığılması','pedagogy','soft',22,'{"difficulty_threshold":4}'::jsonb),
('pedagogic_daily_balance','Günlük pedagojik yük dengesi','pedagogy','soft',15,'{}'::jsonb),
('workshop_min_block','Atölye dersinde küçük blok','workshop','soft',30,'{"default_min_block":3}'::jsonb),
('workshop_large_block','Atölye büyük blok tercihi','workshop','soft',-10,'{}'::jsonb)
on conflict(rule_code) do nothing;

create table if not exists public.course_pedagogy_profiles (
  course_id uuid primary key references public.course_catalog(id) on delete cascade,
  academic_load smallint not null default 3 check(academic_load between 1 and 5),
  physical_load smallint not null default 1 check(physical_load between 1 and 5),
  practical_load smallint not null default 1 check(practical_load between 1 and 5),
  attention_load smallint not null default 3 check(attention_load between 1 and 5),
  difficulty smallint not null default 3 check(difficulty between 1 and 5),
  lesson_family text,
  is_workshop boolean not null default false,
  is_vocational_practice boolean not null default false,
  prefer_early boolean not null default false,
  avoid_early boolean not null default false,
  prefer_weekdays smallint[] not null default '{}'::smallint[],
  updated_by uuid references public.profiles(user_id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.schedule_workshop_policies (
  course_id uuid primary key references public.course_catalog(id) on delete cascade,
  min_block smallint not null default 3 check(min_block between 1 and 12),
  preferred_block smallint not null default 5 check(preferred_block between 1 and 12),
  max_block smallint not null default 7 check(max_block between 1 and 12),
  preferred_patterns smallint[][] not null default array[array[6,6]::smallint[],array[6,4]::smallint[],array[5,5]::smallint[]],
  active boolean not null default true,
  updated_by uuid references public.profiles(user_id) on delete set null,
  updated_at timestamptz not null default now(),
  check(min_block<=preferred_block and preferred_block<=max_block)
);

create table if not exists public.schedule_duty_optimization (
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  weekday smallint not null check(weekday between 1 and 7),
  max_duty_day_hours smallint not null default 5 check(max_duty_day_hours between 0 and 12),
  anchor_period smallint check(anchor_period between 1 and 12),
  overload_weight integer not null default 20,
  adjacent_weight integer not null default 15,
  hard_max boolean not null default false,
  source text not null default 'manual' check(source in ('manual','duty_cycle')),
  updated_at timestamptz not null default now(),
  primary key(teacher_id,weekday)
);

create table if not exists public.schedule_repair_audit (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.schedule_scenarios(id) on delete cascade,
  action_no integer not null,
  issue_code text not null,
  description text not null,
  before_state jsonb,
  after_state jsonb,
  score_delta integer,
  hard_issues_before integer,
  hard_issues_after integer,
  created_at timestamptz not null default now(),
  unique(scenario_id,action_no)
);

create table if not exists public.schedule_scenario_explanations (
  scenario_id uuid primary key references public.schedule_scenarios(id) on delete cascade,
  total_score integer not null default 0,
  pedagogic_score integer not null default 0,
  teacher_score integer not null default 0,
  room_score integer not null default 0,
  duty_score integer not null default 0,
  workshop_score integer not null default 0,
  positives jsonb not null default '[]'::jsonb,
  negatives jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now()
);

alter table public.schedule_optimization_profiles enable row level security;
alter table public.schedule_optimization_settings enable row level security;
alter table public.schedule_rule_modes enable row level security;
alter table public.course_pedagogy_profiles enable row level security;
alter table public.schedule_workshop_policies enable row level security;
alter table public.schedule_duty_optimization enable row level security;
alter table public.schedule_repair_audit enable row level security;
alter table public.schedule_scenario_explanations enable row level security;

grant select on public.schedule_optimization_profiles,public.schedule_optimization_settings,public.schedule_rule_modes,
  public.course_pedagogy_profiles,public.schedule_workshop_policies,public.schedule_duty_optimization,
  public.schedule_repair_audit,public.schedule_scenario_explanations to authenticated;
grant insert,update,delete on public.schedule_optimization_settings,public.schedule_rule_modes,public.course_pedagogy_profiles,
  public.schedule_workshop_policies,public.schedule_duty_optimization to authenticated;

create policy "schedule users read optimization profiles" on public.schedule_optimization_profiles for select to authenticated using(public.has_permission('schedule.view') or public.has_permission('schedule.rules'));
create policy "schedule users read optimization settings" on public.schedule_optimization_settings for select to authenticated using(public.has_permission('schedule.view') or public.has_permission('schedule.rules'));
create policy "schedule rule managers manage optimization settings" on public.schedule_optimization_settings for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));
create policy "schedule users read rule modes" on public.schedule_rule_modes for select to authenticated using(public.has_permission('schedule.view') or public.has_permission('schedule.rules'));
create policy "schedule rule managers manage rule modes" on public.schedule_rule_modes for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));
create policy "schedule users read pedagogy" on public.course_pedagogy_profiles for select to authenticated using(public.has_permission('schedule.view') or public.has_permission('schedule.rules'));
create policy "schedule rule managers manage pedagogy" on public.course_pedagogy_profiles for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));
create policy "schedule users read workshop policies" on public.schedule_workshop_policies for select to authenticated using(public.has_permission('schedule.view') or public.has_permission('schedule.rules'));
create policy "schedule rule managers manage workshop policies" on public.schedule_workshop_policies for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));
create policy "schedule users read duty optimization" on public.schedule_duty_optimization for select to authenticated using(public.has_permission('schedule.view') or public.has_permission('schedule.rules'));
create policy "schedule rule managers manage duty optimization" on public.schedule_duty_optimization for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));
create policy "schedule users read repair audit" on public.schedule_repair_audit for select to authenticated using(public.has_permission('schedule.view') or public.has_permission('schedule.generate'));
create policy "schedule users read scenario explanations" on public.schedule_scenario_explanations for select to authenticated using(public.has_permission('schedule.view') or public.has_permission('schedule.generate'));

-- Keep weekly duty-cycle membership synchronized as default timetable duty optimization input.
create or replace function public.sync_schedule_duty_optimization_from_cycle()
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  if not(public.has_permission('schedule.rules') or public.has_permission('duty.manage')) then raise exception 'PERMISSION_DENIED';end if;
  insert into public.schedule_duty_optimization(teacher_id,weekday,source)
  select m.teacher_id,m.weekday,'duty_cycle'
  from public.teacher_duty_cycle_members m where m.active=true
  on conflict(teacher_id,weekday) do update set source=case when public.schedule_duty_optimization.source='manual' then 'manual' else 'duty_cycle' end,updated_at=now();
  get diagnostics v_count=row_count;
  return v_count;
end;$$;
revoke all on function public.sync_schedule_duty_optimization_from_cycle() from public;
grant execute on function public.sync_schedule_duty_optimization_from_cycle() to authenticated;
