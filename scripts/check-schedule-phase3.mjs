import { readFile,readdir } from "node:fs/promises";

const read=(path)=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const [schedule,authority]=await Promise.all([
  read("src/routes/schedule.tsx"),
  read("scripts/check-timetable-authority.mjs"),
]);

for(const token of [
  'supabase.rpc("upsert_schedule_slot_v2"',
  'supabase.rpc("get_schedule_integrity_report")',
  'manualBlocked',
]) if(!schedule.includes(token)){console.error(`Manuel program güvenlik zinciri eksik: ${token}`);process.exit(1);}

const migrationDir=new URL("../supabase/migrations/",import.meta.url);
const files=(await readdir(migrationDir)).filter((x)=>x.endsWith(".sql")).sort();
const texts=await Promise.all(files.map(async(file)=>({file,text:await readFile(new URL(file,migrationDir),"utf8")})));
const joined=texts.map((x)=>x.text).join("\n");

for(const token of [
  "get_schedule_phase3_preflight_issues_v1",
  "LOCKED_SCOPED_RULE_CONFLICT",
  "SYNC_GROUP_NO_COMMON_WINDOW",
  "get_schedule_phase3_scenario_issues_v1",
  "SCOPED_COURSE_TIME_RULE",
  "SCOPED_COURSE_DAILY_LIMIT",
  "SCOPED_COURSE_MINIMUM_SPREAD",
  "SCOPED_COURSE_BLOCK_PATTERN",
  "LOCKED_SLOT_NOT_PRESERVED",
  "SYNC_GROUP_NOT_PLACED",
  "SYNC_GROUP_PARTIAL_SLOT",
  "schedule_scenario_block_matches_phase3_v1",
  "schedule_current_block_matches_phase3_v1",
  "SCENARIO_HAS_HARD_ISSUES",
  "APPLIED_SCHEDULE_FAILED_FINAL_VALIDATION",
  "PUBLISH_BLOCKED_BY_HARD_ISSUES",
  "guard_schedule_row_tenant_phase3_v1",
  "CROSS_TENANT_SCHEDULE_WRITE",
  "get_schedule_phase3_scoped_preference_score_v1",
]) if(!joined.includes(token)){console.error(`Faz 3 migration sözleşmesi eksik: ${token}`);process.exit(1);}

for(const token of [
  '"function:apply_schedule_scenario": "20260821015500_schedule_phase3_authority_closure.sql"',
  '"function:publish_current_schedule": "20260821015500_schedule_phase3_authority_closure.sql"',
  '"function:get_schedule_preparation_readiness": "20260821015500_schedule_phase3_authority_closure.sql"',
  '"function:get_schedule_scenario_hard_issues_v2": "20260821015500_schedule_phase3_authority_closure.sql"',
  '"function:get_schedule_integrity_report": "20260821015500_schedule_phase3_authority_closure.sql"',
  '"function:calculate_schedule_scenario_score_v2": "20260821020500_schedule_phase3_scoped_quality_score.sql"',
]) if(!authority.includes(token)){console.error(`Faz 3 authority kaydı eksik: ${token}`);process.exit(1);}

// Guard semantic intent: apply validates before mutating; publish checks the same current integrity authority.
const phase3=texts.find((x)=>x.file==="20260821015500_schedule_phase3_authority_closure.sql")?.text??"";
const applyPos=phase3.indexOf("create or replace function public.apply_schedule_scenario");
const publishPos=phase3.indexOf("create or replace function public.publish_current_schedule");
if(applyPos<0||publishPos<0){console.error("Faz 3 apply/publish authority bulunamadı.");process.exit(1);}
const applyBody=phase3.slice(applyPos,publishPos);
if(!(applyBody.indexOf("validate_schedule_scenario_v2")<applyBody.indexOf("apply_schedule_scenario_pre_phase3"))){console.error("Apply önce hard validation çalıştırmıyor.");process.exit(1);}
if(!applyBody.includes("get_schedule_integrity_report()")){console.error("Apply sonrası final integrity kontrolü eksik.");process.exit(1);}
const publishBody=phase3.slice(publishPos);
if(!(publishBody.indexOf("get_schedule_integrity_report()")<publishBody.indexOf("publish_current_schedule_pre_phase3"))){console.error("Publish öncesi final integrity gate eksik.");process.exit(1);}

console.log("Faz 3 tamamlık guardı geçti: preflight, scoped hard rules, blok, locked/sync, manual edit, apply ve publish aynı doğrulama zincirinde.");
