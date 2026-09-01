import {describe,expect,it} from "bun:test";

const migration=await Bun.file("supabase/migrations/20260831010500_canonical_schedule_validation_rpc_boundary.sql").text();

describe("canonical schedule validation RPC boundary",()=>{
  it("requires authentication, a schedule permission and tenant ownership",()=>{
    expect(migration).toContain("AUTHENTICATION_REQUIRED");
    expect(migration).toContain("assert_schedule_scenario_tenant_phase3_v1");
    expect(migration).toContain("has_permission('schedule.view')");
  });
  it("does not relax inherited hard validation and closes anonymous execution",()=>{
    expect(migration).toContain("validate_schedule_scenario_pre_access_v1");
    expect(migration).toContain("get_schedule_scenario_hard_issues_pre_access_v1");
    expect(migration).toContain("from public, anon");
    expect(migration).toContain("to authenticated");
  });
});
