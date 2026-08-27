export const SCHEDULE_CONSTRUCTION_HEURISTICS=["FIRST_FIT","FIRST_FIT_DECREASING","CHEAPEST_INSERTION","REGRET_2","REGRET_3","FAIL_FIRST"] as const;
export type ScheduleConstructionHeuristic=(typeof SCHEDULE_CONSTRUCTION_HEURISTICS)[number];
export type ConstructionCell={score:number};
export type ConstructionOption={index:number;duration:number;dependency:number;cells:ConstructionCell[]};
export type ConstructionDecision={taskIndex:number;cellIndex:number;heuristic:ScheduleConstructionHeuristic};
const regret=(cells:ConstructionCell[],k:2|3)=>{if(!cells.length)return Number.POSITIVE_INFINITY;const best=cells[0]!.score,alt=cells[Math.min(k-1,cells.length-1)]?.score??best+50;return alt-best};
export function chooseConstructionDecision(options:ConstructionOption[],heuristic:ScheduleConstructionHeuristic):ConstructionDecision|null{
 const available=options.filter(o=>o.cells.length);if(!available.length)return null;let pick:ConstructionOption;
 switch(heuristic){
  case"FIRST_FIT":pick=available[0]!;break;
  case"FIRST_FIT_DECREASING":pick=[...available].sort((a,b)=>b.duration-a.duration||a.index-b.index)[0]!;break;
  case"CHEAPEST_INSERTION":pick=[...available].sort((a,b)=>a.cells[0]!.score-b.cells[0]!.score||a.index-b.index)[0]!;break;
  case"REGRET_2":pick=[...available].sort((a,b)=>regret(b.cells,2)-regret(a.cells,2)||a.cells.length-b.cells.length||a.index-b.index)[0]!;break;
  case"REGRET_3":pick=[...available].sort((a,b)=>regret(b.cells,3)-regret(a.cells,3)||a.cells.length-b.cells.length||a.index-b.index)[0]!;break;
  default:pick=[...available].sort((a,b)=>b.dependency-a.dependency||regret(b.cells,2)-regret(a.cells,2)||a.cells.length-b.cells.length||a.index-b.index)[0]!;
 }
 return{taskIndex:pick.index,cellIndex:0,heuristic};
}
export function constructionPortfolioForSeed(seed:number):ScheduleConstructionHeuristic[]{const a=[...SCHEDULE_CONSTRUCTION_HEURISTICS];const shift=Math.abs(seed|0)%a.length;return[...a.slice(shift),...a.slice(0,shift)]}
