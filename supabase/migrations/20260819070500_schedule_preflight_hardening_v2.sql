create or replace function public.get_schedule_preparation_readiness()
returns table(category text,code text,status text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
active_profile as (select count(*)::integer n from public.schedule_time_profiles where active=true),
curriculum_bad as (select count(*)::integer n from public.get_curriculum_readiness(null) where ready=false),
constraint_missing as (select count(*)::integer n from public.profiles p left join public.teacher_schedule_constraints c on c.teacher_id=p.user_id where p.role='teacher' and c.teacher_id is null),
locked_unlinked as (select count(*)::integer n from public.teacher_schedule where active and locked and (course_id is null or class_course_requirement_id is null or teacher_assignment_id is null)),
locked_mismatch as (
 select count(*)::integer n from public.teacher_schedule ts
 left join public.teacher_course_assignments a on a.id=ts.teacher_assignment_id
 left join public.class_course_requirements r on r.id=ts.class_course_requirement_id
 where ts.active and ts.locked and ts.teacher_assignment_id is not null and (a.id is null or r.id is null or a.teacher_id<>ts.teacher_id or a.class_course_requirement_id<>r.id or r.class_id is distinct from ts.class_id or r.course_id<>ts.course_id)
),
locked_unavailable as (
 select count(*)::integer n from public.teacher_schedule ts join public.teacher_unavailability u on u.teacher_id=ts.teacher_id and u.weekday=ts.weekday and u.period=ts.period and u.active where ts.active and ts.locked
),
locked_over_assignment as (
 select count(*)::integer n from (select ts.teacher_assignment_id,count(*) c,max(a.assigned_hours) h from public.teacher_schedule ts join public.teacher_course_assignments a on a.id=ts.teacher_assignment_id where ts.active and ts.locked group by ts.teacher_assignment_id having count(*)>max(a.assigned_hours)) q
),
sync_empty as (select count(*)::integer n from public.schedule_sync_groups g where g.active and not exists(select 1 from public.schedule_sync_group_members m where m.sync_group_id=g.id)),
sync_length_mismatch as (
 select count(*)::integer n from (select g.id,min(m.block_hours) mn,max(m.block_hours) mx from public.schedule_sync_groups g join public.schedule_sync_group_members m on m.sync_group_id=g.id where g.active and g.required_simultaneous group by g.id having min(m.block_hours)<>max(m.block_hours)) q
),
sync_bad_subgroups as (
 select count(*)::integer n from public.schedule_sync_group_members m join public.teacher_course_assignments a on a.id=m.teacher_assignment_id join public.class_course_requirements r on r.id=a.class_course_requirement_id left join public.class_subgroups sg on sg.id=m.subgroup_id where m.subgroup_id is not null and (sg.id is null or sg.class_id<>r.class_id or not sg.active)
),
sync_empty_students as (select count(*)::integer n from public.schedule_sync_group_members m where m.subgroup_id is not null and not exists(select 1 from public.class_subgroup_students s where s.subgroup_id=m.subgroup_id)),
sync_overlap_students as (
 select count(*)::integer n from (
   select g.id from public.schedule_sync_groups g
   join public.schedule_sync_group_members m1 on m1.sync_group_id=g.id and m1.subgroup_id is not null
   join public.schedule_sync_group_members m2 on m2.sync_group_id=g.id and m2.id>m1.id and m2.subgroup_id is not null
   where g.active and exists(select 1 from public.class_subgroup_students a join public.class_subgroup_students b on b.student_id=a.student_id where a.subgroup_id=m1.subgroup_id and b.subgroup_id=m2.subgroup_id)
   group by g.id
 ) q
),
quran_bad as (select count(*)::integer n from public.quran_split_plans q where q.enabled and public.quran_plan_sync_status(q.id)<>'READY'),
room_rule_without_room as (
 select count(*)::integer n from public.lesson_room_rules lr where lr.active and not exists(select 1 from public.classrooms c where c.active and (lr.required_room_type is null or c.room_type=lr.required_room_type) and (lr.required_department is null or coalesce(c.department,'')=lr.required_department) and (lr.required_hardware='{}'::jsonb or c.hardware @> lr.required_hardware))
),
block_assignment_bad as (
 select count(*)::integer n from public.teacher_course_assignments a join public.class_course_requirements r on r.id=a.class_course_requirement_id join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active and cardinality(cr.block_pattern)>0
 where (select coalesce(sum(x),0) from unnest(cr.block_pattern) x)<>a.assigned_hours
)
select * from (
 select 'zaman','ACTIVE_TIME_PROFILE','error',case when n=1 then 0 else n end,'Tam olarak bir aktif okul zaman şablonu bulunmalıdır.' from active_profile where n<>1 union all
 select 'müfredat','CURRICULUM_NOT_READY','error',n,'Sınıf ders yükü, öğretmen saatleri veya TTKB alan-ders eşleşmesi eksik.' from curriculum_bad where n>0 union all
 select 'öğretmen','TEACHER_CONSTRAINT_ROW_MISSING','error',n,'Her öğretmenin açık bir program kısıt kaydı bulunmalıdır.' from constraint_missing where n>0 union all
 select 'kilit','LOCKED_ROW_UNLINKED','error',n,'Kilitli program satırı müfredat ve öğretmen atamasına bağlı değil.' from locked_unlinked where n>0 union all
 select 'kilit','LOCKED_ROW_SEMANTIC_MISMATCH','error',n,'Kilitli satırın sınıf/ders/öğretmen kimliği atama kaydıyla uyuşmuyor.' from locked_mismatch where n>0 union all
 select 'kilit','LOCKED_TEACHER_UNAVAILABLE','error',n,'Kilitli saat öğretmenin kesin uygun değil kaydıyla çakışıyor.' from locked_unavailable where n>0 union all
 select 'kilit','LOCKED_HOURS_EXCEED_ASSIGNMENT','error',n,'Kilitli saat sayısı öğretmenin o ders için atanmış haftalık saatini aşıyor.' from locked_over_assignment where n>0 union all
 select 'eşzamanlı','SYNC_GROUP_EMPTY','error',n,'Aktif eşzamanlı grubun en az bir öğretmen-ders üyesi olmalıdır.' from sync_empty where n>0 union all
 select 'eşzamanlı','SYNC_MEMBER_BLOCK_LENGTH_MISMATCH','error',n,'Aynı paralel bloktaki tüm üyelerin ardışık blok uzunluğu aynı olmalıdır.' from sync_length_mismatch where n>0 union all
 select 'eşzamanlı','SYNC_SUBGROUP_MISMATCH','error',n,'Eşzamanlı grup alt grubu, öğretmen atamasının sınıfına ait değil.' from sync_bad_subgroups where n>0 union all
 select 'eşzamanlı','SYNC_SUBGROUP_HAS_NO_STUDENTS','error',n,'Programda kullanılacak alt grupta öğrenci üyeliği bulunmuyor.' from sync_empty_students where n>0 union all
 select 'eşzamanlı','SYNC_SUBGROUP_STUDENT_OVERLAP','error',n,'Aynı paralel bloktaki alt gruplarda ortak öğrenci bulunuyor.' from sync_overlap_students where n>0 union all
 select 'kur-an','QURAN_WEEKLY_SYNC_INCOMPLETE','error',n,'Etkin Kur’an bölme planının tüm haftalık paralel blokları/öğretmen atamaları tamamlanmamış.' from quran_bad where n>0 union all
 select 'derslik','ROOM_RULE_HAS_NO_MATCHING_ROOM','error',n,'Derslik kuralını karşılayan aktif fiziksel derslik bulunmuyor.' from room_rule_without_room where n>0 union all
 select 'blok','BLOCK_PATTERN_ASSIGNMENT_MISMATCH','error',n,'Ders blok deseninin toplam saati ilgili öğretmen-ders atama saatiyle tam eşleşmiyor.' from block_assignment_bad where n>0
) q;
$$;
revoke all on function public.get_schedule_preparation_readiness() from public;
grant execute on function public.get_schedule_preparation_readiness() to authenticated;
