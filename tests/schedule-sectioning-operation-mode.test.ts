import {describe,expect,test} from "bun:test";
import {SCHEDULE_SECTIONING_OPERATION_MODES,SECTIONING_OPERATION_POLICY} from "../src/lib/schedule-sectioning-operation-mode";

describe("schedule sectioning operation modes",()=>{
 test("joint mode mutates timetable and sectioning through one explicit operation",()=>{const x=SCHEDULE_SECTIONING_OPERATION_MODES.TIMETABLE_AND_SECTIONING;expect(x.truth).toBe("JOINT_OPTIMIZATION");expect(x.primaryAction).toBe("RUN_JOINT");expect(x.timetableMutable).toBe(true);expect(x.sectioningMutable).toBe(true);expect(SECTIONING_OPERATION_POLICY).toContain("atomik")});
 test("sectioning-only freezes timetable authority",()=>{const x=SCHEDULE_SECTIONING_OPERATION_MODES.SECTIONING_ONLY;expect(x.timetableMutable).toBe(false);expect(x.sectioningMutable).toBe(true);expect(x.primaryAction).toBe("RUN_SECTIONING")});
 test("timetable-only leaves section enrollment unchanged",()=>{const x=SCHEDULE_SECTIONING_OPERATION_MODES.TIMETABLE_ONLY;expect(x.timetableMutable).toBe(true);expect(x.sectioningMutable).toBe(false);expect(x.primaryAction).toBe("OPEN_SOLVER")});
});
