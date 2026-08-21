import { readFile, readdir } from "node:fs/promises";

const read=(p)=>readFile(new URL(`../${p}`,import.meta.url),"utf8");
const [ci,pkg,parserTest,schemaSql,tenantSql]=await Promise.all([
  read(".github/workflows/ci.yml"),
  read("package.json"),
  read("tests/schedule-import.test.ts"),
  read("tests/sql/phase4_schema_contract.sql"),
  read("tests/sql/phase4_tenant_isolation.sql"),
]);

for(const token of [
  "Protect applied migration history",
  "bun test",
  "supabase start",
  "supabase db reset --local --no-seed",
  "phase4_schema_contract.sql",
  "phase4_tenant_isolation.sql",
]) if(!ci.includes(token)){console.error(`Phase 4 CI contract missing: ${token}`);process.exit(1);}

if(!pkg.includes('"test": "bun test"')){console.error("Bun test script missing.");process.exit(1);}
for(const token of ["parseScheduleImport","normalizeRows","PROGRAM_SATIRI_GECERSIZ","REQUIRED_COLUMNS_NOT_FOUND"])
  if(!parserTest.includes(token)){console.error(`Parser regression contract missing: ${token}`);process.exit(1);}

for(const token of [
  "current_tenant_code()",
  "generate_schedule_scenarios_v2()",
  "apply_schedule_scenario(uuid)",
  "publish_current_schedule(date,text,text,text)",
  "uq_schedule_time_profile_active_per_tenant",
  "assert_schedule_scenario_tenant_phase3_v1",
  "validate_schedule_scenario_v2",
]) if(!schemaSql.includes(token)){console.error(`DB schema contract missing: ${token}`);process.exit(1);}

for(const token of [
  "set local role authenticated",
  "request.jwt.claim.sub",
  "tenant_row_allowed('990002')",
  "foreign institution visible",
  "foreign membership visible",
]) if(!tenantSql.includes(token)){console.error(`Tenant isolation behavior test missing: ${token}`);process.exit(1);}

const migrations=(await readdir(new URL("../supabase/migrations/",import.meta.url))).filter((x)=>x.endsWith(".sql")).sort();
if(!migrations.length){console.error("No migrations found.");process.exit(1);}
const timestamps=new Set();
for(const file of migrations){
  const m=file.match(/^(\d{14})_/);
  if(!m){console.error(`Migration name is not timestamp-prefixed: ${file}`);process.exit(1);}
  if(timestamps.has(m[1])){console.error(`Duplicate migration timestamp: ${m[1]}`);process.exit(1);}
  timestamps.add(m[1]);
}

console.log(`Phase 4 testing guard OK: ${migrations.length} forward migrations, parser regressions, clean DB rebuild and tenant RLS integration are wired.`);
