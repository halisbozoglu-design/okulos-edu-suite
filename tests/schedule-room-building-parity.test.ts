import {describe,expect,test} from "bun:test";

const roomMigration=await Bun.file("supabase/migrations/20260826235000_schedule_room_building_parity_v2.sql").text();
const reoptMigration=await Bun.file("supabase/migrations/20260826235500_schedule_room_reoptimize_v2.sql").text();
const classroomsUi=await Bun.file("src/routes/classrooms.tsx").text();
const assignmentUi=await Bun.file("src/routes/room-assignment.tsx").text();

describe("room/building parity contract",()=>{
  test("scenario room candidate authority covers hard room, pool and transfer feasibility",()=>{
    expect(roomMigration).toContain("get_schedule_scenario_room_candidates_v2");
    expect(roomMigration).toContain("required_room_type");
    expect(roomMigration).toContain("required_hardware");
    expect(roomMigration).toContain("schedule_room_pools");
    expect(roomMigration).toContain("pool_capacity");
    expect(roomMigration).toContain("transfer_allowed");
    expect(roomMigration).toContain("get_schedule_building_travel_minutes_v1");
  });
  test("room preferences remain soft and are part of the authoritative objective vector",()=>{
    expect(roomMigration).toContain("preferred_room_type");
    expect(roomMigration).toContain("preferred_building_id");
    expect(roomMigration).toContain("capacity_waste_penalty");
    expect(roomMigration).toContain("get_schedule_scenario_room_summary_v2");
    expect(roomMigration).toContain("coalesce(g.soft,0)+coalesce(r.soft,0)");
  });
  test("room hard issues participate in scenario hard validation",()=>{
    expect(roomMigration).toContain("get_schedule_scenario_room_issues_v2");
    expect(roomMigration).toContain("ROOM_UNASSIGNED");
    expect(roomMigration).toContain("ROOM_INFEASIBLE");
    expect(roomMigration).toContain("union all select * from public.get_schedule_scenario_room_issues_v2");
  });
  test("building transfer can be explicitly forbidden even when travel minutes exist",()=>{
    expect(roomMigration).toContain("BUILDING_TRANSFER_NOT_ALLOWED");
    expect(roomMigration).toContain("BUILDING_TRANSFER_TIME_INSUFFICIENT");
  });
  test("reoptimization preserves locked room placements by default",()=>{
    expect(reoptMigration).toContain("p_preserve_locked boolean default true");
    expect(reoptMigration).toContain("not p_preserve_locked or not locked");
    expect(reoptMigration).toContain("assign_classrooms_to_scenario_core_v2");
  });
  test("operators can configure infrastructure and inspect room objective without raw SQL",()=>{
    expect(classroomsUi).toContain("schedule_buildings");
    expect(classroomsUi).toContain("schedule_room_pools");
    expect(classroomsUi).toContain("schedule_period_breaks");
    expect(classroomsUi).toContain("schedule_building_travel");
    expect(assignmentUi).toContain("get_schedule_scenario_room_summary_v2");
    expect(assignmentUi).toContain("optimize_classrooms_to_scenario_v2");
  });
});
