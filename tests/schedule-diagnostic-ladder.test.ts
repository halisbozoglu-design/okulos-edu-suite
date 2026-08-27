import {describe,expect,test} from "bun:test";
import {buildScheduleDiagnosticLadder,DIAGNOSTIC_LADDER_POLICY,firstPressureLayer} from "../src/lib/schedule-diagnostic-ladder";
describe("schedule diagnostic ladder",()=>{
 test("orders foundational layers before downstream quality",()=>{const x=buildScheduleDiagnosticLadder({preparation:[{code:"TIME_PROFILE_CONFIGURATION_INVALID",affected_count:1},{code:"ROOM_RULE_HAS_NO_MATCHING_ROOM",affected_count:2}],softCount:5});expect(x.map(v=>v.key)).toEqual(["TIME","TEACHER","CLASS","ROOM","RELATION","STUDENT","MEB","MEDIUM","SOFT"]);expect(firstPressureLayer(x)?.key).toBe("TIME")});
 test("maps canonical unplaced diagnostics into their layer",()=>{const x=buildScheduleDiagnosticLadder({unplaced:[{diagnostic:{teacher_busy:3,room_capacity:2,student_conflict:1}}]});expect(x.find(v=>v.key==="TEACHER")?.signalCount).toBe(3);expect(x.find(v=>v.key==="ROOM")?.signalCount).toBe(2);expect(x.find(v=>v.key==="STUDENT")?.signalCount).toBe(1)});
 test("never authorizes hard relaxation",()=>{expect(DIAGNOSTIC_LADDER_POLICY).toContain("hiçbir HARD kural");expect(DIAGNOSTIC_LADDER_POLICY).toContain("kapatılmaz");expect(DIAGNOSTIC_LADDER_POLICY).toContain("gevşetilmez")});
});
