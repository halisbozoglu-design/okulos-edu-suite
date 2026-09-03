export type BriefingContext={schoolName?:string;schoolType?:string;province?:string;district?:string;students?:number;teachers?:number;projects?:string[];achievements?:string;facilities?:string};
export type AdvisorResult={title:string;reason:string;suggestion:string;sources:string[]};

const clean=(v?:string)=>String(v??'').replace(/\s+/g,' ').trim();
const sentence=(v:string)=>{const t=clean(v);return !t?t:/[.!?]$/.test(t)?t:`${t}.`};

export function improveInstitutionalText(kind:string,input:string,ctx:BriefingContext):AdvisorResult|null{
 const base=clean(input);if(!base)return null;
 const facts=[ctx.schoolName,ctx.schoolType,ctx.district&&ctx.province?`${ctx.district}/${ctx.province}`:ctx.district||ctx.province,ctx.students?`${ctx.students} öğrenci`:undefined,ctx.teachers?`${ctx.teachers} öğretmen`:undefined].filter(Boolean) as string[];
 const projectText=ctx.projects?.length?` Kurumda yürütülen ${ctx.projects.slice(0,4).join(', ')} çalışmaları bu yaklaşımı desteklemektedir.`:'';
 const prefix=kind==='mission'?'Kurumumuz; öğrencilerin akademik, sosyal, kültürel ve değer temelli gelişimini bütüncül biçimde desteklemeyi,':'vizyon'===kind?'Kurumumuzun vizyonu; bilimsel düşünceyi, etik değerleri, yenilikçiliği ve toplumsal sorumluluğu merkeze alan,':'history'===kind?'Kurumun tarihsel gelişimi; kuruluşundan bugüne eğitim kapasitesi, fiziki imkânları ve kurumsal yapısındaki dönüşümler esas alınarak,':'strengths'===kind?'Kurumsal güçlü yönler; insan kaynağı, eğitim ortamları, öğrenci gelişimi, proje üretme kapasitesi ve paydaş iş birliği dikkate alınarak,':'weaknesses'===kind?'Geliştirilmesi gereken alanlar; ölçülebilir veriler, fiziki ihtiyaçlar, insan kaynağı ve öğrenci destek süreçleri dikkate alınarak,':'plannedActions'===kind?'Planlanan çalışmalar; belirlenen ihtiyaçların sorumlusu, zamanı ve beklenen çıktısı tanımlanacak şekilde,':'Kurum metni; açık, ölçülebilir ve resmî bir anlatımla,';
 const ending=kind==='mission'?' millî ve evrensel değerleri gözeten, sorumluluk sahibi ve sürekli öğrenen bireyler yetiştirmeyi amaçlar.':kind==='vision'?' öğrencilerin potansiyelini geliştiren ve çevresine örnek olan güçlü bir eğitim kurumu olmayı hedefler.':' daha açık, kurumsal ve izlenebilir bir anlatımla ifade edilebilir.';
 const merged=`${prefix} ${sentence(base)}${ending}${projectText}`.replace(/\s+/g,' ');
 return{title:'OkulOS Kurumsal Yazım Önerisi',reason:'Metniniz korunarak daha resmî, kurumsal ve veriyle ilişkilendirilebilir bir alternatif hazırlandı.',suggestion:merged,sources:facts};
}

export function missingBriefingSuggestions(ctx:BriefingContext,fields:Record<string,string>):string[]{
 const out:string[]=[];
 if(!clean(fields.mission))out.push('Misyon bölümü eksik. Kurumun temel eğitim yaklaşımını ve öğrenciye kazandırmak istediği nitelikleri ekleyin.');
 if(!clean(fields.vision))out.push('Vizyon bölümü eksik. Kurumun ulaşmak istediği gelecek konumunu kısa ve ayırt edici biçimde tanımlayın.');
 if(!clean(fields.achievements))out.push('Başarılar bölümü eksik. Son yıllardaki sınav, yarışma, proje, kültür-sanat ve spor derecelerini ekleyin.');
 if(!clean(fields.facilities))out.push('Fizikî imkânlar bölümü eksik. Derslik, laboratuvar, kütüphane, spor alanı, mescit, atölye ve erişilebilirlik bilgilerini ekleyin.');
 if(!(ctx.projects?.length))out.push('Sistemde proje verisi görünmüyor. Projeleri manuel ekleyebilir veya ilgili modül oluştuğunda otomatik bağlayabilirsiniz.');
 if(!ctx.students)out.push('Öğrenci toplamı alınamadı. Brifing içinde manuel öğrenci verisi ekleme alanı açık tutulmalı.');
 return out;
}
