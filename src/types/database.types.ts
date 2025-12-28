export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      // --- CRM: Core ---
      crm_clients: {
        Row: {
          id: string
          name: string
          company: string | null
          website_url: string | null
          phone: string | null
          billing_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          website_url?: string | null
          phone?: string | null
          billing_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          website_url?: string | null
          phone?: string | null
          billing_notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      crm_client_contacts: {
        Row: {
          id: string
          client_id: string
          name: string
          email: string | null
          phone: string | null
          title: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          email?: string | null
          phone?: string | null
          title?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          title?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_client_contacts_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          }
        ]
      }
      crm_projects: {
        Row: {
          id: string
          client_id: string
          slug: string
          title: string
          description: string | null
          status: Database["public"]["Enums"]["crm_project_status"]
          priority: Database["public"]["Enums"]["crm_priority"]
          created_at: string
          project_health_url: string | null
          project_health_secret: string | null
          project_health_enabled: boolean
        }
        Insert: {
          id?: string
          client_id: string
          slug: string
          title: string
          description?: string | null
          status?: Database["public"]["Enums"]["crm_project_status"]
          priority?: Database["public"]["Enums"]["crm_priority"]
          created_at?: string
          project_health_url?: string | null
          project_health_secret?: string | null
          project_health_enabled?: boolean
        }
        Update: {
          id?: string
          client_id?: string
          slug?: string
          title?: string
          description?: string | null
          status?: Database["public"]["Enums"]["crm_project_status"]
          priority?: Database["public"]["Enums"]["crm_priority"]
          created_at?: string
          project_health_url?: string | null
          project_health_secret?: string | null
          project_health_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "crm_projects_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          }
        ]
      }

      // --- CRM: Project Artifacts ---
      crm_project_links: {
        Row: {
          id: string
          project_id: string
          type: Database["public"]["Enums"]["crm_link_type"]
          url: string
          label: string | null
          is_client_visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: Database["public"]["Enums"]["crm_link_type"]
          url: string
          label?: string | null
          is_client_visible?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: Database["public"]["Enums"]["crm_link_type"]
          url?: string
          label?: string | null
          is_client_visible?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_project_links_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          }
        ]
      }
      crm_project_lists: {
        Row: {
          id: string
          project_id: string
          key: Database["public"]["Enums"]["crm_list_key"]
          title: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          key: Database["public"]["Enums"]["crm_list_key"]
          title: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          key?: Database["public"]["Enums"]["crm_list_key"]
          title?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_project_lists_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          }
        ]
      }
      crm_project_list_items: {
        Row: {
          id: string
          list_id: string
          title: string
          description: string | null
          status: Database["public"]["Enums"]["crm_item_status"]
          priority: Database["public"]["Enums"]["crm_priority"]
          due_at: string | null
          is_client_visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          list_id: string
          title: string
          description?: string | null
          status?: Database["public"]["Enums"]["crm_item_status"]
          priority?: Database["public"]["Enums"]["crm_priority"]
          due_at?: string | null
          is_client_visible?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          title?: string
          description?: string | null
          status?: Database["public"]["Enums"]["crm_item_status"]
          priority?: Database["public"]["Enums"]["crm_priority"]
          due_at?: string | null
          is_client_visible?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_project_list_items_list_id_fkey"
            columns: ["list_id"]
            referencedRelation: "crm_project_lists"
            referencedColumns: ["id"]
          }
        ]
      }
      crm_project_messages: {
        Row: {
          id: string
          project_id: string
          author_role: Database["public"]["Enums"]["crm_author_role"]
          author_name: string
          text: string
          attachments: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          author_role: Database["public"]["Enums"]["crm_author_role"]
          author_name: string
          text: string
          attachments?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          author_role?: Database["public"]["Enums"]["crm_author_role"]
          author_name?: string
          text?: string
          attachments?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_project_messages_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          }
        ]
      }
      crm_project_documents: {
        Row: {
          id: string
          project_id: string
          kind: Database["public"]["Enums"]["crm_doc_kind"]
          title: string
          status: Database["public"]["Enums"]["crm_doc_status"]
          url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          kind: Database["public"]["Enums"]["crm_doc_kind"]
          title: string
          status: Database["public"]["Enums"]["crm_doc_status"]
          url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          kind?: Database["public"]["Enums"]["crm_doc_kind"]
          title?: string
          status?: Database["public"]["Enums"]["crm_doc_status"]
          url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_project_documents_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          }
        ]
      }

      // --- CRM: Health History ---
      crm_project_health_runs: {
        Row: {
          id: string
          project_id: string
          started_at: string
          finished_at: string | null
          duration_ms: number | null
          overall_status: Database["public"]["Enums"]["crm_health_status"]
          items: Json
          endpoint_url: string | null
          error: string | null
        }
        Insert: {
          id?: string
          project_id: string
          started_at?: string
          finished_at?: string | null
          duration_ms?: number | null
          overall_status: Database["public"]["Enums"]["crm_health_status"]
          items: Json
          endpoint_url?: string | null
          error?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          started_at?: string
          finished_at?: string | null
          duration_ms?: number | null
          overall_status?: Database["public"]["Enums"]["crm_health_status"]
          items?: Json
          endpoint_url?: string | null
          error?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_project_health_runs_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          }
        ]
      }

      // --- CRM: Team & Activity ---
      crm_profiles: {
        Row: {
          id: string
          role: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          role?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          role?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      crm_activity_log: {
        Row: {
          id: string
          action_type: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          action_type: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          action_type?: string
          description?: string
          created_at?: string
        }
        Relationships: []
      }

      // --- CRM: Billing ---
      invoices: {
        Row: {
          id: string
          project_id: string
          number: string
          status: "draft" | "open" | "paid" | "void" | "uncollectible" | "overdue"
          amount_cents: number
          currency: string
          due_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          number: string
          status?: "draft" | "open" | "paid" | "void" | "uncollectible" | "overdue"
          amount_cents: number
          currency: string
          due_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          number?: string
          status?: "draft" | "open" | "paid" | "void" | "uncollectible" | "overdue"
          amount_cents?: number
          currency?: string
          due_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          }
        ]
      }
      team_invites: {
        Row: {
          id: string
          email: string
          role: string
          status: string
          message: string | null
          invite_key: string | null
          created_at: string | null
          expires_at: string | null
          accepted_at: string | null
        }
        Insert: {
          id?: string
          email: string
          role: string
          status?: string
          message?: string | null
          invite_key?: string | null
          created_at?: string | null
          expires_at?: string | null
          accepted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: string
          status?: string
          message?: string | null
          invite_key?: string | null
          created_at?: string | null
          expires_at?: string | null
          accepted_at?: string | null
        }
        Relationships: []
      }

      // --- CRM: Catalog ---
      crm_services: {
        Row: {
          slug: string
          title: string
          price_range: string | null
          updated_at: string | null
          category: string | null
        }
        Insert: {
          slug: string
          title: string
          price_range?: string | null
          updated_at?: string | null
          category?: string | null
        }
        Update: {
          slug?: string
          title?: string
          price_range?: string | null
          updated_at?: string | null
          category?: string | null
        }
        Relationships: []
      }
      crm_bundles: {
        Row: {
          slug: string
          title: string
          price_range: string | null
          bg_img: string | null
        }
        Insert: {
          slug: string
          title: string
          price_range?: string | null
          bg_img?: string | null
        }
        Update: {
          slug?: string
          title?: string
          price_range?: string | null
          bg_img?: string | null
        }
        Relationships: []
      }
      crm_bundle_services: {
        Row: {
          bundle_slug: string
          service_slug: string
        }
        Insert: {
          bundle_slug: string
          service_slug: string
        }
        Update: {
          bundle_slug?: string
          service_slug?: string
        }
        Relationships: []
      }
      admin_passwords: {
        Row: {
          created_at: string
          id: number
          password_1_hash: string
          password_2_hash: string
          password_3_hash: string
        }
        Insert: {
          created_at?: string
          id?: number
          password_1_hash: string
          password_2_hash: string
          password_3_hash: string
        }
        Update: {
          created_at?: string
          id?: number
          password_1_hash?: string
          password_2_hash?: string
          password_3_hash?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          budget: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string | null
          entry_text: string
          id: string
          published: boolean | null
          status_text: string
        }
        Insert: {
          created_at?: string | null
          entry_text: string
          id?: string
          published?: boolean | null
          status_text: string
        }
        Update: {
          created_at?: string | null
          entry_text?: string
          id?: string
          published?: boolean | null
          status_text?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      // --- Blog ---
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          cover_image_url: string | null
          status: 'draft' | 'published' | 'archived'
          updated_at: string | null
          published_at: string | null
          reading_time_minutes: number | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          cover_image_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          updated_at?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          cover_image_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          updated_at?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
        }
        Relationships: []
      }
      blog_post_views: {
        Row: {
          id: string
          post_id: string
          ip_hash: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          ip_hash?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          ip_hash?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_views_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          }
        ]
      }
      blog_comments: {
        Row: {
          id: string
          post_id: string
          author_name: string | null
          author_email: string | null
          website_url: string | null
          content: string
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_name?: string | null
          author_email?: string | null
          website_url?: string | null
          content: string
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_name?: string | null
          author_email?: string | null
          website_url?: string | null
          content?: string
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      execute_sql: {
        Args: { sql_query: string }
        Returns: Json
      }
      get_chat_room: {
        Args: { room_id: string }
        Returns: {
          id: string
          name: string
          description: string
          created_by: string
          created_at: string
          updated_at: string
          participants: Json
        }[]
      }
      get_chat_unread_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_conversation: {
        Args: { context_type: string; context_id: string; p_user_id: string }
        Returns: {
          id: string
          sender_id: string
          sender_name: string
          recipient_id: string
          recipient_name: string
          content: string
          appointment_id: string
          estimate_id: string
          read_at: string
          created_at: string
          updated_at: string
        }[]
      }
      update_service: {
        Args: {
          p_id: string
          p_name: string
          p_description: string
          p_duration: number
          p_price: number
          p_price_type: string
          p_image_url: string
        }
        Returns: boolean
      }
    }
    Enums: {
      crm_health_status: "ok" | "warn" | "error" | "pending"
      // --- CRM Enums ---
      crm_project_status: "planned" | "in_progress" | "paused" | "completed" | "archived"
      crm_priority: "low" | "normal" | "high" | "urgent"
      crm_item_status: "open" | "in_progress" | "done"
      crm_link_type: "live" | "staging" | "repo" | "docs" | "design" | "tracker" | "other"
      crm_list_key: "goals" | "bugs" | "tasks" | "custom"
      crm_doc_kind: "contract" | "sow" | "nda" | "other"
      crm_doc_status: "signed" | "pending" | "draft"
      crm_author_role: "admin" | "client"
      appointment_status:
        | "ESTIMATE_REQUESTED"
        | "ESTIMATE_APPROVED"
        | "ESTIMATE_REJECTED"
        | "CONFIRMED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED"
      price_type: "minimum" | "fixed" | "consultation" | "per_session" | "free"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      crm_health_status: ["ok", "warn", "error", "pending"],
      crm_project_status: [
        "planned",
        "in_progress",
        "paused",
        "completed",
        "archived",
      ],
      crm_priority: ["low", "normal", "high", "urgent"],
      crm_item_status: ["open", "in_progress", "done"],
      crm_link_type: [
        "live",
        "staging",
        "repo",
        "docs",
        "design",
        "tracker",
        "other",
      ],
      crm_list_key: ["goals", "bugs", "tasks", "custom"],
      crm_doc_kind: ["contract", "sow", "nda", "other"],
      crm_doc_status: ["signed", "pending", "draft"],
      crm_author_role: ["admin", "client"],
      appointment_status: [
        "ESTIMATE_REQUESTED",
        "ESTIMATE_APPROVED",
        "ESTIMATE_REJECTED",
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      price_type: ["minimum", "fixed", "consultation", "per_session", "free"],
    },
  },
} as const
