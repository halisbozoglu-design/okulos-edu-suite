export type PersonnelNormalizedFields = {
  province: string; district: string; institutionName: string; institutionCode: string;
  fullName: string; tcIdentityNo: string; personnelStatus: string; gradeStep: string;
  baseTitle: string; dutyTitle: string; teachingArea: string; careerStage: string;
  educationStatus: string; institutionRegistryNo: string; retirementRegistryNo: string;
  archiveNo: string; gender: string; bloodGroup: string; birthDate: string; firstServiceDate: string;
};

export type PersonnelImportRow = {
  fullName: string;
  title: string;
  dutyTitle: string;
  teachingArea: string;
  employmentStatus: string;
  systemRole: "teacher" | "principal" | "vice_principal" | "other";
  derivedRoles: string[];
  normalized: PersonnelNormalizedFields;
  rawFields: Record<string, string>;
  rawLabels: Record<string, string>;
};

const PHYSICAL_LABELS = [
  "Bulunduğu İl / İlçe", "Çalıştığı Kurumun Adı / Kodu", "Adı Soyadı / T.C. Kimlik No + Durumu / Kademe-Derecesi",
  "Unvanı / Görevi", "Bakanlık Atama Alanı / Kariyer Basamağı", "Öğrenim Durumu", "Kurum Sicil No",
  "Emekli Sicil No", "Arşiv No", "Cinsiyet", "Kan Grubu", "Doğum Tarihi", "İlk Göreve Başlama Tarihi",
] as const;
const PHYSICAL_KEYS = ["il_ilce","kurum_adi_kodu","ad_soyad_tc_durum_kademe","unvani_gorevi","bakanlik_atama_alani_kariyer","ogrenim_durumu","kurum_sicil_no","emekli_sicil_no","arsiv_no","cinsiyet","kan_grubu","dogum_tarihi","ilk_goreve_baslama_tarihi"] as const;

function clean(value: unknown) { return String(value ?? "").replace(/\u00a0/g," ").replace(/\s+/g," ").trim(); }
function lower(value: unknown) { return clean(value).toLocaleLowerCase("tr-TR"); }
function ascii(value: string) { return value.toLocaleLowerCase("tr-TR").replace(/[ç]/g,"c").replace(/[ğ]/g,"g").replace(/[ıİi]/g,"i").replace(/[ö]/g,"o").replace(/[ş]/g,"s").replace(/[ü]/g,"u").normalize("NFKD").replace(/[\u0300-\u036f]/g,""); }
function makeFieldKey(label:string,index:number,used:Set<string>){const base=ascii(clean(label)).replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")||`sutun_${index+1}`;let key=base,n=2;while(used.has(key))key=`${base}_${n++}`;used.add(key);return key;}
function isoDate(v:string){const m=clean(v).match(/\b(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})\b/);return m?`${m[3]}-${m[2]!.padStart(2,"0")}-${m[1]!.padStart(2,"0")}`:"";}
function splitSlash(v:string){const p=clean(v).split(/\s*\/\s*/);return [clean(p[0]),clean(p.slice(1).join(" / "))] as const;}
function splitPersonCell(v:string){const raw=clean(v);const tc=raw.match(/\((\d{11})\)/)?.[1]??"";const name=clean(raw.replace(/\(\d{11}\)/g,"").replace(/\bGörevde\b.*$/i,"").replace(/\bGorevde\b.*$/i,""));const status=raw.match(/\b(Görevde|Gorevde)\s+([^\s]+(?:\s*[-/]\s*[^\s]+)?)/i);return {fullName:name,tcIdentityNo:tc,personnelStatus:status?status[1]:"",gradeStep:status?clean(status[2]):""};}
function splitTitleDuty(v:string){const raw=clean(v);const known=["Müdür Yardımcısı","Müdür","Sözleşmeli Öğretmen(657 S.K. 4/B)","Öğretmen"];
  for(const duty of known){const pos=lower(raw).lastIndexOf(lower(`/ ${duty}`));if(pos>=0)return {baseTitle:clean(raw.slice(0,pos)),dutyTitle:duty};}
  const parts=raw.split(/\s*\/\s*/);if(parts.length>=2)return {baseTitle:clean(parts[0]),dutyTitle:clean(parts.slice(1).join(" / "))};return {baseTitle:raw,dutyTitle:raw};}
function splitAreaCareer(v:string){const raw=clean(v);const m=raw.match(/^(.*?)(?:\s*\/\s*)?(Başöğretmen|Basogretmen|Uzman Öğretmen|Uzman Ogretmen)$/i);return m?{teachingArea:clean(m[1]),careerStage:clean(m[2])}:{teachingArea:raw.replace(/\s*\/\s*$/,""),careerStage:""};}
function roleInfo(baseTitle:string,dutyTitle:string,teachingArea:string){const v=lower(`${baseTitle} ${dutyTitle}`),a=lower(teachingArea);let systemRole:PersonnelImportRow["systemRole"]="other";const tags:string[]=[];
  if(/müdür yardım|mudur yardim/.test(v)){systemRole="vice_principal";tags.push("vice_principal");}
  else if(/(^|\W)müdür($|\W)|(^|\W)mudur($|\W)/.test(v)){systemRole="principal";tags.push("principal");}
  else if(/öğretmen|ogretmen/.test(v)){systemRole="teacher";tags.push("teacher");}
  if(/rehberlik|\bpdr\b/.test(a)||/rehber öğretmen|rehber ogretmen/.test(v)){if(!tags.includes("teacher"))tags.push("teacher");tags.push("guidance_teacher");}
  return {systemRole,derivedRoles:tags};}
function splitInstitution(v:string){const raw=clean(v);const m=raw.match(/^(.*?)(?:\s*\/\s*)(\d{5,})$/);return m?{institutionName:clean(m[1]),institutionCode:m[2]??""}:{institutionName:raw,institutionCode:""};}
function normalizedFromPhysical(c:string[]):PersonnelNormalizedFields{const [province,district]=splitSlash(c[0]??"");const inst=splitInstitution(c[1]??"");const person=splitPersonCell(c[2]??"");const title=splitTitleDuty(c[3]??"");const area=splitAreaCareer(c[4]??"");return {province,district,institutionName:inst.institutionName,institutionCode:inst.institutionCode,fullName:person.fullName,tcIdentityNo:person.tcIdentityNo,personnelStatus:person.personnelStatus,gradeStep:person.gradeStep,baseTitle:title.baseTitle,dutyTitle:title.dutyTitle,teachingArea:area.teachingArea,careerStage:area.careerStage,educationStatus:clean(c[5]),institutionRegistryNo:clean(c[6]),retirementRegistryNo:clean(c[7]),archiveNo:clean(c[8]),gender:clean(c[9]),bloodGroup:clean(c[10]),birthDate:isoDate(c[11]??""),firstServiceDate:isoDate(c[12]??"")};}
function addNormalized(rawFields:Record<string,string>,rawLabels:Record<string,string>,n:PersonnelNormalizedFields){const labels:Record<keyof PersonnelNormalizedFields,string>={province:"İl",district:"İlçe",institutionName:"Kurum Adı",institutionCode:"Kurum Kodu",fullName:"Ad Soyad",tcIdentityNo:"T.C. Kimlik No",personnelStatus:"Personel Durumu",gradeStep:"Kademe-Derece",baseTitle:"Temel Unvan",dutyTitle:"Fiilî Görev",teachingArea:"Bakanlık Atama Alanı / Branş",careerStage:"Kariyer Basamağı",educationStatus:"Öğrenim Durumu",institutionRegistryNo:"Kurum Sicil No",retirementRegistryNo:"Emekli Sicil No",archiveNo:"Arşiv No",gender:"Cinsiyet",bloodGroup:"Kan Grubu",birthDate:"Doğum Tarihi",firstServiceDate:"İlk Göreve Başlama Tarihi"};for(const [k,label] of Object.entries(labels)){const key=`normalized_${k}`;rawFields[key]=String(n[k as keyof PersonnelNormalizedFields]??"");rawLabels[key]=label;}}
function buildRow(cells:string[],extra?:{rawFields:Record<string,string>;rawLabels:Record<string,string>}):PersonnelImportRow|null{if(cells.length<13)return null;const normalized=normalizedFromPhysical(cells);if(!normalized.fullName||normalized.fullName.length<3)return null;const rawFields=extra?.rawFields??{},rawLabels=extra?.rawLabels??{};PHYSICAL_KEYS.forEach((k,i)=>{rawFields[k]=clean(cells[i]);rawLabels[k]=PHYSICAL_LABELS[i];});addNormalized(rawFields,rawLabels,normalized);const roles=roleInfo(normalized.baseTitle,normalized.dutyTitle,normalized.teachingArea);return {fullName:normalized.fullName,title:normalized.baseTitle,dutyTitle:normalized.dutyTitle,teachingArea:normalized.teachingArea,employmentStatus:normalized.personnelStatus,systemRole:roles.systemRole,derivedRoles:roles.derivedRoles,normalized,rawFields,rawLabels};}

function isHeaderCandidate(row:unknown[]){const joined=lower(row.map(clean).join(" | "));return /ad.*soyad/.test(joined)&&/(unvan|ünvan)/.test(joined)&&/(atama.*alan|bakanlık.*atama)/.test(joined);}
function findHeader(rows:unknown[][]){for(let i=0;i<Math.min(rows.length,80);i++)if(isHeaderCandidate(rows[i]??[]))return i;return -1;}
function excelPhysicalRow(row:unknown[],headers:string[]){const values=row.map(clean);const idx=(re:RegExp)=>headers.findIndex(h=>re.test(lower(h)));const nameIdx=idx(/ad.*soyad/),provinceIdx=idx(/bulunduğu.*il|bulundugu.*il/),instIdx=idx(/çalıştığı.*kurum|calistigi.*kurum/),titleIdx=idx(/unvan|ünvan/),areaIdx=idx(/bakanlık.*atama|bakanlik.*atama/),eduIdx=idx(/öğrenim|ogrenim/),kurumSicilIdx=idx(/kurum.*sicil/),emekliIdx=idx(/emekli.*sicil/),arsivIdx=idx(/arşiv|arsiv/),genderIdx=idx(/cinsiyet/),bloodIdx=idx(/kan.*gr/),birthIdx=idx(/doğum|dogum/),firstIdx=idx(/ilk.*göreve|ilk.*goreve/);
  const picks=[provinceIdx,instIdx,nameIdx,titleIdx,areaIdx,eduIdx,kurumSicilIdx,emekliIdx,arsivIdx,genderIdx,bloodIdx,birthIdx,firstIdx];if(picks.some(i=>i<0))return null;return picks.map(i=>values[i]??"");}
async function parseExcel(file:File){const XLSX=await import("xlsx");const wb=XLSX.read(await file.arrayBuffer(),{type:"array",cellDates:false,raw:false});const result:PersonnelImportRow[]=[];const seen=new Set<string>();for(const name of wb.SheetNames){const sh=wb.Sheets[name];if(!sh)continue;const rows=XLSX.utils.sheet_to_json<unknown[]>(sh,{header:1,defval:"",raw:false});const h=findHeader(rows);if(h<0)continue;const width=Math.max(...rows.map(r=>r.length));const mergedHeaders=Array.from({length:width},(_,i)=>clean(rows[h]?.[i]));
    for(let i=h+1;i<Math.min(rows.length,h+4);i++){for(let j=0;j<width;j++){const v=clean(rows[i]?.[j]);if(v&&(/durumu.*kademe|görev|gorev|alan|öğrenim|sicil|arşiv|cinsiyet|kan|doğum|ilk/i.test(v)))mergedHeaders[j]=clean(`${mergedHeaders[j]} ${v}`);}}
    const used=new Set<string>();const keys=mergedHeaders.map((x,i)=>makeFieldKey(x||`Sütun ${i+1}`,i,used));
    for(let i=h+1;i<rows.length;i++){const raw=rows[i]??[];const physical=excelPhysicalRow(raw,mergedHeaders);if(!physical)continue;const extra={rawFields:{} as Record<string,string>,rawLabels:{} as Record<string,string>};keys.forEach((k,j)=>{extra.rawFields[k]=clean(raw[j]);extra.rawLabels[k]=mergedHeaders[j]||`Sütun ${j+1}`;});const row=buildRow(physical,extra);if(!row)continue;const key=`${lower(row.normalized.tcIdentityNo||row.fullName)}|${row.normalized.institutionCode}`;if(seen.has(key))continue;seen.add(key);result.push(row);}}
  return result;}

type PdfItem={x:number;y:number;str:string};
const PDF_BOUNDS=[0.014,0.118,0.244,0.444,0.545,0.602,0.659,0.703,0.760,0.817,0.839,0.886,0.939,1.001];
async function parsePdf(file:File){const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;const result:PersonnelImportRow[]=[];const seen=new Set<string>();for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p);const viewport=page.getViewport({scale:1});const content=await page.getTextContent();const items=(content.items as Array<{str?:string;transform?:number[]}>).filter(i=>i.str?.trim()).map(i=>({x:i.transform?.[4]??0,y:i.transform?.[5]??0,str:clean(i.str)} as PdfItem));const col=(x:number)=>{const r=x/viewport.width;for(let i=0;i<13;i++)if(r>=PDF_BOUNDS[i]!&&r<PDF_BOUNDS[i+1]!)return i;return -1;};
    const starts=items.filter(i=>col(i.x)===2&&/\(\d{11}\)/.test(i.str)).sort((a,b)=>b.y-a.y);for(let s=0;s<starts.length;s++){const top=starts[s]!.y+8,bottom=s+1<starts.length?starts[s+1]!.y+8:25;const cells=Array.from({length:13},()=>[] as PdfItem[]);for(const item of items){if(item.y>top||item.y<=bottom)continue;const c=col(item.x);if(c>=0)cells[c]!.push(item);}const physical=cells.map(arr=>arr.sort((a,b)=>Math.abs(b.y-a.y)>2?b.y-a.y:a.x-b.x).map(i=>i.str).join(" ").replace(/\s+/g," ").trim());const row=buildRow(physical);if(!row)continue;const key=`${lower(row.normalized.tcIdentityNo||row.fullName)}|${row.normalized.institutionCode}`;if(seen.has(key))continue;seen.add(key);result.push(row);}}
  return result;}

export async function parsePersonnelSummaryReport(file:File):Promise<PersonnelImportRow[]>{const ext=file.name.split(".").pop()?.toLowerCase();const rows=ext==="xls"||ext==="xlsx"?await parseExcel(file):ext==="pdf"?await parsePdf(file):[];if(!rows.length)throw new Error(ext==="pdf"?"MEB_PERSONNEL_PDF_LAYOUT_NOT_RECOGNIZED":"MEB_PERSONNEL_LAYOUT_NOT_RECOGNIZED");return rows;}
export function getPersonnelColumns(rows:PersonnelImportRow[]){const map=new Map<string,string>();for(const row of rows)for(const [key,label] of Object.entries(row.rawLabels))if(!map.has(key))map.set(key,label);return [...map.entries()].map(([key,label])=>({key,label}));}
