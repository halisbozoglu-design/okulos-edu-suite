import {describe,expect,test} from "bun:test";
import {ScheduleHotspotIndex} from "../src/lib/schedule-local-hotspot-index";
import type {LocalAssignment,LocalLockedRow} from "../src/lib/schedule-local-solver-time-core";

const assignments:LocalAssignment[]=[
 {assignment_id:"odd",teacher_id:"t",class_id:"c",course_id:"q",assigned_hours:1,week_pattern:"ODD"},
 {assignment_id:"even",teacher_id:"t",class_id:"c",course_id:"q",assigned_hours:1,week_pattern:"EVEN"},
 {assignment_id:"all",teacher_id:"x",class_id:"z",course_id:"r",assigned_hours:1,week_pattern:"ALL"},
];
const row=(assignment_id:string,teacher_id:string,class_id:string,weekday:number,period:number):LocalLockedRow=>({assignment_id,teacher_id,class_id,weekday,period,locked:false,activity_key:`${assignment_id}:1`,activity_duration:1});

describe("schedule hotspot index",()=>{
 test("scope-aware buckets preserve odd/even overlap semantics",()=>{const rows=[row("odd","t","c",1,1),row("even","t","c",1,1),row("all","x","z",1,1)];const i=new ScheduleHotspotIndex(assignments,rows);expect(i.slot(assignments[0]!,1,1).map(x=>x.assignment_id).sort()).toEqual(["all","odd"]);expect(i.slot(assignments[1]!,1,1).map(x=>x.assignment_id).sort()).toEqual(["all","even"]);expect(i.occupied(assignments[0]!,1,1)).toBe(true);});
 test("add/remove mutate every hotspot bucket consistently",()=>{const i=new ScheduleHotspotIndex(assignments);const r=row("odd","t","c",2,3);i.add(r);expect(i.teacherDay(assignments[0]!,2)).toHaveLength(1);expect(i.classDay(assignments[0]!,2)).toHaveLength(1);expect(i.courseDay(assignments[0]!,2)).toHaveLength(1);expect(i.activityGroups()).toHaveLength(1);i.remove(r);expect(i.teacherDay(assignments[0]!,2)).toHaveLength(0);expect(i.classDay(assignments[0]!,2)).toHaveLength(0);expect(i.courseDay(assignments[0]!,2)).toHaveLength(0);expect(i.activityGroups()).toHaveLength(0);});
 test("student penalty uses slot bucket and conflict adjacency",()=>{const rows=[row("all","x","z",1,2)];const i=new ScheduleHotspotIndex(assignments,rows,[{left_assignment_id:"odd",right_assignment_id:"all",student_weight:4,severity_weight:7}]);expect(i.studentPenalty("odd",1,2,1)).toBe(7);expect(i.studentPenalty("even",1,2,1)).toBe(0);});
});
