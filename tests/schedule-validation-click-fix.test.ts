import{describe,expect,it}from"bun:test";
const src=await Bun.file("src/routes/schedule-validation.tsx").text();
describe("schedule validation click-to-fix",()=>{
 it("routes room problems to canonical room assignment UI",()=>{expect(src).toContain('to:"/room-assignment"');expect(src).toContain("Derslikleri Düzelt")});
 it("routes time and rule problems to their existing authorities",()=>{expect(src).toContain('to:"/schedule-time-model"');expect(src).toContain('to:"/schedule-rules"')});
 it("keeps validation authority unchanged while exposing navigation",()=>{expect(src).toContain('supabase.rpc("get_schedule_integrity_report")');expect(src).toContain("Yayın durumu")});
});
