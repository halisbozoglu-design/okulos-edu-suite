export const SCHEDULE_OBJECTIVE_CONTRACT="okulos.schedule-objective-vector.v1" as const;
export const SCHEDULE_OBJECTIVE_ORDER=["hard","unplaced","medium","soft"] as const;
export type ScheduleObjectiveVector={hard:number;unplaced:number;medium:number;soft:number};
export function assertScheduleObjectiveVector(v:ScheduleObjectiveVector){for(const key of SCHEDULE_OBJECTIVE_ORDER){const value=v[key];if(!Number.isFinite(value)||value<0)throw new Error(`SCHEDULE_OBJECTIVE_${key.toUpperCase()}_INVALID`)}return v}
export function compareScheduleObjectiveVectors(a:ScheduleObjectiveVector,b:ScheduleObjectiveVector){assertScheduleObjectiveVector(a);assertScheduleObjectiveVector(b);for(const key of SCHEDULE_OBJECTIVE_ORDER){if(a[key]!==b[key])return a[key]<b[key]?-1:1}return 0}
export function localCandidateObjective(candidate:{failed:number;score:{hard:number;medium:number;soft:number}}):ScheduleObjectiveVector{return assertScheduleObjectiveVector({hard:candidate.score.hard,unplaced:candidate.failed,medium:candidate.score.medium,soft:candidate.score.soft})}
