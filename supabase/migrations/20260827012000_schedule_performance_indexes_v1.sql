CREATE INDEX IF NOT EXISTS idx_teacher_schedule_perf_active_slot ON public.teacher_schedule (institution_code,weekday,period,teacher_id,class_id,classroom_id) WHERE active=true;
CREATE INDEX IF NOT EXISTS idx_scenario_rows_perf_slot ON public.schedule_scenario_rows (institution_code,scenario_id,weekday,period,teacher_id,class_id,classroom_id);
CREATE INDEX IF NOT EXISTS idx_student_schedule_enrollments_assignment ON public.student_schedule_enrollments (institution_code,teacher_assignment_id,student_id) WHERE active=true;
CREATE INDEX IF NOT EXISTS idx_student_schedule_enrollments_student ON public.student_schedule_enrollments (institution_code,student_id,teacher_assignment_id) WHERE active=true;
