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
      connected_users: {
        Row: {
          connected_at: string | null
          id: string
          last_active: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          connected_at?: string | null
          id?: string
          last_active?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          connected_at?: string | null
          id?: string
          last_active?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      draft_picks: {
        Row: {
          id: string
          overall: number
          pick_in_round: number
          player_id: string | null
          round: number
          team_id: string | null
          timestamp: string | null
        }
        Insert: {
          id?: string
          overall: number
          pick_in_round: number
          player_id?: string | null
          round: number
          team_id?: string | null
          timestamp?: string | null
        }
        Update: {
          id?: string
          overall?: number
          pick_in_round?: number
          player_id?: string | null
          round?: number
          team_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draft_picks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_state: {
        Row: {
          current_pick: number | null
          id: string
          number_of_rounds: number | null
          snake_format: boolean | null
          status: string
          time_per_pick: number | null
          updated_at: string | null
        }
        Insert: {
          current_pick?: number | null
          id?: string
          number_of_rounds?: number | null
          snake_format?: boolean | null
          status?: string
          time_per_pick?: number | null
          updated_at?: string | null
        }
        Update: {
          current_pick?: number | null
          id?: string
          number_of_rounds?: number | null
          snake_format?: boolean | null
          status?: string
          time_per_pick?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      field_players: {
        Row: {
          created_at: string | null
          defense: number | null
          dribbling: number | null
          height: string | null
          id: string
          name: string
          ovr: number
          pace: number | null
          passing: number | null
          physical: number | null
          position: string
          shooting: number | null
          skill_moves: number | null
          team: string
          weight: string | null
        }
        Insert: {
          created_at?: string | null
          defense?: number | null
          dribbling?: number | null
          height?: string | null
          id: string
          name: string
          ovr: number
          pace?: number | null
          passing?: number | null
          physical?: number | null
          position: string
          shooting?: number | null
          skill_moves?: number | null
          team: string
          weight?: string | null
        }
        Update: {
          created_at?: string | null
          defense?: number | null
          dribbling?: number | null
          height?: string | null
          id?: string
          name?: string
          ovr?: number
          pace?: number | null
          passing?: number | null
          physical?: number | null
          position?: string
          shooting?: number | null
          skill_moves?: number | null
          team?: string
          weight?: string | null
        }
        Relationships: []
      }
      goalkeepers: {
        Row: {
          created_at: string | null
          elasticity: number | null
          handling: number | null
          height: string | null
          id: string
          name: string
          ovr: number
          position: string
          positioning: number | null
          reflexes: number | null
          shooting: number | null
          speed: number | null
          team: string
          weight: string | null
        }
        Insert: {
          created_at?: string | null
          elasticity?: number | null
          handling?: number | null
          height?: string | null
          id: string
          name: string
          ovr: number
          position: string
          positioning?: number | null
          reflexes?: number | null
          shooting?: number | null
          speed?: number | null
          team: string
          weight?: string | null
        }
        Update: {
          created_at?: string | null
          elasticity?: number | null
          handling?: number | null
          height?: string | null
          id?: string
          name?: string
          ovr?: number
          position?: string
          positioning?: number | null
          reflexes?: number | null
          shooting?: number | null
          speed?: number | null
          team?: string
          weight?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          draft_position: number | null
          id: string
          name: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          draft_position?: number | null
          id: string
          name: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          draft_position?: number | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
