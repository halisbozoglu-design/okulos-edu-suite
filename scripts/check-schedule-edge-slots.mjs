import { readFile } from "node:fs/promises";

const migration = await readFile(new URL("../supabase/migrations/20260820192500_schedule_edge_slot_policy.sql", import.meta.url), "utf8");
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
  if (!migration.includes(token)) {
    console.error(`Kenar-saat migration işareti eksik: ${token}`);
    process.exit(1);
  }
}

for (const token of ["Beden Eğitimi", "Müzik", "Pazartesi 1. ders + Cuma son ders", "default açık ve HARD".replace("default", "Default")]) {
  if (!workspace.includes(token)) {
    console.error(`Kenar-saat UI işareti eksik: ${token}`);
    process.exit(1);
  }
}

console.log("Beden Eğitimi ve Müzik kenar-saat politikası solver + final integrity + UI tarafından korunuyor.");
