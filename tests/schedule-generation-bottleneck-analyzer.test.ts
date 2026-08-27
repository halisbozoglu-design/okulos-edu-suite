import {describe,expect,test} from "bun:test";
import {analyzeScheduleGenerationBottlenecks} from "../src/lib/schedule-generation-bottleneck-analyzer";

describe("schedule generation bottleneck analyzer",()=>{
 test("promotes repeated hard pressure across scenarios",()=>{const r=analyzeScheduleGenerationBottlenecks([
  {id:"1",scenario_id:"a",subject:"Math",reason:"UNPLACED",block_hours:2,diagnostic:{teacher_busy:2}},
  {id:"2",scenario_id:"b",subject:"Math",reason:"UNPLACED",block_hours:2,diagnostic:{teacher_busy:1}},
  {id:"3",scenario_id:"b",subject:"PE",reason:"UNPLACED",block_hours:1,diagnostic:{room_capacity:1}}
 ]);expect(r.scenarioCount).toBe(2);expect(r.signals[0].key).toBe("teacher_busy");expect(r.signals[0].severity).toBe("HARD_PRESSURE");expect(r.structural.some(x=>x.key==="teacher_busy")).toBe(true)});
 test("keeps unsafe repair actions out of safe suggestions",()=>{const r=analyzeScheduleGenerationBottlenecks([],[
  {scenario_id:"a",action_code:"SAFE",title:"Safe",legal_safe:true,hard_rule_impact:false,estimated_gain:4},
  {scenario_id:"a",action_code:"HARD",title:"Hard",legal_safe:true,hard_rule_impact:true,estimated_gain:99}
 ]);expect(r.safeSuggestions.map(x=>x.action_code)).toEqual(["SAFE"]);expect(r.policy).toContain("HARD kurallar otomatik gevşetilmez")});
});
