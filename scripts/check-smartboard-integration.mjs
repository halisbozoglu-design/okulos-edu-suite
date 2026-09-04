import fs from 'node:fs';

const requiredFiles = [
  'supabase/migrations/20260903013000_smartboard_room_section_resolution.sql',
  'supabase/migrations/20260903084500_smartboard_daily_lifecycle.sql',
  'supabase/migrations/20260903090000_smartboard_device_credentials.sql',
  'supabase/migrations/20260903102000_smartboard_barcode_unlock_permissions.sql',
  'supabase/migrations/20260903103000_smartboard_unlock_command_delivery.sql',
  'supabase/migrations/20260903113000_guidance_calendar_smartboard_access.sql',
  'supabase/migrations/20260903115000_guidance_due_reminder_dispatch.sql',
  'supabase/migrations/20260904233000_smartboard_platform_classroom_interaction.sql',
  'supabase/functions/smartboard-daily-plan/index.ts',
  'src/routes/guidance-calendar.tsx',
  'docs/SMARTBOARD_INTEGRATION_CANONICAL.md',
  'docs/SMARTBOARD_GUIDANCE_CALENDAR_ACCESS.md',
  'docs/SMARTBOARD_PLATFORM_CLASSROOM_INTERACTION.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing SmartBoard integration file: ${file}`);
}

const placement = fs.readFileSync(requiredFiles[0], 'utf8');
const lifecycle = fs.readFileSync(requiredFiles[1], 'utf8');
const creds = fs.readFileSync(requiredFiles[2], 'utf8');
const unlock = fs.readFileSync(requiredFiles[3], 'utf8');
const commands = fs.readFileSync(requiredFiles[4], 'utf8');
const guidance = fs.readFileSync(requiredFiles[5], 'utf8');
const reminderDispatch = fs.readFileSync(requiredFiles[6], 'utf8');
const platform = fs.readFileSync(requiredFiles[7], 'utf8');
const edge = fs.readFileSync(requiredFiles[8], 'utf8');
const guidanceUi = fs.readFileSync(requiredFiles[9], 'utf8');
const docs = fs.readFileSync(requiredFiles[10], 'utf8');
const guidanceDocs = fs.readFileSync(requiredFiles[11], 'utf8');
const platformDocs = fs.readFileSync(requiredFiles[12], 'utf8');

const mustContain = (name, text, needles) => {
  for (const needle of needles) {
    if (!text.includes(needle)) throw new Error(`${name} missing contract token: ${needle}`);
  }
};

mustContain('placement migration', placement, [
  'section_instances',
  'section_room_placements',
  'smartboard_room_bindings',
  'resolve_lesson_room',
  'resolve_smartboard_for_lesson',
  'smartboard_academic_year_readiness',
  'institution_code',
]);

mustContain('daily lifecycle migration', lifecycle, [
  'institution_period_times',
  'institution_schedule_events',
  'institution_calendar_days',
  'smartboard_power_policies',
  'smartboard_day_activities',
  'smartboard_daily_plan',
  "'DYK'",
  'shutdown_warning_minutes',
  'wol_retry_from_minutes',
  'break_display_mode',
]);

mustContain('device credential migration', creds, [
  'smartboard_integration_devices',
  'credential_sha256',
  'expires_at',
]);

mustContain('barcode authorization migration', unlock, [
  'barcode_public_id',
  'smartboard_unlock_events',
  'request_smartboard_barcode_unlock',
  'SCHEDULED_TEACHER_CURRENT_LESSON',
  'PRINCIPAL_ANYTIME',
  'VICE_PRINCIPAL_ANYTIME',
  'GUIDANCE_REASON_REQUIRED',
  'GUIDANCE_OVERRIDE_WITH_REASON',
  'DUTY_TEACHER_RECORDED_SUBSTITUTE',
]);

mustContain('unlock delivery migration', commands, [
  'smartboard_device_commands',
  'UNLOCK_LESSON',
  'UNLOCK_ADMIN',
  'UNLOCK_GUIDANCE',
  'UNLOCK_DUTY_SUBSTITUTE',
  'enqueue_smartboard_unlock_command',
]);

mustContain('guidance calendar integration', guidance, [
  'guidance_class_activities',
  'guidance_activity_reminders',
  'guidance_calendar_v',
  'GUIDANCE_CALENDAR_ACTIVITY',
  'guidance_activity_id',
  'counts_as_lesson_open',
  'PRINCIPAL_SCHEDULED_TEACHING',
  'VICE_PRINCIPAL_SCHEDULED_TEACHING',
  'PRINCIPAL_RECORDED_LESSON_SUBSTITUTE',
  'VICE_PRINCIPAL_RECORDED_LESSON_SUBSTITUTE',
  'log_smartboard_admin_device_access',
]);

mustContain('guidance reminder dispatch', reminderDispatch, [
  'dispatch_my_due_guidance_reminders',
  'guidance_activity_reminders',
  "'PENDING'",
  "'SENT'",
  "'/guidance-calendar'",
]);

mustContain('guidance calendar UI', guidanceUi, [
  'createFileRoute("/guidance-calendar")',
  'guidance_calendar_v',
  'guidance_class_activities',
  'BarcodeDetector',
  'request_smartboard_barcode_unlock',
  'GUIDANCE_REASON_REQUIRED',
  'GUIDANCE_CALENDAR_ACTIVITY',
  'dispatch_my_due_guidance_reminders',
]);

mustContain('cross-platform classroom interaction migration', platform, [
  'smartboard_platform_profiles',
  "'PARDUS','WINDOWS'",
  "'PHASE_1','PHASE_2','PHASE_3','PHASE_4','OTHER'",
  'smartboard_runtime_feature_matrix',
  'smartboard_resolution_profile',
  'smartboard_evaluate_runtime_features',
  'smartboard_app_catalog',
  'SMARTBOARD_WHITEBOARD',
  'MATH_TOOLS',
  'LIBREOFFICE_IMPRESS',
  'smartboard_ota_channels',
  "'PILOT','BETA','STABLE'",
  'smartboard_cast_sessions',
  'TEACHER_ONLY',
  'classroom_response_sessions',
  "'POLL','MULTIPLE_CHOICE','QUICK_CHECK','SURVEY'",
  'classroom_response_options',
  'classroom_responses',
  'classroom_response_summary',
]);

mustContain('platform classroom interaction docs', platformDocs, [
  'FATİH / ETAP faz 1, 2, 3, 4',
  'Windows runtime ayrı ve eşdeğer',
  'öğretmenin kendi cihazına odaklanır',
  'A/B/C/D çoktan seçmeli cevap',
  'SmartBoard Whiteboard',
  'LibreOffice Impress',
  'PILOT -> BETA -> STABLE',
  'smartboard_resolution_profile()',
  'Lovable token çalışma zamanında kullanılmaz',
]);

mustContain('daily plan edge function', edge, [
  'x-smartboard-device-key',
  'x-smartboard-secret',
  'x-institution-code',
  'SHA-256',
  'smartboard_daily_plan',
  'SUPABASE_SERVICE_ROLE_KEY',
]);

if (/LOVABLE_(TOKEN|API_KEY)|x-lovable|lovable\.dev\/api/i.test(edge)) {
  throw new Error('Lovable runtime credential/API usage is forbidden in SmartBoard daily plan endpoint.');
}
if (/LOVABLE_(TOKEN|API_KEY)|x-lovable|lovable\.dev\/api/i.test(platform)) {
  throw new Error('Lovable runtime credential/API usage is forbidden in SmartBoard platform/runtime contract.');
}

if (!docs.includes('Lovable token bu akışların hiçbirinde')) {
  throw new Error('Canonical documentation must preserve the Lovable-token prohibition.');
}
if (!docs.includes('Barkodla tahta açma ve izin motoru')) {
  throw new Error('Canonical documentation must preserve barcode unlock authorization rules.');
}
if (!guidanceDocs.includes('Takvim: 7/B') || !guidanceDocs.includes('GUIDANCE_CALENDAR_ACTIVITY')) {
  throw new Error('Guidance calendar documentation must preserve auto-reason barcode linkage.');
}

console.log('SmartBoard integration contract guard: OK');
