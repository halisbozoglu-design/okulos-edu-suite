import { existsSync, readFileSync } from 'node:fs';

const files={
 engine:'supabase/migrations/20260819072700_dynamic_task_permission_engine.sql',
 mode:'supabase/migrations/20260819072800_permission_mode_and_legacy_manager_bridge.sql',
 gateway:'supabase/migrations/20260819072900_delegated_permission_gateway.sql',
 coverage:'supabase/migrations/20260819073000_delegated_permission_module_coverage.sql',
 grants:'supabase/migrations/20260819073100_delegated_permission_grants_completion.sql',
 personnel:'supabase/migrations/20260819073200_delegated_personnel_operations.sql',
 dependencies:'supabase/migrations/20260819073300_permission_dependency_and_read_access.sql',
 calendarDuty:'supabase/migrations/20260819073400_delegated_calendar_and_duty_operations.sql',
 taskRoles:'supabase/migrations/20260819073500_custom_task_role_templates.sql',
 legacyCleanup:'supabase/migrations/20260819073600_delegated_manager_legacy_policy_cleanup.sql',
 dutyCleanup:'supabase/migrations/20260819073700_close_legacy_duty_policy_bypass.sql',
 volatility:'supabase/migrations/20260819073800_permission_context_volatility_fix.sql',
 restore:'supabase/migrations/20260819073900_schedule_restore_delegation_and_draft_semantics.sql',
 capacity:'supabase/migrations/20260819074000_schedule_teacher_capacity_preflight_v2.sql',
 atomicBundle:'supabase/migrations/20260819074100_atomic_permission_bundle_assignment.sql',
 hook:'src/lib/permissions.ts',
 root:'src/routes/__root.tsx',
 appShell:'src/components/okulos/AppShell.tsx',
 permissionUi:'src/routes/settings-permissions.tsx',
 taskRoleUi:'src/routes/settings-task-roles.tsx',
 payrollUi:'src/routes/payroll.tsx',
 personnelUi:'src/routes/personnel-admin.tsx',
 calendarUi:'src/routes/calendar.tsx',
 dutyUi:'src/routes/settings.tsx',
 dutyBookUi:'src/routes/duty-book.tsx',
 substitutesUi:'src/routes/substitutes.tsx',
 managementUi:'src/routes/management.tsx',
 preparationUi:'src/routes/schedule-preparation.tsx',
};
const errors=[];
for(const [key,file] of Object.entries(files)) if(!existsSync(file)) errors.push(`${key}: eksik dosya ${file}`);
const read=(key)=>readFileSync(files[key],'utf8');
const requireTokens=(key,tokens)=>{const body=read(key);for(const token of tokens)if(!body.includes(token))errors.push(`${key}: eksik sözleşme ${token}`);return body;};

requireTokens('engine',['permission_catalog','user_permission_grants','permission_audit_log','set_user_permission','schedule.generate','schedule.restore','duty.generate','payroll.calculate','permissions.manage']);
requireTokens('mode',['permission_mode',"'delegated'",'set_user_permission_mode','drop function if exists public.get_permission_admin_matrix']);
requireTokens('gateway',['open_permission_context','current_permission_context','schedule.generate','schedule.apply','schedule.publish','duty.generate','duty.lock','payroll.calculate','payroll.approve','payroll.publish','has_permission(public.current_permission_context())']);
requireTokens('coverage',['substitutes.manage','curriculum.manage','quran.manage','norm.manage','classrooms.manage']);
requireTokens('personnel',['get_personnel_admin_list','set_personnel_teaching_area','CANNOT_MODIFY_SUPER_ADMIN','personnel.manage']);
requireTokens('dependencies',['has_module_operation_permission','payroll_month_matrix_permission_core_v2','module_code=\'payroll\'']);
requireTokens('calendarDuty',['settings.manage','set_active_academic_year_permission_core_v2','get_daily_duty_book_permission_core_v2','duty.manage']);
const taskRoles=requireTokens('taskRoles',['task_role_templates','task_role_template_permissions','user_task_role_assignments','assign_task_role_template','revoke_task_role_template','PERMISSION_ADMIN_CANNOT_BE_TASK_TEMPLATE']);
if(taskRoles.includes("perform public.set_user_permission(p_user_id")) errors.push('taskRoles: şablon yetkileri doğrudan bireysel grant tablosuna kopyalanmamalı');
const cleanup=requireTokens('legacyCleanup',['drop policy if exists "teacher can read own crisis"','drop policy if exists "teacher can read own absence lessons"','drop policy if exists "assigned teacher can read assignments"','substitutes.view']);
if(!cleanup.includes("has_module_operation_permission('duty')"))errors.push('legacyCleanup: nöbet görevli okuma köprüsü eksik');
requireTokens('dutyCleanup',['drop policy if exists "authenticated read duty incidents"','drop policy if exists "authenticated create duty incidents"','duty.manage']);
requireTokens('volatility',['payroll_month_matrix(int,int) volatile','kbs_payroll_export(int,int) volatile','get_daily_duty_book(date) volatile']);
const restore=requireTokens('restore',['open_permission_context(\'schedule.restore\')','create_schedule_restore_point_permission_core_v2','upsert_schedule_slot_permission_core_v2','delegated schedule restorers read restore points','delegated schedule restorers read restore rows','delegated schedule restorers read timetable']);
if(restore.includes('perform public.assert_schedule_publishable()'))errors.push('restore: çalışma taslağı geri yüklemede publish gate kullanılmamalı');
requireTokens('capacity',['assignment_loads','TEACHER_ASSIGNED_HOURS_EXCEED_WEEKLY_LIMIT','TEACHER_ASSIGNED_HOURS_EXCEED_DAY_CAPACITY','get_schedule_preparation_readiness_before_teacher_capacity_v2']);
requireTokens('atomicBundle',['set_user_permission_bundle','set_user_permission_mode','perform public.set_user_permission','EMPTY_PERMISSION_BUNDLE','UNKNOWN_PERMISSION_IN_BUNDLE']);

requireTokens('hook',['usePermissions','get_my_permissions','can','any','all']);
const root=requireTokens('root',['PermissionBoundary','protectedRoutes','/settings/permissions','/schedule-solver','/schedule-history','schedule.restore','/payroll','/duty-book','/personnel-admin','superOnly']);
if(!root.includes('rule.any.some((code) => codes.has(code))'))errors.push('root: route permission matching eksik');
requireTokens('appShell',['usePermissions','permissionCodes','substitutes.view','payroll.view','classes.manage','managementCodes','gridTemplateColumns']);
requireTokens('permissionUi',['Görev ve Yetki Atama','Ders Programı Sorumlusu','Nöbet Sorumlusu','Ek Ders Sorumlusu','schedule.restore','set_user_permission_bundle','Görev Bazlı','Yetki Denetim Geçmişi']);
requireTokens('taskRoleUi',['Görev Şablonları','save_task_role_template','assign_task_role_template','revoke_task_role_template']);
requireTokens('payrollUi',['payroll.calculate','payroll.edit','payroll.approve','payroll.publish']);
requireTokens('personnelUi',['personnel.view','personnel.manage','get_personnel_admin_list']);
requireTokens('calendarUi',['settings.manage','salt okunur']);
requireTokens('dutyUi',['duty.view','duty.manage','duty.generate','duty.lock']);
const dutyBook=requireTokens('dutyBookUi',['usePermissions','can("duty.manage")','Salt okunur','duty.manage','if (!canManage)']);
if(!dutyBook.includes('{canManage ? <>'))errors.push('dutyBookUi: düzenleme formları duty.manage arkasında değil');
requireTokens('substitutesUi',['substitutes.view','substitutes.manage','Salt okunur']);
requireTokens('preparationUi',['TEACHER_ASSIGNED_HOURS_EXCEED_WEEKLY_LIMIT','TEACHER_ASSIGNED_HOURS_EXCEED_DAY_CAPACITY']);
const management=requireTokens('managementUi',['/settings/permissions','/settings-task-roles','permissions.manage']);
if(management.includes("to:'/notifications'"))errors.push('managementUi: kişisel PWA/bildirim ayarı kurumsal görev delegasyonu kartı olarak gösterilmemeli');

if(errors.length){console.error('Permission flow check FAILED:\n'+errors.map(e=>`- ${e}`).join('\n'));process.exit(1);}
console.log('Permission flow check OK: delegated roles, atomic bundles, route guards, permission-aware navigation, read-only duty book, restore authority, capacity preflight, gateways and RLS cleanup are present.');
