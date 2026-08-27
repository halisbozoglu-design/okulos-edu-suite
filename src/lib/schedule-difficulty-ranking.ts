export type ScheduleDifficultyInput={candidateSlots:number;totalSlots:number;duration:number;relationDegree:number;eligibleRooms:number;teacherUnavailableSlots:number;lockedNeighborCount:number;studentConflictWeight:number};
export type ScheduleDifficultyBreakdown={score:number;slotScarcity:number;blockPressure:number;relationPressure:number;roomScarcity:number;teacherPressure:number;lockedPressure:number;studentPressure:number};
const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
export function scoreScheduleDifficulty(input:ScheduleDifficultyInput):ScheduleDifficultyBreakdown{
 const total=Math.max(1,input.totalSlots),candidate=Math.max(0,input.candidateSlots),duration=Math.max(1,input.duration),rooms=Math.max(0,input.eligibleRooms);
 const slotScarcity=clamp(1-candidate/total)*35;
 const blockPressure=clamp((duration-1)/4)*12;
 const relationPressure=clamp(input.relationDegree/8)*14;
 const roomScarcity=rooms===0?18:clamp(1/rooms)*10;
 const teacherPressure=clamp(Math.max(0,input.teacherUnavailableSlots)/total)*12;
 const lockedPressure=clamp(Math.max(0,input.lockedNeighborCount)/6)*5;
 const studentPressure=clamp(Math.max(0,input.studentConflictWeight)/100)*4;
 const score=Math.round((slotScarcity+blockPressure+relationPressure+roomScarcity+teacherPressure+lockedPressure+studentPressure)*100)/100;
 return{score,slotScarcity,blockPressure,relationPressure,roomScarcity,teacherPressure,lockedPressure,studentPressure};
}
export function rankScheduleDifficulty<T extends {difficulty:ScheduleDifficultyBreakdown;stableKey:string}>(items:T[]){return[...items].sort((a,b)=>b.difficulty.score-a.difficulty.score||a.stableKey.localeCompare(b.stableKey,"tr"))}
export const SCHEDULE_DIFFICULTY_POLICY="Difficulty yalnız construction ordering ve operatör açıklaması içindir; canonical HARD/MEDIUM/SOFT score veya validator sonucunu değiştirmez.";
