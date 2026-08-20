export type PersonnelImportRow = {
  fullName: string;
  title: string;
  dutyTitle: string;
  teachingArea: string;
  employmentStatus: string;
  systemRole: "teacher" | "principal" | "vice_principal" | "other";
  rawFields: Record<string, string>;
  rawLabels: Record<string, string>;
};

function clean(value: unknown) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}
function lower(value: unknown) { return clean(value).toLocaleLowerCase("tr-TR"); }
function ascii(value: string) {
  return value.toLocaleLowerCase("tr-TR")
    .replace(/[ç]/g,"c").replace(/[ğ]/g,"g").replace(/[ıİi]/g,"i")
    .replace(/[ö]/g,"o").replace(/[ş]/g,"s").replace(/[ü]/g,"u")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g,"");
}
function makeFieldKey(label: string, index: number, used: Set<string>) {
  const base = ascii(clean(label)).replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"") || `sutun_${index+1}`;
  let key=base, n=2;
  while(used.has(key)) key=`${base}_${n++}`;
  used.add(key);
  return key;
}
function roleOf(title: string, duty: string): PersonnelImportRow["systemRole"] {
  const v=lower(`${title} ${duty}`);
  if(/müdür yardım|mudur yardim/.test(v)) return "vice_principal";
  if(/(^|\s)müdür($|\s)|(^|\s)mudur($|\s)/.test(v)) return "principal";
  if(/öğretmen|ogretmen|başöğretmen|basogretmen|uzman öğretmen|uzman ogretmen/.test(v)) return "teacher";
  return "other";
}
function findIndex(headers:string[], re:RegExp){return headers.findIndex(x=>re.test(lower(x)));}
function isHeaderCandidate(row: unknown[]) {
  const values=row.map(clean).filter(Boolean);
  if(values.length<2) return false;
  const joined=lower(values.join(" | "));
  const hasName=/(ad.*soyad|adı.*soyadı|adi.*soyadi|personel.*ad)/.test(joined);
  return hasName && values.length>=3;
}
function headerRowIndex(rows:unknown[][]){
  for(let i=0;i<Math.min(rows.length,80);i+=1) if(isHeaderCandidate(rows[i]??[])) return i;
  return -1;
}
function mapRow(headers:string[], keys:string[], row:unknown[]) {
  const rawFields:Record<string,string>={}, rawLabels:Record<string,string>={};
  keys.forEach((key,i)=>{rawFields[key]=clean(row[i]);rawLabels[key]=headers[i]||`Sütun ${i+1}`;});
  return {rawFields,rawLabels};
}

async function parseExcel(file:File):Promise<PersonnelImportRow[]> {
  const XLSX=await import("xlsx");
  const workbook=XLSX.read(await file.arrayBuffer(),{type:"array",cellDates:false,raw:false});
  const result:PersonnelImportRow[]=[]; const seen=new Set<string>();
  for(const sheetName of workbook.SheetNames){
    const sheet=workbook.Sheets[sheetName]; if(!sheet) continue;
    const rows=XLSX.utils.sheet_to_json<unknown[]>(sheet,{header:1,defval:"",raw:false});
    const h=headerRowIndex(rows); if(h<0) continue;
    const headerCells=rows[h]??[];
    const width=Math.max(headerCells.length,...rows.slice(h+1).map(r=>r.length));
    const headers=Array.from({length:width},(_,i)=>clean(headerCells[i])||`Sütun ${i+1}`);
    const used=new Set<string>(); const keys=headers.map((label,i)=>makeFieldKey(label,i,used));
    const nameIdx=findIndex(headers,/(ad.*soyad|adı.*soyadı|adi.*soyadi|personel.*ad)/i);
    const titleIdx=findIndex(headers,/^\s*(unvan|ünvan)|kadro.*unvan/i);
    const dutyIdx=findIndex(headers,/görev|gorev/i);
    const areaIdx=findIndex(headers,/atama.*alan|branş|brans|öğretmenlik.*alan|ogretmenlik.*alan/i);
    const statusIdx=findIndex(headers,/kadro|statü|statu|sözleş|sozles|ücretli|ucretli|istihdam/i);
    if(nameIdx<0) continue;
    for(let i=h+1;i<rows.length;i+=1){
      const row=rows[i]??[]; const fullName=clean(row[nameIdx]);
      if(!fullName||fullName.length<3||/toplam|sayfa|rapor tarihi|kurum adı|kurum adi/i.test(fullName)) continue;
      const title=titleIdx>=0?clean(row[titleIdx]):"";
      const dutyTitle=dutyIdx>=0?clean(row[dutyIdx]):title;
      const teachingArea=areaIdx>=0?clean(row[areaIdx]):"";
      const employmentStatus=statusIdx>=0?clean(row[statusIdx]):"";
      const {rawFields,rawLabels}=mapRow(headers,keys,row);
      const unique=`${lower(fullName)}|${lower(teachingArea)}|${lower(dutyTitle)}`;
      if(seen.has(unique)) continue; seen.add(unique);
      result.push({fullName,title,dutyTitle,teachingArea,employmentStatus,systemRole:roleOf(title,dutyTitle),rawFields,rawLabels});
    }
  }
  return result;
}

type PdfItem={x:number;y:number;str:string};
async function pdfRows(file:File):Promise<{headers:string[];rows:string[][]}[]> {
  const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
  const pages:{headers:string[];rows:string[][]}[]=[];
  let rememberedHeaders:string[]|null=null, rememberedXs:number[]|null=null;
  for(let pageNo=1;pageNo<=pdf.numPages;pageNo+=1){
    const page=await pdf.getPage(pageNo); const content=await page.getTextContent();
    const items=(content.items as Array<{str?:string;transform?:number[]}>).filter(i=>i.str?.trim()).map(i=>({x:i.transform?.[4]??0,y:i.transform?.[5]??0,str:clean(i.str)} as PdfItem));
    const lineMap=new Map<number,PdfItem[]>();
    for(const item of items){const y=Math.round(item.y/3)*3;const arr=lineMap.get(y)??[];arr.push(item);lineMap.set(y,arr);}
    const lines=[...lineMap.entries()].sort((a,b)=>b[0]-a[0]).map(([,arr])=>arr.sort((a,b)=>a.x-b.x));
    let headerLine=lines.find(line=>isHeaderCandidate(line.map(i=>i.str)));
    let headers=rememberedHeaders, xs=rememberedXs;
    if(headerLine){
      const groups:{x:number;str:string}[]=[];
      for(const item of headerLine){
        const prev=groups[groups.length-1];
        if(prev && item.x-prev.x<32) prev.str=`${prev.str} ${item.str}`.trim(); else groups.push({x:item.x,str:item.str});
      }
      headers=groups.map(g=>g.str); xs=groups.map(g=>g.x); rememberedHeaders=headers; rememberedXs=xs;
    }
    if(!headers||!xs||headers.length<2) continue;
    const dataRows:string[][]=[];
    for(const line of lines){
      if(line===headerLine||isHeaderCandidate(line.map(i=>i.str))) continue;
      const row=Array(headers.length).fill("") as string[];
      for(const item of line){
        let idx=0,best=Infinity;
        xs.forEach((x,i)=>{const d=Math.abs(item.x-x);if(d<best){best=d;idx=i;}});
        row[idx]=clean(`${row[idx]} ${item.str}`);
      }
      if(row.some(Boolean)) dataRows.push(row);
    }
    pages.push({headers,rows:dataRows});
  }
  return pages;
}
async function parsePdf(file:File):Promise<PersonnelImportRow[]> {
  const tables=await pdfRows(file); const result:PersonnelImportRow[]=[]; const seen=new Set<string>();
  for(const table of tables){
    const headers=table.headers; const used=new Set<string>(); const keys=headers.map((h,i)=>makeFieldKey(h,i,used));
    const nameIdx=findIndex(headers,/(ad.*soyad|adı.*soyadı|adi.*soyadi|personel.*ad)/i);
    const titleIdx=findIndex(headers,/^\s*(unvan|ünvan)|kadro.*unvan/i);
    const dutyIdx=findIndex(headers,/görev|gorev/i);
    const areaIdx=findIndex(headers,/atama.*alan|branş|brans|öğretmenlik.*alan|ogretmenlik.*alan/i);
    const statusIdx=findIndex(headers,/kadro|statü|statu|sözleş|sozles|ücretli|ucretli|istihdam/i);
    if(nameIdx<0) continue;
    for(const row of table.rows){
      const fullName=clean(row[nameIdx]); if(!fullName||fullName.length<3||/toplam|sayfa|rapor/i.test(fullName)) continue;
      const title=titleIdx>=0?clean(row[titleIdx]):"", dutyTitle=dutyIdx>=0?clean(row[dutyIdx]):title;
      const teachingArea=areaIdx>=0?clean(row[areaIdx]):"", employmentStatus=statusIdx>=0?clean(row[statusIdx]):"";
      const {rawFields,rawLabels}=mapRow(headers,keys,row);
      const unique=`${lower(fullName)}|${lower(teachingArea)}|${lower(dutyTitle)}`; if(seen.has(unique)) continue; seen.add(unique);
      result.push({fullName,title,dutyTitle,teachingArea,employmentStatus,systemRole:roleOf(title,dutyTitle),rawFields,rawLabels});
    }
  }
  return result;
}

export async function parsePersonnelSummaryReport(file:File):Promise<PersonnelImportRow[]> {
  const ext=file.name.split(".").pop()?.toLowerCase();
  const rows=ext==="xls"||ext==="xlsx"?await parseExcel(file):ext==="pdf"?await parsePdf(file):[];
  if(!rows.length) throw new Error(ext==="pdf"?"MEB_PERSONNEL_PDF_LAYOUT_NOT_RECOGNIZED":"MEB_PERSONNEL_LAYOUT_NOT_RECOGNIZED");
  return rows;
}

export function getPersonnelColumns(rows:PersonnelImportRow[]){
  const map=new Map<string,string>();
  for(const row of rows) for(const [key,label] of Object.entries(row.rawLabels)) if(!map.has(key)) map.set(key,label);
  return [...map.entries()].map(([key,label])=>({key,label}));
}
