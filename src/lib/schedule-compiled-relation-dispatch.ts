import {evaluateCandidateRelations,type PlanningActivity,type PlanningRelation,type PlanningSelector,type RelationScore} from "@/lib/schedule-planning-relations";

type Key="activity_key"|"assignment_id"|"course_id"|"teacher_id"|"class_id"|"activity_tag";
type Compiled={relations:PlanningRelation[];wildcard:Set<number>;byKey:Record<Key,Map<string,Set<number>>>};
const KEYS:Key[]=["activity_key","assignment_id","course_id","teacher_id","class_id","activity_tag"];
const value=(a:PlanningActivity,k:Key)=>k==="activity_tag"?null:String((a as unknown as Record<string,unknown>)[k]??"");
function selectorKeys(s:PlanningSelector){return KEYS.filter(k=>{const v=s[k];return typeof v==="string"&&v.length>0})}
function put(m:Map<string,Set<number>>,v:string,i:number){const s=m.get(v)??new Set<number>();s.add(i);m.set(v,s)}
export function compilePlanningRelationDispatch(relations:PlanningRelation[]):Compiled{const byKey=Object.fromEntries(KEYS.map(k=>[k,new Map<string,Set<number>>()])) as Compiled["byKey"],wildcard=new Set<number>();relations.forEach((r,i)=>{let indexed=false;for(const selector of [r.left_selector,r.right_selector])for(const k of selectorKeys(selector)){const v=String(selector[k]);put(byKey[k],v,i);indexed=true}if(!indexed)wildcard.add(i)});return{relations,wildcard,byKey}}
export function candidateRelevantPlanningRelations(candidate:PlanningActivity,c:Compiled):PlanningRelation[]{const ids=new Set<number>(c.wildcard);for(const k of KEYS){if(k==="activity_tag"){for(const tag of candidate.tags??[])for(const i of c.byKey.activity_tag.get(tag)??[])ids.add(i);continue}const v=value(candidate,k);if(v)for(const i of c.byKey[k].get(v)??[])ids.add(i)}return[...ids].sort((a,b)=>a-b).map(i=>c.relations[i]!).filter(Boolean)}
export function evaluateCandidateRelationsCompiled(candidate:PlanningActivity,placed:PlanningActivity[],compiled:Compiled):RelationScore{return evaluateCandidateRelations(candidate,placed,candidateRelevantPlanningRelations(candidate,compiled))}
export const COMPILED_RELATION_DISPATCH_POLICY="Compiled dispatch yalnız candidate ile eşleşme ihtimali olan canonical relation kayıtlarını ön-seçer; ceza hesabını değiştirmez ve evaluateCandidateRelations nihai relation scorer olarak kalır.";
