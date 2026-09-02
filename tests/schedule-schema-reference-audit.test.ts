import{afterAll,describe,expect,test}from"bun:test";
import{unlink}from"node:fs/promises";
const out=`/tmp/schedule-schema-reference-audit-test-${process.pid}.json`;
afterAll(async()=>{await unlink(out).catch(()=>{})});
describe("canonical schedule schema reference audit",()=>{
 test("baseline plus forward schema has no duplicate or unreferenced fields",async()=>{
  const p=Bun.spawn(["node","scripts/report-schedule-schema-references.mjs","--ci","--out",out],{stdout:"pipe",stderr:"pipe"}),[code,stdout,stderr]=await Promise.all([p.exited,new Response(p.stdout).text(),new Response(p.stderr).text()]);
  expect(code,`${stdout}\n${stderr}`).toBe(0);const report=await Bun.file(out).json();
  expect(report.schema).toBe("okulos.schedule-schema-reference-audit.v1");expect(report.baseline).toBe("20260821153000");expect(report.table_count).toBeGreaterThan(30);expect(report.field_count).toBeGreaterThan(300);expect(report.duplicate_forward_definition_count).toBe(0);expect(report.unreferenced_field_count).toBe(0);
 });
});
