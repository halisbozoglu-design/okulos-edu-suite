import { describe, expect, it } from "bun:test";
import { evaluateCandidateRelations, evaluatePlanningRelations, isSupportedPlanningRelationType, type PlanningActivity, type PlanningMode, type PlanningRelation } from "../src/lib/schedule-planning-relations";
import { PLANNING_RELATION_TYPES, getPlanningRelationTypeSpec } from "../src/lib/schedule-constraint-ontology";
function act(key:string,weekday:number,start:number,end=start,classroom_id:string|null=null):PlanningActivity{return{activity_key:key,assignment_id:`as-${key}`,course_id:`c-${key}`,teacher_id:`t-${key}`,class_id:`k-${key}`,weekday,start,end,classroom_id}}
function rel(relation_type:string,parameters:Record<string,unknown>={},mode:PlanningMode="HARD",left="a",right="b",weight=1):PlanningRelation{return{id:`r-${relation_type}`,relation_type,mode,weight,left_selector:left==="*"?{}:{activity_key:left},right_selector:right==="*"?{}:{activity_key:right},parameters}}
const score=(acts:PlanningActivity[],r:PlanningRelation)=>evaluatePlanningRelations(acts,[r]);

describe("ontology",()=>{
 it("covers all 26 canonical activity relation types",()=>{const types=["SAME_TIME","DIFFERENT_TIME","SAME_START","SAME_DAY","DIFFERENT_DAY","SAME_ROOM","DIFFERENT_ROOM","ORDERED","CONSECUTIVE","ADJACENT","OVERLAP","NOT_OVERLAP","MIN_GAP","MAX_GAP","MIN_DAYS","MAX_DAYS","SAME_ROOM_IF_CONSECUTIVE","STARTS_DAY","ENDS_DAY","PREFERRED_START","PREFERRED_SLOT","FORBIDDEN_SLOT","GROUPED","MAX_SIMULTANEOUS","MAX_OCCUPIED_SLOTS","MAX_DIFFERENT_ROOMS"];expect(PLANNING_RELATION_TYPES.length).toBe(26);for(const t of types){expect(isSupportedPlanningRelationType(t)).toBe(true);expect(getPlanningRelationTypeSpec(t)?.description.length).toBeGreaterThan(0)}});
 it("rejects unknown types",()=>{expect(isSupportedPlanningRelationType("NOT_A_REAL_RELATION")).toBe(false);expect(score([act("a",1,1),act("b",2,3)],rel("NOT_A_REAL_RELATION")).hard).toBe(0)});
});

describe("binary time/room/sequence",()=>{
 it("SAME_ROOM / DIFFERENT_ROOM and unknown room semantics",()=>{expect(score([act("a",1,1,1,"R1"),act("b",2,1,1,"R2")],rel("SAME_ROOM")).hard).toBe(1);expect(score([act("a",1,1,1,"R1"),act("b",2,1,1,"R1")],rel("DIFFERENT_ROOM")).hard).toBe(1);expect(score([act("a",1,1,1,null),act("b",2,1,1,"R2")],rel("SAME_ROOM")).hard).toBe(0)});
 it("SAME_START ignores day",()=>{expect(score([act("a",1,3),act("b",4,3)],rel("SAME_START")).hard).toBe(0);expect(score([act("a",1,3),act("b",1,4)],rel("SAME_START")).hard).toBe(1)});
 it("OVERLAP / NOT_OVERLAP use full intervals",()=>{const x=[act("a",2,1,3),act("b",2,3,5)],y=[act("a",2,1,2),act("b",2,4,5)];expect(score(x,rel("OVERLAP")).hard).toBe(0);expect(score(y,rel("OVERLAP")).hard).toBe(1);expect(score(x,rel("NOT_OVERLAP")).hard).toBe(1);expect(score(y,rel("NOT_OVERLAP")).hard).toBe(0)});
 it("ADJACENT is symmetric and CONSECUTIVE directional",()=>{expect(score([act("a",1,2),act("b",1,3)],rel("ADJACENT")).hard).toBe(0);expect(score([act("a",1,3),act("b",1,2)],rel("ADJACENT")).hard).toBe(0);expect(score([act("a",1,3),act("b",1,2)],rel("CONSECUTIVE")).hard).toBe(1);expect(score([act("a",1,2),act("b",1,4)],rel("ADJACENT")).hard).toBe(1)});
 it("SAME_ROOM_IF_CONSECUTIVE only matters for adjacent activities",()=>{expect(score([act("a",1,1,1,"R1"),act("b",1,2,2,"R2")],rel("SAME_ROOM_IF_CONSECUTIVE")).hard).toBe(1);expect(score([act("a",1,1,1,"R1"),act("b",1,3,3,"R2")],rel("SAME_ROOM_IF_CONSECUTIVE")).hard).toBe(0);expect(score([act("a",1,1,1,"R1"),act("b",1,2,2,"R1")],rel("SAME_ROOM_IF_CONSECUTIVE")).hard).toBe(0)});
 it("MIN_DAYS / MAX_DAYS use weekday distance",()=>{expect(score([act("a",1,1),act("b",2,1)],rel("MIN_DAYS",{days:2})).hard).toBe(1);expect(score([act("a",1,1),act("b",3,1)],rel("MIN_DAYS",{days:2})).hard).toBe(0);expect(score([act("a",1,1),act("b",5,1)],rel("MAX_DAYS",{days:2})).hard).toBe(1)});
});

describe("unary placement",()=>{
 it("STARTS_DAY / ENDS_DAY",()=>{expect(score([act("a",1,1)],rel("STARTS_DAY")).hard).toBe(0);expect(score([act("a",1,2)],rel("STARTS_DAY")).hard).toBe(1);expect(score([act("a",1,7,8)],rel("ENDS_DAY",{last_period:8})).hard).toBe(0)});
 it("PREFERRED_START differs from PREFERRED_SLOT on multi-period activity",()=>{const a=[act("a",1,2,3)];expect(score(a,rel("PREFERRED_START",{days:[1],periods:[2]})).hard).toBe(0);expect(score(a,rel("PREFERRED_SLOT",{days:[1],periods:[2]})).hard).toBe(1);expect(score(a,rel("PREFERRED_SLOT",{days:[1],periods:[2,3]})).hard).toBe(0)});
 it("FORBIDDEN_SLOT checks every occupied period",()=>{expect(score([act("a",5,7,8)],rel("FORBIDDEN_SLOT",{days:[5],periods:[8]})).hard).toBe(1);expect(score([act("a",5,6,7)],rel("FORBIDDEN_SLOT",{days:[5],periods:[8]})).hard).toBe(0)});
});

describe("set relations",()=>{
 const all=(type:string,params:Record<string,unknown>={},mode:PlanningMode="HARD",weight=1):PlanningRelation=>({id:`set-${type}`,relation_type:type,mode,weight,left_selector:{},right_selector:{},parameters:params});
 it("GROUPED accepts one contiguous same-day group",()=>{expect(evaluatePlanningRelations([act("a",1,1),act("b",1,2,3),act("c",1,4)],[all("GROUPED")]).hard).toBe(0);expect(evaluatePlanningRelations([act("a",1,1),act("b",1,3)],[all("GROUPED")]).hard).toBeGreaterThan(0);expect(evaluatePlanningRelations([act("a",1,1),act("b",2,2)],[all("GROUPED")]).hard).toBeGreaterThan(0)});
 it("MAX_SIMULTANEOUS counts excess simultaneous activities",()=>{const acts=[act("a",1,1,2),act("b",1,2),act("c",1,2)];expect(evaluatePlanningRelations(acts,[all("MAX_SIMULTANEOUS",{max:2})]).hard).toBe(1);expect(evaluatePlanningRelations(acts,[all("MAX_SIMULTANEOUS",{max:3})]).hard).toBe(0)});
 it("MAX_OCCUPIED_SLOTS counts distinct occupied slots",()=>{const acts=[act("a",1,1,2),act("b",1,4)];expect(evaluatePlanningRelations(acts,[all("MAX_OCCUPIED_SLOTS",{max:2})]).hard).toBe(1);expect(evaluatePlanningRelations(acts,[all("MAX_OCCUPIED_SLOTS",{max:3})]).hard).toBe(0)});
 it("MAX_DIFFERENT_ROOMS counts distinct known rooms",()=>{const acts=[act("a",1,1,1,"R1"),act("b",2,1,1,"R2"),act("c",3,1,1,"R2")];expect(evaluatePlanningRelations(acts,[all("MAX_DIFFERENT_ROOMS",{max:1})]).hard).toBe(1);expect(evaluatePlanningRelations(acts,[all("MAX_DIFFERENT_ROOMS",{max:2})]).hard).toBe(0)});
 it("candidate set scoring returns only incremental penalty",()=>{const r=all("MAX_OCCUPIED_SLOTS",{max:2});const placed=[act("a",1,1),act("b",1,2)];expect(evaluateCandidateRelations(act("c",1,3),placed,[r]).hard).toBe(1);expect(evaluateCandidateRelations(act("c",1,2),placed,[r]).hard).toBe(0)});
});

describe("modes and counting",()=>{
 it("separates HARD / MEDIUM / SOFT and ignores OFF",()=>{const acts=[act("a",1,1),act("b",2,1)],rels=[rel("SAME_DAY",{},"HARD","a","b",1),rel("SAME_DAY",{},"MEDIUM","a","b",2),rel("SAME_DAY",{},"SOFT","a","b",3),rel("SAME_DAY",{},"OFF","a","b",9)];expect(evaluatePlanningRelations(acts,rels)).toEqual({hard:1,medium:2,soft:3})});
 it("counts symmetric pairs once",()=>{const acts=[act("a",1,1),act("b",2,1)],same:PlanningRelation={id:"s1",relation_type:"SAME_DAY",mode:"HARD",weight:1,left_selector:{},right_selector:{},parameters:{}};expect(evaluatePlanningRelations(acts,[same]).hard).toBe(1)});
 it("candidate evaluation does not mutate placed rows",()=>{const placed=[act("b",2,1)],snapshot=JSON.stringify(placed);evaluateCandidateRelations(act("a",1,1),placed,[rel("SAME_DAY")]);expect(JSON.stringify(placed)).toBe(snapshot)});
});
