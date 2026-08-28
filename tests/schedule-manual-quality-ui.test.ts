import{describe,expect,it}from"bun:test";
const src=await Bun.file("src/routes/schedule.tsx").text();
describe("manual schedule heatmap and quality preview",()=>{
 it("loads teacher soft preferences into the manual grid",()=>{expect(src).toContain("teacher_schedule_preferences");expect(src).toContain("getScheduleSlotVisualState");expect(src).toContain("scheduleSlotVisualClass")});
 it("keeps HARD preview before advisory relation-quality preview for move and swap",()=>{const moveHard=src.indexOf('preview_schedule_move_v1');const moveQuality=src.indexOf('preview_schedule_move_quality_v1');const swapHard=src.indexOf('preview_schedule_swap_v1');const swapQuality=src.indexOf('preview_schedule_swap_quality_v1');expect(moveHard).toBeGreaterThan(-1);expect(moveQuality).toBeGreaterThan(moveHard);expect(swapHard).toBeGreaterThan(-1);expect(swapQuality).toBeGreaterThan(swapHard)});
 it("labels the advisory scope honestly",()=>{expect(src).toContain("Server HARD preview: uygun");expect(src).toContain("İlişki kalite farkı");expect(src).not.toContain("Toplam kalite")});
});
