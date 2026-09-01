import { describe, expect, test } from "bun:test";
import { solveIncrementalSchedule, type JointLocalProblem } from "../src/lib/schedule-local-solver-incremental-core";
import type { LocalAssignment, LocalLockedRow } from "../src/lib/schedule-local-solver-time-core";

const manifest = await Bun.file("benchmarks/general-school-types/manifest.json").json();
const baseAssignment = (assignment_id:string, teacher_id:string, class_id:string, course_id:string, assigned_hours=2):LocalAssignment => ({
  assignment_id, teacher_id, class_id, course_id, assigned_hours,
  week_pattern:"ALL", valid_from:null, valid_to:null, term_no:null,
  schedule_session_id:null, allowed_periods:null,
});

function imamHatipProblem(seed=1903):JointLocalProblem {
  const assignments:LocalAssignment[]=[];
  for(let c=0;c<6;c++){
    const cls=`ih${c}`;
    assignments.push(
      baseAssignment(`${cls}-tr`,`tr${c%3}`,cls,"TURKCE"),
      baseAssignment(`${cls}-mat`,`mat${c%3}`,cls,"MATEMATIK"),
      baseAssignment(`${cls}-arp`,`arp${c%2}`,cls,"ARAPCA"),
      baseAssignment(`${cls}-din`,`din${c%2}`,cls,"DIN_MESLEK"),
    );
  }
  return {
    days:[1,2,3,4,5], periods:8, assignments, locked:[], unavailable:[],
    teacherConstraints:Array.from(new Set(assignments.map(a=>a.teacher_id))).map(teacher_id=>({teacher_id,max_daily_hours:6,max_consecutive_hours:4})),
    courseRules:["TURKCE","MATEMATIK","ARAPCA","DIN_MESLEK"].map(course_id=>({course_id,block_pattern:[1,1],max_per_day:1,prohibited_days:null,prohibited_periods:null})),
    planningRelations:[], studentConflictWeights:[], seed, enableLns:false,
  };
}

function primaryMiddleProblem(seed=2026):JointLocalProblem {
  const assignments:LocalAssignment[]=[];
  for(let c=0;c<8;c++){
    const cls=`pm${c}`, classroomTeacher=`sinif${c}`;
    assignments.push(
      baseAssignment(`${cls}-tr`,classroomTeacher,cls,"TURKCE"),
      baseAssignment(`${cls}-mat`,classroomTeacher,cls,"MATEMATIK"),
      baseAssignment(`${cls}-hay`,classroomTeacher,cls,"SINIF_DERSI"),
      baseAssignment(`${cls}-eng`,`eng${c%2}`,cls,"INGILIZCE"),
    );
  }
  return {
    days:[1,2,3,4,5], periods:8, assignments, locked:[], unavailable:[],
    teacherConstraints:[
      ...Array.from({length:8},(_,i)=>({teacher_id:`sinif${i}`,max_daily_hours:6,max_consecutive_hours:5})),
      {teacher_id:"eng0",max_daily_hours:6,max_consecutive_hours:4},
      {teacher_id:"eng1",max_daily_hours:6,max_consecutive_hours:4},
    ],
    courseRules:["TURKCE","MATEMATIK","SINIF_DERSI","INGILIZCE"].map(course_id=>({course_id,block_pattern:[1,1],max_per_day:1,prohibited_days:null,prohibited_periods:null})),
    planningRelations:[], studentConflictWeights:[], seed, enableLns:false,
  };
}

function audit(problem:JointLocalProblem, rows:LocalLockedRow[]){
  const byId=new Map(problem.assignments.map(a=>[a.assignment_id,a]));
  const counts=new Map<string,number>();
  const occupiedTeacher=new Set<string>(), occupiedClass=new Set<string>();
  const violations:string[]=[];
  for(const row of rows){
    const a=byId.get(row.assignment_id);
    if(!a){violations.push(`UNKNOWN:${row.assignment_id}`);continue;}
    counts.set(a.assignment_id,(counts.get(a.assignment_id)??0)+1);
    const tk=`${row.teacher_id}|${row.weekday}|${row.period}`;
    const ck=`${row.class_id}|${row.weekday}|${row.period}`;
    if(occupiedTeacher.has(tk))violations.push(`TEACHER_COLLISION:${tk}`); else occupiedTeacher.add(tk);
    if(row.class_id && occupiedClass.has(ck))violations.push(`CLASS_COLLISION:${ck}`); else if(row.class_id)occupiedClass.add(ck);
    if(!problem.days.includes(row.weekday)||row.period<1||row.period>problem.periods)violations.push(`DOMAIN:${row.assignment_id}`);
  }
  for(const a of problem.assignments)if((counts.get(a.assignment_id)??0)!==a.assigned_hours)violations.push(`HOURS:${a.assignment_id}`);
  return violations;
}

const stable=(rows:LocalLockedRow[])=>rows.map(r=>[r.assignment_id,r.weekday,r.period]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));

describe("general school-type timetable corpus",()=>{
  test("corpus is explicitly synthetic and covers both declared profiles",()=>{
    expect(manifest.provenance).toContain("Synthetic");
    expect(manifest.provenance).toContain("no real");
    expect(manifest.profiles.map((p:any)=>p.id)).toEqual(["IMAM_HATIP_STRUCTURAL","PRIMARY_MIDDLE_STRUCTURAL"]);
  });

  test("imam hatip shared branch-teacher structure is feasible and HARD-clean",()=>{
    const p=imamHatipProblem(), r=solveIncrementalSchedule(p);
    expect(r.complete).toBe(true);
    expect(r.failed).toBe(0);
    expect(audit(p,r.rows)).toEqual([]);
    expect(new Set(p.assignments.filter(a=>a.course_id==="ARAPCA").map(a=>a.teacher_id)).size).toBeLessThan(6);
  },30000);

  test("primary/middle classroom-teacher plus branch-teacher structure is feasible and deterministic",()=>{
    const p=primaryMiddleProblem(), a=solveIncrementalSchedule(p), b=solveIncrementalSchedule(primaryMiddleProblem());
    expect(a.complete).toBe(true);
    expect(a.failed).toBe(0);
    expect(audit(p,a.rows)).toEqual([]);
    expect(JSON.stringify(stable(a.rows))).toBe(JSON.stringify(stable(b.rows)));
    for(let c=0;c<8;c++)expect(new Set(p.assignments.filter(x=>x.class_id===`pm${c}`&&x.course_id!=="INGILIZCE").map(x=>x.teacher_id)).size).toBe(1);
  },30000);
});
