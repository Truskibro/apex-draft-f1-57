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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      drivers: {
        Row: {
          championship_points: number | null
          country: string
          created_at: string
          id: string
          name: string
          number: number
          team_id: string | null
        }
        Insert: {
          championship_points?: number | null
          country: string
          created_at?: string
          id?: string
          name: string
          number: number
          team_id?: string | null
        }
        Update: {
          championship_points?: number | null
          country?: string
          created_at?: string
          id?: string
          name?: string
          number?: number
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      league_members: {
        Row: {
          id: string
          joined_at: string
          league_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          league_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          league_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      races: {
        Row: {
          country_flag: string
          created_at: string
          current_lap: string | null
          dnf_drivers: string[] | null
          eighth_place: string | null
          fastest_lap_driver: string | null
          fifth_place: string | null
          fourth_place: string | null
          id: string
          location: string
          name: string
          ninth_place: string | null
          race_date: string
          race_time: string
          second_place: string | null
          seventh_place: string | null
          sixth_place: string | null
          status: Database["public"]["Enums"]["race_status"]
          tenth_place: string | null
          third_place: string | null
          total_laps: number | null
          updated_at: string
          winner: string | null
        }
        Insert: {
          country_flag: string
          created_at?: string
          current_lap?: string | null
          dnf_drivers?: string[] | null
          eighth_place?: string | null
          fastest_lap_driver?: string | null
          fifth_place?: string | null
          fourth_place?: string | null
          id?: string
          location: string
          name: string
          ninth_place?: string | null
          race_date: string
          race_time: string
          second_place?: string | null
          seventh_place?: string | null
          sixth_place?: string | null
          status?: Database["public"]["Enums"]["race_status"]
          tenth_place?: string | null
          third_place?: string | null
          total_laps?: number | null
          updated_at?: string
          winner?: string | null
        }
        Update: {
          country_flag?: string
          created_at?: string
          current_lap?: string | null
          dnf_drivers?: string[] | null
          eighth_place?: string | null
          fastest_lap_driver?: string | null
          fifth_place?: string | null
          fourth_place?: string | null
          id?: string
          location?: string
          name?: string
          ninth_place?: string | null
          race_date?: string
          race_time?: string
          second_place?: string | null
          seventh_place?: string | null
          sixth_place?: string | null
          status?: Database["public"]["Enums"]["race_status"]
          tenth_place?: string | null
          third_place?: string | null
          total_laps?: number | null
          updated_at?: string
          winner?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_predictions: {
        Row: {
          created_at: string
          id: string
          points_earned: number | null
          predicted_dnf: string | null
          predicted_fastest_lap: string | null
          predicted_podium: string[] | null
          predicted_winner: string | null
          race_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_earned?: number | null
          predicted_dnf?: string | null
          predicted_fastest_lap?: string | null
          predicted_podium?: string[] | null
          predicted_winner?: string | null
          race_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_earned?: number | null
          predicted_dnf?: string | null
          predicted_fastest_lap?: string | null
          predicted_podium?: string[] | null
          predicted_winner?: string | null
          race_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_predictions_predicted_dnf_fkey"
            columns: ["predicted_dnf"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_predictions_predicted_fastest_lap_fkey"
            columns: ["predicted_fastest_lap"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_predictions_predicted_winner_fkey"
            columns: ["predicted_winner"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_predictions_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      user_standings: {
        Row: {
          created_at: string
          id: string
          previous_rank: number | null
          rank: number | null
          total_points: number
          updated_at: string
          user_id: string
          weekly_points: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          previous_rank?: number | null
          rank?: number | null
          total_points?: number
          updated_at?: string
          user_id: string
          weekly_points?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          previous_rank?: number | null
          rank?: number | null
          total_points?: number
          updated_at?: string
          user_id?: string
          weekly_points?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_prediction_points: {
        Args: { prediction_id: string; race_id: string }
        Returns: number
      }
      recalculate_all_prediction_points: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      trigger_driver_points_update: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_driver_championship_points: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_standings: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      user_can_view_league: {
        Args: { league_id: string }
        Returns: boolean
      }
      user_is_league_owner: {
        Args: { league_id: string }
        Returns: boolean
      }
    }
    Enums: {
      race_status: "upcoming" | "live" | "completed"
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
      race_status: ["upcoming", "live", "completed"],
    },
  },
} as const
