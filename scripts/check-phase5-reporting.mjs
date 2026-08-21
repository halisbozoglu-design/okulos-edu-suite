import { readFile } from "node:fs/promises";

const read=(p)=>readFile(new URL(`../${p}`,import.meta.url),"utf8");
const [route,management,timetable,ci]=await Promise.all([
  read("src/routes/schedule-reports.tsx"),
  read("src/routes/management.tsx"),
  read("src/routes/timetable.tsx"),
  read(".github/workflows/ci.yml"),
]);

for(const token of [
  'createFileRoute("/schedule-reports")',
  'can("schedule.view")',
  'if (!permissionLoading && can("schedule.view")) void load()',
  'from("teacher_schedule")',
  'from("schedule_assignment_options")',
  'rpc("get_active_schedule_time_profile")',
  'from("academic_years")',
  'teacherSummary',
  'classSummary',
  'roomSummary',
  'subjectSummary',
  'XLSX.writeFile',
  'exportCsv',
  'window.print()',
  'Derslik atanmamış',
]) if(!route.includes(token)){console.error(`Phase 5 report contract missing: ${token}`);process.exit(1);}

for(const token of [
  "to:'/schedule-reports'",
  "title:'Raporlar & Çıktılar'",
  "permissions:['schedule.view']",
]) if(!management.includes(token)){console.error(`Phase 5 management link missing: ${token}`);process.exit(1);}

for(const token of [
  'label:"Raporlar & Çıktılar",to:"/schedule-reports"',
  '["Raporlar","/schedule-reports"]',
  'to="/schedule-reports"',
]) if(!timetable.includes(token)){console.error(`Phase 5 timetable navigation missing: ${token}`);process.exit(1);}

if(!ci.includes("Check Phase 5 reporting closure")){console.error("Phase 5 CI step missing.");process.exit(1);}
console.log("Phase 5 reporting guard OK: permission-gated timetable summaries, workspace navigation and Excel/CSV/print-PDF outputs are wired.");
