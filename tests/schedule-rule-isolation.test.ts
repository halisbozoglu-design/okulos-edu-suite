import{describe,expect,test}from"bun:test";
import{isolatePlanningRule}from"../src/lib/schedule-rule-isolation";
import type{PlanningActivity,PlanningRelation}from"../src/lib/schedule-planning-relations";

describe("schedule rule isolation",()=>{
 const focus:PlanningActivity={activity_key:"a1",assignment_id:"x1",course_id:"math",teacher_id:"t1",class_id:"c1",weekday:1,start:1,end:1};
 test("isolates a HARD forbidden-period rule without another authority",()=>{const relation:PlanningRelation={id:"r1",relation_type:"FORBIDDEN_PERIODS",mode:"HARD",weight:1,left_selector:{course_id:"math"},right_selector:{},parameters:{periods:[1,2]}};const r=isolatePlanningRule({relation,activities:[focus],focus,days:[1],periodsPerDay:4});expect(r.affectedActivityKeys).toEqual(["a1"]);expect(r.blockedSlots).toBe(2);expect(r.candidateSlots.filter(x=>!x.allowed).map(x=>x.period)).toEqual([1,2])});
 test("keeps SOFT preference as penalty not prohibition",()=>{const relation:PlanningRelation={id:"r2",relation_type:"PREFERRED_PERIODS",mode:"SOFT",weight:5,left_selector:{teacher_id:"t1"},right_selector:{},parameters:{periods:[3,4]}};const r=isolatePlanningRule({relation,activities:[focus],focus,days:[1],periodsPerDay:4});expect(r.blockedSlots).toBe(0);expect(r.penalizedSlots).toBe(2);expect(r.candidateSlots.find(x=>x.period===3)?.score.soft).toBe(0)});
 test("reports current canonical violation score",()=>{const relation:PlanningRelation={id:"r3",relation_type:"FORBIDDEN_DAYS",mode:"HARD",weight:1,left_selector:{assignment_id:"x1"},right_selector:{},parameters:{days:[1]}};const r=isolatePlanningRule({relation,activities:[focus],focus,days:[1,2],periodsPerDay:2});expect(r.currentScore.hard).toBeGreaterThan(0);expect(r.candidateSlots.filter(x=>x.weekday===2).every(x=>x.allowed)).toBe(true)});
});
