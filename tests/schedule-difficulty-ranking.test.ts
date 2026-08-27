import {describe,expect,test} from "bun:test";
import {rankScheduleDifficulty,scoreScheduleDifficulty,SCHEDULE_DIFFICULTY_POLICY} from "../src/lib/schedule-difficulty-ranking";
describe("schedule difficulty ranking",()=>{
 test("ranks scarce multi-constraint assignment above easy assignment",()=>{const hard=scoreScheduleDifficulty({candidateSlots:3,totalSlots:40,duration:3,relationDegree:6,eligibleRooms:1,teacherUnavailableSlots:12,lockedNeighborCount:4,studentConflictWeight:60}),easy=scoreScheduleDifficulty({candidateSlots:30,totalSlots:40,duration:1,relationDegree:0,eligibleRooms:6,teacherUnavailableSlots:1,lockedNeighborCount:0,studentConflictWeight:0});expect(hard.score).toBeGreaterThan(easy.score);expect(rankScheduleDifficulty([{stableKey:"easy",difficulty:easy},{stableKey:"hard",difficulty:hard}])[0].stableKey).toBe("hard")});
 test("zero eligible rooms is treated as severe construction pressure",()=>{const x=scoreScheduleDifficulty({candidateSlots:20,totalSlots:40,duration:1,relationDegree:0,eligibleRooms:0,teacherUnavailableSlots:0,lockedNeighborCount:0,studentConflictWeight:0});expect(x.roomScarcity).toBe(18)});
 test("never becomes score or validator authority",()=>{expect(SCHEDULE_DIFFICULTY_POLICY).toContain("yalnız construction ordering");expect(SCHEDULE_DIFFICULTY_POLICY).toContain("validator sonucunu değiştirmez")});
});
