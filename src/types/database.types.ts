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
      // --- Marketing: Advertisements ---
      advertisements: {
        Row: {
          id: string
          title: string
          description: string | null
          placement: string
          priority: number
          cta_text: string | null
          cta_link: string
          promo_code: string | null
          is_active: boolean
          starts_at: string
          ends_at: string | null
          styles: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          placement?: string
          priority?: number
          cta_text?: string | null
          cta_link: string
          promo_code?: string | null
          is_active?: boolean
          starts_at?: string
          ends_at?: string | null
          styles?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          placement?: string
          priority?: number
          cta_text?: string | null
          cta_link?: string
          promo_code?: string | null
          is_active?: boolean
          starts_at?: string
          ends_at?: string | null
          styles?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      
      project_signups: {
        Row: {
          id: string
          company_name: string
          company_website: string | null
          contact_name: string
          contact_email: string
          project_description: string | null
          promo_code: string | null
          need_logo: boolean | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          company_name: string
          company_website?: string | null
          contact_name: string
          contact_email: string
          project_description?: string | null
          promo_code?: string | null
          need_logo?: boolean | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          company_website?: string | null
          contact_name?: string
          contact_email?: string
          project_description?: string | null
          promo_code?: string | null
          need_logo?: boolean | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      
      user_roles: {
        Row: {
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      
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
      crm_client_users: {
        Row: {
          client_id: string
          user_id: string
          role: Database["public"]["Enums"]["crm_client_user_role"]
          created_at: string
        }
        Insert: {
          client_id: string
          user_id: string
          role?: Database["public"]["Enums"]["crm_client_user_role"]
          created_at?: string
        }
        Update: {
          client_id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["crm_client_user_role"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_client_users_client_id_fkey"
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

      // --- CRM: AI Tasks ---
      crm_ai_tasks: {
        Row: {
          id: string
          project_id: string
          template_id: string | null
          title: string
          description: string | null
          status: Database["public"]["Enums"]["crm_ai_task_status"]
          inputs: Json | null
          branch_name: string | null
          pr_url: string | null
          run_id: string | null
          logs: Json | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          template_id?: string | null
          title: string
          description?: string | null
          status?: Database["public"]["Enums"]["crm_ai_task_status"]
          inputs?: Json | null
          branch_name?: string | null
          pr_url?: string | null
          run_id?: string | null
          logs?: Json | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          template_id?: string | null
          title?: string
          description?: string | null
          status?: Database["public"]["Enums"]["crm_ai_task_status"]
          inputs?: Json | null
          branch_name?: string | null
          pr_url?: string | null
          run_id?: string | null
          logs?: Json | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_ai_tasks_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_ai_tasks_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
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
          phone: string | null
          subject: string | null
          source: string | null
          handled_at: string | null
          handled_by: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          phone?: string | null
          subject?: string | null
          source?: string | null
          handled_at?: string | null
          handled_by?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          phone?: string | null
          subject?: string | null
          source?: string | null
          handled_at?: string | null
          handled_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          id: string
          contact_name: string
          contact_email: string
          company: string | null
          phone: string | null
          project_summary: string
          scope: Json | null
          budget_min: number | null
          budget_max: number | null
          currency: string | null
          timeline: string | null
          priority: string | null
          status: string | null
          source: string | null
          tags: string[] | null
          internal_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          contact_name: string
          contact_email: string
          company?: string | null
          phone?: string | null
          project_summary: string
          scope?: Json | null
          budget_min?: number | null
          budget_max?: number | null
          currency?: string | null
          timeline?: string | null
          priority?: string | null
          status?: string | null
          source?: string | null
          tags?: string[] | null
          internal_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          contact_name?: string
          contact_email?: string
          company?: string | null
          phone?: string | null
          project_summary?: string
          scope?: Json | null
          budget_min?: number | null
          budget_max?: number | null
          currency?: string | null
          timeline?: string | null
          priority?: string | null
          status?: string | null
          source?: string | null
          tags?: string[] | null
          internal_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
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
      // --- Leadgen: Leads & Groups ---
      leads: {
        Row: {
          id: string
          google_place_id: string | null
          niche: string | null
          location: string | null
          name: string | null
          formatted_address: string | null
          lat: number | null
          lng: number | null
          phone: string | null
          website: string | null
          domain: string | null
          rating: number | null
          user_ratings_total: number | null
          price_level: number | null
          types: string[] | null
          business_status: string | null
          google_maps_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          google_place_id?: string | null
          niche?: string | null
          location?: string | null
          name?: string | null
          formatted_address?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          website?: string | null
          domain?: string | null
          rating?: number | null
          user_ratings_total?: number | null
          price_level?: number | null
          types?: string[] | null
          business_status?: string | null
          google_maps_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          google_place_id?: string | null
          niche?: string | null
          location?: string | null
          name?: string | null
          formatted_address?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          website?: string | null
          domain?: string | null
          rating?: number | null
          user_ratings_total?: number | null
          price_level?: number | null
          types?: string[] | null
          business_status?: string | null
          google_maps_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lead_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      lead_group_members: {
        Row: {
          group_id: string
          lead_id: string
          added_at: string | null
        }
        Insert: {
          group_id: string
          lead_id: string
          added_at?: string | null
        }
        Update: {
          group_id?: string
          lead_id?: string
          added_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_group_members_group_id_fkey",
            columns: ["group_id"],
            referencedRelation: "lead_groups",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "lead_group_members_lead_id_fkey",
            columns: ["lead_id"],
            referencedRelation: "leads",
            referencedColumns: ["id"],
          }
        ]
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
          content_md?: string | null
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
          content_md?: string | null
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
          content_md?: string | null
        }
        Relationships: []
      }
      blog_posts_public: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          cover_image_url: string | null
          published_at: string | null
          tags: string[] | null
        }
        Insert: never
        Update: never
        Relationships: []
      }
      blog_post_views: {
        Row: {
          id: string
          post_id: string
          ip_hash: string | null
          viewer_hash: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          ip_hash?: string | null
          viewer_hash?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          ip_hash?: string | null
          viewer_hash?: string | null
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
      blog_tags: {
        Row: { id: string; name: string }
        Insert: { id?: string; name: string }
        Update: { id?: string; name?: string }
        Relationships: []
      }
      blog_post_tags: {
        Row: { post_id: string; tag_id: string }
        Insert: { post_id: string; tag_id: string }
        Update: { post_id?: string; tag_id?: string }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey",
            columns: ["post_id"],
            referencedRelation: "blog_posts",
            referencedColumns: ["id"],
          }
        ]
      }

      user_profiles: {
        Row: {
          user_id: string
          headline: string | null
          bio: string | null
          avatar_url: string | null
          visibility: "public" | "private"
          socials: Json | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          headline?: string | null
          bio?: string | null
          avatar_url?: string | null
          visibility?: "public" | "private"
          socials?: Json | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          headline?: string | null
          bio?: string | null
          avatar_url?: string | null
          visibility?: "public" | "private"
          socials?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },

      // --- Auth: Refresh Tokens and Credentials ---
      auth_refresh_tokens: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          expires_at: string | null
          revoked_at: string | null
          user_agent: string | null
          ip: string | null
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          expires_at?: string | null
          revoked_at?: string | null
          user_agent?: string | null
          ip?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          expires_at?: string | null
          revoked_at?: string | null
          user_agent?: string | null
          ip?: string | null
        }
        Relationships: []
      }
      team_credentials: {
        Row: {
          user_id: string
          password_1_hash: string
          password_2_hash: string
          password_3_hash: string
        }
        Insert: {
          user_id: string
          password_1_hash: string
          password_2_hash: string
          password_3_hash: string
        }
        Update: {
          user_id?: string
          password_1_hash?: string
          password_2_hash?: string
          password_3_hash?: string
        }
        Relationships: []
      }

      // --- Audit ---
      audit_logs: {
        Row: {
          id: string
          created_at: string
          action: string | null
          method: string | null
          route: string | null
          ip: string | null
          actor_email: string | null
          actor_role: string | null
          status: number | null
          payload: Json | null
          result: Json | null
          error: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          action?: string | null
          method?: string | null
          route?: string | null
          ip?: string | null
          actor_email?: string | null
          actor_role?: string | null
          status?: number | null
          payload?: Json | null
          result?: Json | null
          error?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          action?: string | null
          method?: string | null
          route?: string | null
          ip?: string | null
          actor_email?: string | null
          actor_role?: string | null
          status?: number | null
          payload?: Json | null
          result?: Json | null
          error?: string | null
        }
        Relationships: []
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
      crm_client_user_role: "owner" | "stakeholder" | "viewer"
      crm_health_status: "ok" | "warn" | "error" | "pending"
      crm_ai_task_status: "queued" | "running" | "review" | "success" | "failed"
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
      crm_client_user_role: ["owner", "stakeholder", "viewer"],
      crm_health_status: ["ok", "warn", "error", "pending"],
      crm_ai_task_status: ["queued", "running", "review", "success", "failed"],
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
