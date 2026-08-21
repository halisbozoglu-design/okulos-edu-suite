import { readFile } from "node:fs/promises";

const read=(p)=>readFile(new URL(`../${p}`,import.meta.url),"utf8");
const [bootstrap,duplicate,ci,baseline,policy]=await Promise.all([
  read("supabase/migrations/20260818223624_aa172e0c-f3af-419d-a4cf-fd129a550258.sql"),
  read("supabase/migrations/20260818232500_auth_profiles.sql"),
  read(".github/workflows/ci.yml"),
  read("supabase/baseline/20260821153000_cloud_baseline.sql"),
  read("docs/MIGRATION_POLICY.md"),
]);

const marker="create type public.app_role as enum ('admin', 'manager', 'teacher')";
if(!(bootstrap.includes(marker)&&duplicate.includes(marker))){
  console.error("Legacy replay blocker signature changed; re-audit baseline policy.");
  process.exit(1);
}
if(!baseline.includes("Canonical production baseline")&&!baseline.includes("canonical production baseline")){
  console.error("Canonical Cloud baseline marker is missing.");
  process.exit(1);
}
if(!policy.includes("20260821153000")||!policy.includes("Never replay pre-baseline")){
  console.error("Forward-only migration policy is missing or stale.");
  process.exit(1);
}
if(ci.includes("supabase db reset --local --no-seed")){
  console.error("Legacy migration replay from zero is forbidden; use a fresh schema dump for new environments.");
  process.exit(1);
}
if(!ci.includes("Protect applied migration history")){
  console.error("Forward-only migration history protection is missing.");
  process.exit(1);
}

console.log("Migration policy OK: Cloud baseline 20260821153000 is canonical; legacy chain is immutable and forward-only changes are required.");
