import {supabase} from "@/lib/supabase";
import {loadLocalScheduleProblem} from "@/lib/schedule-local-solver";
import {solveJointScheduleSectioning,type JointEnrollment,type JointSectionCandidate,type JointSectionRequest} from "@/lib/schedule-joint-sectioning-solver";

type RequestRow={id:string;student_id:string;course_id:string;request_kind:"PRIMARY"|"ALTERNATIVE"|"SUBSTITUTE";priority:number;alternative_group:string|null;allow_overlap:boolean};
type EnrollmentRow={student_id:string;teacher_assignment_id:string;request_id:string|null;locked:boolean};
type CandidateRow={assignment_id:string;capacity:number|null;load:number;medium_penalty:number;soft_penalty:number;is_current:boolean;hard_reasons:string[]};
type FreeRow={student_id:string;weekday:number;periods:number[]};

export type JointRunProgress={stage:"LOAD"|"SEARCH"|"IMPORT";detail:string};
export async function runLocalJointScheduleSectioning(opts:{seed?:number;beamWidth?:number;maxTimetableEvaluations?:number;onProgress?:(p:JointRunProgress)=>void}={}){
 opts.onProgress?.({stage:"LOAD",detail:"Canonical timetable ve öğrenci talepleri okunuyor."});
 const db=supabase as any,[timetable,rq,eq,fq]=await Promise.all([loadLocalScheduleProblem(),db.from("student_course_requests").select("id,student_id,course_id,request_kind,priority,alternative_group,allow_overlap").eq("active",true),db.from("student_schedule_enrollments").select("student_id,teacher_assignment_id,request_id,locked").eq("active",true).eq("locked",true),db.from("student_free_time_requests").select("student_id,weekday,periods").eq("active",true).eq("mode","HARD")]);
 if(rq.error||eq.error||fq.error)throw(rq.error??eq.error??fq.error);const requests=(rq.data??[]) as RequestRow[],lockedRows=(eq.data??[]) as EnrollmentRow[],hardFree=(fq.data??[]) as FreeRow[];
 const assignmentCourse=new Map(timetable.assignments.map((a:{assignment_id:string;course_id:string})=>[a.assignment_id,a.course_id])),requestById=new Map(requests.map(r=>[r.id,r])),pending=requests.filter(r=>!lockedRows.some(e=>e.student_id===r.student_id&&(assignmentCourse.get(e.teacher_assignment_id)===r.course_id||Boolean(r.alternative_group&&e.request_id&&requestById.get(e.request_id)?.alternative_group===r.alternative_group))));
 const candidateResults=await Promise.all(pending.map(r=>db.rpc("get_student_section_candidates_v2",{p_request_id:r.id})));
 const error=candidateResults.find(x=>x.error)?.error;if(error)throw error;
 const jointRequests:JointSectionRequest[]=pending.map((r,i)=>{const raw=(candidateResults[i]?.data??[]) as CandidateRow[],candidates:JointSectionCandidate[]=raw.filter(c=>!c.hard_reasons?.includes("CAPACITY_UNKNOWN")&&!c.hard_reasons?.includes("LOCKED_SECTION")).map(c=>({assignment_id:String(c.assignment_id),capacity:c.capacity==null?null:Number(c.capacity),current_load:0,medium_penalty:Number(c.medium_penalty),soft_penalty:Number(c.soft_penalty),current:Boolean(c.is_current)}));return{request_id:r.id,student_id:r.student_id,course_id:r.course_id,request_kind:r.request_kind,priority:Number(r.priority),alternative_group:r.alternative_group,allow_overlap:Boolean(r.allow_overlap),candidates};});
 const existing_locked:JointEnrollment[]=lockedRows.map(e=>({request_id:e.request_id??`locked:${e.student_id}:${e.teacher_assignment_id}`,student_id:e.student_id,assignment_id:e.teacher_assignment_id,locked:true,allow_overlap:e.request_id?Boolean(requestById.get(e.request_id)?.allow_overlap):false}));
 opts.onProgress?.({stage:"SEARCH",detail:`${jointRequests.length} talep timetable ile aynı çözüm uzayında değerlendiriliyor.`});
 const solution=solveJointScheduleSectioning({timetable:{...timetable,seed:(opts.seed??Date.now())>>>0},requests:jointRequests,existing_locked,hard_free_time:hardFree.map(f=>({student_id:f.student_id,weekday:Number(f.weekday),periods:f.periods.map(Number)})),beam_width:opts.beamWidth??48,max_timetable_evaluations:opts.maxTimetableEvaluations??48});
 if(!solution.complete)throw new Error(`JOINT_SOLUTION_INCOMPLETE hard=${solution.score.hard} primary=${solution.score.unassigned_primary}`);
 opts.onProgress?.({stage:"IMPORT",detail:"Joint aday server canonical audit kapısına gönderiliyor."});
 const rows=solution.timetable.rows.map(r=>({assignment_id:r.assignment_id,weekday:r.weekday,period:r.period,classroom_id:r.classroom_id??null,subgroup_id:r.subgroup_id??null,locked:r.locked}));
 const enrollments=solution.enrollments.map(e=>({student_id:e.student_id,assignment_id:e.assignment_id,request_id:e.request_id.startsWith("locked:")?null:e.request_id,locked:e.locked,allow_overlap:e.allow_overlap}));
 const imported=await db.rpc("import_joint_schedule_candidate_v1",{p_rows:rows,p_enrollments:enrollments,p_title:"Joint timetable + sectioning adayı"});if(imported.error)throw imported.error;
 return{scenarioId:String(imported.data),solution};
}
