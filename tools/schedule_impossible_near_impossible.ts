import { solveLocalSchedule, type LocalProblem, type LocalLockedRow } from "../src/lib/schedule-local-solver-core";

type Expected="FEASIBLE"|"INFEASIBLE";
type SuiteCase={id:string;expected:Expected;problem:LocalProblem};
type SuiteFixture={schema:string;cases:SuiteCase[]};
export type HardAudit={hard:number;unplaced:number;violations:string[]};
export type SuiteResult={id:string;expected:Expected;observed:Expected;complete:boolean;failed:number;hard:number;unplaced:number;deterministic:boolean;runtime_ms:number;pass:boolean};
export type SuiteReport={schema:string;generated_at:string;summary:{cases:number;expected_infeasible:number;expected_feasible:number;passed:number;failed:number;hard_leakage:number;deterministic:boolean;runtime_max_ms:number};results:SuiteResult[]};

const fixture=await Bun.file(new URL("../tests/fixtures/schedule-impossible-near-impossible.json",import.meta.url)).json() as SuiteFixture;
const K=(...v:(string|number|null|undefined)[])=>v.join("|");
const stable=(rows:LocalLockedRow[])=>rows.map(r=>[r.assignment_id,r.teacher_id,r.class_id,r.weekday,r.period,r.activity_key??null]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));

export function auditHard(problem:LocalProblem,rows:LocalLockedRow[]):HardAudit{
 const violations:string[]=[],assignment=new Map(problem.assignments.map(a=>[a.assignment_id,a])),teacher=new Set<string>(),clazz=new Set<string>(),counts=new Map<string,number>(),teacherDay=new Map<string,number[]>(),courseDay=new Map<string,number>();
 const unavailable=new Set(problem.unavailable.map(u=>K(u.teacher_id,u.weekday,u.period))),constraints=new Map(problem.teacherConstraints.map(c=>[c.teacher_id,c])),rules=new Map(problem.courseRules.map(r=>[r.course_id,r]));
 for(const row of rows){const a=assignment.get(row.assignment_id);if(!a){violations.push(`UNKNOWN_ASSIGNMENT:${row.assignment_id}`);continue}counts.set(a.assignment_id,(counts.get(a.assignment_id)??0)+1);const tk=K(row.teacher_id,row.weekday,row.period),ck=K(row.class_id,row.weekday,row.period);if(teacher.has(tk))violations.push(`TEACHER_COLLISION:${tk}`);if(row.class_id&&clazz.has(ck))violations.push(`CLASS_COLLISION:${ck}`);teacher.add(tk);if(row.class_id)clazz.add(ck);if(unavailable.has(tk))violations.push(`TEACHER_UNAVAILABLE:${tk}`);const td=K(row.teacher_id,row.weekday);teacherDay.set(td,[...(teacherDay.get(td)??[]),row.period]);const rule=rules.get(a.course_id);if(rule?.prohibited_days?.includes(row.weekday))violations.push(`PROHIBITED_DAY:${a.assignment_id}:${row.weekday}`);if(rule?.prohibited_periods?.includes(row.period))violations.push(`PROHIBITED_PERIOD:${a.assignment_id}:${row.period}`);const allowed=(a as LocalProblem["assignments"][number]&{allowed_periods?:number[]|null}).allowed_periods;if(allowed?.length&&!allowed.includes(row.period))violations.push(`OUTSIDE_ALLOWED_PERIOD:${a.assignment_id}:${row.period}`);const qk=K(a.class_id,a.course_id,row.weekday);courseDay.set(qk,(courseDay.get(qk)??0)+1)}
 for(const [tk,periods]of teacherDay){const [teacherId]=tk.split("|"),c=constraints.get(teacherId!);if(c?.max_daily_hours&&periods.length>c.max_daily_hours)violations.push(`MAX_DAILY:${tk}`);if(c?.max_consecutive_hours){const ps=new Set(periods);let run=0,best=0;for(let p=1;p<=problem.periods;p++){run=ps.has(p)?run+1:0;best=Math.max(best,run)}if(best>c.max_consecutive_hours)violations.push(`MAX_CONSECUTIVE:${tk}`)}}
 for(const [qk,n]of courseDay){const [,courseId]=qk.split("|"),rule=rules.get(courseId!);if(rule?.max_per_day&&n>rule.max_per_day)violations.push(`MAX_PER_DAY:${qk}`)}
 let unplaced=0;for(const a of problem.assignments)unplaced+=Math.max(0,a.assigned_hours-(counts.get(a.assignment_id)??0));return{hard:violations.length+unplaced,unplaced,violations};
}

export function getImpossibleSuiteCases(){return fixture.cases.map(c=>structuredClone(c))}

export function assertImpossibleSuiteGate(report:SuiteReport){
 if(report.summary.cases!==9||report.summary.expected_infeasible!==5||report.summary.expected_feasible!==4)throw new Error("IMPOSSIBLE_SUITE_SHAPE_FAILED");
 if(report.summary.passed!==9||report.summary.failed!==0||report.summary.hard_leakage!==0||!report.summary.deterministic)throw new Error("IMPOSSIBLE_SUITE_GATE_FAILED");
}

export async function runImpossibleSuite():Promise<SuiteReport>{
 const results:SuiteResult[]=[];
 for(const c of fixture.cases){const t=performance.now(),first=solveLocalSchedule(c.problem),runtime=performance.now()-t,again=solveLocalSchedule(c.problem),audit=auditHard(c.problem,first.rows),againAudit=auditHard(c.problem,again.rows),deterministic=JSON.stringify(stable(first.rows))===JSON.stringify(stable(again.rows))&&JSON.stringify(first.score)===JSON.stringify(again.score),observed:Expected=first.complete&&first.failed===0&&audit.hard===0?"FEASIBLE":"INFEASIBLE",pass=observed===c.expected&&deterministic&&(c.expected==="INFEASIBLE"||againAudit.hard===0);results.push({id:c.id,expected:c.expected,observed,complete:first.complete,failed:first.failed,hard:audit.hard,unplaced:audit.unplaced,deterministic,runtime_ms:Math.round(runtime*1000)/1000,pass})}
 const expectedInfeasible=results.filter(r=>r.expected==="INFEASIBLE").length,expectedFeasible=results.length-expectedInfeasible,passed=results.filter(r=>r.pass).length;return{schema:fixture.schema,generated_at:new Date().toISOString(),summary:{cases:results.length,expected_infeasible:expectedInfeasible,expected_feasible:expectedFeasible,passed,failed:results.length-passed,hard_leakage:results.filter(r=>r.expected==="FEASIBLE"&&r.hard>0).length,deterministic:results.every(r=>r.deterministic),runtime_max_ms:Math.max(...results.map(r=>r.runtime_ms))},results};
}

if(import.meta.main){const args=process.argv.slice(2),oi=args.indexOf("--out"),out=oi>=0?args[oi+1]:null,report=await runImpossibleSuite();console.log("SCHEDULE_IMPOSSIBLE_SUITE",JSON.stringify(report));if(out)await Bun.write(out,JSON.stringify(report,null,2));assertImpossibleSuiteGate(report)}
