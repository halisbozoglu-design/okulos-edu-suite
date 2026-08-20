import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const routesDir = path.join(root, 'src', 'routes');
const migrationPath = path.join(root, 'supabase', 'migrations', '20260820190000_existing_module_tenant_entry_hardening.sql');

const publicRoutes = new Set(['/', '/school-registration', '/auth/callback']);
const intentionallyUngated = new Set(['/notifications']); // approval/maintenance notices must remain reachable

// Current routes only. Adding a new route is deliberately release-blocking until its status is
// explicitly decided. This protects the rule: no new active module silently appears in the product.
const currentRoutePrefixes = new Set([
  '/dashboard','/management','/calendar','/classes','/classrooms','/curriculum','/duty-book',
  '/legislation','/norm-analysis','/norm-settings','/payroll','/payroll-rules','/personnel-admin',
  '/personnel-field-settings','/personnel-import','/quran-groups','/room-assignment','/schedule',
  '/schedule-archive','/schedule-history','/schedule-preparation','/schedule-rules','/schedule-solver',
  '/schedule-validation','/settings','/settings-permissions','/settings-task-roles','/substitutes',
  '/super-admin','/super-admin-tenants','/notifications',
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
  console.error('Do not activate a new module silently. First classify it in Super Admin as passive/disabled or explicitly approve it as an existing route.');
  process.exit(1);
}
if (missingFiles.length) {
  console.error('Expected existing route file(s) missing:', missingFiles.join(', '));
  process.exit(1);
}

const migration = fs.readFileSync(migrationPath, 'utf8');
const featureMissing = [...currentRoutePrefixes]
  .filter((r) => !intentionallyUngated.has(r))
  .filter((r) => !migration.includes(`'${r}'`));
if (featureMissing.length) {
  console.error('Existing route(s) not represented in the consolidated feature/tenant catalogue:', featureMissing.join(', '));
  process.exit(1);
}

const rootRoute = fs.readFileSync(path.join(routesDir, '__root.tsx'), 'utf8');
for (const required of ['SystemAccessBoundary', 'get_system_access_state', 'PermissionBoundary']) {
  if (!rootRoute.includes(required)) {
    console.error(`Root access boundary is missing required marker: ${required}`);
    process.exit(1);
  }
}

console.log(`Existing module/tenant wiring OK: ${found.length} route files classified; no silent new module detected.`);
