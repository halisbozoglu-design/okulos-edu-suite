import {describe,expect,test} from "bun:test";
import {SCHEDULE_SECTIONING_OPERATION_MODES,SECTIONING_OPERATION_POLICY} from "../src/lib/schedule-sectioning-operation-mode";

describe("schedule sectioning operation modes",()=>{
 test("does not misrepresent two-phase timetable plus sectioning as a joint optimizer",()=>{const x=SCHEDULE_SECTIONING_OPERATION_MODES.TIMETABLE_AND_SECTIONING;expect(x.truth).toBe("TWO_PHASE");expect(x.description).toContain("iki aşamalı");expect(SECTIONING_OPERATION_POLICY).toContain("joint solver gibi gösterilmez")});
 test("sectioning-only freezes timetable authority",()=>{const x=SCHEDULE_SECTIONING_OPERATION_MODES.SECTIONING_ONLY;expect(x.timetableMutable).toBe(false);expect(x.sectioningMutable).toBe(true);expect(x.primaryAction).toBe("RUN_SECTIONING")});
 test("timetable-only leaves section enrollment unchanged",()=>{const x=SCHEDULE_SECTIONING_OPERATION_MODES.TIMETABLE_ONLY;expect(x.timetableMutable).toBe(true);expect(x.sectioningMutable).toBe(false);expect(x.primaryAction).toBe("OPEN_SOLVER")});
});
