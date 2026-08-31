Warning: truncated output (original token count: 95285)
Total output lines: 12248

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
    PostgrestVersion: "14.17"
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
          is_justified_exception: boolean
          note: string | null
          exception_approved_at: string | null
          exception_approved_by: string | null
          exception_permission_status: string | null
          exception_reason: string | null
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
          is_justified_exception?: boolean
          note?: string | null
          exception_approved_at?: string | null
          exception_approved_by?: string | null
          exception_permission_status?: string | null
          exception_reason?: string | null
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
          is_justified_exception?: boolean
          note?: string | null
          exception_approved_at?: string | null
          exception_approved_by?: string | null
          exception_permission_status?: string | null
          exception_reason?: string | null
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
          academic_year_id: string | null
          category: string
          class_id: string
          course_id: string
          created_at: string
          delivery_mode: string | null
          id: string
          institution_code: string | null
          locked: boolean
          note: string | null
          offering_rule_id: string | null
          source_kind: string
          source_template_id: string | null
          updated_at: string
          weekly_hours: number
          workshop_required: boolean
        }
        Insert: {
          academic_year_id?: string | null
          category?: string
          class_id: string
          course_id: string
          created_at?: string
          delivery_mode?: string | null
          id?: string
          institution_code?: string | null
          locked?: boolean
          note?: string | null
          offering_rule_id?: string | null
          source_kind?: string
          source_template_id?: string | null
          updated_at?: string
          weekly_hours: number
          workshop_required?: boolean
        }
        Update: {
          academic_year_id?: string | null
          category?: string
          class_id?: string
          course_id?: string
          created_at?: string
          delivery_mode?: string | null
          id?: string
          institution_code?: string | null
          locked?: boolean
          note?: string | null
          offering_rule_id?: string | null
          source_kind?: string
          source_template_id?: string | null
          updated_at?: string
          weekly_hours?: number
          workshop_required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "class_course_requirements_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "class_course_requirements_offering_rule_id_fkey"
            columns: ["offering_rule_id"]
            isOneToOne: false
            referencedRelation: "course_offering_rules"
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
      class_course_workshop_options: {
        Row: {
          active: boolean
          classroom_id: string
          institution_code: string
          priority: number
          requirement_id: string
        }
        Insert: {
          active?: boolean
          classroom_id: string
          institution_code: string
          priority?: number
          requirement_id: string
        }
        Update: {
          active?: boolean
          classroom_id?: string
          institution_code?: string
          priority?: number
          requirement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_course_workshop_options_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_course_workshop_options_institution_code_fkey"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "class_course_workshop_options_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "class_course_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_course_workshop_options_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["requirement_id"]
          },
        ]
      }
      class_enterprise_week_patterns: {
        Row: {
          active: boolean
          class_id: string
          consecutive_days_required: boolean
          enterprise_day_count: number | null
          enterprise_hours_per_day: number
          enterprise_weekly_hours: number
          institution_code: string
          movable_days: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          class_id: string
          consecutive_days_required?: boolean
          enterprise_day_count?: number | null
          enterprise_hours_per_day?: number
          enterprise_weekly_hours: number
          institution_code: string
          movable_days?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          class_id?: string
          consecutive_days_required?: boolean
          enterprise_day_count?: number | null
          enterprise_hours_per_day?: number
          enterprise_weekly_hours?: number
          institution_code?: string
          movable_days?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enterprise_week_patterns_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: true
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "class_enterprise_week_patterns_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: true
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enterprise_week_patterns_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: true
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enterprise_week_patterns_institution_code_fkey"
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
      class_timetable_application_selections: {
        Row: {
          active: boolean
          class_id: string
          created_at: string
          extra_hours: number | null
          id: string
          rule_id: string
          selection_scope: string
          settings: Json
          subject_choice: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          class_id: string
          created_at?: string
          extra_hours?: number | null
          id?: string
          rule_id: string
          selection_scope?: string
          settings?: Json
          subject_choice?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          class_id?: string
          created_at?: string
          extra_hours?: number | null
          id?: string
          rule_id?: string
          selection_scope?: string
          settings?: Json
          subject_choice?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_timetable_application_selections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "class_timetable_application_selections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_timetable_application_selections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_timetable_application_selections_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "official_timetable_application_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          active: boolean
          aggregate_capacity_enforced: boolean
          branch_id: string | null
          building_id: string | null
          capacity: number
          created_at: string
          department: string | null
          field_id: string | null
          floor: number | null
          hardware: Json
          id: string
          institution_code: string | null
          is_vocational_workshop: boolean
          max_simultaneous_activities: number
          name: string
          room_pool_id: string | null
          room_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          aggregate_capacity_enforced?: boolean
          branch_id?: string | null
          building_id?: string | null
          capacity: number
          created_at?: string
          department?: string | null
          field_id?: string | null
          floor?: number | null
          hardware?: Json
          id?: string
          institution_code?: string | null
          is_vocational_workshop?: boolean
          max_simultaneous_activities?: number
          name: string
          room_pool_id?: string | null
          room_type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          aggregate_capacity_enforced?: boolean
          branch_id?: string | null
          building_id?: string | null
          capacity?: number
          created_at?: string
          department?: string | null
          field_id?: string | null
          floor?: number | null
          hardware?: Json
          id?: string
          institution_code?: string | null
          is_vocational_workshop?: boolean
          max_simultaneous_activities?: number
          name?: string
          room_pool_id?: string | null
          room_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "institution_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classrooms_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "schedule_buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classrooms_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "institution_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classrooms_room_pool_id_fkey"
            columns: ["room_pool_id"]
            isOneToOne: false
            referencedRelation: "schedule_room_pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_classrooms_institution_code"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
      }
      course_block_preferences: {
        Row: {
          active: boolean
          block_pattern: number[]
          class_course_requirement_id: string
          created_at: string
          id: string
          institution_code: string
          priority: number
        }
        Insert: {
          active?: boolean
          block_pattern: number[]
          class_course_requirement_id: string
          created_at?: string
          id?: string
          institution_code?: string
          priority: number
        }
        Update: {
          active?: boolean
          block_pattern?: number[]
          class_course_requirement_id?: string
          created_at?: string
          id?: string
          institution_code?: string
          priority?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_block_preferences_class_course_requirement_id_fkey"
            columns: ["class_course_requirement_id"]
            isOneToOne: false
            referencedRelation: "class_course_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_block_preferences_class_course_requirement_id_fkey"
            columns: ["class_course_requirement_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["requirement_id"]
          },
          {
            foreignKeyName: "course_block_preferences_institution_code_fkey"
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
      course_offering_rules: {
        Row: {
          academic_year: string
          active: boolean
          branch_name: string | null
          category: string
          course_id: string
          created_at: string
          elective_group_key: string | null
          field_name: string | null
          grade_level: number
          hour_options: number[]
          id: string
          institution_code: string
          max_selections: number
          parsed_constraints: Json
          program_type: string | null
          repeat_across_years: boolean
          school_level: string | null
          school_subtype: string | null
          source_file_name: string | null
          source_note: string | null
          updated_at: string
        }
        Insert: {
          academic_year: string
          active?: boolean
          branch_name?: string | null
          category: string
          course_id: string
          created_at?: string
          elective_group_key?: string | null
          field_name?: string | null
          grade_level: number
          hour_options?: number[]
          id?: string
          institution_code?: string
          max_selections?: number
          parsed_constraints?: Json
          program_type?: string | null
          repeat_across_years?: boolean
          school_level?: string | null
          school_subtype?: string | null
          source_file_name?: string | null
          source_note?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          active?: boolean
          branch_name?: string | null
          category?: string
          course_id?: string
          created_at?: string
          elective_group_key?: string | null
          field_name?: string | null
          grade_level?: number
          hour_options?: number[]
          id?: string
          institution_code?: string
          max_selections?: number
          parsed_constraints?: Json
          program_type?: string | null
          repeat_across_years?: boolean
          school_level?: string | null
          school_subtype?: string | null
          source_file_name?: string | null
          source_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_offering_rules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_offering_rules_institution_code_fkey"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
        ]
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
      course_time_preferences: {
        Row: {
          active: boolean
          course_id: string
          id: string
          institution_code: string
          mode: string
          note: string | null
          period: number
          updated_at: string
          weekday: number
          weight: number
        }
        Insert: {
          active?: boolean
          course_id: string
          id?: string
          institution_code?: string
          mode: string
          note?: string | null
          period: number
          updated_at?: string
          weekday: number
          weight?: number
        }
        Update: {
          active?: boolean
          course_id?: string
          id?: string
          institution_code?: string
          mode?: string
          note?: string | null
          period?: number
          updated_at?: string
          weekday?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_time_preferences_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_time_preferences_institution_code_fkey"
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
        …65285 tokens truncated…    reason: string
        }[]
      }
      audit_mtal_catalog_completeness_v1: {
        Args: never
        Returns: {
          branch_name: string
          field_name: string
          issue_type: string
          reason: string
        }[]
      }
      audit_mtal_curriculum_v1: {
        Args: never
        Returns: {
          branch_name: string
          code: string
          detail: string
          field_name: string
          grade_level: number
          program_type: string
          schedule_variant: string
          severity: string
        }[]
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
      calculate_teacher_load_limits_v1: {
        Args: {
          p_full_day_preschool?: boolean
          p_role?: string
          p_teacher_type: string
        }
        Returns: Json
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
      claim_schedule_worker_attempt_v1: {
        Args: { p_worker_key: string }
        Returns: {
          attempt_id: string
          attempt_no: number
          config: Json
          job_id: string
          mode: string
          quality_target: number
          seed: number
        }[]
      }
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
      complete_schedule_worker_attempt_v1: {
        Args: {
          p_attempt_id: string
          p_diagnostics?: Json
          p_duration_ms?: number
          p_hard_issue_count?: number
          p_scenario_id: string
          p_score?: number
          p_unplaced_count?: number
          p_worker_key: string
        }
        Returns: boolean
      }
      course_slot_allowed_v1: {
        Args: { p_course_id: string; p_period: number; p_weekday: number }
        Returns: boolean
      }
      course_slot_penalty_v1: {
        Args: {
          p_block: number
          p_course_id: string
          p_start: number
          p_weekday: number
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
      fail_schedule_worker_attempt_v1: {
        Args: {
          p_attempt_id: string
          p_diagnostics?: Json
          p_worker_key: string
        }
        Returns: string
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
          education_mode: string
          id: string
          institution_code: string | null
          lunch_after_period: number | null
          name: string
          periods_per_day: number
          session_scope: string
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
      get_class_course_pool_v1: {
        Args: { p_class_id: string }
        Returns: {
          already_assigned: boolean
          category: string
          course_id: string
          course_name: string
          current_hours: number
          elective_group_key: string
          eligible: boolean
          expected_hours: number
          hour_options: number[]
          planned_hours: number
          reason: string
          repeat_across_years: boolean
          short_name: string
        }[]
      }
      get_current_custom_rule_issues_v1: {
        Args: never
        Returns: {
          affected_count: number
          code: string
          detail: string
          severity: string
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
      get_iho_application_options_v1: {
        Args: { p_grade: number }
        Returns: {
          allowed_subjects: Json
          approval_scope: string
          code: string
          configuration: Json
          label: string
          requires_subject: boolean
          selection_scope: string
          total_max: number
          total_min: number
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
      get_scenario_block_pattern_v1: {
        Args: {
          p_base: number[]
          p_remaining: number
          p_requirement_id: string
          p_scenario_no: number
        }
        Returns: number[]
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
      get_schedule_activity_instances_v1: {
        Args: never
        Returns: {
          activity_key: string
          class_id: string
          component_no: number
          course_id: string
          duration: number
          teacher_assignment_id: string
          teacher_id: string
        }[]
      }
      get_schedule_assignment_student_conflict_weights_v1: {
        Args: never
        Returns: {
          left_assignment_id: string
          right_assignment_id: string
          student_weight: number
        }[]
      }
      get_schedule_assignment_student_conflict_weights_v2: {
        Args: never
        Returns: {
          left_assignment_id: string
          right_assignment_id: string
          severity_weight: number
          student_weight: number
        }[]
      }
      get_schedule_atomic_move_plan_v1: {
        Args: {
          p_classroom_id?: string
          p_period: number
          p_schedule_id: string
          p_weekday: number
        }
        Returns: Json
      }
      get_schedule_block_integrity_report_v1: {
        Args: never
        Returns: {
          actual_pattern: number[]
          expected_pattern: number[]
          ok: boolean
          teacher_assignment_id: string
        }[]
      }
      get_schedule_block_move_plan_v1: {
        Args: {
          p_classroom_id?: string
          p_period: number
          p_schedule_id: string
          p_weekday: number
        }
        Returns: Json
      }
      get_schedule_building_travel_minutes_v1: {
        Args: { p_from: string; p_to: string }
        Returns: number
      }
      get_schedule_compute_capabilities_v1: {
        Args: never
        Returns: {
          avg_latency_ms: number
          current_load: number
          display_name: string
          health: string
          max_parallel: number
          recommended: boolean
          worker_key: string
          worker_type: string
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
      get_schedule_planning_relations_v1: {
        Args: never
        Returns: {
          id: string
          left_selector: Json
          mode: string
          parameters: Json
          relation_type: string
          right_selector: Json
          weight: number
        }[]
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
      get_schedule_scenario_custom_rule_issues_v1: {
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
      get_schedule_scenario_student_conflict_summary_v1: {
        Args: { p_scenario_id: string }
        Returns: {
          affected_students: number
          conflict_events: number
          weighted_conflict: number
        }[]
      }
      get_schedule_student_conflict_report_v1: {
        Args: never
        Returns: {
          conflict_count: number
          period: number
          student_id: string
          weekday: number
        }[]
      }
      get_schedule_student_conflict_report_v2: {
        Args: never
        Returns: {
          assignment_ids: string[]
          conflict_count: number
          period: number
          student_id: string
          student_name: string
          subjects: string[]
          weekday: number
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
      heartbeat_schedule_compute_worker_v1: {
        Args: {
          p_avg_latency_ms?: number
          p_current_load?: number
          p_health?: string
          p_worker_key: string
        }
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
      import_local_schedule_candidate_v1: {
        Args: { p_rows: Json; p_title?: string }
        Returns: string
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
      infer_school_type_for_class_v1: {
        Args: { p_existing: string; p_grade: number; p_program: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_institution_principal: { Args: never; Returns: boolean }
      is_manager_or_admin: { Args: never; Returns: boolean }
      is_metropolitan_province: { Args: { p_name: string }; Returns: boolean }
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
      link_class_predecessors_for_year_v1: {
        Args: { p_academic_year_id: string }
        Returns: number
      }
      mark_official_source_change_parsed_v1: {
        Args: {
          p_approval_required?: boolean
          p_effective_from?: string
          p_parser_result: Json
          p_queue_id: string
        }
        Returns: undefined
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
      move_schedule_block_v1: {
        Args: {
          p_classroom_id?: string
          p_period: number
          p_schedule_id: string
          p_weekday: number
        }
        Returns: Json
      }
      move_schedule_slot_v1: {
        Args: {
          p_classroom_id?: string
          p_period: number
          p_schedule_id: string
          p_weekday: number
        }
        Returns: string
      }
      move_schedule_slots_batch_v1: { Args: { p_moves: Json }; Returns: Json }
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
      plan_schedule_solve_job_v1: {
        Args: {
          p_candidate_count?: number
          p_compute_preference?: string
          p_mode?: string
          p_quality_target?: number
        }
        Returns: string
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
      preserve_manual_schedule_v1: {
        Args: { p_preserve?: boolean }
        Returns: number
      }
      preview_schedule_batch_move_v1: { Args: { p_moves: Json }; Returns: Json }
      preview_schedule_block_move_v1: {
        Args: {
          p_classroom_id?: string
          p_period: number
          p_schedule_id: string
          p_weekday: number
        }
        Returns: Json
      }
      preview_schedule_move_v1: {
        Args: {
          p_classroom_id?: string
          p_period: number
          p_schedule_id: string
          p_weekday: number
        }
        Returns: Json
      }
      preview_schedule_swap_v1: {
        Args: { p_left_id: string; p_right_id: string }
        Returns: Json
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
      reap_stale_schedule_worker_attempts_v1: { Args: never; Returns: number }
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
      refresh_schedule_repair_suggestions_v1: {
        Args: { p_scenario_id: string }
        Returns: number
      }
      refresh_schedule_scenario_explanation_v1: {
        Args: { p_scenario_id: string }
        Returns: undefined
      }
      register_official_source_snapshot_v1: {
        Args: {
          p_authority?: string
          p_content_hash: string
          p_decision_no?: string
          p_document_date?: string
          p_effective_from?: string
          p_effective_to?: string
          p_http_status?: number
          p_metadata?: Json
          p_raw_location?: string
          p_source_key: string
          p_source_type: string
          p_source_url: string
          p_title?: string
        }
        Returns: {
          changed: boolean
          queue_id: string
          snapshot_id: string
          source_id: string
        }[]
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
      register_schedule_compute_worker_v1: {
        Args: {
          p_capabilities?: Json
          p_cpu_threads?: number
          p_display_name: string
          p_gpu_memory_mb?: number
          p_gpu_model?: string
          p_max_parallel?: number
          p_software_version?: string
          p_worker_key: string
          p_worker_type: string
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
      resolve_class_iho_timetable_v1: {
        Args: { p_class: string }
        Returns: Json
      }
      resolve_iho_application_v1: {
        Args: {
          p_code: string
          p_extra?: number
          p_grade: number
          p_subject?: string
        }
        Returns: Json
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
      schedule_relation_slot_allowed_v1: {
        Args: {
          p_block: number
          p_period: number
          p_requirement_id: string
          p_scenario_id: string
          p_weekday: number
        }
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
      section_students_batch_v1: {
        Args: { p_replace_solver?: boolean }
        Returns: Json
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
      set_class_iho_application_v1: {
        Args: {
          p_class: string
          p_code: string
          p_extra?: number
          p_settings?: Json
          p_subject?: string
        }
        Returns: Json
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
      set_teacher_slot_unavailable_v1: {
        Args: {
          p_blocked: boolean
          p_note?: string
          p_period: number
          p_source?: string
          p_teacher_id: string
          p_weekday: number
        }
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
      suggest_schedule_ejection_chain_v1: {
        Args: {
          p_limit?: number
          p_period: number
          p_schedule_id: string
          p_weekday: number
        }
        Returns: Json
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
      suggest_substitutes_for_day_v3: {
        Args: { p_date?: string }
        Returns: {
          absence_lesson_id: string
          candidate_name: string
          candidate_user_id: string
          class_id: string
          class_name: string
          duty: boolean
          monthly_load: number
          period: number
          qualified: boolean
          rank_score: number
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
      super_admin_import_official_course_schedule_v1: {
        Args: {
          p_effective_academic_year: string
          p_program_type: string
          p_rows: Json
          p_school_type: string
          p_source_file_name: string
        }
        Returns: Json
      }
      super_admin_import_official_course_schedule_v2: {
        Args: { p_profile: Json; p_rows: Json; p_source_file_name: string }
        Returns: Json
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
      super_admin_override_official_course_v1: {
        Args: { p_catalog_id: string; p_patch: Json; p_reason: string }
        Returns: undefined
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
      super_admin_upsert_curriculum_profile_v1: {
        Args: { p_profile: Json }
        Returns: string
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
      swap_schedule_slots_v1: {
        Args: { p_left_id: string; p_right_id: string }
        Returns: Json
      }
      sync_all_quran_plans_to_timetable: {
        Args: never
        Returns: {
          failed: number
          synced: number
        }[]
      }
      sync_official_course_offerings_for_class_v1: {
        Args: { p_class_id: string }
        Returns: number
      }
      sync_official_course_offerings_for_year_v1: {
        Args: { p_academic_year_id: string }
        Returns: number
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
      get_teacher_course_assignment_exceptions_v1: {
        Args: never
        Returns: {
          approved_at: string
          approved_by: string
          class_course_requirement_id: string
          class_name: string
          course_name: string
          reason: string
          teacher_assignment_id: string
          teacher_id: string
        }[]
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
      upsert_official_vocational_catalog_batch: {
        Args: { p_rows: Json }
        Returns: {
          branch_count: number
          field_count: number
        }[]
      }
      upsert_official_vocational_framework_sources_batch: {
        Args: { p_rows: Json }
        Returns: number
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
      vocational_coordination_program_applicable: {
        Args: {
          p_grade: number
          p_grade11_approved?: boolean
          p_has_official_enterprise_course: boolean
          p_program_type: string
        }
        Returns: boolean
      }
      vocational_coordination_weekly_cap: {
        Args: { p_is_metropolitan: boolean; p_program_type: string }
        Returns: number
      }
      vocational_enterprise_days_from_hours: {
        Args: { p_weekly_hours: number }
        Returns: number
      }
      vocational_suggest_group_count: {
        Args: { p_grade: number; p_special?: number; p_students: number }
        Returns: number
      }
      worker_claim_schedule_attempt_v1: {
        Args: { p_worker_key: string }
        Returns: Json
      }
      worker_complete_schedule_attempt_v1: {
        Args: {
          p_attempt_id: string
          p_duration_ms?: number
          p_error?: string
          p_result: Json
          p_worker_key: string
        }
        Returns: boolean
      }
      worker_heartbeat_schedule_v1: {
        Args: { p_latency_ms?: number; p_load?: number; p_worker_key: string }
        Returns: boolean
      }
      workshop_block_patterns: {
        Args: { p_daily_capacity: number; p_total: number }
        Returns: {
          part_count: number
          pattern: number[]
        }[]
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
