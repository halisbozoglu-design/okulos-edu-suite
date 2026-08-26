import {describe,expect,test} from "bun:test";
import {applyMoves,findDirectBlockers,mergeEjectionMoves,scoreEjectionCandidate,type EjectionMove} from "../src/lib/schedule-ejection-chain";

const rows=[
 {id:"a",teacher_id:"t1",class_id:"c1",classroom_id:"r1",subgroup_id:null,teacher_assignment_id:"a1",weekday:1,period:1,locked:false},
 {id:"b",teacher_id:"t2",class_id:"c1",classroom_id:"r2",subgroup_id:null,teacher_assignment_id:"a2",weekday:1,period:2,locked:false},
 {id:"c",teacher_id:"t3",class_id:"c3",classroom_id:"r1",subgroup_id:null,teacher_assignment_id:"a3",weekday:1,period:2,locked:false},
];

describe("deep ejection chain helpers",()=>{
 test("merge rejects contradictory targets for the same atomic row",()=>{const a:EjectionMove[]=[{schedule_id:"x",weekday:1,period:2}],b:EjectionMove[]=[{schedule_id:"x",weekday:2,period:2}];expect(mergeEjectionMoves(a,b)).toBeNull()});
 test("merge preserves an atomic multi-row block",()=>{const a:EjectionMove[]=[{schedule_id:"x1",weekday:2,period:3},{schedule_id:"x2",weekday:2,period:4}],b:EjectionMove[]=[{schedule_id:"y",weekday:3,period:2}];expect(mergeEjectionMoves(a,b)?.map(x=>x.schedule_id).sort()).toEqual(["x1","x2","y"])});
 test("direct blockers are resource-aware, not global-slot occupancy",()=>{const moves:EjectionMove[]=[{schedule_id:"a",weekday:1,period:2,classroom_id:"r1"}];expect(findDirectBlockers(rows,moves).map(x=>x.id).sort()).toEqual(["b","c"])});
 test("unrelated lesson in same clock slot is not an ejection blocker",()=>{const extra={id:"d",teacher_id:"t9",class_id:"c9",classroom_id:"r9",subgroup_id:null,teacher_assignment_id:"a9",weekday:1,period:2,locked:false};const moves:EjectionMove[]=[{schedule_id:"a",weekday:1,period:2,classroom_id:"r1"}];expect(findDirectBlockers([...rows,extra],moves).map(x=>x.id)).not.toContain("d")});
 test("student conflict weights can make an otherwise unrelated row a blocker candidate",()=>{const extra={id:"d",teacher_id:"t9",class_id:"c9",classroom_id:"r9",subgroup_id:null,teacher_assignment_id:"a9",weekday:1,period:2,locked:false};const moves:EjectionMove[]=[{schedule_id:"a",weekday:1,period:2,classroom_id:"r1"}];const weights=[{left_assignment_id:"a1",right_assignment_id:"a9",severity_weight:5,student_weight:1}];expect(findDirectBlockers([...rows,extra],moves,weights).map(x=>x.id)).toContain("d")});
 test("hypothetical apply does not mutate source rows",()=>{const moved=applyMoves(rows,[{schedule_id:"a",weekday:3,period:5}]);expect(moved.find(x=>x.id==="a")?.weekday).toBe(3);expect(rows.find(x=>x.id==="a")?.weekday).toBe(1)});
 test("candidate score is lexicographic-ready and charges movement",()=>{const assignments=new Map([["a1",{teacher_assignment_id:"a1",teacher_id:"t1",class_id:"c1",course_id:"q1"}],["a2",{teacher_assignment_id:"a2",teacher_id:"t2",class_id:"c1",course_id:"q2"}],["a3",{teacher_assignment_id:"a3",teacher_id:"t3",class_id:"c3",course_id:"q3"}]]);const s=scoreEjectionCandidate({rows,assignmentById:assignments,relations:[],conflictWeights:[]},[{schedule_id:"a",weekday:2,period:4,classroom_id:"r1"}]);expect(s.medium).toBe(0);expect(s.moveCost).toBeGreaterThan(0);expect(s.soft).toBeGreaterThanOrEqual(s.moveCost)});
});
