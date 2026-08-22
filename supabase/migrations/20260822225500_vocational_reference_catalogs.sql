begin;

alter table public.institutions add column if not exists province_name text;

create table if not exists public.metropolitan_provinces(
 name text primary key,
 active boolean not null default true,
 source_note text
);
insert into public.metropolitan_provinces(name,source_note) values
('Adana','6360/5216 kapsamı'),('Ankara','6360/5216 kapsamı'),('Antalya','6360/5216 kapsamı'),('Aydın','6360/5216 kapsamı'),('Balıkesir','6360/5216 kapsamı'),('Bursa','6360/5216 kapsamı'),('Denizli','6360/5216 kapsamı'),('Diyarbakır','6360/5216 kapsamı'),('Erzurum','6360/5216 kapsamı'),('Eskişehir','6360/5216 kapsamı'),('Gaziantep','6360/5216 kapsamı'),('Hatay','6360/5216 kapsamı'),('İstanbul','6360/5216 kapsamı'),('İzmir','6360/5216 kapsamı'),('Kahramanmaraş','6360/5216 kapsamı'),('Kayseri','6360/5216 kapsamı'),('Kocaeli','6360/5216 kapsamı'),('Konya','6360/5216 kapsamı'),('Malatya','6360/5216 kapsamı'),('Manisa','6360/5216 kapsamı'),('Mardin','6360/5216 kapsamı'),('Mersin','6360/5216 kapsamı'),('Muğla','6360/5216 kapsamı'),('Ordu','6360/5216 kapsamı'),('Sakarya','6360/5216 kapsamı'),('Samsun','6360/5216 kapsamı'),('Şanlıurfa','6360/5216 kapsamı'),('Tekirdağ','6360/5216 kapsamı'),('Trabzon','6360/5216 kapsamı'),('Van','6360/5216 kapsamı')
on conflict(name) do update set active=true;

create or replace function public.is_metropolitan_province(p_name text)
returns boolean language sql stable as $$
 select exists(select 1 from public.metropolitan_provinces m where m.active and lower(m.name)=lower(trim(p_name)))
$$;

create table if not exists public.official_vocational_fields(
 id uuid primary key default gen_random_uuid(),
 institution_type text not null check(institution_type in ('MTAL','MESEM')),
 field_name text not null,
 source_scope text not null default 'CURRENT',
 source_url text,
 source_note text,
 active boolean not null default true,
 updated_at timestamptz not null default now(),
 unique(institution_type,field_name,source_scope)
);
create table if not exists public.official_vocational_branches(
 id uuid primary key default gen_random_uuid(),
 field_id uuid not null references public.official_vocational_fields(id) on delete cascade,
 branch_name text not null,
 source_url text,
 source_note text,
 active boolean not null default true,
 updated_at timestamptz not null default now(),
 unique(field_id,branch_name)
);

insert into public.official_vocational_fields(institution_type,field_name,source_url,source_note)
values('MTAL','Bilişim Teknolojileri','https://meslek.meb.gov.tr/dokumanlar/alan_dal_listesi_08092025.pdf','56 alan 119 dal listesi'),
      ('MESEM','Bilişim Teknolojileri','https://meslek.meb.gov.tr/dokumanlar/alan_dal_listesi_08092025.pdf','39 alan 193 dal listesi')
on conflict(institution_type,field_name,source_scope) do update set active=true,source_url=excluded.source_url;

insert into public.official_vocational_branches(field_id,branch_name,source_url,source_note)
select f.id,x.branch_name,'https://meslek.meb.gov.tr/dokumanlar/alan_dal_listesi_08092025.pdf',x.note
from public.official_vocational_fields f
join (values
 ('MTAL','Ağ İşletmenliği','56/119'),('MTAL','Yazılım Geliştirme','56/119'),
 ('MESEM','Bilgisayar Teknik Servisi','39/193'),('MESEM','Yazılım Geliştirme','39/193')
) x(kind,branch_name,note) on x.kind=f.institution_type
where f.field_name='Bilişim Teknolojileri'
on conflict(field_id,branch_name) do update set active=true;

alter table public.official_curriculum_profiles drop constraint if exists official_curriculum_profiles_effective_academic_year_school_key;
create unique index if not exists uq_official_curriculum_profile_variant
on public.official_curriculum_profiles(
 effective_academic_year,school_type,coalesce(school_subtype,''),coalesce(program_type,''),
 coalesce(field_name,''),coalesce(branch_name,''),grade_level,coalesce(schedule_variant,'STANDARD')
);

commit;
