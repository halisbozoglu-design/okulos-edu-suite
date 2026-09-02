import{readFile,readdir,writeFile}from"node:fs/promises";
import path from"node:path";
const root=process.cwd(),baselineVersion="20260821153000",args=process.argv.slice(2),outArg=args.indexOf("--out"),outPath=outArg>=0?args[outArg+1]:null,ci=args.includes("--ci");
const scope=/^(schedule_|teacher_schedule$|teacher_course_assignments$|teacher_unavailability$|class_course_requirements$|classrooms$|class_subgroups$|class_subgroup_students$|student_course_requests$|student_schedule_enrollments$)/;
const migrationDir=path.join(root,"supabase","migrations"),migrationNames=(await readdir(migrationDir)).filter(x=>x.endsWith(".sql")&&x.slice(0,14)>baselineVersion).sort();
const sources=[{file:"supabase/baseline/20260821153000_cloud_baseline.sql",text:await readFile(path.join(root,"supabase/baseline/20260821153000_cloud_baseline.sql"),"utf8"),baseline:true}];
for(const name of migrationNames)sources.push({file:`supabase/migrations/${name}`,text:await readFile(path.join(migrationDir,name),"utf8"),baseline:false});
const declarations=new Map();
function add(table,column,file,baseline){if(!scope.test(table))return;const key=`${table}.${column}`,list=declarations.get(key)??[];list.push({file,baseline});declarations.set(key,list)}
function splitColumns(body){const out=[];let start=0,depth=0,quote=false;for(let i=0;i<body.length;i++){const ch=body[i];if(ch==="'"&&body[i-1]!=="\\")quote=!quote;if(quote)continue;if(ch==="(")depth++;else if(ch===")")depth--;else if(ch===","&&depth===0){out.push(body.slice(start,i));start=i+1}}out.push(body.slice(start));return out}
for(const source of sources){
 const normalized=source.text.replace(/--[^\n]*/g," ");let match;
 const create=/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-z_][a-z0-9_]*)\s*\(([\s\S]*?)\);/gi;
 while((match=create.exec(normalized))){for(const part of splitColumns(match[2])){const m=part.trim().match(/^"?([a-z_][a-z0-9_]*)"?\s+/i);if(m&&!/^(constraint|primary|foreign|unique|check|exclude)$/i.test(m[1]))add(match[1].toLowerCase(),m[1].toLowerCase(),source.file,source.baseline)}}
 const alter=/alter\s+table\s+(?:if\s+exists\s+)?(?:public\.)?([a-z_][a-z0-9_]*)\s+([\s\S]*?);/gi;
 while((match=alter.exec(normalized))){const addColumn=/add\s+column\s+(?:if\s+not\s+exists\s+)?"?([a-z_][a-z0-9_]*)"?/gi;let c;while((c=addColumn.exec(match[2])))add(match[1].toLowerCase(),c[1].toLowerCase(),source.file,source.baseline)}
}
const scanRoots=["src","tests","tools","scripts","desktop","supabase/migrations"],scanFiles=[];
async function walk(dir){for(const e of await readdir(path.join(root,dir),{withFileTypes:true})){const rel=path.join(dir,e.name);if(e.isDirectory())await walk(rel);else if(/\.(ts|tsx|js|mjs|rs|sql)$/.test(e.name))scanFiles.push(rel)}}
for(const dir of scanRoots)await walk(dir);const corpus=await Promise.all(scanFiles.map(async file=>({file,text:await readFile(path.join(root,file),"utf8")})));
const fields=[];for(const[key,defs]of [...declarations].sort()){const[table,column]=key.split("."),needle=new RegExp(`\\b${column.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"gi");let references=0;const files=[];for(const source of corpus){const count=source.text.match(needle)?.length??0,declared=defs.filter(x=>x.file===source.file).length,net=Math.max(0,count-declared);if(net){references+=net;files.push(source.file)}}fields.push({table,column,declarations:defs,references,reference_files:files.length})}
const duplicateForward=fields.filter(x=>x.declarations.filter(d=>!d.baseline).length>1).map(x=>({field:`${x.table}.${x.column}`,files:x.declarations.filter(d=>!d.baseline).map(d=>d.file)}));
const unreferenced=fields.filter(x=>x.references===0).map(x=>`${x.table}.${x.column}`),tables=[...new Set(fields.map(x=>x.table))].sort();
const report={schema:"okulos.schedule-schema-reference-audit.v1",baseline:baselineVersion,generated_at:new Date().toISOString(),scope:"canonical schedule tables from Cloud baseline plus forward migrations",table_count:tables.length,field_count:fields.length,forward_migration_count:migrationNames.length,duplicate_forward_definition_count:duplicateForward.length,unreferenced_field_count:unreferenced.length,duplicate_forward_definitions:duplicateForward,unreferenced_fields:unreferenced,tables};
if(outPath)await writeFile(outPath,JSON.stringify(report,null,2)+"\n");console.log("SCHEDULE_SCHEMA_REFERENCE_AUDIT",JSON.stringify(report));
if(ci&&(duplicateForward.length||unreferenced.length)){console.error(`Canonical schedule schema audit failed: duplicate=${duplicateForward.length}, unreferenced=${unreferenced.length}`);process.exit(1)}
