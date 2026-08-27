import type {LocalSolveMode} from "./schedule-local-solver";
export type ScheduleGenerationEffort="QUICK"|"BALANCED"|"DEEP";
export type ScheduleGenerationEffortProfile={id:ScheduleGenerationEffort;label:string;description:string;candidateCount:number;lnsIterations:number;preferredMode:LocalSolveMode;allowRemote:boolean};
export const SCHEDULE_GENERATION_EFFORT_PROFILES:Record<ScheduleGenerationEffort,ScheduleGenerationEffortProfile>={
 QUICK:{id:"QUICK",label:"Hızlı",description:"Önce güvenli fizibilite; daha az aday ve kısa iyileştirme.",candidateCount:3,lnsIterations:12,preferredMode:"AUTO",allowRemote:false},
 BALANCED:{id:"BALANCED",label:"Dengeli",description:"Adaptif portfolio, orta aday havuzu ve dengeli LNS.",candidateCount:6,lnsIterations:32,preferredMode:"AUTO",allowRemote:true},
 DEEP:{id:"DEEP",label:"Derin Arama",description:"Geniş aday havuzu, daha uzun LNS ve hibrit hızlandırıcı kullanımı.",candidateCount:12,lnsIterations:72,preferredMode:"HYBRID",allowRemote:true}
};
export function generationEffortProfile(id:ScheduleGenerationEffort){return SCHEDULE_GENERATION_EFFORT_PROFILES[id]}
export const GENERATION_EFFORT_POLICY="Effort profili yalnız arama bütçesi, aday sayısı ve compute yönlendirmesini değiştirir; canonical HARD/MEDIUM/SOFT kural setini veya validator otoritesini değiştirmez.";
