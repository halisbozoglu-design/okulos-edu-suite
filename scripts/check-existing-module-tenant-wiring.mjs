import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const routesDir = path.join(root, 'src', 'routes');
const migrationPath = path.join(root, 'supabase', 'migrations', '20260820190000_existing_module_tenant_entry_hardening.sql');

const publicRoutes = new Set(['/', '/school-registration', '/auth/callback']);
const intentionallyUngated = new Set(['/notifications']);

const currentRoutePrefixes = new Set([
  '/dashboard','/management','/calendar','/academic-years','/classes','/classrooms','/curriculum','/duty-book',
  '/legislation','/norm-analysis','/norm-settings','/payroll','/payroll-rules','/personnel-admin',
  '/personnel-field-settings','/personnel-import','/quran-groups','/room-assignment','/schedule',
  '/timetable','/schedule-optimization','/schedule-placement-rules','/schedule-scoped-rules','/schedule-scenario-comparison','/schedule-reports',
  '/schedule-archive','/schedule-history','/schedule-preparation','/schedule-rules','/schedule-solver',
  '/schedule-validation','/settings','/settings-permissions','/settings-task-roles','/substitutes',
  '/super-admin','/super-admin/course-schedules','/super-admin-tenants','/notifications',
]);

const featureFamily = new Map([
  ['/academic-years','/calendar'],
  ['/timetable','/schedule'],
  ['/schedule-optimization','/schedule'],
  ['/schedule-placement-rules','/schedule'],
  ['/schedule-scoped-rules','/schedule'],
  ['/schedule-scenario-comparison','/schedule'],
  ['/schedule-reports','/schedule'],
  ['/super-admin/course-schedules','/super-admin'],
]);

function routeFromFile(file) {
  if (file === 'index.tsx') return '/';
  if (file === '__root.tsx' || file === 'README.md') return null;
  if (!file.endsWith('.tsx')) return null;
  return '/' + file.slice(0, -4).replace(/\./g, '/');
}

const found = fs.readdirSync(routesDir).map(routeFromFile).filter(Boolean);
const unknown = found.filter((r) => !publicRoutes.has(r) && !currentRoutePrefixes.has(r));
const missingFiles = [...currentRoutePrefixes].filter((r) => r !== '/notifications' && !found.includes(r));
if (unknown.length) {
  console.error('New/unclassified route(s) detected:', unknown.join(', '));
  console.error('Classify the route under an existing feature family or explicitly add a system feature before release.');
  process.exit(1);
}
if (missingFiles.length) {
  console.error('Expected existing route file(s) missing:', missingFiles.join(', '));
  process.exit(1);
}

const migration = fs.readFileSync(migrationPath, 'utf8');
const featureMissing = [...currentRoutePrefixes]
  .filter((r) => !intentionallyUngated.has(r))
  .map((route) => ({ route, feature: featureFamily.get(route) ?? route }))
  .filter(({ feature }) => !migration.includes(`'${feature}'`));
if (featureMissing.length) {
  console.error('Existing route(s) not represented by a consolidated feature/tenant family:', featureMissing.map(({route,feature})=>`${route} -> ${feature}`).join(', '));
  process.exit(1);
}

const rootRoute = fs.readFileSync(path.join(routesDir, '__root.tsx'), 'utf8');
for (const required of ['SystemAccessBoundary', 'get_system_access_state', 'PermissionBoundary']) {
  if (!rootRoute.includes(required)) {
    console.error(`Root access boundary is missing required marker: ${required}`);
    process.exit(1);
  }
}

console.log(`Existing module/tenant wiring OK: ${found.length} route files classified; workflow subroutes inherit canonical system features.`);