import{describe,expect,test}from"bun:test";
import{getScheduleSlotVisualState,scheduleSlotVisualClass}from"../src/lib/schedule-slot-visual-state";

describe("schedule slot visual state",()=>{
 const unavailable=[{teacher_id:"t1",weekday:1,period:1,active:true}];
 const preferences=[{teacher_id:"t1",weekday:1,period:2,preference:"prefer" as const,weight:4,active:true},{teacher_id:"t1",weekday:1,period:3,preference:"avoid" as const,weight:7,active:true}];
 test("HARD unavailable always wins",()=>expect(getScheduleSlotVisualState({teacherId:"t1",weekday:1,period:1,unavailable,preferences}).state).toBe("blocked"));
 test("prefer and avoid remain SOFT visual states",()=>{expect(getScheduleSlotVisualState({teacherId:"t1",weekday:1,period:2,unavailable,preferences}).state).toBe("prefer");expect(getScheduleSlotVisualState({teacherId:"t1",weekday:1,period:3,unavailable,preferences}).state).toBe("avoid")});
 test("visual helper does not invent authority",()=>{expect(getScheduleSlotVisualState({teacherId:"t1",weekday:2,period:1,unavailable,preferences}).state).toBe("neutral");expect(scheduleSlotVisualClass("blocked")).toContain("bg-destructive")});
});
