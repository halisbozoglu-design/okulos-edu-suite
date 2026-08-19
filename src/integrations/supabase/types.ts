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
            foreignKeyName: "assignment_audit_log_old_substitute_user_id_fkey"
            columns: ["old_substitute_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      crisis_reports: {
        Row: {
          created_at: string
          has_medical_report: boolean
          id: string
          note: string | null
          report_date: string
          status: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          has_medical_report?: boolean
          id?: string
          note?: string | null
          report_date?: string
          status?: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          has_medical_report?: boolean
          id?: string
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
        ]
      }
      duty_rotation: {
        Row: {
          created_at: string
          duty_date: string
          vice_principal_id: string
        }
        Insert: {
          created_at?: string
          duty_date: string
          vice_principal_id: string
        }
        Update: {
          created_at?: string
          duty_date?: string
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
        ]
      }
      eokul_import_batches: {
        Row: {
          file_name: string
          file_type: string
          id: string
          imported_at: string
          imported_by: string
          row_count: number
        }
        Insert: {
          file_name: string
          file_type: string
          id?: string
          imported_at?: string
          imported_by: string
          row_count?: number
        }
        Update: {
          file_name?: string
          file_type?: string
          id?: string
          imported_at?: string
          imported_by?: string
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
        ]
      }
      fcm_tokens: {
        Row: {
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          platform?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
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
        ]
      }
      payroll_calculation_runs: {
        Row: {
          calculated_by: string
          created_at: string
          id: string
          period_end: string
          period_start: string
          rule_version: string
          status: string
        }
        Insert: {
          calculated_by: string
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          rule_version?: string
          status?: string
        }
        Update: {
          calculated_by?: string
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          rule_version?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_calculation_runs_calculated_by_fkey"
            columns: ["calculated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
          source_note?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_calendar_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
          explanation: string | null
          hours: number
          id: string
          kbs_data_type: string
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
          explanation?: string | null
          hours?: number
          id?: string
          kbs_data_type?: string
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
          explanation?: string | null
          hours?: number
          id?: string
          kbs_data_type?: string
          source_id?: string | null
          source_type?: string
          teacher_id?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_day_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_day_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
          role: Database["public"]["Enums"]["app_role"]
          tckn: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tckn: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tckn?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          blood_type: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          tckn: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blood_type?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tckn: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blood_type?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tckn?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      school_classes: {
        Row: {
          active: boolean
          class_name: string
          composite_key: string | null
          grade_level: number | null
          id: string
          program_type: string | null
          section: string | null
          source: string
          split_threshold: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          class_name: string
          composite_key?: string | null
          grade_level?: number | null
          id?: string
          program_type?: string | null
          section?: string | null
          source?: string
          split_threshold?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          class_name?: string
          composite_key?: string | null
          grade_level?: number | null
          id?: string
          program_type?: string | null
          section?: string | null
          source?: string
          split_threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          active: boolean
          class_id: string
          created_at: string
          full_name: string
          id: string
          import_batch_id: string | null
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
          school_number?: string
          source?: string
          updated_at?: string
        }
        Relationships: [
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
          notified_at?: string | null
          substitute_user_id?: string
        }
        Relationships: [
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
            foreignKeyName: "substitute_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "substitute_assignments_substitute_user_id_fkey"
            columns: ["substitute_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      teacher_duty_assignments: {
        Row: {
          duty_date: string
          teacher_id: string
        }
        Insert: {
          duty_date: string
          teacher_id: string
        }
        Update: {
          duty_date?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_duty_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      teacher_payroll_config: {
        Row: {
          active: boolean
          gunduz_kbs_data_type: string
          has_class_guidance: boolean
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
          nobet_kbs_data_type?: string
          rehberlik_kbs_data_type?: string
          teacher_id?: string
          updated_at?: string
          weekly_salary_obligation?: number
        }
        Relationships: [
          {
            foreignKeyName: "teacher_payroll_config_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      teacher_schedule: {
        Row: {
          class_id: string | null
          class_name: string
          id: string
          period: number
          subject: string
          teacher_id: string
          weekday: number
        }
        Insert: {
          class_id?: string | null
          class_name: string
          id?: string
          period: number
          subject: string
          teacher_id: string
          weekday: number
        }
        Update: {
          class_id?: string | null
          class_name?: string
          id?: string
          period?: number
          subject?: string
          teacher_id?: string
          weekday?: number
        }
        Relationships: [
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
            foreignKeyName: "teacher_schedule_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vice_principals: {
        Row: {
          active: boolean
          user_id: string
        }
        Insert: {
          active?: boolean
          user_id: string
        }
        Update: {
          active?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vice_principals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
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
    }
    Functions: {
      approve_payroll_month: {
        Args: { p_month: number; p_year: number }
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
      import_eokul_roster: {
        Args: { p_file_name: string; p_file_type: string; p_rows: Json }
        Returns: {
          affected_classes: number
          import_batch_id: string
          imported_students: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_manager_or_admin: { Args: never; Returns: boolean }
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
      normalize_class_key: {
        Args: { p_class_name: string; p_program_type: string }
        Returns: string
      }
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
      recalculate_payroll_month: {
        Args: { p_month: number; p_year: number }
        Returns: string
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
