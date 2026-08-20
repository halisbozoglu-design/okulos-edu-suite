import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "supabase", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

const protectedDefinitions = {
  "function:generate_schedule_scenarios_v2": "20260820004859_5461dc36-66dd-4a52-99c6-942da6ffe6b8.sql",
  "function:apply_schedule_scenario": "20260820004859_5461dc36-66dd-4a52-99c6-942da6ffe6b8.sql",
  "function:validate_schedule_scenario_v2": "20260819220922_a4c09d54-71d0-4cea-b33c-b6e815f5d7f1.sql",
  "function:rescore_schedule_scenario_v2": "20260820004859_5461dc36-66dd-4a52-99c6-942da6ffe6b8.sql",
  "function:repair_schedule_scenario_v2": "20260820004859_5461dc36-66dd-4a52-99c6-942da6ffe6b8.sql",
  "function:assign_classrooms_to_scenario": "20260820004859_5461dc36-66dd-4a52-99c6-942da6ffe6b8.sql",
  "function:publish_current_schedule": "20260820004859_5461dc36-66dd-4a52-99c6-942da6ffe6b8.sql",
  "function:validate_schedule_semantics_v2": "20260819232413_2c256a7d-e97f-46c1-8629-75b7c47e1c54.sql",
  "function:upsert_schedule_slot_v2": "20260820004859_5461dc36-66dd-4a52-99c6-942da6ffe6b8.sql",
  "function:create_schedule_restore_point": "20260820070022_f45563b6-c4ac-481c-8724-7cb6c3e1832b.sql",
  "function:restore_schedule_restore_point": "20260820070022_f45563b6-c4ac-481c-8724-7cb6c3e1832b.sql",
  "function:get_schedule_preparation_readiness": "20260820070132_645dfff4-6b77-41ba-a140-c4ab9cfb0bdb.sql",
  "function:get_schedule_integrity_report_core_v2": "20260819220922_a4c09d54-71d0-4cea-b33c-b6e815f5d7f1.sql",
  "function:get_schedule_scenario_hard_issues_v2": "20260820070454_1fd83ac6-2961-4c1d-a8a7-3508d759597a.sql",
  "view:schedule_scenario_status_v2": "20260819214719_d99727ed-5f70-4c00-8e01-20b68d28c926.sql",
};

const lastDefinition = new Map();
for (const file of files) {
  const sql = readFileSync(join(dir, file), "utf8");
  for (const key of Object.keys(protectedDefinitions)) {
    const [kind, name] = key.split(":");
    const pattern = kind === "view"
      ? new RegExp(`create\\s+or\\s+replace\\s+view\\s+public\\.${name}\\b`, "i")
      : new RegExp(`create\\s+or\\s+replace\\s+function\\s+public\\.${name}\\s*\\(`, "i");
    if (pattern.test(sql)) lastDefinition.set(key, file);
  }
}

const errors = [];
for (const [key, expected] of Object.entries(protectedDefinitions)) {
  const actual = lastDefinition.get(key);
  if (!actual) errors.push(`${key}: tanım bulunamadı`);
  else if (actual !== expected) errors.push(`${key}: son tanım ${actual}, beklenen ${expected}`);
}
if (errors.length) {
  console.error("Timetable authority check FAILED:\n" + errors.map((e) => `- ${e}`).join("\n"));
  process.exit(1);
}
console.log(`Timetable authority check OK (${Object.keys(protectedDefinitions).length} protected definitions).`);