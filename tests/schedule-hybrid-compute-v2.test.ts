import {describe,expect,test} from "bun:test";
const migration=await Bun.file("supabase/migrations/20260827014000_schedule_hybrid_compute_v2.sql").text();
const remote=await Bun.file("src/lib/schedule-remote-accelerator.ts").text();
const ui=await Bun.file("src/routes/schedule-hybrid-health.tsx").text();
const wiring=await Bun.file("scripts/check-existing-module-tenant-wiring.mjs").text();
describe("schedule hybrid compute v2 closure",()=>{
 test("job authority has budget deadline and reproducible base seed",()=>{for(const x of["budget_ms","deadline_at","base_seed","plan_schedule_solve_job_v2","p_budget_ms","p_base_seed"])expect(migration).toContain(x);expect(migration).toContain("seed0+i*7919")});
 test("capability routing is heartbeat load and capacity aware",()=>{for(const x of["get_schedule_compute_capabilities_v2","heartbeat_fresh","available_slots","load_ratio","avg_latency_ms","lease_seconds"])expect(migration).toContain(x)});
 test("worker lease and failover are explicit",()=>{for(const x of["heartbeat_schedule_worker_attempt_v2","lease_until","reap_stale_schedule_worker_attempts_v2","reaped_from","r.worker_type='GPU' and x.worker_type='CPU'"])expect(migration).toContain(x)});
 test("external problem payload carries canonical section 4 6 and 8 semantics",()=>{for(const x of["worker_claim_schedule_attempt_v2","week_pattern","valid_from","valid_to","term_no","schedule_session_id","allowed_periods","planning_relations","student_conflict_weights"])expect(migration).toContain(x)});
 test("raw worker result is fingerprinted and cannot bypass canonical server audit",()=>{for(const x of["worker_complete_schedule_attempt_v2","result_fingerprint","DUPLICATE","accept_schedule_worker_result_v2","import_local_schedule_candidate_v1","schedule_scenario_status_v2","canonical_audit","REJECTED","LATE"])expect(migration).toContain(x)});
 test("client uses only v2 remote authority and explicitly cancels timeout",()=>{for(const x of["get_schedule_compute_capabilities_v2","plan_schedule_solve_job_v2","get_schedule_solve_job_status_v2","accept_schedule_worker_result_v2","cancel_schedule_solve_job_v2"])expect(remote).toContain(x);expect(remote).not.toContain("accept_schedule_worker_result_v1");expect(remote).not.toContain('from("schedule_solve_attempts")')});
 test("hybrid health UI exposes canonical safety state",()=>{expect(ui).toContain("get_schedule_compute_capabilities_v2");expect(ui).toContain("get_schedule_hybrid_health_v2");expect(ui).toContain("Canonical kabul zinciri");expect(ui).toContain("fingerprint");expect(wiring).toContain("/schedule-hybrid-health");expect(wiring).toContain("['/schedule-hybrid-health','/schedule']")});
 test("migration remains forward-only",()=>expect(migration).not.toMatch(/drop\s+(table|column)|truncate\s|delete\s+from/i));
});
