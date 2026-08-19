import { existsSync, readFileSync } from 'node:fs';

const requiredFiles=[
  'supabase/migrations/20260819072700_dynamic_task_permission_engine.sql',
  'supabase/migrations/20260819072800_permission_mode_and_legacy_manager_bridge.sql',
  'supabase/migrations/20260819072900_delegated_permission_gateway.sql',
  'supabase/migrations/20260819073000_delegated_permission_module_coverage.sql',
  'src/routes/settings-permissions.tsx',
];
const errors=[];
for(const file of requiredFiles) if(!existsSync(file)) errors.push(`eksik dosya: ${file}`);

const engine=readFileSync(requiredFiles[0],'utf8');
for(const token of ['permission_catalog','user_permission_grants','permission_audit_log','set_user_permission','schedule.generate','duty.generate','payroll.calculate'])
  if(!engine.includes(token)) errors.push(`permission engine eksik: ${token}`);

const mode=readFileSync(requiredFiles[1],'utf8');
for(const token of ["permission_mode","'delegated'","set_user_permission_mode"])
  if(!mode.includes(token)) errors.push(`permission mode eksik: ${token}`);

const gateway=readFileSync(requiredFiles[2],'utf8');
for(const token of ['open_permission_context','schedule.generate','schedule.apply','schedule.publish','duty.generate','duty.lock','payroll.calculate','payroll.approve','payroll.publish'])
  if(!gateway.includes(token)) errors.push(`permission gateway eksik: ${token}`);
if(/current_permission_context\(\)[\s\S]*?or\s+exists\([\s\S]*?user_permission_grants/i.test(gateway)===false)
  errors.push('is_manager_or_admin delegated context guard gözden geçirilmeli');

const ui=readFileSync(requiredFiles[4],'utf8');
for(const token of ['Görev ve Yetki Atama','Ders Programı Sorumlusu','Nöbet Sorumlusu','Ek Ders Sorumlusu','Görev Bazlı'])
  if(!ui.includes(token)) errors.push(`permission UI eksik: ${token}`);

if(errors.length){console.error('Permission flow check FAILED:\n'+errors.map(e=>`- ${e}`).join('\n'));process.exit(1);}
console.log('Permission flow check OK.');
