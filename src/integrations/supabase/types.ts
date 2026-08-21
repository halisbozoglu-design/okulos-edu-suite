export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      absence_lessons: {
        Row: {
          class_id: string | null
          class_name: string
          crisis_report_id: string
          id: string
          institution_code: string | null
          lesson_date: string
          period: number
          subject: string
          teacher_id: string
        }
        Insert: {
          class_id?: string | null
          class_name: string
          crisis_report_id: string
          id?: string
          institution_code?: string | null
          lesson_date: string
          period: number
          subject: string
          teacher_id: string
        }
        Update: {
          class_id?: string | null
          class_name?: string
          crisis_report_id?: string
          id?: string
          institution_code?: string | null
          lesson_date?: string
          period?: number
          subject?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "absence_lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "absence_lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absence_lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absence_lessons_crisis_report_id_fkey"
            columns: ["crisis_report_id"]
            isOneToOne: false
            referencedRelation: "crisis_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absence_lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "absence_lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_absence_lessons_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      absences: {
        Row: {
          absence_date: string
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          crisis_report_id: string
          has_medical_report: boolean
          id: string
          institution_code: string | null
          note: string | null
          status: string
          teacher_id: string
        }
        Insert: {
          absence_date: string
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          crisis_report_id: string
          has_medical_report?: boolean
          id?: string
          institution_code?: string | null
          note?: string | null
          status?: string
          teacher_id: string
        }
        Update: {
          absence_date?: string
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          crisis_report_id?: string
          has_medical_report?: boolean
          id?: string
          institution_code?: string | null
          note?: string | null
          status?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "absences_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "absences_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "absences_crisis_report_id_fkey"
            columns: ["crisis_report_id"]
            isOneToOne: true
            referencedRelation: "crisis_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absences_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "absences_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_absences_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      academic_years: {
        Row: {
          active: boolean
          code: string
          created_at: string
          created_by: string | null
          ends_on: string
          first_term_ends_on: string | null
          id: string
          institution_code: string | null
          second_term_starts_on: string | null
          source_note: string | null
          starts_on: string
          teacher_work_starts_on: string | null
          teaching_ends_on: string | null
          teaching_starts_on: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          ends_on: string
          first_term_ends_on?: string | null
          id?: string
          institution_code?: string | null
          second_term_starts_on?: string | null
          source_note?: string | null
          starts_on: string
          teacher_work_starts_on?: string | null
          teaching_ends_on?: string | null
          teaching_starts_on?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          ends_on?: string
          first_term_ends_on?: string | null
          id?: string
          institution_code?: string | null
          second_term_starts_on?: string | null
          source_note?: string | null
          starts_on?: string
          teacher_work_starts_on?: string | null
          teaching_ends_on?: string | null
          teaching_starts_on?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "academic_years_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_academic_years_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      area_course_permissions: {
        Row: {
          active: boolean
          condition_note: string | null
          course_id: string
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          priority_order: number
          source_id: string | null
          teaching_area_id: string
        }
        Insert: {
          active?: boolean
          condition_note?: string | null
          course_id: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          priority_order?: number
          source_id?: string | null
          teaching_area_id: string
        }
        Update: {
          active?: boolean
          condition_note?: string | null
          course_id?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          priority_order?: number
          source_id?: string | null
          teaching_area_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "area_course_permissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "area_course_permissions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "legal_rule_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "area_course_permissions_teaching_area_id_fkey"
            columns: ["teaching_area_id"]
            isOneToOne: false
            referencedRelation: "teaching_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_audit_log: {
        Row: {
          absence_lesson_id: string | null
          action: string
          actor_user_id: string | null
          assignment_id: string | null
          created_at: string
          id: number
          institution_code: string | null
          metadata: Json
          new_substitute_user_id: string | null
          old_substitute_user_id: string | null
        }
        Insert: {
          absence_lesson_id?: string | null
          action: string
          actor_user_id?: string | null
          assignment_id?: string | null
          created_at?: string
          id?: never
          institution_code?: string | null
          metadata?: Json
          new_substitute_user_id?: string | null
          old_substitute_user_id?: string | null
        }
        Update: {
          absence_lesson_id?: string | null
          action?: string
          actor_user_id?: string | null
          assignment_id?: string | null
          created_at?: string
          id?: never
          institution_code?: string | null
          metadata?: Json
          new_substitute_user_id?: string | null
          old_substitute_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_audit_log_absence_lesson_id_fkey"
            columns: ["absence_lesson_id"]
            isOneToOne: false
            referencedRelation: "absence_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "assignment_audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "assignment_audit_log_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "substitute_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_audit_log_new_substitute_user_id_fkey"
            columns: ["new_substitute_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "assignment_audit_log_new_substitute_user_id_fkey"
            columns: ["new_substitute_user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "assignment_audit_log_old_substitute_user_id_fkey"
            columns: ["old_substitute_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "assignment_audit_log_old_substitute_user_id_fkey"
            columns: ["old_substitute_user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_assignment_audit_log_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      calendar_event_tasks: {
        Row: {
          assigned_personnel_id: string | null
          assigned_responsibility_id: string | null
          assigned_user_id: string | null
          calendar_event_id: string
          created_at: string
          due_on: string | null
          file_required: boolean
          id: string
          institution_code: string | null
          note: string | null
          recurrence: string
          report_frequency: string | null
          report_required: boolean
          starts_on: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_personnel_id?: string | null
          assigned_responsibility_id?: string | null
          assigned_user_id?: string | null
          calendar_event_id: string
          created_at?: string
          due_on?: string | null
          file_required?: boolean
          id?: string
          institution_code?: string | null
          note?: string | null
          recurrence?: string
          report_frequency?: string | null
          report_required?: boolean
          starts_on?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_personnel_id?: string | null
          assigned_responsibility_id?: string | null
          assigned_user_id?: string | null
          calendar_event_id?: string
          created_at?: string
          due_on?: string | null
          file_required?: boolean
          id?: string
          institution_code?: string | null
          note?: string | null
          recurrence?: string
          report_frequency?: string | null
          report_required?: boolean
          starts_on?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_event_tasks_assigned_personnel_id_fkey"
            columns: ["assigned_personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_event_tasks_assigned_responsibility_id_fkey"
            columns: ["assigned_responsibility_id"]
            isOneToOne: false
            referencedRelation: "responsibility_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_event_tasks_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "school_calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_calendar_event_tasks_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      calendar_task_files: {
        Row: {
          file_name: string | null
          file_url: string
          id: string
          institution_code: string | null
          task_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_name?: string | null
          file_url: string
          id?: string
          institution_code?: string | null
          task_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string | null
          file_url?: string
          id?: string
          institution_code?: string | null
          task_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_task_files_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "calendar_event_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_calendar_task_files_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      class_course_requirements: {
        Row: {
          category: string
          class_id: string
          course_id: string
          created_at: string
          id: string
          institution_code: string | null
          locked: boolean
          note: string | null
          source_template_id: string | null
          updated_at: string
          weekly_hours: number
        }
        Insert: {
          category?: string
          class_id: string
          course_id: string
          created_at?: string
          id?: string
          institution_code?: string | null
          locked?: boolean
          note?: string | null
          source_template_id?: string | null
          updated_at?: string
          weekly_hours: number
        }
        Update: {
          category?: string
          class_id?: string
          course_id?: string
          created_at?: string
          id?: string
          institution_code?: string | null
          locked?: boolean
          note?: string | null
          source_template_id?: string | null
          updated_at?: string
          weekly_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_course_requirements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "class_course_requirements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_course_requirements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_course_requirements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_course_requirements_source_template_id_fkey"
            columns: ["source_template_id"]
            isOneToOne: false
            referencedRelation: "curriculum_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_class_course_requirements_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      class_subgroup_students: {
        Row: {
          institution_code: string | null
          student_id: string
          subgroup_id: string
        }
        Insert: {
          institution_code?: string | null
          student_id: string
          subgroup_id: string
        }
        Update: {
          institution_code?: string | null
          student_id?: string
          subgroup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_subgroup_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subgroup_students_subgroup_id_fkey"
            columns: ["subgroup_id"]
            isOneToOne: false
            referencedRelation: "class_subgroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_class_subgroup_students_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      class_subgroups: {
        Row: {
          active: boolean
          class_id: string
          id: string
          institution_code: string | null
          label: string | null
          subgroup_key: string
        }
        Insert: {
          active?: boolean
          class_id: string
          id?: string
          institution_code?: string | null
          label?: string | null
          subgroup_key: string
        }
        Update: {
          active?: boolean
          class_id?: string
          id?: string
          institution_code?: string | null
          label?: string | null
          subgroup_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_subgroups_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "class_subgroups_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subgroups_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_class_subgroups_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      classrooms: {
        Row: {
          active: boolean
          capacity: number
          created_at: string
          department: string | null
          hardware: Json
          id: string
          institution_code: string | null
          name: string
          room_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          capacity: number
          created_at?: string
          department?: string | null
          hardware?: Json
          id?: string
          institution_code?: string | null
          name: string
          room_type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          capacity?: number
          created_at?: string
          department?: string | null
          hardware?: Json
          id?: string
          institution_code?: string | null
          name?: string
          room_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_classrooms_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      course_catalog: {
        Row: {
          active: boolean
          category: string
          code: string | null
          created_at: string
          id: string
          name: string
          short_name: string | null
        }
        Insert: {
          active?: boolean
          category?: string
          code?: string | null
          created_at?: string
          id?: string
          name: string
          short_name?: string | null
        }
        Update: {
          active?: boolean
          category?: string
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          short_name?: string | null
        }
        Relationships: []
      }
      course_pedagogy_profiles: {
        Row: {
          academic_load: number
          attention_load: number
          avoid_early: boolean
          course_id: string
          difficulty: number
          institution_code: string
          is_vocational_practice: boolean
          is_workshop: boolean
          lesson_family: string | null
          physical_load: number
          practical_load: number
          prefer_early: boolean
          prefer_weekdays: number[]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          academic_load?: number
          attention_load?: number
          avoid_early?: boolean
          course_id: string
          difficulty?: number
          institution_code?: string
          is_vocational_practice?: boolean
          is_workshop?: boolean
          lesson_family?: string | null
          physical_load?: number
          practical_load?: number
          prefer_early?: boolean
          prefer_weekdays?: number[]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          academic_load?: number
          attention_load?: number
          avoid_early?: boolean
          course_id?: string
          difficulty?: number
          institution_code?: string
          is_vocational_practice?: boolean
          is_workshop?: boolean
          lesson_family?: string | null
          physical_load?: number
          practical_load?: number
          prefer_early?: boolean
          prefer_weekdays?: number[]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_pedagogy_profiles_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_pedagogy_profiles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "course_pedagogy_profiles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_course_pedagogy_profiles_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      course_schedule_rules: {
        Row: {
          active: boolean
          avoid_last_period: boolean
          block_pattern: number[]
          course_id: string
          id: string
          institution_code: string | null
          max_per_day: number | null
          min_distinct_days: number | null
          note: string | null
          preferred_days: number[]
          preferred_periods: number[]
          prohibited_days: number[]
          prohibited_periods: number[]
          updated_at: string
        }
        Insert: {
          active?: boolean
          avoid_last_period?: boolean
          block_pattern?: number[]
          course_id: string
          id?: string
          institution_code?: string | null
          max_per_day?: number | null
          min_distinct_days?: number | null
          note?: string | null
          preferred_days?: number[]
          preferred_periods?: number[]
          prohibited_days?: number[]
          prohibited_periods?: number[]
          updated_at?: string
        }
        Update: {
          active?: boolean
          avoid_last_period?: boolean
          block_pattern?: number[]
          course_id?: string
          id?: string
          institution_code?: string | null
          max_per_day?: number | null
          min_distinct_days?: number | null
          note?: string | null
          preferred_days?: number[]
          preferred_periods?: number[]
          prohibited_days?: number[]
          prohibited_periods?: number[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_schedule_rules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_course_schedule_rules_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      crisis_reports: {
        Row: {
          created_at: string
          has_medical_report: boolean
          id: string
          institution_code: string | null
          note: string | null
          report_date: string
          status: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          has_medical_report?: boolean
          id?: string
          institution_code?: string | null
          note?: string | null
          report_date?: string
          status?: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          has_medical_report?: boolean
          id?: string
          institution_code?: string | null
          note?: string | null
          report_date?: string
          status?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crisis_reports_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "crisis_reports_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_crisis_reports_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      curriculum_template_courses: {
        Row: {
          category: string
          course_id: string
          id: string
          institution_code: string | null
          sort_order: number
          template_id: string
          weekly_hours: number
        }
        Insert: {
          category?: string
          course_id: string
          id?: string
          institution_code?: string | null
          sort_order?: number
          template_id: string
          weekly_hours: number
        }
        Update: {
          category?: string
          course_id?: string
          id?: string
          institution_code?: string | null
          sort_order?: number
          template_id?: string
          weekly_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_template_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_template_courses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "curriculum_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_curriculum_template_courses_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      curriculum_templates: {
        Row: {
          academic_year: string | null
          active: boolean
          created_at: string
          created_by: string | null
          expected_weekly_hours: number | null
          grade_level: number | null
          id: string
          institution_code: string | null
          name: string
          program_type: string | null
          school_level: string | null
          source_note: string | null
        }
        Insert: {
          academic_year?: string | null
          active?: boolean
          created_at?: string
          created_by?: string | null
          expected_weekly_hours?: number | null
          grade_level?: number | null
          id?: string
          institution_code?: string | null
          name: string
          program_type?: string | null
          school_level?: string | null
          source_note?: string | null
        }
        Update: {
          academic_year?: string | null
          active?: boolean
          created_at?: string
          created_by?: string | null
          expected_weekly_hours?: number | null
          grade_level?: number | null
          id?: string
          institution_code?: string | null
          name?: string
          program_type?: string | null
          school_level?: string | null
          source_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "curriculum_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_curriculum_templates_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      duty_assignment_history: {
        Row: {
          assignment_type: string
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          duty_date: string
          duty_location: string | null
          effective_end_date: string | null
          effective_start_date: string
          id: number
          institution_code: string | null
          new_record: Json | null
          previous_record: Json | null
          source: string
          subject_user_id: string
        }
        Insert: {
          assignment_type: string
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          duty_date: string
          duty_location?: string | null
          effective_end_date?: string | null
          effective_start_date: string
          id?: never
          institution_code?: string | null
          new_record?: Json | null
          previous_record?: Json | null
          source?: string
          subject_user_id: string
        }
        Update: {
          assignment_type?: string
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          duty_date?: string
          duty_location?: string | null
          effective_end_date?: string | null
          effective_start_date?: string
          id?: never
          institution_code?: string | null
          new_record?: Json | null
          previous_record?: Json | null
          source?: string
          subject_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "duty_assignment_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "duty_assignment_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "duty_assignment_history_subject_user_id_fkey"
            columns: ["subject_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "duty_assignment_history_subject_user_id_fkey"
            columns: ["subject_user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_duty_assignment_history_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      duty_day_notes: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          duty_date: string
          empty_lesson_resolution: string | null
          end_time: string | null
          general_note: string | null
          institution_code: string | null
          principal_approval_note: string | null
          start_time: string | null
          teaching_mode: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          duty_date: string
          empty_lesson_resolution?: string | null
          end_time?: string | null
          general_note?: string | null
          institution_code?: string | null
          principal_approval_note?: string | null
          start_time?: string | null
          teaching_mode?: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          duty_date?: string
          empty_lesson_resolution?: string | null
          end_time?: string | null
          general_note?: string | null
          institution_code?: string | null
          principal_approval_note?: string | null
          start_time?: string | null
          teaching_mode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "duty_day_notes_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "duty_day_notes_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_duty_day_notes_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      duty_incident_logs: {
        Row: {
          action_taken: string | null
          created_at: string
          description: string
          duty_date: string
          duty_location: string | null
          id: string
          institution_code: string | null
          occurred_at: string
          reporter_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          description: string
          duty_date: string
          duty_location?: string | null
          id?: string
          institution_code?: string | null
          occurred_at?: string
          reporter_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          description?: string
          duty_date?: string
          duty_location?: string | null
          id?: string
          institution_code?: string | null
          occurred_at?: string
          reporter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duty_incident_logs_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "duty_incident_logs_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_duty_incident_logs_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      duty_locations: {
        Row: {
          active: boolean
          critical: boolean
          id: string
          institution_code: string | null
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          critical?: boolean
          id?: string
          institution_code?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          critical?: boolean
          id?: string
          institution_code?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_duty_locations_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      duty_month_locks: {
        Row: {
          generated_at: string
          generated_by: string | null
          institution_code: string | null
          locked: boolean
          month_start: string
          note: string | null
          schedule_signature: string | null
        }
        Insert: {
          generated_at?: string
          generated_by?: string | null
          institution_code?: string | null
          locked?: boolean
          month_start: string
          note?: string | null
          schedule_signature?: string | null
        }
        Update: {
          generated_at?: string
          generated_by?: string | null
          institution_code?: string | null
          locked?: boolean
          month_start?: string
          note?: string | null
          schedule_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duty_month_locks_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "duty_month_locks_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_duty_month_locks_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      duty_rotation: {
        Row: {
          assignment_source: string
          created_at: string
          cycle_month: string | null
          duty_date: string
          institution_code: string
          vice_principal_id: string
        }
        Insert: {
          assignment_source?: string
          created_at?: string
          cycle_month?: string | null
          duty_date: string
          institution_code?: string
          vice_principal_id: string
        }
        Update: {
          assignment_source?: string
          created_at?: string
          cycle_month?: string | null
          duty_date?: string
          institution_code?: string
          vice_principal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "duty_rotation_vice_principal_id_fkey"
            columns: ["vice_principal_id"]
            isOneToOne: false
            referencedRelation: "vice_principals"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_duty_rotation_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      duty_tardiness_logs: {
        Row: {
          class_name: string | null
          created_at: string
          duty_date: string
          id: string
          institution_code: string | null
          minutes_late: number
          note: string | null
          period: number | null
          recorded_by: string | null
          teacher_id: string
        }
        Insert: {
          class_name?: string | null
          created_at?: string
          duty_date: string
          id?: string
          institution_code?: string | null
          minutes_late: number
          note?: string | null
          period?: number | null
          recorded_by?: string | null
          teacher_id: string
        }
        Update: {
          class_name?: string | null
          created_at?: string
          duty_date?: string
          id?: string
          institution_code?: string | null
          minutes_late?: number
          note?: string | null
          period?: number | null
          recorded_by?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "duty_tardiness_logs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "duty_tardiness_logs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "duty_tardiness_logs_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "duty_tardiness_logs_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_duty_tardiness_logs_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      eokul_import_batches: {
        Row: {
          file_name: string
          file_type: string
          id: string
          imported_at: string
          imported_by: string
          institution_code: string | null
          row_count: number
        }
        Insert: {
          file_name: string
          file_type: string
          id?: string
          imported_at?: string
          imported_by: string
          institution_code?: string | null
          row_count?: number
        }
        Update: {
          file_name?: string
          file_type?: string
          id?: string
          imported_at?: string
          imported_by?: string
          institution_code?: string | null
          row_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "eokul_import_batches_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "eokul_import_batches_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_eokul_import_batches_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      fcm_tokens: {
        Row: {
          id: string
          institution_code: string | null
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          institution_code?: string | null
          platform?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          institution_code?: string | null
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fcm_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fcm_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_fcm_tokens_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      institution_memberships: {
        Row: {
          active: boolean
          created_at: string
          institution_code: string
          is_owner: boolean
          membership_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          institution_code: string
          is_owner?: boolean
          membership_role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          institution_code?: string
          is_owner?: boolean
          membership_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_memberships_institution_code_fkey"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      institution_principals: {
        Row: {
          active: boolean
          assigned_at: string
          institution_code: string
          user_id: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          institution_code: string
          user_id: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          institution_code?: string
          user_id?: string
        }
        Relationships: []
      }
      institutions: {
        Row: {
          approval_note: string | null
          approval_status: string
          created_at: string
          created_by: string | null
          institution_code: string
          reviewed_at: string | null
          reviewed_by: string | null
          school_name: string
          status: string
          updated_at: string
        }
        Insert: {
          approval_note?: string | null
          approval_status?: string
          created_at?: string
          created_by?: string | null
          institution_code: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          approval_note?: string | null
          approval_status?: string
          created_at?: string
          created_by?: string | null
          institution_code?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_rule_sources: {
        Row: {
          active: boolean
          authority: string
          code: string
          created_at: string
          decision_date: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          note: string | null
          source_url: string | null
          title: string
        }
        Insert: {
          active?: boolean
          authority: string
          code: string
          created_at?: string
          decision_date?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          note?: string | null
          source_url?: string | null
          title: string
        }
        Update: {
          active?: boolean
          authority?: string
          code?: string
          created_at?: string
          decision_date?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          note?: string | null
          source_url?: string | null
          title?: string
        }
        Relationships: []
      }
      legislation_library: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          effective_on: string | null
          file_url: string | null
          id: string
          institution_code: string | null
          legislation_type: string
          notes: string | null
          school_levels: string[]
          school_types: string[]
          source_url: string | null
          tags: string[]
          title: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          effective_on?: string | null
          file_url?: string | null
          id?: string
          institution_code?: string | null
          legislation_type?: string
          notes?: string | null
          school_levels?: string[]
          school_types?: string[]
          source_url?: string | null
          tags?: string[]
          title: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          effective_on?: string | null
          file_url?: string | null
          id?: string
          institution_code?: string | null
          legislation_type?: string
          notes?: string | null
          school_levels?: string[]
          school_types?: string[]
          source_url?: string | null
          tags?: string[]
          title?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_legislation_library_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      legislation_shares: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          institution_code: string | null
          legislation_id: string
          message: string | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          institution_code?: string | null
          legislation_id: string
          message?: string | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          institution_code?: string | null
          legislation_id?: string
          message?: string | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_legislation_shares_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "legislation_shares_legislation_id_fkey"
            columns: ["legislation_id"]
            isOneToOne: false
            referencedRelation: "legislation_library"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_room_rules: {
        Row: {
          active: boolean
          id: string
          institution_code: string | null
          required_department: string | null
          required_hardware: Json
          required_room_type: string | null
          subject_pattern: string
        }
        Insert: {
          active?: boolean
          id?: string
          institution_code?: string | null
          required_department?: string | null
          required_hardware?: Json
          required_room_type?: string | null
          subject_pattern: string
        }
        Update: {
          active?: boolean
          id?: string
          institution_code?: string | null
          required_department?: string | null
          required_hardware?: Json
          required_room_type?: string | null
          subject_pattern?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lesson_room_rules_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      norm_area_rule_assignments: {
        Row: {
          active: boolean
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          institution_code: string | null
          note: string | null
          rule_set_id: string
          source_id: string | null
          teaching_area_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          effective_from: string
          effective_to?: string | null
          id?: string
          institution_code?: string | null
          note?: string | null
          rule_set_id: string
          source_id?: string | null
          teaching_area_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          institution_code?: string | null
          note?: string | null
          rule_set_id?: string
          source_id?: string | null
          teaching_area_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_norm_area_rule_assignments_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "norm_area_rule_assignments_rule_set_id_fkey"
            columns: ["rule_set_id"]
            isOneToOne: false
            referencedRelation: "norm_rule_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "norm_area_rule_assignments_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "legal_rule_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "norm_area_rule_assignments_teaching_area_id_fkey"
            columns: ["teaching_area_id"]
            isOneToOne: false
            referencedRelation: "teaching_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      norm_course_area_rules: {
        Row: {
          active: boolean
          course_id: string
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          institution_code: string | null
          note: string | null
          source_id: string | null
          teaching_area_id: string
        }
        Insert: {
          active?: boolean
          course_id: string
          created_at?: string
          effective_from: string
          effective_to?: string | null
          id?: string
          institution_code?: string | null
          note?: string | null
          source_id?: string | null
          teaching_area_id: string
        }
        Update: {
          active?: boolean
          course_id?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          institution_code?: string | null
          note?: string | null
          source_id?: string | null
          teaching_area_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_norm_course_area_rules_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "norm_course_area_rules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "norm_course_area_rules_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "legal_rule_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "norm_course_area_rules_teaching_area_id_fkey"
            columns: ["teaching_area_id"]
            isOneToOne: false
            referencedRelation: "teaching_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      norm_rule_bands: {
        Row: {
          id: string
          max_hours: number | null
          min_hours: number
          norm_count: number
          rule_set_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          max_hours?: number | null
          min_hours: number
          norm_count: number
          rule_set_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          max_hours?: number | null
          min_hours?: number
          norm_count?: number
          rule_set_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "norm_rule_bands_rule_set_id_fkey"
            columns: ["rule_set_id"]
            isOneToOne: false
            referencedRelation: "norm_rule_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      norm_rule_sets: {
        Row: {
          active: boolean
          code: string
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          name: string
          note: string | null
          remainder_min_hours: number | null
          repeating_block_hours: number | null
          source_id: string | null
          teacher_category: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          effective_from: string
          effective_to?: string | null
          id?: string
          name: string
          note?: string | null
          remainder_min_hours?: number | null
          repeating_block_hours?: number | null
          source_id?: string | null
          teacher_category: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          name?: string
          note?: string | null
          remainder_min_hours?: number | null
          repeating_block_hours?: number | null
          source_id?: string | null
          teacher_category?: string
        }
        Relationships: [
          {
            foreignKeyName: "norm_rule_sets_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "legal_rule_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          id: string
          message: string
          priority: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          priority?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      payroll_activity_entries: {
        Row: {
          activity_date: string
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string
          entered_by: string | null
          evidence_reference: string | null
          explanation: string | null
          hours: number
          id: string
          institution_code: string | null
          rule_id: string | null
          status: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          activity_date: string
          approved_at?: string | null
          approved_by?: string | null
          category: string
          created_at?: string
          entered_by?: string | null
          evidence_reference?: string | null
          explanation?: string | null
          hours: number
          id?: string
          institution_code?: string | null
          rule_id?: string | null
          status?: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          activity_date?: string
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          entered_by?: string | null
          evidence_reference?: string | null
          explanation?: string | null
          hours?: number
          id?: string
          institution_code?: string | null
          rule_id?: string | null
          status?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payroll_activity_entries_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "payroll_activity_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_activity_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "payroll_activity_entries_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_activity_entries_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "payroll_activity_entries_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "payroll_rule_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_activity_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_activity_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      payroll_calculation_runs: {
        Row: {
          calculated_by: string
          created_at: string
          id: string
          institution_code: string | null
          period_end: string
          period_start: string
          rule_version: string
          status: string
        }
        Insert: {
          calculated_by: string
          created_at?: string
          id?: string
          institution_code?: string | null
          period_end: string
          period_start: string
          rule_version?: string
          status?: string
        }
        Update: {
          calculated_by?: string
          created_at?: string
          id?: string
          institution_code?: string | null
          period_end?: string
          period_start?: string
          rule_version?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payroll_calculation_runs_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "payroll_calculation_runs_calculated_by_fkey"
            columns: ["calculated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_calculation_runs_calculated_by_fkey"
            columns: ["calculated_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      payroll_calendar: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          calendar_date: string
          day_type: string
          deemed_guidance_performed: boolean
          deemed_regular_performed: boolean
          duty_payable: boolean
          institution_code: string | null
          source_note: string | null
          title: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          calendar_date: string
          day_type: string
          deemed_guidance_performed?: boolean
          deemed_regular_performed?: boolean
          duty_payable?: boolean
          institution_code?: string | null
          source_note?: string | null
          title: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          calendar_date?: string
          day_type?: string
          deemed_guidance_performed?: boolean
          deemed_regular_performed?: boolean
          duty_payable?: boolean
          institution_code?: string | null
          source_note?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payroll_calendar_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "payroll_calendar_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_calendar_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      payroll_day_entries: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          calculated: boolean
          category: string
          created_at: string
          evidence_note: string | null
          explanation: string | null
          hours: number
          id: string
          institution_code: string | null
          kbs_data_type: string
          rate_multiplier: number
          rule_code: string | null
          source_id: string | null
          source_type: string
          teacher_id: string
          work_date: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          calculated?: boolean
          category: string
          created_at?: string
          evidence_note?: string | null
          explanation?: string | null
          hours?: number
          id?: string
          institution_code?: string | null
          kbs_data_type?: string
          rate_multiplier?: number
          rule_code?: string | null
          source_id?: string | null
          source_type: string
          teacher_id: string
          work_date: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          calculated?: boolean
          category?: string
          created_at?: string
          evidence_note?: string | null
          explanation?: string | null
          hours?: number
          id?: string
          institution_code?: string | null
          kbs_data_type?: string
          rate_multiplier?: number
          rule_code?: string | null
          source_id?: string | null
          source_type?: string
          teacher_id?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payroll_day_entries_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "payroll_day_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_day_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "payroll_day_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_day_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      payroll_dirty_periods: {
        Row: {
          institution_code: string | null
          marked_at: string
          month: number
          reason: string
          teacher_id: string
          year: number
        }
        Insert: {
          institution_code?: string | null
          marked_at?: string
          month: number
          reason: string
          teacher_id: string
          year: number
        }
        Update: {
          institution_code?: string | null
          marked_at?: string
          month?: number
          reason?: string
          teacher_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_payroll_dirty_periods_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "payroll_dirty_periods_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_dirty_periods_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      payroll_rule_registry: {
        Row: {
          active: boolean
          category: string
          code: string
          condition_note: string | null
          created_at: string
          created_by: string | null
          effective_from: string
          effective_to: string | null
          id: string
          institution_code: string | null
          kbs_data_type: string
          monthly_cap_hours: number | null
          name: string
          rate_multiplier: number
          requires_actual_performance: boolean
          source_id: string | null
          weekly_cap_hours: number | null
        }
        Insert: {
          active?: boolean
          category: string
          code: string
          condition_note?: string | null
          created_at?: string
          created_by?: string | null
          effective_from: string
          effective_to?: string | null
          id?: string
          institution_code?: string | null
          kbs_data_type: string
          monthly_cap_hours?: number | null
          name: string
          rate_multiplier?: number
          requires_actual_performance?: boolean
          source_id?: string | null
          weekly_cap_hours?: number | null
        }
        Update: {
          active?: boolean
          category?: string
          code?: string
          condition_note?: string | null
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          institution_code?: string | null
          kbs_data_type?: string
          monthly_cap_hours?: number | null
          name?: string
          rate_multiplier?: number
          requires_actual_performance?: boolean
          source_id?: string | null
          weekly_cap_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payroll_rule_registry_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "payroll_rule_registry_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_rule_registry_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "payroll_rule_registry_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "legal_rule_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_audit_log: {
        Row: {
          actor_user_id: string | null
          created_at: string
          id: string
          institution_code: string | null
          note: string | null
          operation: string
          permission_code: string
          scope: Json
          target_user_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          institution_code?: string | null
          note?: string | null
          operation: string
          permission_code: string
          scope?: Json
          target_user_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          institution_code?: string | null
          note?: string | null
          operation?: string
          permission_code?: string
          scope?: Json
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_permission_audit_log_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "permission_audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "permission_audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "permission_audit_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "permission_audit_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      permission_catalog: {
        Row: {
          action: string
          active: boolean
          code: string
          created_at: string
          dangerous: boolean
          description: string | null
          label: string
          module_code: string
          module_label: string
          sort_order: number
        }
        Insert: {
          action: string
          active?: boolean
          code: string
          created_at?: string
          dangerous?: boolean
          description?: string | null
          label: string
          module_code: string
          module_label: string
          sort_order?: number
        }
        Update: {
          action?: string
          active?: boolean
          code?: string
          created_at?: string
          dangerous?: boolean
          description?: string | null
          label?: string
          module_code?: string
          module_label?: string
          sort_order?: number
        }
        Relationships: []
      }
      personnel_field_catalog: {
        Row: {
          data_class: string
          display_name: string
          enabled: boolean
          field_key: string
          first_seen_at: string
          last_seen_at: string
          module_keys: string[]
          source_headers: string[]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          data_class?: string
          display_name: string
          enabled?: boolean
          field_key: string
          first_seen_at?: string
          last_seen_at?: string
          module_keys?: string[]
          source_headers?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          data_class?: string
          display_name?: string
          enabled?: boolean
          field_key?: string
          first_seen_at?: string
          last_seen_at?: string
          module_keys?: string[]
          source_headers?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      personnel_field_overrides: {
        Row: {
          enabled: boolean | null
          field_key: string
          institution_code: string
          module_keys: string[] | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          enabled?: boolean | null
          field_key: string
          institution_code?: string
          module_keys?: string[] | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          enabled?: boolean | null
          field_key?: string
          institution_code?: string
          module_keys?: string[] | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_personnel_field_overrides_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "personnel_field_overrides_field_key_fkey"
            columns: ["field_key"]
            isOneToOne: false
            referencedRelation: "personnel_field_catalog"
            referencedColumns: ["field_key"]
          },
        ]
      }
      personnel_import_payloads: {
        Row: {
          id: string
          imported_at: string
          institution_code: string | null
          is_current: boolean
          personnel_id: string
          raw_data: Json
          source_file_name: string | null
          source_format: string | null
        }
        Insert: {
          id?: string
          imported_at?: string
          institution_code?: string | null
          is_current?: boolean
          personnel_id: string
          raw_data?: Json
          source_file_name?: string | null
          source_format?: string | null
        }
        Update: {
          id?: string
          imported_at?: string
          institution_code?: string | null
          is_current?: boolean
          personnel_id?: string
          raw_data?: Json
          source_file_name?: string | null
          source_format?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_personnel_import_payloads_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "personnel_import_payloads_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel_private_details: {
        Row: {
          archive_no: string | null
          base_title: string | null
          birth_date: string | null
          blood_group: string | null
          career_stage: string | null
          district: string | null
          duty_title: string | null
          education_status: string | null
          first_service_date: string | null
          gender: string | null
          grade_step: string | null
          imported_at: string
          institution_code: string | null
          institution_name: string | null
          institution_registry_no: string | null
          personnel_id: string
          personnel_status: string | null
          province: string | null
          raw_data: Json
          raw_labels: Json
          retirement_registry_no: string | null
          source_file_name: string | null
          source_format: string | null
          tc_identity_no: string | null
          teaching_area: string | null
          updated_at: string
        }
        Insert: {
          archive_no?: string | null
          base_title?: string | null
          birth_date?: string | null
          blood_group?: string | null
          career_stage?: string | null
          district?: string | null
          duty_title?: string | null
          education_status?: string | null
          first_service_date?: string | null
          gender?: string | null
          grade_step?: string | null
          imported_at?: string
          institution_code?: string | null
          institution_name?: string | null
          institution_registry_no?: string | null
          personnel_id: string
          personnel_status?: string | null
          province?: string | null
          raw_data?: Json
          raw_labels?: Json
          retirement_registry_no?: string | null
          source_file_name?: string | null
          source_format?: string | null
          tc_identity_no?: string | null
          teaching_area?: string | null
          updated_at?: string
        }
        Update: {
          archive_no?: string | null
          base_title?: string | null
          birth_date?: string | null
          blood_group?: string | null
          career_stage?: string | null
          district?: string | null
          duty_title?: string | null
          education_status?: string | null
          first_service_date?: string | null
          gender?: string | null
          grade_step?: string | null
          imported_at?: string
          institution_code?: string | null
          institution_name?: string | null
          institution_registry_no?: string | null
          personnel_id?: string
          personnel_status?: string | null
          province?: string | null
          raw_data?: Json
          raw_labels?: Json
          retirement_registry_no?: string | null
          source_file_name?: string | null
          source_format?: string | null
          tc_identity_no?: string | null
          teaching_area?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_personnel_private_details_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "personnel_private_details_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: true
            referencedRelation: "personnel_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel_registry: {
        Row: {
          active: boolean
          derived_roles: string[]
          duty_title: string | null
          employment_status: string | null
          full_name: string
          id: string
          imported_at: string
          institution_code: string | null
          linked_user_id: string | null
          source_file_name: string | null
          system_role: string | null
          teaching_area_id: string | null
          teaching_area_raw: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          derived_roles?: string[]
          duty_title?: string | null
          employment_status?: string | null
          full_name: string
          id?: string
          imported_at?: string
          institution_code?: string | null
          linked_user_id?: string | null
          source_file_name?: string | null
          system_role?: string | null
          teaching_area_id?: string | null
          teaching_area_raw?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          derived_roles?: string[]
          duty_title?: string | null
          employment_status?: string | null
          full_name?: string
          id?: string
          imported_at?: string
          institution_code?: string | null
          linked_user_id?: string | null
          source_file_name?: string | null
          system_role?: string | null
          teaching_area_id?: string | null
          teaching_area_raw?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_personnel_registry_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "personnel_registry_teaching_area_id_fkey"
            columns: ["teaching_area_id"]
            isOneToOne: false
            referencedRelation: "teaching_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel_responsibilities: {
        Row: {
          active: boolean
          assignment_document_url: string | null
          created_at: string
          ends_on: string | null
          id: string
          institution_code: string | null
          legal_basis: string | null
          personnel_id: string | null
          responsibility_id: string
          starts_on: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean
          assignment_document_url?: string | null
          created_at?: string
          ends_on?: string | null
          id?: string
          institution_code?: string | null
          legal_basis?: string | null
          personnel_id?: string | null
          responsibility_id: string
          starts_on?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean
          assignment_document_url?: string | null
          created_at?: string
          ends_on?: string | null
          id?: string
          institution_code?: string | null
          legal_basis?: string | null
          personnel_id?: string | null
          responsibility_id?: string
          starts_on?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_personnel_responsibilities_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "personnel_responsibilities_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personnel_responsibilities_responsibility_id_fkey"
            columns: ["responsibility_id"]
            isOneToOne: false
            referencedRelation: "responsibility_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_registered_teachers: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          full_name: string
          id: string
          institution_code: string | null
          role: Database["public"]["Enums"]["app_role"]
          tckn: string
          teaching_area_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          institution_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tckn: string
          teaching_area_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          institution_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tckn?: string
          teaching_area_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pre_registered_teachers_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "pre_registered_teachers_teaching_area_id_fkey"
            columns: ["teaching_area_id"]
            isOneToOne: false
            referencedRelation: "teaching_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      principal_recovery_identity: {
        Row: {
          created_at: string
          email: string
          institution_code: string
          phone: string
          tckn_hmac: string
          tckn_masked: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          institution_code: string
          phone: string
          tckn_hmac: string
          tckn_masked: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          institution_code?: string
          phone?: string
          tckn_hmac?: string
          tckn_masked?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "principal_recovery_identity_institution_code_fkey"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      profile_role_tags: {
        Row: {
          active: boolean
          institution_code: string | null
          role_tag: string
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          institution_code?: string | null
          role_tag: string
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          institution_code?: string | null
          role_tag?: string
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile_role_tags_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      profiles: {
        Row: {
          blood_type: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          institution_code: string | null
          is_super_admin: boolean
          permission_mode: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          tckn: string | null
          teaching_area_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blood_type?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          institution_code?: string | null
          is_super_admin?: boolean
          permission_mode?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tckn?: string | null
          teaching_area_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blood_type?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          institution_code?: string | null
          is_super_admin?: boolean
          permission_mode?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tckn?: string | null
          teaching_area_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "profiles_institution_code_fkey"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "profiles_teaching_area_id_fkey"
            columns: ["teaching_area_id"]
            isOneToOne: false
            referencedRelation: "teaching_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          active: boolean
          auth: string
          created_at: string
          endpoint: string
          id: string
          institution_code: string | null
          p256dh: string
          platform: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          institution_code?: string | null
          p256dh: string
          platform?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          institution_code?: string | null
          p256dh?: string
          platform?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_push_subscriptions_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      quran_split_plans: {
        Row: {
          academic_year: string
          class_id: string
          created_at: string
          created_by: string | null
          enabled: boolean
          group_1_id: string | null
          group_2_id: string | null
          id: string
          institution_code: string | null
          source_note: string
          sync_group_id: string | null
          teacher_1_id: string | null
          teacher_2_id: string | null
          threshold: number
          updated_at: string
        }
        Insert: {
          academic_year: string
          class_id: string
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          group_1_id?: string | null
          group_2_id?: string | null
          id?: string
          institution_code?: string | null
          source_note?: string
          sync_group_id?: string | null
          teacher_1_id?: string | null
          teacher_2_id?: string | null
          threshold?: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class_id?: string
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          group_1_id?: string | null
          group_2_id?: string | null
          id?: string
          institution_code?: string | null
          source_note?: string
          sync_group_id?: string | null
          teacher_1_id?: string | null
          teacher_2_id?: string | null
          threshold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quran_split_plans_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "quran_split_plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "quran_split_plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quran_split_plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quran_split_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quran_split_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "quran_split_plans_group_1_id_fkey"
            columns: ["group_1_id"]
            isOneToOne: false
            referencedRelation: "class_subgroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quran_split_plans_group_2_id_fkey"
            columns: ["group_2_id"]
            isOneToOne: false
            referencedRelation: "class_subgroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quran_split_plans_sync_group_id_fkey"
            columns: ["sync_group_id"]
            isOneToOne: false
            referencedRelation: "schedule_sync_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quran_split_plans_teacher_1_id_fkey"
            columns: ["teacher_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quran_split_plans_teacher_1_id_fkey"
            columns: ["teacher_1_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "quran_split_plans_teacher_2_id_fkey"
            columns: ["teacher_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quran_split_plans_teacher_2_id_fkey"
            columns: ["teacher_2_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      responsibility_catalog: {
        Row: {
          active: boolean
          applicable_school_types: string[]
          code: string
          id: string
          legal_basis: string | null
          name: string
          parent_title: string | null
          sort_order: number
        }
        Insert: {
          active?: boolean
          applicable_school_types?: string[]
          code: string
          id?: string
          legal_basis?: string | null
          name: string
          parent_title?: string | null
          sort_order?: number
        }
        Update: {
          active?: boolean
          applicable_school_types?: string[]
          code?: string
          id?: string
          legal_basis?: string | null
          name?: string
          parent_title?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      schedule_audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: number
          institution_code: string | null
          new_row: Json | null
          old_row: Json | null
          schedule_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: never
          institution_code?: string | null
          new_row?: Json | null
          old_row?: Json | null
          schedule_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: never
          institution_code?: string | null
          new_row?: Json | null
          old_row?: Json | null
          schedule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_audit_log_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "schedule_audit_log_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_audit_log_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "teacher_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_duty_optimization: {
        Row: {
          adjacent_weight: number
          anchor_period: number | null
          hard_max: boolean
          institution_code: string
          max_duty_day_hours: number
          overload_weight: number
          source: string
          teacher_id: string
          updated_at: string
          weekday: number
        }
        Insert: {
          adjacent_weight?: number
          anchor_period?: number | null
          hard_max?: boolean
          institution_code?: string
          max_duty_day_hours?: number
          overload_weight?: number
          source?: string
          teacher_id: string
          updated_at?: string
          weekday: number
        }
        Update: {
          adjacent_weight?: number
          anchor_period?: number | null
          hard_max?: boolean
          institution_code?: string
          max_duty_day_hours?: number
          overload_weight?: number
          source?: string
          teacher_id?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_duty_optimization_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_duty_optimization_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_duty_optimization_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      schedule_engine_state: {
        Row: {
          id: boolean
          revision: number
          updated_at: string
        }
        Insert: {
          id?: boolean
          revision?: number
          updated_at?: string
        }
        Update: {
          id?: boolean
          revision?: number
          updated_at?: string
        }
        Relationships: []
      }
      schedule_generation_settings: {
        Row: {
          gap_penalty: number
          id: boolean
          institution_code: string
          late_period_penalty: number
          max_same_course_per_day: number
          periods_per_day: number
          repeated_course_penalty: number
          teaching_days: number[]
          updated_at: string
        }
        Insert: {
          gap_penalty?: number
          id?: boolean
          institution_code?: string
          late_period_penalty?: number
          max_same_course_per_day?: number
          periods_per_day?: number
          repeated_course_penalty?: number
          teaching_days?: number[]
          updated_at?: string
        }
        Update: {
          gap_penalty?: number
          id?: boolean
          institution_code?: string
          late_period_penalty?: number
          max_same_course_per_day?: number
          periods_per_day?: number
          repeated_course_penalty?: number
          teaching_days?: number[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_generation_settings_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      schedule_import_batches: {
        Row: {
          file_name: string
          file_type: string
          id: string
          imported_at: string
          imported_by: string
          institution_code: string | null
          row_count: number
        }
        Insert: {
          file_name: string
          file_type: string
          id?: string
          imported_at?: string
          imported_by: string
          institution_code?: string | null
          row_count?: number
        }
        Update: {
          file_name?: string
          file_type?: string
          id?: string
          imported_at?: string
          imported_by?: string
          institution_code?: string | null
          row_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_import_batches_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_import_batches_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_import_batches_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      schedule_optimization_profiles: {
        Row: {
          active: boolean
          created_at: string
          defaults: Json
          description: string | null
          institution_code: string | null
          name: string
          profile_key: string
          system_profile: boolean
          updated_at: string
          weights: Json
        }
        Insert: {
          active?: boolean
          created_at?: string
          defaults?: Json
          description?: string | null
          institution_code?: string | null
          name: string
          profile_key: string
          system_profile?: boolean
          updated_at?: string
          weights?: Json
        }
        Update: {
          active?: boolean
          created_at?: string
          defaults?: Json
          description?: string | null
          institution_code?: string | null
          name?: string
          profile_key?: string
          system_profile?: boolean
          updated_at?: string
          weights?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_optimization_profiles_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      schedule_optimization_settings: {
        Row: {
          active_profile_key: string
          explain_scenarios: boolean
          id: boolean
          institution_code: string
          record_repairs: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active_profile_key?: string
          explain_scenarios?: boolean
          id?: boolean
          institution_code?: string
          record_repairs?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active_profile_key?: string
          explain_scenarios?: boolean
          id?: boolean
          institution_code?: string
          record_repairs?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_optimization_settings_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_optimization_settings_active_profile_key_fkey"
            columns: ["active_profile_key"]
            isOneToOne: false
            referencedRelation: "schedule_optimization_profiles"
            referencedColumns: ["profile_key"]
          },
          {
            foreignKeyName: "schedule_optimization_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_optimization_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      schedule_publication_rows: {
        Row: {
          class_id: string | null
          class_name: string
          classroom: string | null
          classroom_id: string | null
          id: number
          institution_code: string | null
          is_group_split: boolean
          period: number
          publication_id: string
          snapshot: Json
          source_schedule_id: string | null
          subgroup_id: string | null
          subgroup_key: string | null
          subject: string
          teacher_id: string
          weekday: number
        }
        Insert: {
          class_id?: string | null
          class_name: string
          classroom?: string | null
          classroom_id?: string | null
          id?: never
          institution_code?: string | null
          is_group_split?: boolean
          period: number
          publication_id: string
          snapshot: Json
          source_schedule_id?: string | null
          subgroup_id?: string | null
          subgroup_key?: string | null
          subject: string
          teacher_id: string
          weekday: number
        }
        Update: {
          class_id?: string | null
          class_name?: string
          classroom?: string | null
          classroom_id?: string | null
          id?: never
          institution_code?: string | null
          is_group_split?: boolean
          period?: number
          publication_id?: string
          snapshot?: Json
          source_schedule_id?: string | null
          subgroup_id?: string | null
          subgroup_key?: string | null
          subject?: string
          teacher_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_publication_rows_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_publication_rows_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "schedule_publication_rows_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_publication_rows_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_publication_rows_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_publication_rows_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "schedule_publication_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_publication_rows_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "schedule_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_publication_rows_subgroup_id_fkey"
            columns: ["subgroup_id"]
            isOneToOne: false
            referencedRelation: "class_subgroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_publication_rows_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_publication_rows_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      schedule_publications: {
        Row: {
          academic_year: string | null
          effective_from: string
          id: string
          institution_code: string | null
          note: string | null
          published_at: string
          published_by: string | null
          row_count: number
          schedule_hash: string
          title: string
        }
        Insert: {
          academic_year?: string | null
          effective_from: string
          id?: string
          institution_code?: string | null
          note?: string | null
          published_at?: string
          published_by?: string | null
          row_count: number
          schedule_hash: string
          title?: string
        }
        Update: {
          academic_year?: string | null
          effective_from?: string
          id?: string
          institution_code?: string | null
          note?: string | null
          published_at?: string
          published_by?: string | null
          row_count?: number
          schedule_hash?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_publications_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_publications_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_publications_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      schedule_repair_audit: {
        Row: {
          action_no: number
          after_state: Json | null
          before_state: Json | null
          created_at: string
          description: string
          hard_issues_after: number | null
          hard_issues_before: number | null
          id: string
          institution_code: string | null
          issue_code: string
          scenario_id: string
          score_delta: number | null
        }
        Insert: {
          action_no: number
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          description: string
          hard_issues_after?: number | null
          hard_issues_before?: number | null
          id?: string
          institution_code?: string | null
          issue_code: string
          scenario_id: string
          score_delta?: number | null
        }
        Update: {
          action_no?: number
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          description?: string
          hard_issues_after?: number | null
          hard_issues_before?: number | null
          id?: string
          institution_code?: string | null
          issue_code?: string
          scenario_id?: string
          score_delta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_repair_audit_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_repair_audit_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenario_status_v2"
            referencedColumns: ["scenario_id"]
          },
          {
            foreignKeyName: "schedule_repair_audit_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_restore_point_rows: {
        Row: {
          id: number
          institution_code: string | null
          restore_point_id: string
          snapshot: Json
        }
        Insert: {
          id?: never
          institution_code?: string | null
          restore_point_id: string
          snapshot: Json
        }
        Update: {
          id?: never
          institution_code?: string | null
          restore_point_id?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_restore_point_rows_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_restore_point_rows_restore_point_id_fkey"
            columns: ["restore_point_id"]
            isOneToOne: false
            referencedRelation: "schedule_restore_points"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_restore_points: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          institution_code: string | null
          label: string
          reason: string
          row_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          institution_code?: string | null
          label: string
          reason?: string
          row_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          institution_code?: string | null
          label?: string
          reason?: string
          row_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_restore_points_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_restore_points_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_restore_points_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      schedule_room_assignment_issues: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          institution_code: string | null
          reason: string
          scenario_id: string
          scenario_row_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          institution_code?: string | null
          reason: string
          scenario_id: string
          scenario_row_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          institution_code?: string | null
          reason?: string
          scenario_id?: string
          scenario_row_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_room_assignment_issues_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_room_assignment_issues_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenario_status_v2"
            referencedColumns: ["scenario_id"]
          },
          {
            foreignKeyName: "schedule_room_assignment_issues_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_room_assignment_issues_scenario_row_id_fkey"
            columns: ["scenario_row_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenario_rows"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_rule_modes: {
        Row: {
          category: string
          config: Json
          institution_code: string
          label: string
          mode: string
          rule_code: string
          system_rule: boolean
          updated_at: string
          updated_by: string | null
          weight: number
        }
        Insert: {
          category: string
          config?: Json
          institution_code?: string
          label: string
          mode?: string
          rule_code: string
          system_rule?: boolean
          updated_at?: string
          updated_by?: string | null
          weight?: number
        }
        Update: {
          category?: string
          config?: Json
          institution_code?: string
          label?: string
          mode?: string
          rule_code?: string
          system_rule?: boolean
          updated_at?: string
          updated_by?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_rule_modes_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_rule_modes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_rule_modes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      schedule_rule_overrides: {
        Row: {
          active: boolean
          avoid_last_period: boolean
          block_pattern: number[]
          class_course_requirement_id: string | null
          id: string
          institution_code: string
          max_per_day: number | null
          min_distinct_days: number | null
          note: string | null
          preferred_days: number[]
          preferred_periods: number[]
          prohibited_days: number[]
          prohibited_periods: number[]
          teacher_assignment_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          avoid_last_period?: boolean
          block_pattern?: number[]
          class_course_requirement_id?: string | null
          id?: string
          institution_code?: string
          max_per_day?: number | null
          min_distinct_days?: number | null
          note?: string | null
          preferred_days?: number[]
          preferred_periods?: number[]
          prohibited_days?: number[]
          prohibited_periods?: number[]
          teacher_assignment_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          avoid_last_period?: boolean
          block_pattern?: number[]
          class_course_requirement_id?: string | null
          id?: string
          institution_code?: string
          max_per_day?: number | null
          min_distinct_days?: number | null
          note?: string | null
          preferred_days?: number[]
          preferred_periods?: number[]
          prohibited_days?: number[]
          prohibited_periods?: number[]
          teacher_assignment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_rule_overrides_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_rule_overrides_class_course_requirement_id_fkey"
            columns: ["class_course_requirement_id"]
            isOneToOne: false
            referencedRelation: "class_course_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_rule_overrides_class_course_requirement_id_fkey"
            columns: ["class_course_requirement_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["requirement_id"]
          },
          {
            foreignKeyName: "schedule_rule_overrides_teacher_assignment_id_fkey"
            columns: ["teacher_assignment_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["teacher_assignment_id"]
          },
          {
            foreignKeyName: "schedule_rule_overrides_teacher_assignment_id_fkey"
            columns: ["teacher_assignment_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_scenario_explanations: {
        Row: {
          duty_score: number
          generated_at: string
          institution_code: string | null
          metrics: Json
          negatives: Json
          pedagogic_score: number
          positives: Json
          room_score: number
          scenario_id: string
          teacher_score: number
          total_score: number
          workshop_score: number
        }
        Insert: {
          duty_score?: number
          generated_at?: string
          institution_code?: string | null
          metrics?: Json
          negatives?: Json
          pedagogic_score?: number
          positives?: Json
          room_score?: number
          scenario_id: string
          teacher_score?: number
          total_score?: number
          workshop_score?: number
        }
        Update: {
          duty_score?: number
          generated_at?: string
          institution_code?: string | null
          metrics?: Json
          negatives?: Json
          pedagogic_score?: number
          positives?: Json
          room_score?: number
          scenario_id?: string
          teacher_score?: number
          total_score?: number
          workshop_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_scenario_explanations_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_scenario_explanations_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: true
            referencedRelation: "schedule_scenario_status_v2"
            referencedColumns: ["scenario_id"]
          },
          {
            foreignKeyName: "schedule_scenario_explanations_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: true
            referencedRelation: "schedule_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_scenario_integrity_issues: {
        Row: {
          affected_count: number
          code: string
          created_at: string
          detail: string
          id: string
          institution_code: string | null
          scenario_id: string
        }
        Insert: {
          affected_count?: number
          code: string
          created_at?: string
          detail: string
          id?: string
          institution_code?: string | null
          scenario_id: string
        }
        Update: {
          affected_count?: number
          code?: string
          created_at?: string
          detail?: string
          id?: string
          institution_code?: string | null
          scenario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_scenario_integrity_issues_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_scenario_integrity_issues_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenario_status_v2"
            referencedColumns: ["scenario_id"]
          },
          {
            foreignKeyName: "schedule_scenario_integrity_issues_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_scenario_rows: {
        Row: {
          block_key: string | null
          class_id: string | null
          class_name: string
          classroom_id: string | null
          course_id: string | null
          id: string
          institution_code: string | null
          is_group_split: boolean
          locked: boolean
          period: number
          requirement_id: string | null
          scenario_id: string
          source_schedule_id: string | null
          subgroup_id: string | null
          subgroup_key: string | null
          subject: string
          sync_group_id: string | null
          teacher_assignment_id: string | null
          teacher_id: string
          weekday: number
        }
        Insert: {
          block_key?: string | null
          class_id?: string | null
          class_name: string
          classroom_id?: string | null
          course_id?: string | null
          id?: string
          institution_code?: string | null
          is_group_split?: boolean
          locked?: boolean
          period: number
          requirement_id?: string | null
          scenario_id: string
          source_schedule_id?: string | null
          subgroup_id?: string | null
          subgroup_key?: string | null
          subject: string
          sync_group_id?: string | null
          teacher_assignment_id?: string | null
          teacher_id: string
          weekday: number
        }
        Update: {
          block_key?: string | null
          class_id?: string | null
          class_name?: string
          classroom_id?: string | null
          course_id?: string | null
          id?: string
          institution_code?: string | null
          is_group_split?: boolean
          locked?: boolean
          period?: number
          requirement_id?: string | null
          scenario_id?: string
          source_schedule_id?: string | null
          subgroup_id?: string | null
          subgroup_key?: string | null
          subject?: string
          sync_group_id?: string | null
          teacher_assignment_id?: string | null
          teacher_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_scenario_rows_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "class_course_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["requirement_id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenario_status_v2"
            referencedColumns: ["scenario_id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_source_schedule_id_fkey"
            columns: ["source_schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_source_schedule_id_fkey"
            columns: ["source_schedule_id"]
            isOneToOne: false
            referencedRelation: "teacher_schedule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_subgroup_id_fkey"
            columns: ["subgroup_id"]
            isOneToOne: false
            referencedRelation: "class_subgroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_sync_group_id_fkey"
            columns: ["sync_group_id"]
            isOneToOne: false
            referencedRelation: "schedule_sync_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_teacher_assignment_id_fkey"
            columns: ["teacher_assignment_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["teacher_assignment_id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_teacher_assignment_id_fkey"
            columns: ["teacher_assignment_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_scenario_rows_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      schedule_scenarios: {
        Row: {
          basis_revision: number | null
          generated_at: string
          generated_by: string | null
          generation_group: string
          id: string
          institution_code: string | null
          row_count: number
          scenario_no: number
          score: number
          status: string
          title: string
          unplaced_count: number
        }
        Insert: {
          basis_revision?: number | null
          generated_at?: string
          generated_by?: string | null
          generation_group: string
          id?: string
          institution_code?: string | null
          row_count?: number
          scenario_no: number
          score?: number
          status?: string
          title: string
          unplaced_count?: number
        }
        Update: {
          basis_revision?: number | null
          generated_at?: string
          generated_by?: string | null
          generation_group?: string
          id?: string
          institution_code?: string | null
          row_count?: number
          scenario_no?: number
          score?: number
          status?: string
          title?: string
          unplaced_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_scenarios_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_scenarios_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_scenarios_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      schedule_sync_group_members: {
        Row: {
          block_hours: number
          id: string
          institution_code: string | null
          subgroup_id: string | null
          sync_group_id: string
          teacher_assignment_id: string
        }
        Insert: {
          block_hours?: number
          id?: string
          institution_code?: string | null
          subgroup_id?: string | null
          sync_group_id: string
          teacher_assignment_id: string
        }
        Update: {
          block_hours?: number
          id?: string
          institution_code?: string | null
          subgroup_id?: string | null
          sync_group_id?: string
          teacher_assignment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_sync_group_members_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_sync_group_members_subgroup_id_fkey"
            columns: ["subgroup_id"]
            isOneToOne: false
            referencedRelation: "class_subgroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_sync_group_members_sync_group_id_fkey"
            columns: ["sync_group_id"]
            isOneToOne: false
            referencedRelation: "schedule_sync_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_sync_group_members_teacher_assignment_id_fkey"
            columns: ["teacher_assignment_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["teacher_assignment_id"]
          },
          {
            foreignKeyName: "schedule_sync_group_members_teacher_assignment_id_fkey"
            columns: ["teacher_assignment_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_sync_groups: {
        Row: {
          active: boolean
          class_id: string | null
          created_at: string
          id: string
          institution_code: string | null
          name: string
          note: string | null
          required_simultaneous: boolean
          source_block_index: number | null
          source_id: string | null
          source_type: string | null
        }
        Insert: {
          active?: boolean
          class_id?: string | null
          created_at?: string
          id?: string
          institution_code?: string | null
          name: string
          note?: string | null
          required_simultaneous?: boolean
          source_block_index?: number | null
          source_id?: string | null
          source_type?: string | null
        }
        Update: {
          active?: boolean
          class_id?: string | null
          created_at?: string
          id?: string
          institution_code?: string | null
          name?: string
          note?: string | null
          required_simultaneous?: boolean
          source_block_index?: number | null
          source_id?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_sync_groups_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_sync_groups_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "schedule_sync_groups_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_sync_groups_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_time_profiles: {
        Row: {
          active: boolean
          created_at: string
          id: string
          institution_code: string | null
          lunch_after_period: number | null
          name: string
          periods_per_day: number
          teaching_days: number[]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          institution_code?: string | null
          lunch_after_period?: number | null
          name: string
          periods_per_day?: number
          teaching_days?: number[]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          institution_code?: string | null
          lunch_after_period?: number | null
          name?: string
          periods_per_day?: number
          teaching_days?: number[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_time_profiles_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      schedule_unplaced_items: {
        Row: {
          block_hours: number
          class_id: string | null
          created_at: string
          diagnostic: Json
          id: string
          institution_code: string | null
          reason: string
          requirement_id: string | null
          scenario_id: string
          subject: string
          teacher_assignment_id: string | null
          teacher_id: string | null
        }
        Insert: {
          block_hours?: number
          class_id?: string | null
          created_at?: string
          diagnostic?: Json
          id?: string
          institution_code?: string | null
          reason: string
          requirement_id?: string | null
          scenario_id: string
          subject: string
          teacher_assignment_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          block_hours?: number
          class_id?: string | null
          created_at?: string
          diagnostic?: Json
          id?: string
          institution_code?: string | null
          reason?: string
          requirement_id?: string | null
          scenario_id?: string
          subject?: string
          teacher_assignment_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_unplaced_items_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_unplaced_items_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "schedule_unplaced_items_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_unplaced_items_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_unplaced_items_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "class_course_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_unplaced_items_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["requirement_id"]
          },
          {
            foreignKeyName: "schedule_unplaced_items_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenario_status_v2"
            referencedColumns: ["scenario_id"]
          },
          {
            foreignKeyName: "schedule_unplaced_items_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_unplaced_items_teacher_assignment_id_fkey"
            columns: ["teacher_assignment_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["teacher_assignment_id"]
          },
          {
            foreignKeyName: "schedule_unplaced_items_teacher_assignment_id_fkey"
            columns: ["teacher_assignment_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_unplaced_items_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_unplaced_items_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      schedule_workshop_policies: {
        Row: {
          active: boolean
          course_id: string
          institution_code: string
          max_block: number
          min_block: number
          preferred_block: number
          preferred_patterns: number[]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          course_id: string
          institution_code?: string
          max_block?: number
          min_block?: number
          preferred_block?: number
          preferred_patterns?: number[]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          course_id?: string
          institution_code?: string
          max_block?: number
          min_block?: number
          preferred_block?: number
          preferred_patterns?: number[]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_workshop_policies_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "schedule_workshop_policies_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_workshop_policies_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_workshop_policies_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      school_calendar_events: {
        Row: {
          academic_year_id: string
          all_day: boolean
          audiences: string[]
          blocks_teaching: boolean
          conditional: boolean
          counts_as_workday: boolean
          created_at: string
          created_by: string | null
          ends_on: string
          event_type: string
          grade_levels: string[]
          id: string
          institution_code: string | null
          note: string | null
          parsed_from_source: boolean
          school_levels: string[]
          school_types: string[]
          source_file_name: string | null
          source_note: string | null
          starts_on: string
          title: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          all_day?: boolean
          audiences?: string[]
          blocks_teaching?: boolean
          conditional?: boolean
          counts_as_workday?: boolean
          created_at?: string
          created_by?: string | null
          ends_on: string
          event_type: string
          grade_levels?: string[]
          id?: string
          institution_code?: string | null
          note?: string | null
          parsed_from_source?: boolean
          school_levels?: string[]
          school_types?: string[]
          source_file_name?: string | null
          source_note?: string | null
          starts_on: string
          title: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          all_day?: boolean
          audiences?: string[]
          blocks_teaching?: boolean
          conditional?: boolean
          counts_as_workday?: boolean
          created_at?: string
          created_by?: string | null
          ends_on?: string
          event_type?: string
          grade_levels?: string[]
          id?: string
          institution_code?: string | null
          note?: string | null
          parsed_from_source?: boolean
          school_levels?: string[]
          school_types?: string[]
          source_file_name?: string | null
          source_note?: string | null
          starts_on?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_school_calendar_events_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "school_calendar_events_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "school_calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      school_classes: {
        Row: {
          active: boolean
          advisor_teacher_id: string | null
          class_name: string
          composite_key: string | null
          curriculum_status: string
          expected_weekly_hours: number | null
          grade_level: number | null
          id: string
          imported_student_count: number | null
          institution_code: string | null
          program_type: string | null
          section: string | null
          source: string
          source_file_name: string | null
          split_threshold: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          advisor_teacher_id?: string | null
          class_name: string
          composite_key?: string | null
          curriculum_status?: string
          expected_weekly_hours?: number | null
          grade_level?: number | null
          id?: string
          imported_student_count?: number | null
          institution_code?: string | null
          program_type?: string | null
          section?: string | null
          source?: string
          source_file_name?: string | null
          split_threshold?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          advisor_teacher_id?: string | null
          class_name?: string
          composite_key?: string | null
          curriculum_status?: string
          expected_weekly_hours?: number | null
          grade_level?: number | null
          id?: string
          imported_student_count?: number | null
          institution_code?: string | null
          program_type?: string | null
          section?: string | null
          source?: string
          source_file_name?: string | null
          split_threshold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_school_classes_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      students: {
        Row: {
          active: boolean
          class_id: string
          created_at: string
          full_name: string
          id: string
          import_batch_id: string | null
          institution_code: string | null
          school_number: string
          source: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          class_id: string
          created_at?: string
          full_name: string
          id?: string
          import_batch_id?: string | null
          institution_code?: string | null
          school_number: string
          source?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          class_id?: string
          created_at?: string
          full_name?: string
          id?: string
          import_batch_id?: string | null
          institution_code?: string | null
          school_number?: string
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_students_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "eokul_import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      substitute_assignments: {
        Row: {
          absence_lesson_id: string
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          assigned_at: string
          assigned_by: string
          id: string
          institution_code: string | null
          notified_at: string | null
          substitute_user_id: string
        }
        Insert: {
          absence_lesson_id: string
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          assigned_at?: string
          assigned_by: string
          id?: string
          institution_code?: string | null
          notified_at?: string | null
          substitute_user_id: string
        }
        Update: {
          absence_lesson_id?: string
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          assigned_at?: string
          assigned_by?: string
          id?: string
          institution_code?: string | null
          notified_at?: string | null
          substitute_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_substitute_assignments_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "substitute_assignments_absence_lesson_id_fkey"
            columns: ["absence_lesson_id"]
            isOneToOne: true
            referencedRelation: "absence_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitute_assignments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "substitute_assignments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "substitute_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "substitute_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "substitute_assignments_substitute_user_id_fkey"
            columns: ["substitute_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "substitute_assignments_substitute_user_id_fkey"
            columns: ["substitute_user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      super_admin_bootstrap: {
        Row: {
          active: boolean
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          email: string
          full_name: string
          institution_code: string | null
        }
        Insert: {
          active?: boolean
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          email: string
          full_name?: string
          institution_code?: string | null
        }
        Update: {
          active?: boolean
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          email?: string
          full_name?: string
          institution_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_super_admin_bootstrap_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      system_feature_catalog: {
        Row: {
          enabled: boolean
          feature_key: string
          label: string
          maintenance: boolean
          maintenance_message: string | null
          parent_key: string | null
          route_prefix: string | null
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          enabled?: boolean
          feature_key: string
          label: string
          maintenance?: boolean
          maintenance_message?: string | null
          parent_key?: string | null
          route_prefix?: string | null
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          enabled?: boolean
          feature_key?: string
          label?: string
          maintenance?: boolean
          maintenance_message?: string | null
          parent_key?: string | null
          route_prefix?: string | null
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_feature_catalog_parent_key_fkey"
            columns: ["parent_key"]
            isOneToOne: false
            referencedRelation: "system_feature_catalog"
            referencedColumns: ["feature_key"]
          },
        ]
      }
      system_runtime_settings: {
        Row: {
          maintenance: boolean
          maintenance_message: string
          singleton: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          maintenance?: boolean
          maintenance_message?: string
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          maintenance?: boolean
          maintenance_message?: string
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      task_role_template_permissions: {
        Row: {
          institution_code: string | null
          permission_code: string
          scope: Json
          template_id: string
        }
        Insert: {
          institution_code?: string | null
          permission_code: string
          scope?: Json
          template_id: string
        }
        Update: {
          institution_code?: string | null
          permission_code?: string
          scope?: Json
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_task_role_template_permissions_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "task_role_template_permissions_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permission_catalog"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "task_role_template_permissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_role_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      task_role_templates: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          institution_code: string | null
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          institution_code?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          institution_code?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_task_role_templates_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "task_role_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "task_role_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teacher_course_assignments: {
        Row: {
          assigned_hours: number
          assignment_group: string
          class_course_requirement_id: string
          created_at: string
          created_by: string | null
          id: string
          institution_code: string | null
          note: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          assigned_hours: number
          assignment_group?: string
          class_course_requirement_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          institution_code?: string | null
          note?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          assigned_hours?: number
          assignment_group?: string
          class_course_requirement_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          institution_code?: string | null
          note?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_course_assignments_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "teacher_course_assignments_class_course_requirement_id_fkey"
            columns: ["class_course_requirement_id"]
            isOneToOne: false
            referencedRelation: "class_course_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_course_assignments_class_course_requirement_id_fkey"
            columns: ["class_course_requirement_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["requirement_id"]
          },
          {
            foreignKeyName: "teacher_course_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_course_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "teacher_course_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_course_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teacher_duty_assignments: {
        Row: {
          assignment_source: string
          created_at: string
          duty_date: string
          duty_location: string | null
          institution_code: string | null
          teacher_id: string
        }
        Insert: {
          assignment_source?: string
          created_at?: string
          duty_date: string
          duty_location?: string | null
          institution_code?: string | null
          teacher_id: string
        }
        Update: {
          assignment_source?: string
          created_at?: string
          duty_date?: string
          duty_location?: string | null
          institution_code?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_duty_assignments_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "teacher_duty_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_duty_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teacher_duty_cycle_members: {
        Row: {
          active: boolean
          institution_code: string | null
          rotation_offset: number
          teacher_id: string
          updated_at: string
          weekday: number
        }
        Insert: {
          active?: boolean
          institution_code?: string | null
          rotation_offset?: number
          teacher_id: string
          updated_at?: string
          weekday: number
        }
        Update: {
          active?: boolean
          institution_code?: string | null
          rotation_offset?: number
          teacher_id?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_duty_cycle_members_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "teacher_duty_cycle_members_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_duty_cycle_members_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teacher_payroll_config: {
        Row: {
          active: boolean
          gunduz_kbs_data_type: string
          has_class_guidance: boolean
          institution_code: string | null
          nobet_kbs_data_type: string
          rehberlik_kbs_data_type: string
          teacher_id: string
          updated_at: string
          weekly_salary_obligation: number
        }
        Insert: {
          active?: boolean
          gunduz_kbs_data_type?: string
          has_class_guidance?: boolean
          institution_code?: string | null
          nobet_kbs_data_type?: string
          rehberlik_kbs_data_type?: string
          teacher_id: string
          updated_at?: string
          weekly_salary_obligation?: number
        }
        Update: {
          active?: boolean
          gunduz_kbs_data_type?: string
          has_class_guidance?: boolean
          institution_code?: string | null
          nobet_kbs_data_type?: string
          rehberlik_kbs_data_type?: string
          teacher_id?: string
          updated_at?: string
          weekly_salary_obligation?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_payroll_config_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "teacher_payroll_config_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_payroll_config_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teacher_schedule: {
        Row: {
          active: boolean
          block_key: string | null
          class_course_requirement_id: string | null
          class_id: string | null
          class_name: string
          classroom: string | null
          classroom_id: string | null
          course_id: string | null
          id: string
          institution_code: string | null
          is_group_split: boolean
          locked: boolean
          period: number
          source_kind: string
          subgroup_id: string | null
          subgroup_key: string | null
          subject: string
          sync_group_id: string | null
          teacher_assignment_id: string | null
          teacher_id: string
          updated_at: string
          weekday: number
        }
        Insert: {
          active?: boolean
          block_key?: string | null
          class_course_requirement_id?: string | null
          class_id?: string | null
          class_name: string
          classroom?: string | null
          classroom_id?: string | null
          course_id?: string | null
          id?: string
          institution_code?: string | null
          is_group_split?: boolean
          locked?: boolean
          period: number
          source_kind?: string
          subgroup_id?: string | null
          subgroup_key?: string | null
          subject: string
          sync_group_id?: string | null
          teacher_assignment_id?: string | null
          teacher_id: string
          updated_at?: string
          weekday: number
        }
        Update: {
          active?: boolean
          block_key?: string | null
          class_course_requirement_id?: string | null
          class_id?: string | null
          class_name?: string
          classroom?: string | null
          classroom_id?: string | null
          course_id?: string | null
          id?: string
          institution_code?: string | null
          is_group_split?: boolean
          locked?: boolean
          period?: number
          source_kind?: string
          subgroup_id?: string | null
          subgroup_key?: string | null
          subject?: string
          sync_group_id?: string | null
          teacher_assignment_id?: string | null
          teacher_id?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_schedule_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "teacher_schedule_class_course_requirement_id_fkey"
            columns: ["class_course_requirement_id"]
            isOneToOne: false
            referencedRelation: "class_course_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_schedule_class_course_requirement_id_fkey"
            columns: ["class_course_requirement_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["requirement_id"]
          },
          {
            foreignKeyName: "teacher_schedule_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "teacher_schedule_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_schedule_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_schedule_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_schedule_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_schedule_subgroup_id_fkey"
            columns: ["subgroup_id"]
            isOneToOne: false
            referencedRelation: "class_subgroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_schedule_sync_group_id_fkey"
            columns: ["sync_group_id"]
            isOneToOne: false
            referencedRelation: "schedule_sync_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_schedule_teacher_assignment_id_fkey"
            columns: ["teacher_assignment_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["teacher_assignment_id"]
          },
          {
            foreignKeyName: "teacher_schedule_teacher_assignment_id_fkey"
            columns: ["teacher_assignment_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_schedule_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_schedule_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teacher_schedule_constraints: {
        Row: {
          institution_code: string | null
          max_consecutive_hours: number
          max_daily_hours: number | null
          max_weekly_hours: number | null
          max_working_days: number | null
          min_working_days: number | null
          preferred_free_day: number | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          institution_code?: string | null
          max_consecutive_hours?: number
          max_daily_hours?: number | null
          max_weekly_hours?: number | null
          max_working_days?: number | null
          min_working_days?: number | null
          preferred_free_day?: number | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          institution_code?: string | null
          max_consecutive_hours?: number
          max_daily_hours?: number | null
          max_weekly_hours?: number | null
          max_working_days?: number | null
          min_working_days?: number | null
          preferred_free_day?: number | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_schedule_constraints_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "teacher_schedule_constraints_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_schedule_constraints_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teacher_schedule_preferences: {
        Row: {
          active: boolean
          id: string
          institution_code: string | null
          note: string | null
          period: number
          preference: string
          teacher_id: string
          weekday: number
          weight: number
        }
        Insert: {
          active?: boolean
          id?: string
          institution_code?: string | null
          note?: string | null
          period: number
          preference: string
          teacher_id: string
          weekday: number
          weight?: number
        }
        Update: {
          active?: boolean
          id?: string
          institution_code?: string | null
          note?: string | null
          period?: number
          preference?: string
          teacher_id?: string
          weekday?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_schedule_preferences_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "teacher_schedule_preferences_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_schedule_preferences_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teacher_unavailability: {
        Row: {
          active: boolean
          approved_at: string | null
          approved_by: string | null
          id: string
          institution_code: string | null
          period: number
          reason: string
          teacher_id: string
          weekday: number
        }
        Insert: {
          active?: boolean
          approved_at?: string | null
          approved_by?: string | null
          id?: string
          institution_code?: string | null
          period: number
          reason?: string
          teacher_id: string
          weekday: number
        }
        Update: {
          active?: boolean
          approved_at?: string | null
          approved_by?: string | null
          id?: string
          institution_code?: string | null
          period?: number
          reason?: string
          teacher_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_unavailability_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "teacher_unavailability_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_unavailability_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "teacher_unavailability_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_unavailability_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teaching_areas: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      telegram_integrations: {
        Row: {
          enabled: boolean
          linked_at: string | null
          telegram_chat_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          enabled?: boolean
          linked_at?: string | null
          telegram_chat_id?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          enabled?: boolean
          linked_at?: string | null
          telegram_chat_id?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "telegram_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      telegram_link_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_link_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "telegram_link_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      tenant_messages: {
        Row: {
          created_at: string
          id: string
          institution_code: string
          message: string
          sender_user_id: string | null
          severity: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_code: string
          message: string
          sender_user_id?: string | null
          severity?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_code?: string
          message?: string
          sender_user_id?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_messages_institution_code_fkey"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      tenant_scope_registry: {
        Row: {
          note: string | null
          scope: string
          table_name: string
          updated_at: string
        }
        Insert: {
          note?: string | null
          scope: string
          table_name: string
          updated_at?: string
        }
        Update: {
          note?: string | null
          scope?: string
          table_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_permission_grants: {
        Row: {
          active: boolean
          created_at: string
          granted_by: string | null
          id: string
          institution_code: string | null
          note: string | null
          permission_code: string
          scope: Json
          updated_at: string
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          granted_by?: string | null
          id?: string
          institution_code?: string | null
          note?: string | null
          permission_code: string
          scope?: Json
          updated_at?: string
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          granted_by?: string | null
          id?: string
          institution_code?: string | null
          note?: string | null
          permission_code?: string
          scope?: Json
          updated_at?: string
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_permission_grants_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "user_permission_grants_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_permission_grants_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "user_permission_grants_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permission_catalog"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "user_permission_grants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_permission_grants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      user_task_role_assignments: {
        Row: {
          active: boolean
          assigned_at: string
          assigned_by: string | null
          id: string
          institution_code: string | null
          note: string | null
          template_id: string
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          institution_code?: string | null
          note?: string | null
          template_id: string
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          institution_code?: string | null
          note?: string | null
          template_id?: string
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_task_role_assignments_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "user_task_role_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_task_role_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "user_task_role_assignments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_role_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_task_role_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_task_role_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      vice_principals: {
        Row: {
          active: boolean
          institution_code: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          institution_code?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          institution_code?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_vice_principals_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "vice_principals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vice_principals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
    }
    Views: {
      class_curriculum_summary: {
        Row: {
          assigned_teacher_hours: number | null
          class_id: string | null
          class_name: string | null
          composite_key: string | null
          course_count: number | null
          curriculum_status: string | null
          expected_weekly_hours: number | null
          planned_weekly_hours: number | null
          program_type: string | null
        }
        Relationships: []
      }
      class_roster_summary: {
        Row: {
          class_name: string | null
          composite_key: string | null
          grade_level: number | null
          id: string | null
          needs_split: boolean | null
          program_type: string | null
          section: string | null
          split_threshold: number | null
          student_count: number | null
          suggested_group_count: number | null
        }
        Relationships: []
      }
      schedule_assignment_options: {
        Row: {
          assigned_hours: number | null
          class_id: string | null
          class_name: string | null
          composite_key: string | null
          course_id: string | null
          course_name: string | null
          placed_hours: number | null
          remaining_hours: number | null
          requirement_id: string | null
          teacher_assignment_id: string | null
          teacher_id: string | null
          teacher_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_course_requirements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "class_course_requirements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_course_requirements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_course_requirements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_course_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_course_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      schedule_publication_periods: {
        Row: {
          academic_year: string | null
          effective_from: string | null
          effective_to: string | null
          id: string | null
          next_effective_date: string | null
          note: string | null
          published_at: string | null
          published_by: string | null
          row_count: number | null
          schedule_hash: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_publications_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_publications_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      schedule_scenario_status_v2: {
        Row: {
          applicable: boolean | null
          basis_revision: number | null
          current_revision: number | null
          generation_group: string | null
          hard_issue_count: number | null
          room_issue_count: number | null
          row_count: number | null
          scenario_id: string | null
          scenario_no: number | null
          score: number | null
          stale: boolean | null
          status: string | null
          unplaced_count: number | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          active: boolean | null
          class_id: string | null
          class_name: string | null
          classroom: string | null
          classroom_id: string | null
          day_of_week: number | null
          id: string | null
          is_group_split: boolean | null
          period_number: number | null
          subgroup_id: string | null
          subgroup_key: string | null
          subject: string | null
          teacher_id: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_schedule_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "teacher_schedule_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_schedule_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_schedule_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_schedule_subgroup_id_fkey"
            columns: ["subgroup_id"]
            isOneToOne: false
            referencedRelation: "class_subgroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_schedule_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_schedule_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teacher_course_load_summary: {
        Row: {
          assigned_weekly_hours: number | null
          class_count: number | null
          course_count: number | null
          full_name: string | null
          teacher_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_approved_payroll_activities: {
        Args: { p_month: number; p_run_id: string; p_year: number }
        Returns: number
      }
      apply_curriculum_template: {
        Args: { p_class_id: string; p_replace?: boolean; p_template_id: string }
        Returns: number
      }
      apply_curriculum_template_permission_core_v2: {
        Args: { p_class_id: string; p_replace?: boolean; p_template_id: string }
        Returns: number
      }
      apply_schedule_edge_slot_repairs_v1: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      apply_schedule_optimization_profile_v1: {
        Args: { p_profile_key: string }
        Returns: undefined
      }
      apply_schedule_scenario: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      apply_schedule_scenario_permission_core_v2: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      apply_schedule_scenario_pre_phase3: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      approve_payroll_activity: {
        Args: { p_activity_id: string; p_approve?: boolean }
        Returns: boolean
      }
      approve_payroll_activity_permission_core_v2: {
        Args: { p_activity_id: string; p_approve?: boolean }
        Returns: boolean
      }
      approve_payroll_month: {
        Args: { p_month: number; p_year: number }
        Returns: number
      }
      approve_payroll_month_permission_core_v2: {
        Args: { p_month: number; p_year: number }
        Returns: number
      }
      assert_curriculum_ready_for_timetable: { Args: never; Returns: boolean }
      assert_date_in_active_academic_year: {
        Args: { p_date: string }
        Returns: boolean
      }
      assert_schedule_preparation_ready: { Args: never; Returns: boolean }
      assert_schedule_publishable: { Args: never; Returns: boolean }
      assert_schedule_scenario_fresh_v2: {
        Args: { p_scenario_id: string }
        Returns: undefined
      }
      assert_schedule_scenario_tenant_phase3_v1: {
        Args: { p_scenario_id: string }
        Returns: undefined
      }
      assign_classrooms_to_scenario: {
        Args: { p_scenario_id: string }
        Returns: {
          assigned_count: number
          unassigned_count: number
        }[]
      }
      assign_classrooms_to_scenario_core_v2: {
        Args: { p_scenario_id: string }
        Returns: {
          assigned_count: number
          unassigned_count: number
        }[]
      }
      assign_classrooms_to_scenario_permission_core_v2: {
        Args: { p_scenario_id: string }
        Returns: {
          assigned_count: number
          unassigned_count: number
        }[]
      }
      assign_classrooms_to_scenario_pre_phase3_tenant: {
        Args: { p_scenario_id: string }
        Returns: {
          assigned_count: number
          unassigned_count: number
        }[]
      }
      assign_quran_parallel_lesson: {
        Args: {
          p_academic_year: string
          p_class_id: string
          p_classroom_1?: string
          p_classroom_2?: string
          p_period: number
          p_subject: string
          p_weekday: number
        }
        Returns: number
      }
      assign_quran_parallel_lesson_permission_core_v2: {
        Args: {
          p_academic_year: string
          p_class_id: string
          p_classroom_1?: string
          p_classroom_2?: string
          p_period: number
          p_subject: string
          p_weekday: number
        }
        Returns: number
      }
      assign_substitutes_for_day: {
        Args: { p_date?: string }
        Returns: {
          absence_lesson_id: string
          assignment_id: string
          class_name: string
          period: number
          subject: string
          substitute_name: string
          substitute_user_id: string
        }[]
      }
      assign_substitutes_permission_core_v2: {
        Args: { p_date?: string }
        Returns: {
          absence_lesson_id: string
          assignment_id: string
          class_name: string
          period: number
          subject: string
          substitute_name: string
          substitute_user_id: string
        }[]
      }
      assign_task_role_template: {
        Args: {
          p_note?: string
          p_template_id: string
          p_user_id: string
          p_valid_from?: string
          p_valid_until?: string
        }
        Returns: number
      }
      assign_teacher_to_class_course: {
        Args: {
          p_group?: string
          p_hours?: number
          p_requirement_id: string
          p_teacher_id: string
        }
        Returns: string
      }
      assign_teacher_to_class_course_permission_core_v2: {
        Args: {
          p_group?: string
          p_hours?: number
          p_requirement_id: string
          p_teacher_id: string
        }
        Returns: string
      }
      calculate_norm_from_rule: {
        Args: { p_rule_set_id: string; p_total_hours: number }
        Returns: number
      }
      calculate_schedule_scenario_score_base_v3: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      calculate_schedule_scenario_score_pre_phase3: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      calculate_schedule_scenario_score_v2: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      can_access_institution: {
        Args: { p_institution_code: string }
        Returns: boolean
      }
      can_manage_institution_personnel: {
        Args: { p_institution_code: string }
        Returns: boolean
      }
      can_manage_permissions: { Args: never; Returns: boolean }
      can_manage_personnel_private_data: { Args: never; Returns: boolean }
      claim_super_admin_profile: {
        Args: never
        Returns: {
          blood_type: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          institution_code: string | null
          is_super_admin: boolean
          permission_mode: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          tckn: string | null
          teaching_area_id: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      clone_class_curriculum: {
        Args: {
          p_copy_teachers?: boolean
          p_source_class_id: string
          p_target_class_id: string
        }
        Returns: number
      }
      clone_class_curriculum_permission_core_v2: {
        Args: {
          p_copy_teachers?: boolean
          p_source_class_id: string
          p_target_class_id: string
        }
        Returns: number
      }
      create_schedule_restore_point: {
        Args: { p_label: string; p_reason?: string }
        Returns: string
      }
      create_schedule_restore_point_permission_core_v2: {
        Args: { p_label?: string; p_reason?: string }
        Returns: string
      }
      create_telegram_link_token: { Args: never; Returns: string }
      current_permission_context: { Args: never; Returns: string }
      current_schedule_signature: { Args: never; Returns: string }
      current_tenant_code: { Args: never; Returns: string }
      disable_push_subscription: {
        Args: { p_endpoint: string }
        Returns: boolean
      }
      disable_telegram_notifications: { Args: never; Returns: undefined }
      drop_unique_constraint_by_columns: {
        Args: { p_columns: string[]; p_table: string }
        Returns: undefined
      }
      ensure_tenant_composite_pk_v1: {
        Args: { p_columns: string[]; p_table: string }
        Returns: undefined
      }
      finalize_my_registration: {
        Args: { p_email: string; p_tckn: string }
        Returns: {
          blood_type: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          institution_code: string | null
          is_super_admin: boolean
          permission_mode: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          tckn: string | null
          teaching_area_id: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      finalize_schedule_scenario_v2: {
        Args: { p_scenario_id: string }
        Returns: {
          applicable: boolean
          hard_issue_count: number
          repaired_count: number
          score: number
        }[]
      }
      generate_monthly_teacher_duties: {
        Args: { p_month: string; p_overwrite?: boolean }
        Returns: number
      }
      generate_monthly_teacher_duties_permission_core_v2: {
        Args: { p_month: string; p_overwrite?: boolean }
        Returns: number
      }
      generate_monthly_vp_rotation: {
        Args: {
          p_month: string
          p_overwrite?: boolean
          p_vice_principal_ids: string[]
        }
        Returns: number
      }
      generate_monthly_vp_rotation_permission_core_v2: {
        Args: {
          p_month: string
          p_overwrite?: boolean
          p_vice_principal_ids: string[]
        }
        Returns: number
      }
      generate_schedule_scenarios: {
        Args: never
        Returns: {
          generation_group: string
          row_count: number
          scenario_id: string
          scenario_no: number
          score: number
          unplaced_count: number
        }[]
      }
      generate_schedule_scenarios_permission_core_v2: {
        Args: never
        Returns: {
          generation_group: string
          row_count: number
          scenario_id: string
          scenario_no: number
          score: number
          unplaced_count: number
        }[]
      }
      generate_schedule_scenarios_pre_edge_v2: {
        Args: never
        Returns: {
          generation_group: string
          row_count: number
          scenario_id: string
          scenario_no: number
          score: number
          unplaced_count: number
        }[]
      }
      generate_schedule_scenarios_pre_phase3_tenant: {
        Args: never
        Returns: {
          generation_group: string
          row_count: number
          scenario_id: string
          scenario_no: number
          score: number
          unplaced_count: number
        }[]
      }
      generate_schedule_scenarios_v2: {
        Args: never
        Returns: {
          generation_group: string
          row_count: number
          scenario_id: string
          scenario_no: number
          score: number
          unplaced_count: number
        }[]
      }
      get_active_academic_year: {
        Args: never
        Returns: {
          active: boolean
          code: string
          created_at: string
          created_by: string | null
          ends_on: string
          first_term_ends_on: string | null
          id: string
          institution_code: string | null
          second_term_starts_on: string | null
          source_note: string | null
          starts_on: string
          teacher_work_starts_on: string | null
          teaching_ends_on: string | null
          teaching_starts_on: string | null
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "academic_years"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_active_schedule_time_profile: {
        Args: never
        Returns: {
          active: boolean
          created_at: string
          id: string
          institution_code: string | null
          lunch_after_period: number | null
          name: string
          periods_per_day: number
          teaching_days: number[]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "schedule_time_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_calendar_days: {
        Args: { p_from: string; p_to: string }
        Returns: {
          day_date: string
          event_titles: string[]
          is_teaching_day: boolean
          is_weekday: boolean
          is_workday: boolean
        }[]
      }
      get_curriculum_readiness: {
        Args: { p_class_id?: string }
        Returns: {
          assigned_hours: number
          blocking_reason: string
          class_id: string
          composite_key: string
          expected_hours: number
          partially_assigned_course_count: number
          planned_hours: number
          ready: boolean
          unassigned_course_count: number
        }[]
      }
      get_daily_duty_book: { Args: { p_date: string }; Returns: Json }
      get_daily_duty_book_permission_core_v2: {
        Args: { p_date: string }
        Returns: Json
      }
      get_duty_month_state: {
        Args: { p_month: string }
        Returns: {
          current_schedule_signature: string
          generated_at: string
          locked: boolean
          month_start: string
          schedule_changed: boolean
          stored_schedule_signature: string
        }[]
      }
      get_effective_schedule_rule_scope_v2: {
        Args: { p_requirement_id: string; p_teacher_assignment_id?: string }
        Returns: string
      }
      get_effective_schedule_rule_v2: {
        Args: { p_requirement_id: string; p_teacher_assignment_id?: string }
        Returns: {
          active: boolean
          avoid_last_period: boolean
          block_pattern: number[]
          course_id: string
          id: string
          institution_code: string | null
          max_per_day: number | null
          min_distinct_days: number | null
          note: string | null
          preferred_days: number[]
          preferred_periods: number[]
          prohibited_days: number[]
          prohibited_periods: number[]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "course_schedule_rules"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_feature_access_state: { Args: { p_path: string }; Returns: Json }
      get_formal_norm_analysis: {
        Args: { p_on_date?: string }
        Returns: {
          active_teacher_count: number
          formal_norm: number
          operational_difference: number
          rule_set_id: string
          rule_set_name: string
          status: string
          teaching_area_id: string
          teaching_area_name: string
          total_weekly_hours: number
        }[]
      }
      get_my_active_institution_code: { Args: never; Returns: string }
      get_my_institution_code: { Args: never; Returns: string }
      get_my_permissions: {
        Args: never
        Returns: {
          action: string
          code: string
          dangerous: boolean
          label: string
          module_code: string
          module_label: string
          scope: Json
        }[]
      }
      get_my_principal_institution_code: { Args: never; Returns: string }
      get_my_published_schedule: {
        Args: { p_date?: string }
        Returns: {
          academic_year: string
          class_id: string
          class_name: string
          classroom: string
          classroom_id: string
          effective_from: string
          is_group_split: boolean
          period: number
          publication_id: string
          schedule_hash: string
          subgroup_id: string
          subgroup_key: string
          subject: string
          title: string
          weekday: number
        }[]
      }
      get_my_role_tags: { Args: never; Returns: string[] }
      get_norm_missing_mappings: {
        Args: { p_on_date?: string }
        Returns: {
          detail: string
          item_id: string
          item_name: string
          item_type: string
        }[]
      }
      get_norm_readiness: {
        Args: { p_on_date?: string }
        Returns: {
          mapped_area_count: number
          mapped_course_count: number
          missing_area_rule_count: number
          missing_course_area_count: number
          ready: boolean
        }[]
      }
      get_permission_admin_matrix: {
        Args: never
        Returns: {
          full_name: string
          permission_code: string
          role: Database["public"]["Enums"]["app_role"]
          scope: Json
          user_id: string
          valid_from: string
          valid_until: string
        }[]
      }
      get_personnel_admin_list: {
        Args: never
        Returns: {
          email: string
          full_name: string
          is_super_admin: boolean
          permission_mode: string
          role: Database["public"]["Enums"]["app_role"]
          teaching_area_id: string
          updated_at: string
          user_id: string
        }[]
      }
      get_personnel_field_settings: {
        Args: never
        Returns: {
          default_enabled: boolean
          default_module_keys: string[]
          display_name: string
          effective_enabled: boolean
          effective_module_keys: string[]
          field_key: string
          institution_code: string
          mode: string
          source_headers: string[]
        }[]
      }
      get_personnel_module_fields: {
        Args: { p_module_key: string; p_personnel_id: string }
        Returns: Json
      }
      get_published_schedule_rows: {
        Args: {
          p_class_id?: string
          p_publication_id: string
          p_teacher_id?: string
        }
        Returns: {
          class_id: string | null
          class_name: string
          classroom: string | null
          classroom_id: string | null
          id: number
          institution_code: string | null
          is_group_split: boolean
          period: number
          publication_id: string
          snapshot: Json
          source_schedule_id: string | null
          subgroup_id: string | null
          subgroup_key: string | null
          subject: string
          teacher_id: string
          weekday: number
        }[]
        SetofOptions: {
          from: "*"
          to: "schedule_publication_rows"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_scenario_room_status: {
        Args: { p_scenario_id: string }
        Returns: {
          assigned_rows: number
          room_issue_count: number
          rooms_configured: boolean
          total_rows: number
          unassigned_rows: number
        }[]
      }
      get_schedule_configuration_issues_before_scoped_rules_v2: {
        Args: never
        Returns: {
          affected_count: number
          code: string
          detail: string
        }[]
      }
      get_schedule_configuration_issues_v2: {
        Args: never
        Returns: {
          affected_count: number
          code: string
          detail: string
        }[]
      }
      get_schedule_edge_slot_integrity_issues_v1: {
        Args: never
        Returns: {
          affected_count: number
          code: string
          detail: string
          severity: string
        }[]
      }
      get_schedule_integrity_report: {
        Args: never
        Returns: {
          affected_count: number
          code: string
          detail: string
          severity: string
        }[]
      }
      get_schedule_integrity_report_core_v2: {
        Args: never
        Returns: {
          affected_count: number
          code: string
          detail: string
          severity: string
        }[]
      }
      get_schedule_integrity_report_parallel_core_v2: {
        Args: never
        Returns: {
          affected_count: number
          code: string
          detail: string
          severity: string
        }[]
      }
      get_schedule_integrity_report_pre_edge_v1: {
        Args: never
        Returns: {
          affected_count: number
          code: string
          detail: string
          severity: string
        }[]
      }
      get_schedule_integrity_report_pre_phase3: {
        Args: never
        Returns: {
          affected_count: number
          code: string
          detail: string
          severity: string
        }[]
      }
      get_schedule_phase3_current_issues_v1: {
        Args: never
        Returns: {
          affected_count: number
          code: string
          detail: string
          severity: string
        }[]
      }
      get_schedule_phase3_preflight_issues_v1: {
        Args: never
        Returns: {
          affected_count: number
          category: string
          code: string
          detail: string
          status: string
        }[]
      }
      get_schedule_phase3_scenario_issues_v1: {
        Args: { p_scenario_id: string }
        Returns: {
          affected_count: number
          code: string
          detail: string
        }[]
      }
      get_schedule_phase3_scoped_preference_score_v1: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      get_schedule_preparation_readiness: {
        Args: never
        Returns: {
          affected_count: number
          category: string
          code: string
          detail: string
          status: string
        }[]
      }
      get_schedule_preparation_readiness_before_assigned_educator_con: {
        Args: never
        Returns: {
          affected_count: number
          category: string
          code: string
          detail: string
          status: string
        }[]
      }
      get_schedule_preparation_readiness_before_flexible_blocks_v2: {
        Args: never
        Returns: {
          affected_count: number
          category: string
          code: string
          detail: string
          status: string
        }[]
      }
      get_schedule_preparation_readiness_before_teacher_capacity_v2: {
        Args: never
        Returns: {
          affected_count: number
          category: string
          code: string
          detail: string
          status: string
        }[]
      }
      get_schedule_preparation_readiness_core_v2: {
        Args: never
        Returns: {
          affected_count: number
          category: string
          code: string
          detail: string
          status: string
        }[]
      }
      get_schedule_preparation_readiness_pre_phase3: {
        Args: never
        Returns: {
          affected_count: number
          category: string
          code: string
          detail: string
          status: string
        }[]
      }
      get_schedule_publication_for_date: {
        Args: { p_date: string }
        Returns: string
      }
      get_schedule_publication_history: {
        Args: never
        Returns: {
          academic_year: string
          effective_from: string
          effective_to: string
          note: string
          publication_id: string
          published_at: string
          published_by: string
          row_count: number
          same_day_revision_no: number
          schedule_hash: string
          title: string
        }[]
      }
      get_schedule_scenario_advanced_hard_issues_v1: {
        Args: { p_scenario_id: string }
        Returns: {
          affected_count: number
          code: string
          detail: string
        }[]
      }
      get_schedule_scenario_edge_slot_issues_v1: {
        Args: { p_scenario_id: string }
        Returns: {
          affected_count: number
          code: string
          detail: string
        }[]
      }
      get_schedule_scenario_hard_issues_parallel_core_v2: {
        Args: { p_scenario_id: string }
        Returns: {
          affected_count: number
          code: string
          detail: string
        }[]
      }
      get_schedule_scenario_hard_issues_pre_advanced_v2: {
        Args: { p_scenario_id: string }
        Returns: {
          affected_count: number
          code: string
          detail: string
        }[]
      }
      get_schedule_scenario_hard_issues_pre_edge_v2: {
        Args: { p_scenario_id: string }
        Returns: {
          affected_count: number
          code: string
          detail: string
        }[]
      }
      get_schedule_scenario_hard_issues_pre_phase3: {
        Args: { p_scenario_id: string }
        Returns: {
          affected_count: number
          code: string
          detail: string
        }[]
      }
      get_schedule_scenario_hard_issues_v2: {
        Args: { p_scenario_id: string }
        Returns: {
          affected_count: number
          code: string
          detail: string
        }[]
      }
      get_schedule_scenario_quality_breakdown_v1: {
        Args: { p_scenario_id: string }
        Returns: {
          detail: string
          metric: string
          score: number
        }[]
      }
      get_super_admin_personnel: {
        Args: never
        Returns: {
          active: boolean
          email: string
          full_name: string
          id: string
          institution_code: string
          role: Database["public"]["Enums"]["app_role"]
          school_name: string
          tckn_masked: string
          teaching_area_id: string
        }[]
      }
      get_system_access_state: { Args: { p_path?: string }; Returns: Json }
      get_system_feature_matrix: {
        Args: never
        Returns: {
          enabled: boolean
          feature_key: string
          label: string
          maintenance: boolean
          maintenance_message: string
          parent_key: string
          route_prefix: string
          sort_order: number
        }[]
      }
      has_any_module_permission: {
        Args: { p_module: string }
        Returns: boolean
      }
      has_module_operation_permission: {
        Args: { p_module: string }
        Returns: boolean
      }
      has_permission:
        | { Args: { p_code: string; p_scope?: Json }; Returns: boolean }
        | {
            Args: { p_code: string; p_scope?: Json; p_user_id: string }
            Returns: boolean
          }
      import_class_summaries: {
        Args: { p_file_name: string; p_rows: Json }
        Returns: Json
      }
      import_eokul_roster: {
        Args: { p_file_name: string; p_file_type: string; p_rows: Json }
        Returns: {
          affected_classes: number
          import_batch_id: string
          imported_students: number
        }[]
      }
      import_personnel_registry: {
        Args: { p_file_name: string; p_rows: Json }
        Returns: Json
      }
      import_weekly_schedule: {
        Args: { p_file_name: string; p_file_type: string; p_rows: Json }
        Returns: {
          import_batch_id: string
          imported_rows: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_institution_principal: { Args: never; Returns: boolean }
      is_manager_or_admin: { Args: never; Returns: boolean }
      is_principal_user: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_teaching_day: { Args: { p_date: string }; Returns: boolean }
      is_valid_tckn: { Args: { p_tckn: string }; Returns: boolean }
      kbs_payroll_export: {
        Args: { p_month: number; p_year: number }
        Returns: {
          data_type: string
          explanation: string
          full_name: string
          hours: number
          tckn: string
        }[]
      }
      kbs_payroll_export_permission_core_v2: {
        Args: { p_month: number; p_year: number }
        Returns: {
          data_type: string
          explanation: string
          full_name: string
          hours: number
          tckn: string
        }[]
      }
      materialize_workshop_block_rule_v1: {
        Args: { p_course_id: string }
        Returns: undefined
      }
      max_consecutive_with_candidate: {
        Args: {
          p_exclude_id?: string
          p_period: number
          p_teacher_id: string
          p_weekday: number
        }
        Returns: number
      }
      normalize_class_key: {
        Args: { p_class_name: string; p_program_type: string }
        Returns: string
      }
      normalize_schedule_block_pattern_v2: {
        Args: { p_hours: number; p_pattern: number[] }
        Returns: number[]
      }
      notify_tenant_principals: {
        Args: {
          p_institution_code: string
          p_message: string
          p_priority?: string
          p_title: string
        }
        Returns: undefined
      }
      open_permission_context: { Args: { p_code: string }; Returns: undefined }
      payroll_month_is_locked: {
        Args: { p_month: number; p_year: number }
        Returns: boolean
      }
      payroll_month_matrix: {
        Args: { p_month: number; p_year: number }
        Returns: {
          approved: boolean
          category: string
          full_name: string
          hours: number
          kbs_data_type: string
          role: Database["public"]["Enums"]["app_role"]
          teacher_id: string
          work_date: string
        }[]
      }
      payroll_month_matrix_permission_core_v2: {
        Args: { p_month: number; p_year: number }
        Returns: {
          approved: boolean
          category: string
          full_name: string
          hours: number
          kbs_data_type: string
          role: Database["public"]["Enums"]["app_role"]
          teacher_id: string
          work_date: string
        }[]
      }
      prepare_quran_split: {
        Args: {
          p_academic_year: string
          p_class_id: string
          p_teacher_1: string
          p_teacher_2: string
        }
        Returns: {
          academic_year: string
          class_id: string
          created_at: string
          created_by: string | null
          enabled: boolean
          group_1_id: string | null
          group_2_id: string | null
          id: string
          institution_code: string | null
          source_note: string
          sync_group_id: string | null
          teacher_1_id: string | null
          teacher_2_id: string | null
          threshold: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "quran_split_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      prepare_quran_split_permission_core_v2: {
        Args: {
          p_academic_year: string
          p_class_id: string
          p_teacher_1: string
          p_teacher_2: string
        }
        Returns: {
          academic_year: string
          class_id: string
          created_at: string
          created_by: string | null
          enabled: boolean
          group_1_id: string | null
          group_2_id: string | null
          id: string
          institution_code: string | null
          source_note: string
          sync_group_id: string | null
          teacher_1_id: string | null
          teacher_2_id: string | null
          threshold: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "quran_split_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      publish_current_schedule: {
        Args: {
          p_academic_year?: string
          p_effective_from: string
          p_note?: string
          p_title?: string
        }
        Returns: string
      }
      publish_current_schedule_core_v2: {
        Args: {
          p_academic_year?: string
          p_effective_from: string
          p_note?: string
          p_title?: string
        }
        Returns: string
      }
      publish_current_schedule_permission_core_v2: {
        Args: {
          p_academic_year?: string
          p_effective_from: string
          p_note?: string
          p_title?: string
        }
        Returns: string
      }
      publish_current_schedule_pre_phase3: {
        Args: {
          p_academic_year?: string
          p_effective_from: string
          p_note?: string
          p_title?: string
        }
        Returns: string
      }
      quran_plan_sync_status: { Args: { p_plan_id: string }; Returns: string }
      recalculate_payroll_month: {
        Args: { p_month: number; p_year: number }
        Returns: string
      }
      recalculate_payroll_month_permission_core_v2: {
        Args: { p_month: number; p_year: number }
        Returns: string
      }
      recalculate_payroll_month_v2: {
        Args: { p_month: number; p_year: number }
        Returns: string
      }
      refresh_class_curriculum_status: {
        Args: { p_class_id: string }
        Returns: string
      }
      refresh_schedule_scenario_explanation_v1: {
        Args: { p_scenario_id: string }
        Returns: undefined
      }
      register_push_subscription: {
        Args: {
          p_auth: string
          p_endpoint: string
          p_p256dh: string
          p_platform?: string
          p_user_agent?: string
        }
        Returns: string
      }
      repair_schedule_scenario_core_v2: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      repair_schedule_scenario_permission_core_v2: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      repair_schedule_scenario_pre_phase3_tenant: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      repair_schedule_scenario_v2: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      rescore_schedule_scenario_permission_core_v2: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      rescore_schedule_scenario_pre_phase3_tenant: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      rescore_schedule_scenario_score_core_v3: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      rescore_schedule_scenario_v2: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      resolve_pre_registered_teacher: {
        Args: { p_institution_code: string; p_tckn: string }
        Returns: {
          email: string
          id: string
          institution_code: string
        }[]
      }
      resolve_user_institution: { Args: { p_user_id: string }; Returns: string }
      restore_schedule_restore_point: {
        Args: { p_restore_point_id: string }
        Returns: number
      }
      revoke_task_role_template: {
        Args: { p_template_id: string; p_user_id: string }
        Returns: number
      }
      save_task_role_template: {
        Args: {
          p_description?: string
          p_name: string
          p_permission_codes?: string[]
          p_template_id: string
        }
        Returns: string
      }
      scenario_assignment_run_lengths: {
        Args: { p_assignment: string; p_scenario: string }
        Returns: number[]
      }
      scenario_slot_diagnostic: {
        Args: {
          p_assignment: string
          p_block_hours: number
          p_scenario: string
        }
        Returns: Json
      }
      scenario_teacher_consecutive_count: {
        Args: {
          p_day: number
          p_period: number
          p_scenario: string
          p_teacher: string
        }
        Returns: number
      }
      scenario_teacher_consecutive_count_block_v2: {
        Args: {
          p_block_hours: number
          p_day: number
          p_scenario: string
          p_start: number
          p_teacher: string
        }
        Returns: number
      }
      scenario_teacher_daily_count: {
        Args: { p_day: number; p_scenario: string; p_teacher: string }
        Returns: number
      }
      scenario_teacher_working_days: {
        Args: {
          p_candidate_day?: number
          p_scenario: string
          p_teacher: string
        }
        Returns: number
      }
      schedule_assignment_run_lengths: {
        Args: { p_assignment: string }
        Returns: number[]
      }
      schedule_current_block_matches_phase3_v1: {
        Args: { p_assignment_id: string }
        Returns: boolean
      }
      schedule_rule_mode_v1: { Args: { p_rule_code: string }; Returns: string }
      schedule_rule_weight_v1: {
        Args: {
          p_default: number
          p_profile_weight_key: string
          p_rule_code: string
        }
        Returns: number
      }
      schedule_scenario_block_matches_phase3_v1: {
        Args: { p_assignment_id: string; p_scenario_id: string }
        Returns: boolean
      }
      schedule_subject_matches_edge_rule_v1: {
        Args: { p_rule_code: string; p_subject: string }
        Returns: boolean
      }
      seed_timetable_defaults_for_tenant_v1: {
        Args: { p_code: string }
        Returns: undefined
      }
      set_active_academic_year: {
        Args: { p_academic_year_id: string }
        Returns: boolean
      }
      set_active_academic_year_permission_core_v2: {
        Args: { p_academic_year_id: string }
        Returns: boolean
      }
      set_duty_month_lock: {
        Args: { p_locked: boolean; p_month: string }
        Returns: undefined
      }
      set_duty_month_lock_permission_core_v2: {
        Args: { p_locked: boolean; p_month: string }
        Returns: undefined
      }
      set_personnel_field_override: {
        Args: {
          p_enabled: boolean
          p_field_key: string
          p_module_keys: string[]
        }
        Returns: undefined
      }
      set_personnel_field_rule: {
        Args: {
          p_enabled: boolean
          p_field_key: string
          p_module_keys: string[]
        }
        Returns: undefined
      }
      set_personnel_teaching_area: {
        Args: { p_teaching_area_id?: string; p_user_id: string }
        Returns: boolean
      }
      set_user_permission: {
        Args: {
          p_enabled: boolean
          p_note?: string
          p_permission_code: string
          p_scope?: Json
          p_user_id: string
          p_valid_from?: string
          p_valid_until?: string
        }
        Returns: boolean
      }
      set_user_permission_bundle: {
        Args: {
          p_note?: string
          p_permission_codes: string[]
          p_user_id: string
          p_valid_from?: string
          p_valid_until?: string
        }
        Returns: number
      }
      set_user_permission_mode: {
        Args: { p_mode: string; p_user_id: string }
        Returns: boolean
      }
      student_count_for_schedule: {
        Args: { p_class_id: string; p_subgroup_id: string }
        Returns: number
      }
      suggest_substitutes_for_day: {
        Args: { p_date?: string }
        Returns: {
          absence_lesson_id: string
          candidate_name: string
          candidate_role: Database["public"]["Enums"]["app_role"]
          candidate_user_id: string
          class_id: string
          class_name: string
          period: number
          priority: number
          reason: string
          subject: string
          weekly_load: number
        }[]
      }
      suggest_substitutes_permission_core_v2: {
        Args: { p_date?: string }
        Returns: {
          absence_lesson_id: string
          candidate_name: string
          candidate_role: Database["public"]["Enums"]["app_role"]
          candidate_user_id: string
          class_id: string
          class_name: string
          period: number
          priority: number
          reason: string
          subject: string
          weekly_load: number
        }[]
      }
      super_admin_feature_catalog_audit: {
        Args: never
        Returns: {
          enabled: boolean
          feature_key: string
          label: string
          maintenance: boolean
          parent_key: string
          route_prefix: string
        }[]
      }
      super_admin_list_tenants: {
        Args: never
        Returns: {
          approval_note: string
          approval_status: string
          institution_code: string
          principal_email: string
          principal_name: string
          principal_phone: string
          reviewed_at: string
          school_name: string
        }[]
      }
      super_admin_review_tenant: {
        Args: {
          p_decision: string
          p_institution_code: string
          p_note?: string
        }
        Returns: undefined
      }
      super_admin_send_tenant_message: {
        Args: {
          p_institution_code: string
          p_message: string
          p_severity?: string
          p_title: string
        }
        Returns: undefined
      }
      super_admin_set_feature: {
        Args: {
          p_enabled: boolean
          p_feature_key: string
          p_maintenance?: boolean
          p_message?: string
        }
        Returns: undefined
      }
      super_admin_set_profile_teaching_area: {
        Args: { p_teaching_area_id: string; p_user_id: string }
        Returns: boolean
      }
      super_admin_set_system_maintenance: {
        Args: { p_maintenance: boolean; p_message?: string }
        Returns: undefined
      }
      super_admin_tenant_isolation_audit: { Args: never; Returns: Json }
      super_admin_tenant_key_audit: {
        Args: never
        Returns: {
          columns: string[]
          constraint_name: string
          constraint_type: string
          table_name: string
        }[]
      }
      super_admin_upsert_personnel: {
        Args: {
          p_email?: string
          p_full_name: string
          p_role?: Database["public"]["Enums"]["app_role"]
          p_tckn: string
          p_teaching_area_id?: string
        }
        Returns: string
      }
      super_admin_upsert_personnel_for_tenant: {
        Args: {
          p_email?: string
          p_full_name: string
          p_institution_code: string
          p_role?: Database["public"]["Enums"]["app_role"]
          p_tckn: string
          p_teaching_area_id?: string
        }
        Returns: string
      }
      sync_all_quran_plans_to_timetable: {
        Args: never
        Returns: {
          failed: number
          synced: number
        }[]
      }
      sync_payroll_calendar_from_academic_year: {
        Args: { p_month: number; p_year: number }
        Returns: number
      }
      sync_quran_plan_to_timetable: {
        Args: { p_plan_id: string }
        Returns: string
      }
      sync_schedule_duty_optimization_from_cycle: {
        Args: never
        Returns: number
      }
      teacher_course_permission_status: {
        Args: { p_course_id: string; p_on_date?: string; p_teacher_id: string }
        Returns: string
      }
      tenant_row_allowed: {
        Args: { p_institution_code: string }
        Returns: boolean
      }
      tenantize_public_table: {
        Args: { p_legacy_code?: string; p_table: string }
        Returns: undefined
      }
      try_schedule_edge_target_v1: {
        Args: {
          p_rule_code: string
          p_scenario_id: string
          p_target_period: number
          p_target_weekday: number
        }
        Returns: boolean
      }
      update_my_profile_safe: {
        Args: {
          p_blood_type?: string
          p_emergency_contact?: string
          p_phone?: string
        }
        Returns: {
          blood_type: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          institution_code: string | null
          is_super_admin: boolean
          permission_mode: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          tckn: string | null
          teaching_area_id: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_schedule_slot_permission_core_v2: {
        Args: {
          p_classroom_id?: string
          p_locked?: boolean
          p_period: number
          p_schedule_id?: string
          p_source_kind?: string
          p_subgroup_id?: string
          p_teacher_assignment_id: string
          p_weekday: number
        }
        Returns: string
      }
      upsert_schedule_slot_v2: {
        Args: {
          p_classroom_id?: string
          p_locked?: boolean
          p_period: number
          p_schedule_id?: string
          p_source_kind?: string
          p_subgroup_id?: string
          p_teacher_assignment_id: string
          p_weekday: number
        }
        Returns: string
      }
      validate_schedule_scenario_pre_phase3_tenant: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      validate_schedule_scenario_v2: {
        Args: { p_scenario_id: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "teacher"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "teacher"],
    },
  },
} as const
