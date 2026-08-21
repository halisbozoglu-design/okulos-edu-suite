export type OfficialCourseScheduleRow = {
  gradeLevel: number;
  courseName: string;
  courseCode: string | null;
  shortName: string | null;
  category: "zorunlu" | "secmeli" | "rehberlik" | "uygulama" | "diger";
  hourOptions: number[];
  maxSelections: number;
  repeatAcrossYears: boolean;
  electiveGroupKey: string | null;
  sourceNote: string | null;
};

export type OfficialCourseScheduleParseResult = {
  academicYear: string | null;
  schoolType: string | null;
  programType: string | null;
  rows: OfficialCourseScheduleRow[];
  warnings: string[];
};

type GridRow = Array<{ text: string; x: number }>;
const clean=(v:unknown)=>String(v??"").replace(/\u00a0/g," ").replace(/\s+/g," ").trim();
const lower=(v:unknown)=>clean(v).toLocaleLowerCase("tr-TR");
const upper=(v:unknown)=>clean(v).toLocaleUpperCase("tr-TR");
const isGrade=(v:unknown)=>{const n=Number(clean(v).replace(/[^0-9]/g,""));return Number.isInteger(n)&&n>=1&&n<=14?n:null};

function inferAcademicYear(text:string){return text.match(/\b(20\d{2})\s*[-–—\/]\s*(20\d{2})\b/)?.slice(1).join("-")??null}
function inferSchoolType(text:string){const v=lower(text);if(/anadolu\s+imam\s+hatip|\baihl\b/.test(v))return"Anadolu İmam Hatip Lisesi";if(/imam\s+hatip\s+ortaokul|\biho\b/.test(v))return"İmam Hatip Ortaokulu";if(/mesleki\s+ve\s+teknik|\bmtal\b/.test(v))return"Mesleki ve Teknik Anadolu Lisesi";if(/mesleki\s+eğitim\s+merkez|mesem/.test(v))return"Mesleki Eğitim Merkezi";if(/anadolu\s+lisesi/.test(v))return"Anadolu Lisesi";if(/ilkokul/.test(v))return"İlkokul";if(/ortaokul/.test(v))return"Ortaokul";if(/lise/.test(v))return"Lise";return null}
function inferProgramType(text:string){const v=clean(text);const m=v.match(/(?:PROGRAMI|PROGRAM|ALANI|ALAN)\s*[:\-]?\s*([^\n]{3,80})/i);return m?.[1]?.trim()??null}
function inferCategory(text:string):OfficialCourseScheduleRow["category"]{const v=lower(text);if(/seçmeli|secmeli/.test(v))return"secmeli";if(/rehberlik|yönlendirme|yonlendirme/.test(v))return"rehberlik";if(/uygulama|atölye|atolye|laboratuvar/.test(v))return"uygulama";if(/zorunlu|ortak ders/.test(v))return"zorunlu";return"diger"}
function hourOptions(value:unknown){const raw=clean(value);if(!raw||/^[-–—xX]$/.test(raw))return[];const vals=[...raw.matchAll(/\b(\d{1,2})\b/g)].map(m=>Number(m[1])).filter(n=>n>=1&&n<=20);return [...new Set(vals)].sort((a,b)=>a-b)}
function normalizeCourseName(value:string){return clean(value).replace(/^\d+[.)\-]\s*/,"").replace(/\*+$/g,"").trim()}
function rowKey(r:OfficialCourseScheduleRow){return `${r.gradeLevel}|${upper(r.courseName)}|${r.category}|${r.electiveGroupKey??""}`}

function mergeRows(rows:OfficialCourseScheduleRow[]){const map=new Map<string,OfficialCourseScheduleRow>();for(const r of rows){const k=rowKey(r),old=map.get(k);if(!old){map.set(k,r);continue}old.hourOptions=[...new Set([...old.hourOptions,...r.hourOptions])].sort((a,b)=>a-b);old.repeatAcrossYears=old.repeatAcrossYears&&r.repeatAcrossYears;old.maxSelections=Math.max(old.maxSelections,r.maxSelections);if(!old.sourceNote&&r.sourceNote)old.sourceNote=r.sourceNote}return [...map.values()].sort((a,b)=>a.gradeLevel-b.gradeLevel||a.category.localeCompare(b.category,"tr")||a.courseName.localeCompare(b.courseName,"tr"))}

async function workbookSheets(file:File){const XLSX=await import("xlsx");const wb=XLSX.read(await file.arrayBuffer(),{type:"array",raw:true});return wb.SheetNames.map(name=>({name,rows:XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name]!,{header:1,defval:"",raw:true})}))}

async function pdfGrid(file:File):Promise<{rows:string[][];text:string}>{const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;const rows:string[][]=[];const all:string[]=[];for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){const page=await pdf.getPage(pageNo);const content=await page.getTextContent();const buckets=new Map<number,GridRow>();for(const item of content.items as Array<{str?:string;transform?:number[]}>){const t=clean(item.str);if(!t)continue;all.push(t);const y=Math.round((item.transform?.[5]??0)/3)*3,x=item.transform?.[4]??0;const arr=buckets.get(y)??[];arr.push({text:t,x});buckets.set(y,arr)}for(const [,cells] of [...buckets.entries()].sort((a,b)=>b[0]-a[0]))rows.push(cells.sort((a,b)=>a.x-b.x).map(c=>c.text))}return{rows,text:all.join(" \n")}}

function parseGrid(rows:unknown[][],documentText:string,warnings:string[]){const out:OfficialCourseScheduleRow[]=[];let category:OfficialCourseScheduleRow["category"]="diger";let electiveGroup:string|null=null;let header:Map<number,number>|null=null;let courseCol=0;for(let i=0;i<rows.length;i++){const cells=(rows[i]??[]).map(clean);if(!cells.some(Boolean))continue;const joined=cells.join(" ");const cat=inferCategory(joined);if(/zorunlu|ortak ders|seçmeli|secmeli|rehberlik|uygulama|atölye|atolye/i.test(joined)&&cells.filter(Boolean).length<=4){category=cat;if(category==="secmeli"){const g=joined.match(/(?:GRUP|ALAN|KATEGORİ|KATEGORI)\s*[:\-]?\s*(.+)/i);electiveGroup=g?.[1]?.trim()??electiveGroup}else if(category!=="secmeli")electiveGroup=null}
 const gradeMap=new Map<number,number>();cells.forEach((c,idx)=>{const g=isGrade(c);if(g)gradeMap.set(idx,g)});if(gradeMap.size>=2&&(cells.some(c=>/ders|sınıf|sinif/i.test(c))||gradeMap.size>=3)){header=gradeMap;courseCol=Math.max(0,[...gradeMap.keys()][0]!-1);continue}if(!header)continue;
 let name=normalizeCourseName(cells[courseCol]??"");if(!name||/^toplam|haftalık|haftalik|ders saati|sınıf|sinif$/i.test(name))continue;if(name.length<2)continue;
 const codeMatch=name.match(/^([A-ZÇĞİÖŞÜ0-9._-]{2,12})\s+(.+)$/u);const code=codeMatch?.[1]??null;if(codeMatch?.[2])name=codeMatch[2];
 for(const [idx,grade] of header){const hrs=hourOptions(cells[idx]);if(!hrs.length)continue;const nearby=cells.slice(Math.max(0,idx-1),idx+2).join(" ");const repeat=!/tekrar\s+(?:alınamaz|alinamaz|edilemez)|yalnızca?\s+bir\s+kez|sadece\s+bir\s+kez/i.test(`${joined} ${documentText}`);out.push({gradeLevel:grade,courseName:name,courseCode:code,shortName:null,category:category==="diger"?inferCategory(joined):category,hourOptions:hrs,maxSelections:1,repeatAcrossYears:repeat,electiveGroupKey:category==="secmeli"?electiveGroup:null,sourceNote:nearby||null})}}
 if(!out.length)warnings.push("Çizelge tablosu otomatik olarak tanınamadı; başlık/sınıf sütunları kontrol edilmeli.");return out}

export async function parseOfficialWeeklyCourseSchedule(file:File):Promise<OfficialCourseScheduleParseResult>{const ext=file.name.split(".").pop()?.toLowerCase(),warnings:string[]=[];let rows:unknown[][]=[],documentText="";if(ext==="xlsx"||ext==="xls"){const sheets=await workbookSheets(file);rows=sheets.flatMap(s=>[[s.name],...s.rows]);documentText=rows.flat().map(clean).join(" \n")}else if(ext==="pdf"){const parsed=await pdfGrid(file);rows=parsed.rows;documentText=parsed.text}else throw new Error("OFFICIAL_COURSE_SCHEDULE_REQUIRES_PDF_OR_EXCEL");const result=mergeRows(parseGrid(rows,documentText,warnings));const academicYear=inferAcademicYear(`${file.name} ${documentText}`),schoolType=inferSchoolType(`${file.name} ${documentText}`),programType=inferProgramType(documentText);if(!academicYear)warnings.push("Eğitim-öğretim yılı dosyadan kesin çıkarılamadı.");if(!schoolType)warnings.push("Okul türü dosyadan kesin çıkarılamadı.");return{academicYear,schoolType,programType,rows:result,warnings}}
