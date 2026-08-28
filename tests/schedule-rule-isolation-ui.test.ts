import{describe,expect,it}from"bun:test";
const route=await Bun.file("src/routes/schedule-rules-relations.tsx").text();
describe("schedule relation rule isolation UI",()=>{
 it("uses operator language without replacing canonical relation ids",()=>{expect(route).toContain("relationOperatorText");expect(route).toContain("PLANNING_RELATION_TYPES");expect(route).toContain("value={x.type}")});
 it("exposes canonical single-rule isolation without hard relaxation",()=>{expect(route).toContain("isolatePlanningRule");expect(route).toContain("Kuralı Test Et");expect(route).toContain("Production HARD kuralları kapatılmaz veya gevşetilmez")});
 it("shows allowed penalized and blocked candidate slots",()=>{expect(route).toContain('"Yasak · H');expect(route).toContain('"Cezalı · M');expect(route).toContain('"Uygun"')});
});
