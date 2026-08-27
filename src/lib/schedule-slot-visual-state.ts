export type ScheduleSlotPreference="prefer"|"avoid";
export type ScheduleSlotVisualState="blocked"|"prefer"|"avoid"|"neutral";

export type ScheduleSlotPreferenceRow={teacher_id:string;weekday:number;period:number;preference:ScheduleSlotPreference;weight:number;active?:boolean};
export type ScheduleSlotUnavailableRow={teacher_id:string;weekday:number;period:number;active?:boolean};

export function getScheduleSlotVisualState(input:{teacherId:string;weekday:number;period:number;unavailable:ScheduleSlotUnavailableRow[];preferences:ScheduleSlotPreferenceRow[]}):{state:ScheduleSlotVisualState;weight:number;label:string}{
 const {teacherId,weekday,period,unavailable,preferences}=input;
 if(unavailable.some(x=>x.teacher_id===teacherId&&x.weekday===weekday&&x.period===period&&x.active!==false))return{state:"blocked",weight:0,label:"Kesin uygun değil (HARD)"};
 const slot=preferences.filter(x=>x.teacher_id===teacherId&&x.weekday===weekday&&x.period===period&&x.active!==false);
 const prefer=slot.filter(x=>x.preference==="prefer").reduce((s,x)=>s+Math.max(0,Number(x.weight)||0),0);
 const avoid=slot.filter(x=>x.preference==="avoid").reduce((s,x)=>s+Math.max(0,Number(x.weight)||0),0);
 if(prefer>avoid)return{state:"prefer",weight:prefer-avoid,label:`Tercih edilir (SOFT +${prefer-avoid})`};
 if(avoid>prefer)return{state:"avoid",weight:avoid-prefer,label:`Kaçınılması tercih edilir (SOFT -${avoid-prefer})`};
 return{state:"neutral",weight:0,label:"Nötr"};
}

export function scheduleSlotVisualClass(state:ScheduleSlotVisualState){
 if(state==="blocked")return"bg-destructive/10 [background-image:repeating-linear-gradient(135deg,transparent,transparent_6px,rgba(239,68,68,.08)_6px,rgba(239,68,68,.08)_12px)]";
 if(state==="prefer")return"bg-emerald-50/70";
 if(state==="avoid")return"bg-sky-50/80";
 return"";
}
