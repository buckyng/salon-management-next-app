export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      check_ins: {
        Row: {
          client_id: string
          created_at: string | null
          created_date: string | null
          group_id: string
          id: string
          is_in_service: boolean | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          created_date?: string | null
          group_id: string
          id?: string
          is_in_service?: boolean | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          created_date?: string | null
          group_id?: string
          id?: string
          is_in_service?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      client_group_details: {
        Row: {
          agree_to_terms: boolean
          client_id: string
          created_at: string | null
          group_id: string
          id: string
          last_visit_rating: number | null
          number_of_visits: number | null
          updated_at: string | null
        }
        Insert: {
          agree_to_terms: boolean
          client_id: string
          created_at?: string | null
          group_id: string
          id?: string
          last_visit_rating?: number | null
          number_of_visits?: number | null
          updated_at?: string | null
        }
        Update: {
          agree_to_terms?: boolean
          client_id?: string
          created_at?: string | null
          group_id?: string
          id?: string
          last_visit_rating?: number | null
          number_of_visits?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_group_details_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_group_details_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      employee_schedules: {
        Row: {
          created_at: string
          group_id: string
          id: string
          user_id: string
          weekday: Database["public"]["Enums"]["weekday_enum"]
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          user_id: string
          weekday: Database["public"]["Enums"]["weekday_enum"]
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
          weekday?: Database["public"]["Enums"]["weekday_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "employee_schedules_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_turns: {
        Row: {
          completed: boolean
          created_at: string | null
          created_date: string | null
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string | null
          created_date?: string | null
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string | null
          created_date?: string | null
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_turns_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_turns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      eod_reports: {
        Row: {
          cash: number
          created_at: string | null
          date: string
          debit: number
          expense: number | null
          expense_note: string | null
          giftcard_buy: number | null
          giftcard_redeem: number | null
          group_id: string
          id: string
          income_note: string | null
          other_income: number | null
          result: number
          service_discount: number | null
          total_sale: number
          updated_at: string | null
        }
        Insert: {
          cash: number
          created_at?: string | null
          date: string
          debit: number
          expense?: number | null
          expense_note?: string | null
          giftcard_buy?: number | null
          giftcard_redeem?: number | null
          group_id: string
          id?: string
          income_note?: string | null
          other_income?: number | null
          result: number
          service_discount?: number | null
          total_sale: number
          updated_at?: string | null
        }
        Update: {
          cash?: number
          created_at?: string | null
          date?: string
          debit?: number
          expense?: number | null
          expense_note?: string | null
          giftcard_buy?: number | null
          giftcard_redeem?: number | null
          group_id?: string
          id?: string
          income_note?: string | null
          other_income?: number | null
          result?: number
          service_discount?: number | null
          total_sale?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eod_reports_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string | null
          group_id: string
          id: string
          rating: number
          updated_at: string | null
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string | null
          group_id: string
          id?: string
          rating: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string | null
          group_id?: string
          id?: string
          rating?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          group_id: string
          id: string
          invited_by: string
          roles: string[]
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          group_id: string
          id?: string
          invited_by: string
          roles?: string[]
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          group_id?: string
          id?: string
          invited_by?: string
          roles?: string[]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_invites_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_users: {
        Row: {
          created_at: string
          group_id: string
          id: string
          metadata: Json
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          metadata?: Json
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          metadata?: Json
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_users_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_users_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          google_sheet_id: string | null
          id: string
          logo_url: string | null
          metadata: Json
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          google_sheet_id?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          google_sheet_id?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount: number
          combo_num: number | null
          created_at: string | null
          created_date: string | null
          group_id: string
          id: string
          note: string | null
          paid: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          combo_num?: number | null
          created_at?: string | null
          created_date?: string | null
          group_id: string
          id?: string
          note?: string | null
          paid?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          combo_num?: number | null
          created_at?: string | null
          created_date?: string | null
          group_id?: string
          id?: string
          note?: string | null
          paid?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_unique_player_id: {
        Args: { uid: string; pid: string }
        Returns: undefined
      }
      check_eod_report_exists: {
        Args: { group_id_input: string; date_input: string }
        Returns: boolean
      }
      db_pre_request: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_claims: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      increment_visits: {
        Args: { arg_client_id: string; arg_group_id: string }
        Returns: undefined
      }
      jwt_is_expired: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_group_role: {
        Args: { group_id: string; group_role: string }
        Returns: boolean
      }
      user_is_group_member: {
        Args: { group_id: string }
        Returns: boolean
      }
    }
    Enums: {
      weekday_enum:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      weekday_enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
    },
  },
} as const
