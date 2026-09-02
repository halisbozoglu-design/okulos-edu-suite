export type ParsedConstraint={type:string;severity:"hard"|"soft"|"info";params:Record<string,unknown>;sourceText:string};
export type ParsedCourseRow={courseName:string;courseCode?:string|undefined;shortName?:string|undefined;gradeLevel:number;category:string;hourOptions:number[];maxSelections:number;repeatAcrossYears:boolean;electiveGroupKey?:string|undefined;sourceNote?:string|undefined;sourcePage?:number|undefined;sourceSection?:string|undefined;parserConfidence:number;needsReview:boolean;parsedConstraints:ParsedConstraint[]};
export type ParsedProfile={academicYear:string;schoolType:string;schoolSubtype?:string|undefined;programType?:string|undefined;fieldName?:string|undefined;branchName?:string|undefined;gradeLevel:number;requiredCourseCount:number;requiredHourTotal:number;electiveCourseMin:number;electiveCourseMax?:number|undefined;electiveHourMin:number;electiveHourMax:number;totalHourMin:number;totalHourMax:number;totalHourTarget?:number|undefined;groupRules:ParsedConstraint[];sourceDecisionNo?:string|undefined;sourceDecisionDate?:string|undefined;sourceNote?:string|undefined};
export type ParsedCourseCandidate={course_name:string;hour_options:number[];source_text:string;confidence:number;needs_review:boolean};
export type OfficialPdfEvidence={parser_version:"okulos-official-pdf-evidence-v1";source_hash:string;source_file_name:string;page_count:number;extracted_text_characters:number;extracted_text_hash:string;course_candidates:ParsedCourseCandidate[];decision_no?:string;decision_date?:string;academic_year?:string;extraction_status:"TEXT_EXTRACTED"};

const tr=(s:string)=>s.replace(/\s+/g," ").trim();
export function parseSelectionLimit(rawName:string){const name=tr(rawName);const m=name.match(/\s+\((\d+)\)\s*$/);return m?{name:name.slice(0,m.index).trim(),maxSelections:Number(m[1])}:{name,maxSelections:1};}
export function parseHourOptions(cell:string){const s=tr(cell);if(!s||s==="-"||s==="—")return[];const par=[...s.matchAll(/\((\d+)\)/g)].map(x=>Number(x[1])).filter(x=>x>0&&x<=30);if(par.length)return[...new Set(par)].sort((a,b)=>a-b);const n=Number(s.replace(/[^0-9]/g,""));return Number.isFinite(n)&&n>0&&n<=30?[n]:[];}
export function categoryFromSection(section:string){const s=section.toLocaleUpperCase("tr-TR");if(s.includes("SEÇMELİ"))return"secmeli";if(s.includes("MESLEK")||s.includes("ALAN")||s.includes("DAL"))return"meslek";if(s.includes("PROGRAM"))return"program";if(s.includes("REHBERLİK"))return"rehberlik";return"zorunlu";}
export function extractDecisionMeta(text:string){const t=text.replace(/\r/g,"");const no=t.match(/(?:Karar\s*(?:No|Numarası)?|Sayı)\s*[:\-]?\s*((?:20\d{2})\s*[-\/]\s*\d{1,4}|\d{1,8})\b/i);const date=t.match(/(?:Tarih|TARİH)\s*[:\-]?\s*(\d{1,2}[\/.]\d{1,2}[\/.]\d{4})/);const year=t.match(/(20\d{2})-(20\d{2})\s+eğitim\s+(?:ve\s+)?öğretim/i);return{decisionNo:no?.[1]?.replace(/\s+/g,""),decisionDate:date?.[1]?.replaceAll(".","-").replace(/^(\d{2})-(\d{2})-(\d{4})$/,"$3-$2-$1"),academicYear:year?`${year[1]}-${year[2]}`:undefined};}

function hex(bytes:ArrayBuffer){return Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,"0")).join("");}
async function sha256(bytes:ArrayBuffer){if(!globalThis.crypto?.subtle)throw new Error("PDF_HASH_UNAVAILABLE");return hex(await globalThis.crypto.subtle.digest("SHA-256",bytes));}

/** Conservative table-row candidate extraction. It never writes curriculum data. */
export function extractCourseCandidatesFromText(text:string):ParsedCourseCandidate[]{const out:ParsedCourseCandidate[]=[];const seen=new Set<string>();for(const raw of text.split(/\r?\n/)){const line=raw.trim();const match=line.match(/^(?:\d+[.)-]\s*)?([\p{L}][\p{L}\s,.'’()\-]{2,}?)\s{2,}(\d{1,2}(?:\s*[/,]\s*\d{1,2})*)$/u);if(!match)continue;const name=tr(match[1]??"");const hours=parseHourOptions(match[2]??"");if(!hours.length||/^(ders|sınıf|toplam|saat|açıklama|çizelge)/i.test(name))continue;const key=`${name.toLocaleLowerCase("tr-TR")}:${hours.join(",")}`;if(seen.has(key))continue;seen.add(key);out.push({course_name:name,hour_options:hours,source_text:line,confidence:.72,needs_review:true});}return out;}

/** Extracts verifiable local PDF evidence without uploading the source file. */
export async function parseOfficialPdfEvidence(file:File):Promise<OfficialPdfEvidence>{
 if(file.type!=="application/pdf"&&!file.name.toLocaleLowerCase("tr-TR").endsWith(".pdf"))throw new Error("OFFICIAL_SOURCE_PDF_REQUIRED");
 const bytes=await file.arrayBuffer();
 const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
 const pdf=await pdfjs.getDocument({data:new Uint8Array(bytes)}).promise;
 const pages:string[]=[];
 for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){
  const page=await pdf.getPage(pageNo);
  const content=await page.getTextContent();
  const pageText=(content.items as Array<{str?:string;hasEOL?:boolean}>).map(item=>`${item.str??""}${item.hasEOL?"\n":" "}`).join("");
  if(pageText.trim())pages.push(pageText);
 }
 const rawText=pages.join("\n");
 const text=tr(rawText);
 if(!text)throw new Error("OFFICIAL_PDF_TEXT_NOT_EXTRACTABLE");
 const meta=extractDecisionMeta(text);
 return{parser_version:"okulos-official-pdf-evidence-v1",source_hash:await sha256(bytes),source_file_name:file.name,page_count:pdf.numPages,extracted_text_characters:rawText.length,extracted_text_hash:await sha256(new TextEncoder().encode(rawText).buffer),course_candidates:extractCourseCandidatesFromText(rawText),...(meta.decisionNo?{decision_no:meta.decisionNo}:{}),...(meta.decisionDate?{decision_date:meta.decisionDate}:{}),...(meta.academicYear?{academic_year:meta.academicYear}:{}),extraction_status:"TEXT_EXTRACTED"};
}

export function parseExplanationConstraints(text:string):ParsedConstraint[]{const out:ParsedConstraint[]=[];const sentences=text.split(/(?<=[.!?])\s+/).map(tr).filter(Boolean);for(const s of sentences){const low=s.toLocaleLowerCase("tr-TR");
 const group=low.match(/(?:gruplarından|grubundan).*?en az\s+(?:bir(?:er)?|1)\s+ders/);if(group){const groupNames=[...s.matchAll(/["“”]([^"“”]+)["“”]/g)].map(x=>tr(x[1]??""));out.push({type:"MIN_COURSE_FROM_GROUP",severity:"hard",params:{minCourses:1,eachGroup:groupNames.length>1,groupNames},sourceText:s});}
 if(/farklı sınıf seviyelerinde.*aynı ders.*birlikte eğitim/.test(low))out.push({type:"CROSS_GRADE_GROUPING_ALLOWED",severity:"hard",params:{allowed:true},sourceText:s});
 if(/sınıf(?:lar)? birleştirilemez|sınıf birleştirmesi yapılamaz/.test(low))out.push({type:"NO_CLASS_MERGE",severity:"hard",params:{allowed:false},sourceText:s});
 const split=low.match(/(?:sınıf|şube) mevcudu\s*(\d+)['’]?(?:i|ı|u|ü)?\s*aş(?:ar|ması|tığı).*?(?:iki|2) grup/);if(split)out.push({type:"SPLIT_CLASS_THRESHOLD",severity:"hard",params:{threshold:Number(split[1]),groups:2},sourceText:s});
 const until=low.match(/mezun olana kadar en az\s+(\d+)\s+saat/);if(until)out.push({type:"MIN_CUMULATIVE_HOURS",severity:"hard",params:{hours:Number(until[1]),period:"until_graduation"},sourceText:s});
 const prereq=low.match(/(.+?)\s+(?:modülü|dersi) alınmadan[;,]?\s*(.+?)\s+(?:modülü|dersi|modülleri|dersleri) seçilemez/);if(prereq)out.push({type:"PREREQUISITE",severity:"hard",params:{prerequisite:tr(prereq[1]??""),blocked:tr(prereq[2]??"")},sourceText:s});
 const max=low.match(/(?:en fazla|azami)\s+(\d+)\s+(?:ders saati|saat)/);if(max)out.push({type:"MAX_HOURS",severity:"hard",params:{hours:Number(max[1])},sourceText:s});
 }
 return out;}

export function buildCourseRow(args:{rawName:string;gradeLevel:number;hourCell:string;section:string;groupKey?:string;sourceNote?:string;sourcePage?:number;explanationText?:string}):ParsedCourseRow{const sel=parseSelectionLimit(args.rawName);const hours=parseHourOptions(args.hourCell);const constraints=parseExplanationConstraints(args.explanationText??"");let confidence=1;let needsReview=false;if(!hours.length){confidence-=.4;needsReview=true;}if(!sel.name){confidence-=.5;needsReview=true;}return{courseName:sel.name,gradeLevel:args.gradeLevel,category:categoryFromSection(args.section),hourOptions:hours,maxSelections:sel.maxSelections,repeatAcrossYears:sel.maxSelections>1,electiveGroupKey:args.groupKey,sourceNote:args.sourceNote,sourcePage:args.sourcePage,sourceSection:args.section,parserConfidence:Math.max(0,confidence),needsReview,parsedConstraints:constraints};}

export function deriveProfile(args:{academicYear:string;schoolType:string;schoolSubtype?:string;programType?:string;fieldName?:string;branchName?:string;gradeLevel:number;rows:ParsedCourseRow[];declaredRequiredHours?:number;declaredElectiveHours?:number;declaredTotalHours?:number;explanationText?:string;sourceDecisionNo?:string;sourceDecisionDate?:string;sourceNote?:string}):ParsedProfile{const required=args.rows.filter(r=>r.category!=="secmeli");const electives=args.rows.filter(r=>r.category==="secmeli");const rules=parseExplanationConstraints(args.explanationText??"");const groupMin=rules.filter(r=>r.type==="MIN_COURSE_FROM_GROUP").reduce((n,r)=>{const names=Array.isArray(r.params['groupNames'])?(r.params['groupNames'] as unknown[]).length:0;return n+(r.params['eachGroup']?Math.max(1,names):1);},0);const reqHours=args.declaredRequiredHours??required.reduce((n,r)=>n+(r.hourOptions.length===1?(r.hourOptions[0]??0):0),0);const electMax=args.declaredElectiveHours??electives.reduce((n,r)=>n+Math.max(0,...r.hourOptions),0);const total=args.declaredTotalHours??(reqHours+electMax);return{academicYear:args.academicYear,schoolType:args.schoolType,schoolSubtype:args.schoolSubtype,programType:args.programType,fieldName:args.fieldName,branchName:args.branchName,gradeLevel:args.gradeLevel,requiredCourseCount:required.length,requiredHourTotal:reqHours,electiveCourseMin:groupMin,electiveCourseMax:electives.length,electiveHourMin:0,electiveHourMax:electMax,totalHourMin:reqHours,totalHourMax:total,totalHourTarget:args.declaredTotalHours,groupRules:rules,sourceDecisionNo:args.sourceDecisionNo,sourceDecisionDate:args.sourceDecisionDate,sourceNote:args.sourceNote};}
