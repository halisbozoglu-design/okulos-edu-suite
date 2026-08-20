import { readFile,readdir } from "node:fs/promises";

const read=(path)=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const [root,timetable,optimization,scoped,comparison]=await Promise.all([
  read("src/routes/__root.tsx"),
  read("src/routes/timetable.tsx"),
  read("src/routes/schedule-optimization.tsx"),
  read("src/routes/schedule-scoped-rules.tsx"),
  read("src/routes/schedule-scenario-comparison.tsx"),
]);

const routeRules=[
  ["/schedule-optimization",["schedule.view","schedule.rules"]],
  ["/schedule-scoped-rules",["schedule.view","schedule.rules"]],
  ["/schedule-scenario-comparison",["schedule.view","schedule.generate","schedule.apply"]],
];
for(const [route,permissions] of routeRules){
  const line=root.split("\n").find((x)=>x.includes(`prefix: \"${route}\"`));
  if(!line){console.error(`Faz 2 route koruması eksik: ${route}`);process.exit(1);}
  for(const permission of permissions){if(!line.includes(permission)){console.error(`${route}: ${permission} eksik.`);process.exit(1);}}
}

for(const route of ["/schedule-optimization","/schedule-scoped-rules","/schedule-scenario-comparison"]){
  if(!timetable.includes(route)){console.error(`Ders programı çalışma alanı Faz 2 ekranına bağlı değil: ${route}`);process.exit(1);}
}

for(const token of [
  'createFileRoute("/schedule-optimization")',
  'HARD/SOFT/KAPALI',
  'apply_schedule_optimization_profile_v1',
  'course_pedagogy_profiles',
  'schedule_workshop_policies',
  'schedule_duty_optimization',
  'schedule_repair_audit',
  'onConflict:"institution_code,course_id"',
  'onConflict:"institution_code,teacher_id,weekday"',
]) if(!optimization.includes(token)){console.error(`Optimizasyon ekranı Faz 2 sözleşmesi eksik: ${token}`);process.exit(1);}

for(const token of [
  'createFileRoute("/schedule-scoped-rules")',
  'get_effective_schedule_rule_v2',
  'institution_code,class_course_requirement_id',
  'institution_code,teacher_assignment_id',
  'Global “aynı ders/gün” kalite hedefi soft',
]) if(!scoped.includes(token)){console.error(`Scoped rule ekranı Faz 2 sözleşmesi eksik: ${token}`);process.exit(1);}

for(const token of [
  'createFileRoute("/schedule-scenario-comparison")',
  'schedule_scenario_explanations',
  'hard_issue_count===0',
  'unplaced_count===0',
  'classroom_issue_count===0',
  'ÖNERİLEN',
]) if(!comparison.includes(token)){console.error(`Senaryo karşılaştırma Faz 2 sözleşmesi eksik: ${token}`);process.exit(1);}

const migrationDir=new URL("../supabase/migrations/",import.meta.url);
const migrationFiles=(await readdir(migrationDir)).filter((x)=>x.endsWith(".sql"));
const migrationTexts=await Promise.all(migrationFiles.map(async(file)=>({file,text:await readFile(new URL(file,migrationDir),"utf8")})));
const joined=migrationTexts.map((x)=>x.text).join("\n");
for(const token of [
  "ensure_tenant_composite_pk_v1",
  "uq_course_schedule_rules_tenant_course",
  "uq_schedule_rule_override_tenant_requirement",
  "uq_schedule_rule_override_tenant_assignment",
  "uq_schedule_time_profile_active_per_tenant",
  "TENANT_CONTEXT_REQUIRED",
]) if(!joined.includes(token)){console.error(`Faz 2 tenant migration guard eksik: ${token}`);process.exit(1);}

const edgeGuard=migrationTexts.find((x)=>x.text.includes("uq_schedule_time_profile_active_per_tenant"))?.text??"";
for(const token of [
  "institution_code=v_tenant and s.id=p_scenario_id",
  "institution_code=v_tenant and rule_code in('physical_education_edge_slots','music_edge_slots')",
  "institution_code=v_tenant and r.active=true",
]) if(!edgeGuard.includes(token)){console.error(`Kenar-saat tenant guard eksik: ${token}`);process.exit(1);}

if(optimization.includes('onConflict:"course_id"')||scoped.includes('onConflict:"class_course_requirement_id"')||scoped.includes('onConflict:"teacher_assignment_id"')){
  console.error("Faz 2 ekranlarında tenant dışı legacy conflict target bulundu.");process.exit(1);
}

console.log("Faz 2 tamamlık guardı geçti: optimizasyon, scoped rules, senaryo karşılaştırma, route yetkileri ve tenant güvenliği korunuyor.");
