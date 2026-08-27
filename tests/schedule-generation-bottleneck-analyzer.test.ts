import {describe,expect,test} from "bun:test";
import {analyzeScheduleGenerationBottlenecks} from "../src/lib/schedule-generation-bottleneck-analyzer";

describe("schedule generation bottleneck analyzer",()=>{
 test("promotes repeated hard pressure across scenarios",()=>{const r=analyzeScheduleGenerationBottlenecks([
  {id:"1",scenario_id:"a",subject:"Math",reason:"UNPLACED",block_hours:2,diagnostic:{teacher_busy:2}},
  {id:"2",scenario_id:"b",subject:"Math",reason:"UNPLACED",block_hours:2,diagnostic:{teacher_busy:1}},
  {id:"3",scenario_id:"b",subject:"PE",reason:"UNPLACED",block_hours:1,diagnostic:{room_capacity:1}}
 ]);expect(r.scenarioCount).toBe(2);expect(r.signals[0].key).toBe("teacher_busy");expect(r.signals[0].severity).toBe("HARD_PRESSURE");expect(r.structural.some(x=>x.key==="teacher_busy")).toBe(true)});
 test("detects the same subject and reason as a persistent cross-scenario bottleneck",()=>{const r=analyzeScheduleGenerationBottlenecks([
  {id:"1",scenario_id:"a",subject:"Fizik",reason:"NO_SAFE_SLOT",block_hours:2,diagnostic:{teacher_busy:1,room_capacity:1}},
  {id:"2",scenario_id:"b",subject:"Fizik",reason:"NO_SAFE_SLOT",block_hours:2,diagnostic:{teacher_busy:2}},
  {id:"3",scenario_id:"c",subject:"Fizik",reason:"NO_SAFE_SLOT",block_hours:2,diagnostic:{room_capacity:1}},
  {id:"4",scenario_id:"c",subject:"Beden",reason:"NO_ROOM",block_hours:1,diagnostic:{room_capacity:1}}
 ]);expect(r.persistentSubjects).toHaveLength(1);expect(r.persistentSubjects[0].subject).toBe("Fizik");expect(r.persistentSubjects[0].scenarioCount).toBe(3);expect(r.persistentSubjects[0].diagnosticKeys).toEqual(["room_capacity","teacher_busy"])});
 test("keeps unsafe repair actions out of safe suggestions",()=>{const r=analyzeScheduleGenerationBottlenecks([],[
  {scenario_id:"a",action_code:"SAFE",title:"Safe",legal_safe:true,hard_rule_impact:false,estimated_gain:4},
  {scenario_id:"a",action_code:"HARD",title:"Hard",legal_safe:true,hard_rule_impact:true,estimated_gain:99}
 ]);expect(r.safeSuggestions.map(x=>x.action_code)).toEqual(["SAFE"]);expect(r.policy).toContain("HARD kurallar otomatik gevşetilmez")});
});
