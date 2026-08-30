import {evaluatePlanningRelations,type PlanningActivity,type PlanningRelation,type PlanningSelector,type RelationScore} from "@/lib/schedule-planning-relations";
import {ScheduleHotspotIndex} from "@/lib/schedule-local-hotspot-index";
import {localScopesOverlap,type LocalAssignment,type LocalLockedRow,type LocalScore,type LocalStudentConflictWeight} from "@/lib/schedule-local-solver-time-core";

const k=(...v:(string|number|null|undefined)[])=>v.join("|");
const z=():RelationScore=>({hard:0,medium:0,soft:0});
const match=(a:PlanningActivity,s:PlanningSelector)=>(!s.activity_key||s.activity_key===a.activity_key)&&(!s.assignment_id||s.assignment_id===a.assignment_id)&&(!s.course_id||s.course_id===a.course_id)&&(!s.teacher_id||s.teacher_id===a.teacher_id)&&(!s.class_id||s.class_id===a.class_id);
const gap=(m:Map<number,number>|undefined)=>{if(!m?.size)return 0;const ps=[...m.keys()].sort((a,b)=>a-b);return ps.length>1?ps[ps.length-1]!-ps[0]!+1-ps.length:0};
const sig=(a?:LocalAssignment)=>`${a?.week_pattern??"ALL"}:${a?.term_no??0}:${a?.valid_from??""}:${a?.valid_to??""}`;

export class IncrementalScheduleScore {
 readonly index:ScheduleHotspotIndex;
 private late=0;private student=0;private gaps=0;
 private groups=new Map<string,Map<number,number>>();
 private relationScores=new Map<string,RelationScore>();private dirty=new Set<string>();
 constructor(private assignments:LocalAssignment[],private rows:LocalLockedRow[],private relations:PlanningRelation[]=[],weights:LocalStudentConflictWeight[]=[]){this.index=new ScheduleHotspotIndex(assignments,[],weights);for(const r of rows)this.add(r);for(const rel of relations)this.dirty.add(rel.id)}
 private groupKeys(r:LocalLockedRow){const a=this.index.assignments.get(r.assignment_id),s=sig(a);return[k("t",r.teacher_id,r.weekday,s),k("c",r.class_id,a?.subgroup_id??r.subgroup_id??"*",r.weekday,s)]}
 private mutateGroup(key:string,p:number,delta:number){const m=this.groups.get(key)??new Map<number,number>();this.gaps-=gap(m);const n=(m.get(p)??0)+delta;if(n<=0)m.delete(p);else m.set(p,n);if(m.size)this.groups.set(key,m);else this.groups.delete(key);this.gaps+=gap(m)}
 private activity(activityKey:string):PlanningActivity|null{const g=this.index.activityRows.get(activityKey);if(!g?.size)return null;const rs=[...g].sort((a,b)=>a.period-b.period),r=rs[0]!,a=this.index.assignments.get(r.assignment_id);if(!a)return null;return{activity_key:activityKey,assignment_id:a.assignment_id,course_id:a.course_id,teacher_id:a.teacher_id,class_id:a.class_id,weekday:r.weekday,start:r.period,end:rs[rs.length-1]!.period,classroom_id:r.classroom_id??null}}
 activities(){const out:PlanningActivity[]=[];for(const key of this.index.activityRows.keys()){const a=this.activity(key);if(a)out.push(a)}return out}
 private dirtyFor(r:LocalLockedRow){const ak=r.activity_key??k(r.assignment_id,"row",r.weekday,r.period),a=this.activity(ak)??{activity_key:ak,assignment_id:r.assignment_id,course_id:this.index.assignments.get(r.assignment_id)?.course_id??"",teacher_id:r.teacher_id,class_id:r.class_id,weekday:r.weekday,start:r.period,end:r.period};for(const rel of this.relations)if(match(a,rel.left_selector)||match(a,rel.right_selector))this.dirty.add(rel.id)}
 add(r:LocalLockedRow){const a=this.index.assignments.get(r.assignment_id);if(a){const adj=this.index.conflictAdjacency.get(r.assignment_id);if(adj)for(const o of this.index.slot(a,r.weekday,r.period))if(o!==r&&localScopesOverlap(a,this.index.assignments.get(o.assignment_id)))this.student+=adj.get(o.assignment_id)??0}this.late+=Math.max(0,r.period-6);for(const q of this.groupKeys(r))this.mutateGroup(q,r.period,1);this.index.add(r);this.dirtyFor(r)}
 remove(r:LocalLockedRow){const a=this.index.assignments.get(r.assignment_id);if(a){const adj=this.index.conflictAdjacency.get(r.assignment_id);if(adj)for(const o of this.index.slot(a,r.weekday,r.period))if(o!==r&&localScopesOverlap(a,this.index.assignments.get(o.assignment_id)))this.student-=adj.get(o.assignment_id)??0}this.dirtyFor(r);this.index.remove(r);this.late-=Math.max(0,r.period-6);for(const q of this.groupKeys(r))this.mutateGroup(q,r.period,-1)}
 studentPenalty(id:string,d:number,s:number,n:number){return this.index.studentPenalty(id,d,s,n)}
 private relationTotal(){if(!this.relations.length)return z();const acts=this.activities();for(const rel of this.relations)if(this.dirty.has(rel.id)||!this.relationScores.has(rel.id))this.relationScores.set(rel.id,evaluatePlanningRelations(acts,[rel]));this.dirty.clear();const out=z();for(const x of this.relationScores.values()){out.hard+=x.hard;out.medium+=x.medium;out.soft+=x.soft}return out}
 score(baseHard:number,unplaced:number):LocalScore{const r=this.relationTotal();return{hard:baseHard+unplaced+r.hard,medium:r.medium+this.student,soft:this.gaps*8+this.late*2+r.soft}}
 stats(){let memberships=0;for(const m of[this.index.slotRows,this.index.teacherDayRows,this.index.classDayRows,this.index.courseClassDayRows,this.index.activityRows])for(const s of m.values())memberships+=s.size;let adjacency=0;for(const m of this.index.conflictAdjacency.values())adjacency+=m.size;return{rows:this.rows.length,memberships,adjacency,relationCache:this.relationScores.size,groupBuckets:this.groups.size}}
}
