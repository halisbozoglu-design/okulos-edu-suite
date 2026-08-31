Warning: truncated output (original token count: 79431)
Total output lines: 9999

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
      institution_branches: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          field_id: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          field_id: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          field_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_branches_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "institution_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_education_units: {
        Row: {
          academic_year_id: string | null
          active: boolean
          created_at: string
          education_mode: string
          id: string
          institution_code: string
          program_type: string | null
          school_subtype: string | null
          school_type: string
          session_scope: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          active?: boolean
          created_at?: string
          education_mode?: string
          id?: string
          institution_code: string
          program_type?: string | null
          school_subtype?: string | null
          school_type: string
          session_scope?: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          active?: boolean
          created_at?: string
          education_mode?: string
          id?: string
          institution_code?: string
          program_type?: string | null
          school_subtype?: string | null
          school_type?: string
          session_scope?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_education_units_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_fields: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          id: string
          name: string
          unit_id: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          id?: string
          name: string
          unit_id: string
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_fields_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "institution_education_units"
            referencedColumns: ["id"]
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
          is_metropolitan_district: boolean | null
          province_name: string | null
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
          is_metropolitan_district?: boolean | null
          province_name?: string | null
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
          is_metropolitan_district?: boolean | null
          province_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_rule_definitions: {
        Row: {
          active: boolean
          condition_note: string | null
          domain: string
          effective_from: string
          effective_to: string | null
          id: string
          parameters: Json
          rule_code: string
          source_id: string | null
          subject_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          condition_note?: string | null
          domain: string
          effective_from: string
          effective_to?: string | null
          id?: string
          parameters: Json
          rule_code: string
          source_id?: string | null
          subject_type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          condition_note?: string | null
          domain?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          parameters?: Json
          rule_code?: string
          source_id?: string | null
          subject_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_rule_definitions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "legal_rule_sources"
            referencedColumns: ["id"]
          },
        ]
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
          exception_approved_at: string | null
          exception_approved_by: string | null
          exception_permission_status: string | null
          exception_reason: string | null
          exception_valid_from: string | null
          exception_valid_until: string | null
          id: string
          institution_code: string | null
          is_justified_exception: boolean
          legislation_id: string
          message: string | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          exception_approved_at?: string | null
          exception_approved_by?: string | null
          exception_permission_status?: string | null
          exception_reason?: string | null
          exception_valid_from?: string | null
          exception_valid_until?: string | null
          id?: string
          institution_code?: string | null
          is_justified_exception?: boolean
          legislation_id: string
          message?: string | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          exception_approved_at?: string | null
          exception_approved_by?: string | null
          exception_permission_status?: string | null
          exception_reason?: string | null
          exception_valid_from?: string | null
          exception_valid_until?: string | null
          id?: string
          institution_code?: string | null
          is_justified_exception?: boolean
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
      metropolitan_provinces: {
        Row: {
          active: boolean
          name: string
          source_note: string | null
        }
        Insert: {
          active?: boolean
          name: string
          source_note?: string | null
        }
        Update: {
          active?: boolean
          name?: string
          source_note?: string | null
        }
        Relationships: []
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
      official_course_rule_annotations: {
        Row: {
          active: boolean
          catalog_id: string | null
          created_at: string
          id: string
          parameters: Json
          rule_code: string
          rule_type: string
          severity: string
          source_ref: string | null
          source_text: string
        }
        Insert: {
          active?: boolean
          catalog_id?: string | null
          created_at?: string
          id?: string
          parameters?: Json
          rule_code: string
          rule_type: string
          severity?: string
          source_ref?: string | null
          source_text: string
        }
        Update: {
          active?: boolean
          catalog_id?: string | null
          created_at?: string
          id?: string
          parameters?: Json
          rule_code?: string
          rule_type?: string
          severity?: string
          source_ref?: string | null
          source_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "official_course_rule_annotations_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "official_course_schedule_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "official_course_rule_annotations_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "official_course_schedule_effective"
            referencedColumns: ["id"]
          },
        ]
      }
      official_course_schedule_catalog: {
        Row: {
          active: boolean
          branch_name: string | null
          category: string
          course_id: string
          effective_academic_year: string
          elective_group_key: string | null
          field_name: string | null
          grade_level: number
          hour_options: number[]
          id: string
          imported_at: string
          max_selections: number
          needs_review: boolean
          parsed_constraints: Json
          parser_confidence: number | null
          program_type: string | null
          repeat_across_years: boolean
          schedule_variant: string
          school_subtype: string | null
          school_type: string
          source_decision_date: string | null
          source_decision_no: string | null
          source_file_name: string | null
          source_note: string | null
          source_page: number | null
          source_section: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          branch_name?: string | null
          category: string
          course_id: string
          effective_academic_year: string
          elective_group_key?: string | null
          field_name?: string | null
          grade_level: number
          hour_options: number[]
          id?: string
          imported_at?: string
          max_selections?: number
          needs_review?: boolean
          parsed_constraints?: Json
          parser_confidence?: number | null
          program_type?: string | null
          repeat_across_years?: boolean
          schedule_variant?: string
          school_subtype?: string | null
          school_type: string
          source_decision_date?: string | null
          source_decision_no?: string | null
          source_file_name?: string | null
          source_note?: string | null
          source_page?: number | null
          source_section?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          branch_name?: string | null
          category?: string
          course_id?: string
          effective_academic_year?: string
          elective_group_key?: string | null
          field_name?: string | null
          grade_level?: number
          hour_options?: number[]
          id?: string
          imported_at?: string
          max_selections?: number
          needs_review?: boolean
          parsed_constraints?: Json
          parser_confidence?: number | null
          program_type?: string | null
          repeat_across_years?: boolean
          schedule_variant?: string
          school_subtype?: string | null
          school_type?: string
          source_decision_date?: string | null
          source_decision_no?: string | null
          source_file_name?: string | null
          source_note?: string | null
          source_page?: number | null
          source_section?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "official_course_schedule_catalog_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      official_course_schedule_overrides: {
        Row: {
          active: boolean
          branch_name: string | null
          catalog_id: string
          category: string | null
          elective_group_key: string | null
          field_name: string | null
          grade_level: number | null
          hour_options: number[] | null
          id: string
          max_selections: number | null
          parsed_constraints: Json | null
          program_type: string | null
          reason: string
          repeat_across_years: boolean | null
          school_subtype: string | null
          source_note: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          branch_name?: string | null
          catalog_id: string
          category?: string | null
          elective_group_key?: string | null
          field_name?: string | null
          grade_level?: number | null
          hour_options?: number[] | null
          id?: string
          max_selections?: number | null
          parsed_constraints?: Json | null
          program_type?: string | null
          reason: string
          repeat_across_years?: boolean | null
          school_subtype?: string | null
          source_note?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          branch_name?: string | null
          catalog_id?: string
          category?: string | null
          elective_group_key?: string | null
          field_name?: string | null
          grade_level?: number | null
          hour_options?: number[] | null
          id?: string
          max_selections?: number | null
          parsed_constraints?: Json | null
          program_type?: string | null
          reason?: string
          repeat_across_years?: boolean | null
          school_subtype?: string | null
          source_note?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "official_course_schedule_overrides_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: true
            referencedRelation: "official_course_schedule_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "official_course_schedule_overrides_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: true
            referencedRelation: "official_course_schedule_effective"
            referencedColumns: ["id"]
          },
        ]
      }
      official_curriculum_catalog_status: {
        Row: {
          branch_name: string
          field_name: string
          institution_type: string
          reason: string | null
          source_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          branch_name: string
          field_name: string
          institution_type: string
          reason?: string | null
          source_url?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          branch_name?: string
          field_name?: string
          institution_type?: string
          reason?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      official_curriculum_profiles: {
        Row: {
          academic_support_hours: number | null
          active: boolean
          applicability_status: string
          branch_name: string | null
          common_hours: number | null
          effective_academic_year: string
          electi…29431 tokens truncated…"
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
      schedule_solve_attempts: {
        Row: {
          attempt_no: number
          claimed_at: string | null
          diagnostics: Json
          duration_ms: number | null
          finished_at: string | null
          hard_issue_count: number | null
          id: string
          job_id: string
          lease_until: string | null
          profile_key: string | null
          result_payload: Json
          scenario_id: string | null
          score: number | null
          seed: number | null
          started_at: string | null
          status: string
          unplaced_count: number | null
          worker_id: string | null
        }
        Insert: {
          attempt_no: number
          claimed_at?: string | null
          diagnostics?: Json
          duration_ms?: number | null
          finished_at?: string | null
          hard_issue_count?: number | null
          id?: string
          job_id: string
          lease_until?: string | null
          profile_key?: string | null
          result_payload?: Json
          scenario_id?: string | null
          score?: number | null
          seed?: number | null
          started_at?: string | null
          status?: string
          unplaced_count?: number | null
          worker_id?: string | null
        }
        Update: {
          attempt_no?: number
          claimed_at?: string | null
          diagnostics?: Json
          duration_ms?: number | null
          finished_at?: string | null
          hard_issue_count?: number | null
          id?: string
          job_id?: string
          lease_until?: string | null
          profile_key?: string | null
          result_payload?: Json
          scenario_id?: string | null
          score?: number | null
          seed?: number | null
          started_at?: string | null
          status?: string
          unplaced_count?: number | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_solve_attempts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "schedule_solve_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_solve_attempts_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenario_status_v2"
            referencedColumns: ["scenario_id"]
          },
          {
            foreignKeyName: "schedule_solve_attempts_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "schedule_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_solve_attempts_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "schedule_compute_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_solve_jobs: {
        Row: {
          candidate_count: number
          compute_preference: string
          config: Json
          created_at: string
          finished_at: string | null
          id: string
          institution_code: string
          mode: string
          quality_target: number
          requested_by: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          candidate_count?: number
          compute_preference?: string
          config?: Json
          created_at?: string
          finished_at?: string | null
          id?: string
          institution_code?: string
          mode?: string
          quality_target?: number
          requested_by?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          candidate_count?: number
          compute_preference?: string
          config?: Json
          created_at?: string
          finished_at?: string | null
          id?: string
          institution_code?: string
          mode?: string
          quality_target?: number
          requested_by?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: []
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
        Insert: {
          active?: boolean
          created_at?: string
          education_mode?: string
          id?: string
          institution_code?: string | null
          lunch_after_period?: number | null
          name: string
          periods_per_day?: number
          session_scope?: string
          teaching_days?: number[]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          education_mode?: string
          id?: string
          institution_code?: string | null
          lunch_after_period?: number | null
          name?: string
          periods_per_day?: number
          session_scope?: string
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
          forbid_all_small_blocks: boolean
          institution_code: string
          max_block: number
          min_block: number
          minimize_fragmentation: boolean
          preferred_block: number
          preferred_patterns: number[]
          resource_balance_weight: number
          setup_cleanup_weight: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          course_id: string
          forbid_all_small_blocks?: boolean
          institution_code?: string
          max_block?: number
          min_block?: number
          minimize_fragmentation?: boolean
          preferred_block?: number
          preferred_patterns?: number[]
          resource_balance_weight?: number
          setup_cleanup_weight?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          course_id?: string
          forbid_all_small_blocks?: boolean
          institution_code?: string
          max_block?: number
          min_block?: number
          minimize_fragmentation?: boolean
          preferred_block?: number
          preferred_patterns?: number[]
          resource_balance_weight?: number
          setup_cleanup_weight?: number
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
          academic_year_id: string | null
          active: boolean
          advisor_teacher_id: string | null
          branch_id: string | null
          class_name: string
          composite_key: string | null
          curriculum_status: string
          education_unit_id: string | null
          expected_weekly_hours: number | null
          field_id: string | null
          grade_level: number | null
          id: string
          imported_student_count: number | null
          institution_code: string | null
          predecessor_class_id: string | null
          program_type: string | null
          school_subtype: string | null
          school_type: string | null
          section: string | null
          source: string
          source_file_name: string | null
          split_threshold: number
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          active?: boolean
          advisor_teacher_id?: string | null
          branch_id?: string | null
          class_name: string
          composite_key?: string | null
          curriculum_status?: string
          education_unit_id?: string | null
          expected_weekly_hours?: number | null
          field_id?: string | null
          grade_level?: number | null
          id?: string
          imported_student_count?: number | null
          institution_code?: string | null
          predecessor_class_id?: string | null
          program_type?: string | null
          school_subtype?: string | null
          school_type?: string | null
          section?: string | null
          source?: string
          source_file_name?: string | null
          split_threshold?: number
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          active?: boolean
          advisor_teacher_id?: string | null
          branch_id?: string | null
          class_name?: string
          composite_key?: string | null
          curriculum_status?: string
          education_unit_id?: string | null
          expected_weekly_hours?: number | null
          field_id?: string | null
          grade_level?: number | null
          id?: string
          imported_student_count?: number | null
          institution_code?: string | null
          predecessor_class_id?: string | null
          program_type?: string | null
          school_subtype?: string | null
          school_type?: string | null
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
          {
            foreignKeyName: "school_classes_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_classes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "institution_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_classes_education_unit_id_fkey"
            columns: ["education_unit_id"]
            isOneToOne: false
            referencedRelation: "institution_education_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_classes_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "institution_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_classes_predecessor_class_id_fkey"
            columns: ["predecessor_class_id"]
            isOneToOne: false
            referencedRelation: "class_curriculum_summary"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "school_classes_predecessor_class_id_fkey"
            columns: ["predecessor_class_id"]
            isOneToOne: false
            referencedRelation: "class_roster_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_classes_predecessor_class_id_fkey"
            columns: ["predecessor_class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_course_requests: {
        Row: {
          active: boolean
          allow_overlap: boolean
          alternative_group: string | null
          course_id: string
          created_at: string
          id: string
          institution_code: string
          priority: number
          request_kind: string
          source: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          allow_overlap?: boolean
          alternative_group?: string | null
          course_id: string
          created_at?: string
          id?: string
          institution_code?: string
          priority?: number
          request_kind?: string
          source?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          allow_overlap?: boolean
          alternative_group?: string | null
          course_id?: string
          created_at?: string
          id?: string
          institution_code?: string
          priority?: number
          request_kind?: string
          source?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_course_requests_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_course_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_free_time_requests: {
        Row: {
          active: boolean
          created_at: string
          id: string
          institution_code: string
          mode: string
          periods: number[]
          student_id: string
          updated_at: string
          weekday: number
          weight: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          institution_code?: string
          mode?: string
          periods: number[]
          student_id: string
          updated_at?: string
          weekday: number
          weight?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          institution_code?: string
          mode?: string
          periods?: number[]
          student_id?: string
          updated_at?: string
          weekday?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_free_time_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_schedule_enrollments: {
        Row: {
          active: boolean
          created_at: string
          id: string
          institution_code: string
          locked: boolean
          source: string
          student_id: string
          teacher_assignment_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          institution_code?: string
          locked?: boolean
          source?: string
          student_id: string
          teacher_assignment_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          institution_code?: string
          locked?: boolean
          source?: string
          student_id?: string
          teacher_assignment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_schedule_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_schedule_enrollments_teacher_assignment_id_fkey"
            columns: ["teacher_assignment_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["teacher_assignment_id"]
          },
          {
            foreignKeyName: "student_schedule_enrollments_teacher_assignment_id_fkey"
            columns: ["teacher_assignment_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      student_sectioning_issues: {
        Row: {
          code: string
          created_at: string
          detail: string | null
          id: string
          institution_code: string
          request_id: string | null
          student_id: string
        }
        Insert: {
          code: string
          created_at?: string
          detail?: string | null
          id?: string
          institution_code?: string
          request_id?: string | null
          student_id: string
        }
        Update: {
          code?: string
          created_at?: string
          detail?: string | null
          id?: string
          institution_code?: string
          request_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_sectioning_issues_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "student_course_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_sectioning_issues_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
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
          section_capacity: number | null
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
          section_capacity?: number | null
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
          section_capacity?: number | null
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
      teacher_flexible_schedule_duties: {
        Row: {
          active: boolean
          duty_type: string
          id: string
          institution_code: string
          locked: boolean
          min_block_hours: number
          movable: boolean
          placement_phase: string
          placement_strategy: string
          source_id: string | null
          teacher_id: string
          total_hours: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          duty_type: string
          id?: string
          institution_code: string
          locked?: boolean
          min_block_hours?: number
          movable?: boolean
          placement_phase: string
          placement_strategy?: string
          source_id?: string | null
          teacher_id: string
          total_hours: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          duty_type?: string
          id?: string
          institution_code?: string
          locked?: boolean
          min_block_hours?: number
          movable?: boolean
          placement_phase?: string
          placement_strategy?: string
          source_id?: string | null
          teacher_id?: string
          total_hours?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_flexible_schedule_duties_institution_code_fkey"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "teacher_flexible_schedule_duties_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teacher_flexible_schedule_duties_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
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
          note: string | null
          period: number
          reason: string
          source: string
          teacher_id: string
          weekday: number
        }
        Insert: {
          active?: boolean
          approved_at?: string | null
          approved_by?: string | null
          id?: string
          institution_code?: string | null
          note?: string | null
          period: number
          reason?: string
          source?: string
          teacher_id: string
          weekday: number
        }
        Update: {
          active?: boolean
          approved_at?: string | null
          approved_by?: string | null
          id?: string
          institution_code?: string | null
          note?: string | null
          period?: number
          reason?: string
          source?: string
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
      vocational_coordination_plans: {
        Row: {
          academic_year_id: string | null
          active: boolean
          daily_coordination_max_hours: number
          education_unit_id: string | null
          eligible_teacher_count: number
          enterprise_days_per_week: number | null
          enterprise_weekly_hours: number | null
          field_id: string
          grade_level: number | null
          high_target: number | null
          high_target_teacher_count: number | null
          id: string
          institution_code: string
          is_metropolitan_district: boolean | null
          low_target: number | null
          program_type: string | null
          source_requirement_id: string | null
          source_rule: string | null
          total_hours: number
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          active?: boolean
          daily_coordination_max_hours?: number
          education_unit_id?: string | null
          eligible_teacher_count: number
          enterprise_days_per_week?: number | null
          enterprise_weekly_hours?: number | null
          field_id: string
          grade_level?: number | null
          high_target?: number | null
          high_target_teacher_count?: number | null
          id?: string
          institution_code: string
          is_metropolitan_district?: boolean | null
          low_target?: number | null
          program_type?: string | null
          source_requirement_id?: string | null
          source_rule?: string | null
          total_hours: number
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          active?: boolean
          daily_coordination_max_hours?: number
          education_unit_id?: string | null
          eligible_teacher_count?: number
          enterprise_days_per_week?: number | null
          enterprise_weekly_hours?: number | null
          field_id?: string
          grade_level?: number | null
          high_target?: number | null
          high_target_teacher_count?: number | null
          id?: string
          institution_code?: string
          is_metropolitan_district?: boolean | null
          low_target?: number | null
          program_type?: string | null
          source_requirement_id?: string | null
          source_rule?: string | null
          total_hours?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocational_coordination_plans_education_unit_id_fkey"
            columns: ["education_unit_id"]
            isOneToOne: false
            referencedRelation: "institution_education_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocational_coordination_plans_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "institution_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocational_coordination_plans_institution_code_fkey"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "vocational_coordination_plans_source_requirement_id_fkey"
            columns: ["source_requirement_id"]
            isOneToOne: false
            referencedRelation: "class_course_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocational_coordination_plans_source_requirement_id_fkey"
            columns: ["source_requirement_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["requirement_id"]
          },
        ]
      }
      vocational_course_group_plans: {
        Row: {
          applied_group_count: number
          groupable: boolean
          id: string
          institution_code: string
          override_reason: string | null
          requirement_id: string
          source_rule: string | null
          special_needs_student_count: number
          student_count: number
          suggested_group_count: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          applied_group_count: number
          groupable?: boolean
          id?: string
          institution_code: string
          override_reason?: string | null
          requirement_id: string
          source_rule?: string | null
          special_needs_student_count?: number
          student_count: number
          suggested_group_count: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          applied_group_count?: number
          groupable?: boolean
          id?: string
          institution_code?: string
          override_reason?: string | null
          requirement_id?: string
          source_rule?: string | null
          special_needs_student_count?: number
          student_count?: number
          suggested_group_count?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vocational_course_group_plans_institution_code_fkey"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "vocational_course_group_plans_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: true
            referencedRelation: "class_course_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocational_course_group_plans_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: true
            referencedRelation: "schedule_assignment_options"
            referencedColumns: ["requirement_id"]
          },
        ]
      }
      vocational_lead_assignments: {
        Row: {
          active: boolean
          duty_type: string
          field_id: string
          id: string
          institution_code: string
          teacher_id: string
          updated_at: string
          weekly_hours: number
          workshop_id: string | null
        }
        Insert: {
          active?: boolean
          duty_type: string
          field_id: string
          id?: string
          institution_code: string
          teacher_id: string
          updated_at?: string
          weekly_hours: number
          workshop_id?: string | null
        }
        Update: {
          active?: boolean
          duty_type?: string
          field_id?: string
          id?: string
          institution_code?: string
          teacher_id?: string
          updated_at?: string
          weekly_hours?: number
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vocational_lead_assignments_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "institution_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocational_lead_assignments_institution_code_fkey"
            columns: ["institution_code"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_code"]
          },
          {
            foreignKeyName: "vocational_lead_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vocational_lead_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_course_load_summary"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "vocational_lead_assignments_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      vocational_program_schedule_policies: {
        Row: {
          active: boolean
          default_enterprise_days: number | null
          default_school_days: number | null
          eligible_grades: number[]
          program_type: string
          regular_year_enterprise_mode: string
          source_rule: string
          updated_at: string
          weekly_hours_from_official_schedule: boolean
        }
        Insert: {
          active?: boolean
          default_enterprise_days?: number | null
          default_school_days?: number | null
          eligible_grades: number[]
          program_type: string
          regular_year_enterprise_mode: string
          source_rule: string
          updated_at?: string
          weekly_hours_from_official_schedule?: boolean
        }
        Update: {
          active?: boolean
          default_enterprise_days?: number | null
          default_school_days?: number | null
          eligible_grades?: number[]
          program_type?: string
          regular_year_enterprise_mode?: string
          source_rule?: string
          updated_at?: string
          weekly_hours_from_official_schedule?: boolean
        }
        Relationships: []
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
          academic_year_id: string | null
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
        Relationships: [
          {
            foreignKeyName: "school_classes_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      official_course_schedule_effective: {
        Row: {
          active: boolean | null
          branch_name: string | null
          category: string | null
          course_id: string | null
          effective_academic_year: string | null
          elective_group_key: string | null
          field_name: string | null
          grade_level: number | null
          hour_options: number[] | null
          id: string | null
          manually_overridden: boolean | null
          max_selections: number | null
          needs_review: boolean | null
          parsed_constraints: Json | null
          parser_confidence: number | null
          program_type: string | null
          repeat_across_years: boolean | null
          schedule_variant: string | null
          school_subtype: string | null
          school_type: string | null
          source_decision_date: string | null
          source_decision_no: string | null
          source_file_name: string | null
          source_note: string | null
          source_page: number | null
          source_section: string | null
        }
        Relationships: [
          {
            foreignKeyName: "official_course_schedule_catalog_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_catalog"
            referencedColumns: ["id"]
          },
        ]
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
      accept_schedule_worker_result_v1: {
        Args: { p_attempt_id: string }
        Returns: string
      }
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
      apply_schedule_repair_suggestion_v1: {
        Args: { p_suggestion_id: string }
        Returns: Json
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
      approve_official_source_change_v1: {
        Args: {
          p_calendar_event_type?: string
          p_calendar_title?: string
          p_queue_id: string
        }
        Returns: string
      }
      approve_official_source_change_v2: { Args: { p_note?: string; p_queue_id: string }; Returns: undefined }
      approve_payroll_activity: {
        Args: { p_activity_id: string; p_approve?: boolean }
        Returns: boolean
      }
      approve_payroll_activity_permission_core_v2: {
        Args: { p_activity_id: string; p_approve?: boolean }
