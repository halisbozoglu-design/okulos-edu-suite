import {describe,expect,test} from "bun:test";
import {ascPeriodsPerWeek,ascWeeks,exportAsc2012Xml} from "../tools/schedule_asc_xml_export";
const problem:any={days:[1,2,3,4,5],periods:8,assignments:[{assignment_id:"a&1",teacher_id:"t1",class_id:"c1",course_id:"q1",assigned_hours:1,week_pattern:"ALL"},{assignment_id:"a2",teacher_id:"t2",class_id:"c2",course_id:"q2",assigned_hours:1,week_pattern:"ODD"},{assignment_id:"a3",teacher_id:"t3",class_id:"c3",course_id:"q3",assigned_hours:1,week_pattern:"EVEN"}],locked:[],unavailable:[],teacherConstraints:[{teacher_id:"t1",max_daily_hours:6,max_consecutive_hours:4}],courseRules:[],planningRelations:[],studentConflictWeights:[],seed:1};
describe("aSc 2012 XML conservative exporter",()=>{
 test("maps canonical week patterns using documented aSc week codes",()=>{expect(ascWeeks("ALL")).toBe("1");expect(ascWeeks("ODD")).toBe("10");expect(ascWeeks("EVEN")).toBe("01");expect(ascPeriodsPerWeek(1,"ODD")).toBe(.5)});
 test("exports benchmark entities and escapes XML",()=>{const r=exportAsc2012Xml(problem);expect(r.xml).toContain('<period period="8"');expect(r.xml).toContain('weeks="10"');expect(r.xml).toContain('weeks="01"');expect(r.xml).toContain('id="a&amp;1"')});
 test("never upgrades aSc benchmark status before unsupported hard mappings and executable generation are proven",()=>{const r=exportAsc2012Xml(problem);expect(r.status).toBe("INPUT_PARTIAL");expect(r.unsupported).toContain("TEACHER_DAILY_AND_CONSECUTIVE_LIMIT_XML_MAPPING_UNVERIFIED");expect(r.truth).toContain("generator execution")});
});
