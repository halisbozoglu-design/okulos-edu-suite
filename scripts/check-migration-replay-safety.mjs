import { readFile } from "node:fs/promises";

const read=(p)=>readFile(new URL(`../${p}`,import.meta.url),"utf8");
const [bootstrap,duplicate,ci]=await Promise.all([
  read("supabase/migrations/20260818223624_aa172e0c-f3af-419d-a4cf-fd129a550258.sql"),
  read("supabase/migrations/20260818232500_auth_profiles.sql"),
  read(".github/workflows/ci.yml"),
]);

const marker="create type public.app_role as enum ('admin', 'manager', 'teacher')";
const legacyReplayBlocked=bootstrap.includes(marker)&&duplicate.includes(marker);
if(!legacyReplayBlocked){
  console.error("Legacy replay blocker signature changed. Re-audit migration baseline policy before enabling clean replay.");
  process.exit(1);
}

if(ci.includes("supabase db reset --local --no-seed")){
  console.error("LEGACY_MIGRATION_REPLAY_BLOCKED_UNTIL_BASELINE: CI must not replay the historical Lovable chain from zero before a canonical baseline exists.");
  process.exit(1);
}
if(!ci.includes("Protect applied migration history")){
  console.error("Forward-only migration history protection is missing.");
  process.exit(1);
}

console.log("LEGACY_MIGRATION_REPLAY_BLOCKED_UNTIL_BASELINE: historical Lovable bootstrap contains duplicate non-idempotent DDL; old migrations stay immutable and CI validates forward-only policy until a canonical baseline is produced.");
