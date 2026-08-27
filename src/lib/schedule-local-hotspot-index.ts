import { localScopesOverlap, type LocalAssignment, type LocalLockedRow, type LocalStudentConflictWeight } from "@/lib/schedule-local-solver-time-core";

const k=(...v:(string|number|null|undefined)[])=>v.join("|");

export class ScheduleHotspotIndex {
  readonly assignments=new Map<string,LocalAssignment>();
  readonly slotRows=new Map<string,Set<LocalLockedRow>>();
  readonly teacherDayRows=new Map<string,Set<LocalLockedRow>>();
  readonly classDayRows=new Map<string,Set<LocalLockedRow>>();
  readonly courseClassDayRows=new Map<string,Set<LocalLockedRow>>();
  readonly activityRows=new Map<string,Set<LocalLockedRow>>();
  readonly conflictAdjacency=new Map<string,Map<string,number>>();

  constructor(assignments:LocalAssignment[],rows:LocalLockedRow[]=[],weights:LocalStudentConflictWeight[]=[]){
    for(const a of assignments)this.assignments.set(a.assignment_id,a);
    for(const w of weights){const n=Number(w.severity_weight)||Number(w.student_weight)||0;if(n<=0)continue;const l=this.conflictAdjacency.get(w.left_assignment_id)??new Map<string,number>();l.set(w.right_assignment_id,n);this.conflictAdjacency.set(w.left_assignment_id,l);const r=this.conflictAdjacency.get(w.right_assignment_id)??new Map<string,number>();r.set(w.left_assignment_id,n);this.conflictAdjacency.set(w.right_assignment_id,r)}
    for(const r of rows)this.add(r);
  }

  private put(m:Map<string,Set<LocalLockedRow>>,key:string,row:LocalLockedRow){const s=m.get(key)??new Set<LocalLockedRow>();s.add(row);m.set(key,s)}
  private drop(m:Map<string,Set<LocalLockedRow>>,key:string,row:LocalLockedRow){const s=m.get(key);if(!s)return;s.delete(row);if(!s.size)m.delete(key)}
  private courseKey(r:LocalLockedRow){const a=this.assignments.get(r.assignment_id);return a?k(r.class_id,a.course_id,r.weekday):null}
  private activityKey(r:LocalLockedRow){return r.activity_key??k(r.assignment_id,"row",r.weekday,r.period)}

  add(r:LocalLockedRow){this.put(this.slotRows,k(r.weekday,r.period),r);this.put(this.teacherDayRows,k(r.teacher_id,r.weekday),r);this.put(this.classDayRows,k(r.class_id,r.weekday),r);const c=this.courseKey(r);if(c)this.put(this.courseClassDayRows,c,r);this.put(this.activityRows,this.activityKey(r),r)}
  remove(r:LocalLockedRow){this.drop(this.slotRows,k(r.weekday,r.period),r);this.drop(this.teacherDayRows,k(r.teacher_id,r.weekday),r);this.drop(this.classDayRows,k(r.class_id,r.weekday),r);const c=this.courseKey(r);if(c)this.drop(this.courseClassDayRows,c,r);this.drop(this.activityRows,this.activityKey(r),r)}

  private overlaps(a:LocalAssignment,r:LocalLockedRow){return localScopesOverlap(a,this.assignments.get(r.assignment_id))}
  slot(a:LocalAssignment,day:number,period:number){return [...(this.slotRows.get(k(day,period))??[])].filter(r=>this.overlaps(a,r))}
  occupied(a:LocalAssignment,day:number,period:number){return this.slot(a,day,period).some(r=>r.teacher_id===a.teacher_id||r.class_id===a.class_id)}
  teacherDay(a:LocalAssignment,day:number){return [...(this.teacherDayRows.get(k(a.teacher_id,day))??[])].filter(r=>this.overlaps(a,r))}
  classDay(a:LocalAssignment,day:number){return [...(this.classDayRows.get(k(a.class_id,day))??[])].filter(r=>this.overlaps(a,r))}
  courseDay(a:LocalAssignment,day:number){return [...(this.courseClassDayRows.get(k(a.class_id,a.course_id,day))??[])].filter(r=>this.overlaps(a,r))}
  teacherPeriods(a:LocalAssignment,day:number){return new Set(this.teacherDay(a,day).map(r=>r.period))}
  activityGroups(){return [...this.activityRows.entries()].map(([activity_key,set])=>({activity_key,rows:[...set]}))}
  studentPenalty(assignmentId:string,day:number,start:number,duration:number){const a=this.assignments.get(assignmentId);if(!a)return 0;const adj=this.conflictAdjacency.get(assignmentId);if(!adj?.size)return 0;let total=0;for(let p=start;p<start+duration;p++)for(const r of this.slot(a,day,p))total+=adj.get(r.assignment_id)??0;return total}
}
