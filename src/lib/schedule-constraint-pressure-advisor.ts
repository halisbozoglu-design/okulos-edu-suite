export type ScheduleReadinessItem={category:string;code:string;status:string;affected_count:number;detail:string};
export type SchedulePressureMetrics={lockedCount:number;unavailabilityCount:number;softPreferenceCount:number};
export type SchedulePressureFamily="DATA_TIME"|"TEACHER_CAPACITY"|"LOCKED_MANUAL"|"ROOM_BUILDING"|"SYNC_GROUP"|"CURRICULUM"|"OTHER";
export type SchedulePressureFinding={family:SchedulePressureFamily;title:string;severity:"BLOCKER"|"PRESSURE"|"INFO";affected:number;codes:string[];explanation:string;action:string};

const FAMILY_ORDER:SchedulePressureFamily[]=["DATA_TIME","CURRICULUM","TEACHER_CAPACITY","ROOM_BUILDING","SYNC_GROUP","LOCKED_MANUAL","OTHER"];
function familyFor(code:string):SchedulePressureFamily{
 if(code.includes("TIME_PROFILE" )||code==="ACTIVE_TIME_PROFILE")return "DATA_TIME";
 if(code.includes("CURRICULUM")||code.includes("QURAN"))return "CURRICULUM";
 if(code.includes("TEACHER")||code.includes("WORKING_DAY"))return "TEACHER_CAPACITY";
 if(code.includes("ROOM")||code.includes("BUILDING"))return "ROOM_BUILDING";
 if(code.includes("SYNC")||code.includes("SUBGROUP")||code.includes("STUDENT_OVERLAP"))return "SYNC_GROUP";
 if(code.includes("LOCKED")||code.includes("BLOCK_PATTERN"))return "LOCKED_MANUAL";
 return "OTHER";
}
const META:Record<SchedulePressureFamily,{title:string;explanation:string;action:string}>={
 DATA_TIME:{title:"Zaman modeli / temel veri",explanation:"Aktif gün, ders saati veya canonical zaman profili tutarsızsa diğer optimizasyon katmanlarını test etmek anlamlı değildir.",action:"Önce okul zaman şablonunu ve temel veri bütünlüğünü düzeltin."},
 CURRICULUM:{title:"Müfredat / haftalık yük",explanation:"Ders yükü veya resmi program kaynağı tamamlanmadan çözücü doğru fizibilite alanı kuramaz.",action:"Müfredat ve haftalık ders yüklerini tamamlayıp yeniden kontrol edin."},
 TEACHER_CAPACITY:{title:"Öğretmen kapasitesi / uygunluk",explanation:"Atanan yük, günlük kapasite veya öğretmen uygunluğu çözüm uzayını doğrudan daraltır.",action:"Öğretmen yükü, günlük/ardışık limit ve kesin uygunsuzlukları birlikte inceleyin."},
 ROOM_BUILDING:{title:"Derslik / bina kapasitesi",explanation:"Uygun oda havuzu, kapasite, özellik veya bina transferi karşılanmıyorsa zaman açısından uygun ders yine yerleşemez.",action:"Derslik havuzunu, kapasite/özellik eşleşmesini ve bina transfer kurallarını kontrol edin."},
 SYNC_GROUP:{title:"Eşzamanlı grup / öğrenci grubu",explanation:"Birleşik-split dersler ve eşzamanlı üyelikler küçük bir çelişkiyle geniş bir ders kümesini kilitleyebilir.",action:"Grup üyelerini, blok sürelerini, alt grupları ve öğrenci çakışmalarını kontrol edin."},
 LOCKED_MANUAL:{title:"Kilitli / manuel yerleşimler",explanation:"Kilitli kartlar arama alanını küçültür; tek hatalı kilit çok sayıda uygulanabilir alternatifi yok edebilir.",action:"Zorunlu olmayan kilitleri azaltın; zorunlu kilitlerin canonical HARD auditini kontrol edin."},
 OTHER:{title:"Diğer HARD hazırlık baskısı",explanation:"Hazırlık katmanında çözücüye geçişi engelleyen başka bir canonical kontrol var.",action:"Listelenen canonical hazırlık hatasını doğrudan kaynağında düzeltin."}
};

export function buildScheduleConstraintPressureAdvisor(items:ScheduleReadinessItem[],metrics:SchedulePressureMetrics){
 const grouped=new Map<SchedulePressureFamily,ScheduleReadinessItem[]>();
 for(const item of items){const family=familyFor(item.code);grouped.set(family,[...(grouped.get(family)??[]),item])}
 const findings:SchedulePressureFinding[]=[];
 for(const family of FAMILY_ORDER){const xs=grouped.get(family);if(!xs?.length)continue;const meta=META[family];findings.push({family,title:meta.title,severity:"BLOCKER",affected:xs.reduce((s,x)=>s+Math.max(0,Number(x.affected_count)||0),0),codes:Array.from(new Set(xs.map(x=>x.code))),explanation:meta.explanation,action:meta.action})}
 if(metrics.lockedCount>0&&!grouped.has("LOCKED_MANUAL"))findings.push({family:"LOCKED_MANUAL",title:META.LOCKED_MANUAL.title,severity:"PRESSURE",affected:metrics.lockedCount,codes:["LOCKED_ROWS_PRESENT"],explanation:META.LOCKED_MANUAL.explanation,action:META.LOCKED_MANUAL.action});
 if(metrics.unavailabilityCount>0&&!grouped.has("TEACHER_CAPACITY"))findings.push({family:"TEACHER_CAPACITY",title:"Öğretmen kesin uygunsuzluk yoğunluğu",severity:"INFO",affected:metrics.unavailabilityCount,codes:["TEACHER_UNAVAILABILITY_COUNT"],explanation:"Kesin uygunsuzluklar meşru HARD girdilerdir; sayı yükseldikçe fizibilite alanı daralır.",action:"Sorun oluşursa özellikle yüksek ders yükü olan öğretmenlerin yasak slot yoğunluğunu inceleyin."});
 if(metrics.softPreferenceCount>0)findings.push({family:"OTHER",title:"SOFT tercih baskısı",severity:"INFO",affected:metrics.softPreferenceCount,codes:["SOFT_PREFERENCE_COUNT"],explanation:"Prefer/avoid tercihleri HARD değildir; çözüm varsa kaliteyi yönlendirir, çözümü yasaklamaz.",action:"Feasible çözüm bulunduğu halde kalite zayıfsa ağırlıkları ve gereksiz SOFT tercihleri gözden geçirin."});
 findings.sort((a,b)=>{const s={BLOCKER:0,PRESSURE:1,INFO:2};return s[a.severity]-s[b.severity]||FAMILY_ORDER.indexOf(a.family)-FAMILY_ORDER.indexOf(b.family)||b.affected-a.affected});
 const blockers=findings.filter(x=>x.severity==="BLOCKER");
 return {ready:blockers.length===0,blockerFamilies:blockers.length,totalAffected:blockers.reduce((s,x)=>s+x.affected,0),findings,policy:"HARD kurallar tanı amacıyla bile otomatik gevşetilmez. Tanı yalnız baskı kaynağını küçültür ve açıklar." as const};
}
