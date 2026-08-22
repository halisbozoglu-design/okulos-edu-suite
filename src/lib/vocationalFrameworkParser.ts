import { ParsedConstraint, parseExplanationConstraints } from './officialCourseScheduleParser';

export type VocationalScheduleVariant='AMP'|'ATP'|'AMP_ENTERPRISE_FROM_11'|'MESEM';
export type VocationalCategoryTotals={common:number;vocational:number;electiveVocational:number;elective:number;guidance:number;enterprise:number;total:number};
export type VocationalProfile={schoolType:'MTAL'|'MESEM';variant:VocationalScheduleVariant;fieldName:string;branchName?:string;gradeLevel:number;totals:VocationalCategoryTotals;constraints:ParsedConstraint[];sourcePage?:number;needsReview:boolean};

const clean=(s:string)=>s.replace(/\s+/g,' ').trim();

export function detectScheduleVariant(header:string):VocationalScheduleVariant|undefined{
  const h=header.toLocaleUpperCase('tr-TR');
  if(h.includes('MESLEKİ EĞİTİM MERKEZ')) return 'MESEM';
  if(h.includes('İŞLETMELERDE MESLEKİ EĞİTİME 11. SINIFTA')&&h.includes('ANADOLU MESLEK PROGRAMI')) return 'AMP_ENTERPRISE_FROM_11';
  if(h.includes('ANADOLU TEKNİK PROGRAMI')) return 'ATP';
  if(h.includes('ANADOLU MESLEK PROGRAMI')) return 'AMP';
  return undefined;
}

export function parseFieldBranch(header:string){
  const h=clean(header);
  const field=h.match(/(?:PROGRAMI\s+)?(.+?)\s+ALANI/i)?.[1];
  const branch=h.match(/\((.+?)\s+DALI\)/i)?.[1];
  return {fieldName:field?clean(field):undefined,branchName:branch?clean(branch):undefined};
}

const n=(v?:string)=>v&&v!=='-'?Number(v):0;
export function buildVocationalTotals(args:{common?:string;vocational?:string;electiveVocational?:string;elective?:string;guidance?:string;enterprise?:string;total?:string}):VocationalCategoryTotals{
  return {common:n(args.common),vocational:n(args.vocational),electiveVocational:n(args.electiveVocational),elective:n(args.elective),guidance:n(args.guidance),enterprise:n(args.enterprise),total:n(args.total)};
}

export function parseVocationalApplicationRules(text:string):ParsedConstraint[]{
  const out=parseExplanationConstraints(text);const t=clean(text);const low=t.toLocaleLowerCase('tr-TR');
  if(/9\. sınıfta alana ait temel mesleki becerileri/.test(low)) out.push({type:'FIELD_COMMON_GRADE',severity:'hard',params:{grade:9},sourceText:t});
  if(/10, 11 ve 12\. sınıflarda ise dala ait mesleki becerileri/.test(low)) out.push({type:'BRANCH_SPECIFIC_GRADES',severity:'hard',params:{grades:[10,11,12]},sourceText:t});
  if(/anadolu meslek programında 12\. sınıfta işletmelerde mesleki eğitim/.test(low)) out.push({type:'ENTERPRISE_EDUCATION',severity:'hard',params:{variant:'AMP',grades:[12]},sourceText:t});
  if(/11 ve 12\. sınıflarda işletmelerde mesleki eğitim/.test(low)) out.push({type:'ENTERPRISE_EDUCATION',severity:'hard',params:{variant:'AMP_ENTERPRISE_FROM_11',grades:[11,12],approvalRequired:true},sourceText:t});
  if(/meslek dersleri.*bütünlüğü bozulmadan|birbirini izleyecek şekilde planlanır/.test(low)) out.push({type:'VOCATIONAL_BLOCK_CONTIGUITY',severity:'hard',params:{minimizeFragmentation:true,preferConsecutive:true},sourceText:t});
  if(/tüm sınıf seviyelerinde seçmeli ders gruplarının her birinden en az bir ders/.test(low)) out.push({type:'MIN_COURSE_FROM_EACH_ELECTIVE_GROUP',severity:'hard',params:{minCourses:1},sourceText:t});
  return out;
}

export function validateVocationalProfile(p:VocationalProfile){
  const calculated=p.totals.common+p.totals.vocational+p.totals.electiveVocational+p.totals.elective+p.totals.guidance;
  const enterpriseIncluded=p.totals.enterprise>0&&p.totals.vocational>=p.totals.enterprise;
  const expected=enterpriseIncluded?calculated:calculated+p.totals.enterprise;
  return {valid:p.totals.total===expected||p.totals.total===calculated,declared:p.totals.total,calculated,needsReview:p.needsReview||!(p.totals.total===expected||p.totals.total===calculated)};
}
