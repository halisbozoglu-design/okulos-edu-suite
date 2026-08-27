import {describe,expect,test} from "bun:test";
import {explainScheduleRoomIssue,ROOM_ISSUE_EXPLAINER_POLICY} from "../src/lib/schedule-room-issue-explainer";
describe("schedule room issue explainer",()=>{
 test("separates room capacity, collision, feature and building transfer",()=>{expect(explainScheduleRoomIssue("ROOM_CAPACITY_EXCEEDED").kind).toBe("CAPACITY");expect(explainScheduleRoomIssue("ROOM_DOUBLE_BOOKING").kind).toBe("ROOM_COLLISION");expect(explainScheduleRoomIssue("ROOM_HARDWARE_MISMATCH").kind).toBe("TYPE_OR_FEATURE");expect(explainScheduleRoomIssue("BUILDING_TRANSFER_FORBIDDEN").kind).toBe("BUILDING_TRANSFER")});
 test("distinguishes unassigned room from no eligible room",()=>{expect(explainScheduleRoomIssue("ROOM_UNASSIGNED").kind).toBe("UNASSIGNED");expect(explainScheduleRoomIssue("ROOM_RULE_HAS_NO_MATCHING_ROOM").kind).toBe("NO_ELIGIBLE_ROOM")});
 test("is explanation only, never a feasibility authority",()=>{expect(ROOM_ISSUE_EXPLAINER_POLICY).toContain("HARD karar üretmez")});
});
