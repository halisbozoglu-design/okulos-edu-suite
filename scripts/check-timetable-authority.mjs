import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "supabase", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

const protectedDefinitions = {
  "function:generate_schedule_scenarios_v2": "20260819071600_timetable_revision_and_concurrency_guard.sql",
  "function:apply_schedule_scenario": "20260819071600_timetable_revision_and_concurrency_guard.sql",
  "function:validate_schedule_scenario_v2": "20260819071500_schedule_validation_single_source_v2.sql",
  "function:rescore_schedule_scenario_v2": "20260819071700_timetable_scenario_freshness_guard.sql",
  "function:repair_schedule_scenario_v2": "20260819071800_timetable_postprocess_freshness_wrappers.sql",
  "function:assign_classrooms_to_scenario": "20260819071800_timetable_postprocess_freshness_wrappers.sql",
  "function:publish_current_schedule": "20260819071900_timetable_publish_mutation_lock.sql",
  "function:get_schedule_integrity_report_core_v2": "20260819071300_schedule_parallel_count_null_fix.sql",
  "function:get_schedule_scenario_hard_issues_v2": "20260819071300_schedule_parallel_count_null_fix.sql",
  "view:schedule_scenario_status_v2": "20260819071600_timetable_revision_and_concurrency_guard.sql",
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
