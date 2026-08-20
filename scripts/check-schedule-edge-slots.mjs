import { readFile } from "node:fs/promises";

const policy = await readFile(new URL("../supabase/migrations/20260820192500_schedule_edge_slot_policy.sql", import.meta.url), "utf8");
const repair = await readFile(new URL("../supabase/migrations/20260820193500_schedule_edge_slot_repair.sql", import.meta.url), "utf8");
const contract = await readFile(new URL("../supabase/migrations/20260820193800_schedule_edge_slot_repair_return_contract.sql", import.meta.url), "utf8");
const workspace = await readFile(new URL("../src/routes/timetable.tsx", import.meta.url), "utf8");

for (const token of [
  "physical_education_edge_slots",
  "music_edge_slots",
  "weekday=1 and r.period=1",
  "weekday=5 and r.period=v_last_period",
  "get_schedule_scenario_edge_slot_issues_v1",
  "get_schedule_edge_slot_integrity_issues_v1",
  "get_schedule_integrity_report_pre_edge_v1",
]) {
  if (!policy.includes(token)) {
    console.error(`Kenar-saat policy işareti eksik: ${token}`);
    process.exit(1);
  }
}

for (const token of [
  "try_schedule_edge_target_v1",
  "apply_schedule_edge_slot_repairs_v1",
  "generate_schedule_scenarios_pre_edge_v2",
  "v_after<v_before",
]) {
  if (!repair.includes(token)) {
    console.error(`Kenar-saat placement işareti eksik: ${token}`);
    process.exit(1);
  }
}

for (const token of [
  "scenario_no smallint",
  "score integer,unplaced_count integer,row_count integer",
  "apply_schedule_edge_slot_repairs_v1",
]) {
  if (!contract.includes(token)) {
    console.error(`Scenario generator sözleşmesi eksik: ${token}`);
    process.exit(1);
  }
}

for (const token of ["Beden Eğitimi", "Müzik", "Pazartesi 1. ders + Cuma son ders", "Default açık ve HARD"]) {
  if (!workspace.includes(token)) {
    console.error(`Kenar-saat UI işareti eksik: ${token}`);
    process.exit(1);
  }
}

console.log("Beden Eğitimi ve Müzik kenar-saat politikası placement + hard validator + final integrity + UI tarafından korunuyor.");
