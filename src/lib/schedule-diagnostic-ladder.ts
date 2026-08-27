export type DiagnosticLayerKey="TIME"|"TEACHER"|"CLASS"|"ROOM"|"RELATION"|"STUDENT"|"MEB"|"MEDIUM"|"SOFT";
export type DiagnosticLayer={key:DiagnosticLayerKey;label:string;order:number;signalCount:number;status:"clear"|"pressure";signals:string[];explanation:string};
export type DiagnosticInput={preparation?:Array<{code:string;affected_count:number}>;unplaced?:Array<{diagnostic?:Record<string,number>|null;reason?:string|null}>;mediumCount?:number;softCount?:number};
const defs:Array<{key:DiagnosticLayerKey;label:string;codes:string[];diag:string[];explanation:string}>=[
 {key:"TIME",label:"Temel zaman modeli",codes:["ACTIVE_TIME_PROFILE","TIME_PROFILE_CONFIGURATION_INVALID"],diag:["valid_windows","candidate_windows","course_time_rule"],explanation:"Aktif zaman profili, geçerli gün/saat pencereleri ve ders zaman kuralları."},
 {key:"TEACHER",label:"Öğretmen HARD",codes:["TEACHER_CONSTRAINT_ROW_MISSING","TEACHER_ASSIGNED_HOURS_EXCEED_WEEKLY_LIMIT","TEACHER_ASSIGNED_HOURS_EXCEED_DAY_CAPACITY","TEACHER_CONSTRAINT_CONFIGURATION_INVALID","LOCKED_TEACHER_UNAVAILABLE"],diag:["teacher_busy","teacher_unavailable","daily_limit","working_days_limit","consecutive_limit"],explanation:"Öğretmen çakışması, uygunluk, günlük/ardışık/çalışma günü kapasitesi."},
 {key:"CLASS",label:"Sınıf HARD",codes:["LOCKED_ROW_SEMANTIC_MISMATCH"],diag:["class_busy","class_conflict"],explanation:"Sınıf eşzamanlılık ve yerleşim çakışmaları."},
 {key:"ROOM",label:"Oda / bina HARD",codes:["ROOM_RULE_HAS_NO_MATCHING_ROOM"],diag:["room_busy","room_capacity","room_type","room_feature","room_building","travel"],explanation:"Derslik uygunluğu, kapasite, donanım ve bina hareketi."},
 {key:"RELATION",label:"İlişki / blok HARD",codes:["BLOCK_PATTERN_ASSIGNMENT_MISMATCH","SYNC_GROUP_EMPTY","SYNC_MEMBER_BLOCK_LENGTH_MISMATCH","SYNC_SUBGROUP_MISMATCH","SYNC_GROUP_REQUIRES_TWO_MEMBERS","SYNC_GROUP_CLASS_MISMATCH","SYNC_TOTAL_HOURS_EXCEED_ASSIGNMENT"],diag:["relation","block","sync","ordered","same_time","different_day"],explanation:"Blok, eşzamanlı grup ve canonical activity relation baskısı."},
 {key:"STUDENT",label:"Öğrenci HARD",codes:["SYNC_SUBGROUP_HAS_NO_STUDENTS","SYNC_SUBGROUP_STUDENT_OVERLAP"],diag:["student_conflict","student_overlap","sectioning"],explanation:"Öğrenci/alt grup çakışmaları ve sectioning fizibilitesi."},
 {key:"MEB",label:"MEB / MTAL / MESEM HARD",codes:["CURRICULUM_NOT_READY","QURAN_WEEKLY_SYNC_INCOMPLETE"],diag:["meb","mtal","mesem","curriculum","quran"],explanation:"Resmî program, okul türü ve özel MEB alan kuralları."},
 {key:"MEDIUM",label:"MEDIUM hedefler",codes:[],diag:[],explanation:"HARD fizibiliteyi bozmadan ikinci öncelik kalite hedefleri."},
 {key:"SOFT",label:"SOFT tercihler",codes:[],diag:[],explanation:"Tercihler ve kalite amaçları; fizibilite otoritesi değildir."}
];
const norm=(s:string)=>s.trim().toLowerCase();
export function buildScheduleDiagnosticLadder(input:DiagnosticInput):DiagnosticLayer[]{
 const prep=input.preparation??[],unplaced=input.unplaced??[];
 return defs.map((d,order)=>{const signals:string[]=[];let count=0;
  for(const p of prep)if(d.codes.includes(p.code)){const n=Math.max(1,Number(p.affected_count)||0);count+=n;signals.push(`${p.code} (${n})`)}
  for(const u of unplaced){for(const [k,v] of Object.entries(u.diagnostic??{})){if(d.diag.some(x=>norm(k).includes(norm(x)))&&Number(v)>0){count+=Number(v);signals.push(`${k} (${Number(v)})`)}}const r=norm(u.reason??"");if(r&&d.diag.some(x=>r.includes(norm(x)))){count+=1;signals.push(u.reason??"")}}
  if(d.key==="MEDIUM"&&Number(input.mediumCount)>0){count+=Number(input.mediumCount);signals.push(`MEDIUM (${Number(input.mediumCount)})`)}
  if(d.key==="SOFT"&&Number(input.softCount)>0){count+=Number(input.softCount);signals.push(`SOFT (${Number(input.softCount)})`)}
  return{key:d.key,label:d.label,order,signalCount:count,status:count>0?"pressure":"clear",signals:Array.from(new Set(signals)).slice(0,8),explanation:d.explanation};
 })
}
export function firstPressureLayer(layers:DiagnosticLayer[]){return layers.find(x=>x.status==="pressure")??null}
export const DIAGNOSTIC_LADDER_POLICY="Katmanlar yalnız teşhis ve açıklama içindir. Production solve sırasında hiçbir HARD kural otomatik kapatılmaz, gevşetilmez veya yeniden sınıflandırılmaz.";
