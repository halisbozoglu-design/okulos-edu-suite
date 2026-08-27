import{evaluateCandidateRelations,evaluatePlanningRelations,type PlanningActivity,type PlanningRelation,type RelationScore}from"./schedule-planning-relations";

export type RuleIsolationSlot={weekday:number;period:number;score:RelationScore;allowed:boolean};
export type RuleIsolationReport={relationId:string;relationType:string;mode:string;affectedActivityKeys:string[];currentScore:RelationScore;candidateSlots:RuleIsolationSlot[];blockedSlots:number;penalizedSlots:number};

function selectorMatches(a:PlanningActivity,s:PlanningRelation["left_selector"]){return(!s.activity_key||a.activity_key===s.activity_key)&&(!s.assignment_id||a.assignment_id===s.assignment_id)&&(!s.course_id||a.course_id===s.course_id)&&(!s.teacher_id||a.teacher_id===s.teacher_id)&&(!s.class_id||a.class_id===s.class_id)&&(!s.activity_tag||a.tags?.includes(s.activity_tag)===true)}

export function isolatePlanningRule(input:{relation:PlanningRelation;activities:PlanningActivity[];focus:PlanningActivity;days:number[];periodsPerDay:number}):RuleIsolationReport{
 const{relation,activities,focus,days,periodsPerDay}=input,only=[relation];
 const affected=activities.filter(a=>selectorMatches(a,relation.left_selector)||selectorMatches(a,relation.right_selector)).map(a=>a.activity_key);
 const currentScore=evaluatePlanningRelations(activities,only),placed=activities.filter(a=>a.activity_key!==focus.activity_key),duration=Math.max(1,focus.end-focus.start+1),candidateSlots:RuleIsolationSlot[]=[];
 for(const weekday of days)for(let period=1;period+duration-1<=periodsPerDay;period++){
  const candidate={...focus,weekday,start:period,end:period+duration-1};
  const score=evaluateCandidateRelations(candidate,placed,only);
  candidateSlots.push({weekday,period,score,allowed:score.hard===0});
 }
 return{relationId:relation.id,relationType:relation.relation_type,mode:relation.mode,affectedActivityKeys:[...new Set(affected)],currentScore,candidateSlots,blockedSlots:candidateSlots.filter(x=>!x.allowed).length,penalizedSlots:candidateSlots.filter(x=>x.score.medium>0||x.score.soft>0).length};
}
