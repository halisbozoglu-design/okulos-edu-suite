import fs from 'node:fs';

const requiredFiles = [
  'supabase/migrations/20260903013000_smartboard_room_section_resolution.sql',
  'supabase/migrations/20260903084500_smartboard_daily_lifecycle.sql',
  'supabase/migrations/20260903090000_smartboard_device_credentials.sql',
  'supabase/functions/smartboard-daily-plan/index.ts',
  'docs/SMARTBOARD_INTEGRATION_CANONICAL.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing SmartBoard integration file: ${file}`);
}

const placement = fs.readFileSync(requiredFiles[0], 'utf8');
const lifecycle = fs.readFileSync(requiredFiles[1], 'utf8');
const creds = fs.readFileSync(requiredFiles[2], 'utf8');
const edge = fs.readFileSync(requiredFiles[3], 'utf8');
const docs = fs.readFileSync(requiredFiles[4], 'utf8');

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

if (!docs.includes('Lovable token bu akışların hiçbirinde')) {
  throw new Error('Canonical documentation must preserve the Lovable-token prohibition.');
}

console.log('SmartBoard integration contract guard: OK');
