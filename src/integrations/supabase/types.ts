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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          ghl_notified: boolean
          id: string
          notes: string | null
          package_id: string
          package_name: string
          scheduled_at: string
          service_id: string
          service_name: string
          status: string
          updated_at: string
          user_id: string
          vendor_calendar_link: string | null
          vendor_id: string
          vendor_name: string
        }
        Insert: {
          created_at?: string
          ghl_notified?: boolean
          id?: string
          notes?: string | null
          package_id: string
          package_name: string
          scheduled_at: string
          service_id: string
          service_name: string
          status: string
          updated_at?: string
          user_id: string
          vendor_calendar_link?: string | null
          vendor_id: string
          vendor_name: string
        }
        Update: {
          created_at?: string
          ghl_notified?: boolean
          id?: string
          notes?: string | null
          package_id?: string
          package_name?: string
          scheduled_at?: string
          service_id?: string
          service_name?: string
          status?: string
          updated_at?: string
          user_id?: string
          vendor_calendar_link?: string | null
          vendor_id?: string
          vendor_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          location: string | null
          points: number | null
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          points?: number | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          points?: number | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string | null
          cta_label: string | null
          href: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          kind: string
          service_id: string | null
          slot: number
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cta_label?: string | null
          href?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          kind?: string
          service_id?: string | null
          slot: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cta_label?: string | null
          href?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          kind?: string
          service_id?: string | null
          slot?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "promoted_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number
          created_at: string | null
          id: string
          key: string
          reset_at: string
        }
        Insert: {
          count?: number
          created_at?: string | null
          id?: string
          key: string
          reset_at: string
        }
        Update: {
          count?: number
          created_at?: string | null
          id?: string
          key?: string
          reset_at?: string
        }
        Relationships: []
      }
      service_versions: {
        Row: {
          card: Json
          created_at: string
          created_by: string | null
          funnel: Json | null
          id: string
          pricing: Json
          published_at: string | null
          row_version: number
          service_id: string
          state: Database["public"]["Enums"]["service_version_state"]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          card: Json
          created_at?: string
          created_by?: string | null
          funnel?: Json | null
          id?: string
          pricing: Json
          published_at?: string | null
          row_version?: number
          service_id: string
          state?: Database["public"]["Enums"]["service_version_state"]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          card?: Json
          created_at?: string
          created_by?: string | null
          funnel?: Json | null
          id?: string
          pricing?: Json
          published_at?: string | null
          row_version?: number
          service_id?: string
          state?: Database["public"]["Enums"]["service_version_state"]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_versions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "promoted_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_versions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_versions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          badges: string[] | null
          category: string | null
          city_scope: string | null
          compliance: Json | null
          cover_image: string | null
          created_at: string
          faq: Json | null
          featured: boolean | null
          id: string
          is_active: boolean
          media: Json | null
          name: string
          packages: Json | null
          pricing: Json
          published_version_id: string | null
          rating: number | null
          review_highlight: string | null
          reviews: number | null
          roi_note: string | null
          service_areas: string[] | null
          slug: string | null
          sort_order: number | null
          tagline: string | null
          time_to_value: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          badges?: string[] | null
          category?: string | null
          city_scope?: string | null
          compliance?: Json | null
          cover_image?: string | null
          created_at?: string
          faq?: Json | null
          featured?: boolean | null
          id?: string
          is_active?: boolean
          media?: Json | null
          name: string
          packages?: Json | null
          pricing: Json
          published_version_id?: string | null
          rating?: number | null
          review_highlight?: string | null
          reviews?: number | null
          roi_note?: string | null
          service_areas?: string[] | null
          slug?: string | null
          sort_order?: number | null
          tagline?: string | null
          time_to_value?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          badges?: string[] | null
          category?: string | null
          city_scope?: string | null
          compliance?: Json | null
          cover_image?: string | null
          created_at?: string
          faq?: Json | null
          featured?: boolean | null
          id?: string
          is_active?: boolean
          media?: Json | null
          name?: string
          packages?: Json | null
          pricing?: Json
          published_version_id?: string | null
          rating?: number | null
          review_highlight?: string | null
          reviews?: number | null
          roi_note?: string | null
          service_areas?: string[] | null
          slug?: string | null
          sort_order?: number | null
          tagline?: string | null
          time_to_value?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_published_version_id_fkey"
            columns: ["published_version_id"]
            isOneToOne: false
            referencedRelation: "service_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_partners: {
        Row: {
          allowed_service_ids: string[] | null
          booking_link: string | null
          contact_email: string | null
          copay_policy: Json
          created_at: string
          id: string
          is_active: boolean
          markets: string[] | null
          min_agent_deals_per_year: number | null
          name: string
          prohibited_service_ids: string[] | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          allowed_service_ids?: string[] | null
          booking_link?: string | null
          contact_email?: string | null
          copay_policy: Json
          created_at?: string
          id: string
          is_active?: boolean
          markets?: string[] | null
          min_agent_deals_per_year?: number | null
          name: string
          prohibited_service_ids?: string[] | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          allowed_service_ids?: string[] | null
          booking_link?: string | null
          contact_email?: string | null
          copay_policy?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          markets?: string[] | null
          min_agent_deals_per_year?: number | null
          name?: string
          prohibited_service_ids?: string[] | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          ad_budget_max: number | null
          ad_budget_min: number | null
          budget_currency: string | null
          calendar_link: string | null
          created_at: string
          id: string
          is_active: boolean
          logo: string | null
          name: string
          sort_order: number | null
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          ad_budget_max?: number | null
          ad_budget_min?: number | null
          budget_currency?: string | null
          calendar_link?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo?: string | null
          name: string
          sort_order?: number | null
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          ad_budget_max?: number | null
          ad_budget_min?: number | null
          budget_currency?: string | null
          calendar_link?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo?: string | null
          name?: string
          sort_order?: number | null
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      promoted_cards: {
        Row: {
          badges: string[] | null
          category: string | null
          cover_image: string | null
          id: string | null
          pricing: Json | null
          rating: number | null
          review_count: number | null
          roi_note: string | null
          slot: number | null
          slug: string | null
          subtitle: string | null
          time_to_value: string | null
          title: string | null
          vendor_logo: string | null
          vendor_name: string | null
        }
        Relationships: []
      }
      service_cards: {
        Row: {
          badges: string[] | null
          category: string | null
          cover_image: string | null
          id: string | null
          is_featured: boolean | null
          pricing: Json | null
          rating: number | null
          review_count: number | null
          roi_note: string | null
          slug: string | null
          subtitle: string | null
          time_to_value: string | null
          title: string | null
          vendor_logo: string | null
          vendor_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_rate_limits: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_rate_limit: {
        Args: { p_key: string; p_max_requests?: number; p_window_ms?: number }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "pro" | "user"
      service_version_state:
        | "draft"
        | "submitted"
        | "approved"
        | "published"
        | "archived"
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
      app_role: ["admin", "pro", "user"],
      service_version_state: [
        "draft",
        "submitted",
        "approved",
        "published",
        "archived",
      ],
    },
  },
} as const
