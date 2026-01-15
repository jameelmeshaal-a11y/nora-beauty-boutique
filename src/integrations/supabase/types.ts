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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          name_ar: string | null
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_ar?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_ar?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      company_info: {
        Row: {
          about: string | null
          address: string | null
          created_at: string
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          mission: string | null
          name: string
          name_en: string | null
          phone: string | null
          twitter: string | null
          vision: string | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          created_at?: string
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          mission?: string | null
          name?: string
          name_en?: string | null
          phone?: string | null
          twitter?: string | null
          vision?: string | null
        }
        Update: {
          about?: string | null
          address?: string | null
          created_at?: string
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          mission?: string | null
          name?: string
          name_en?: string | null
          phone?: string | null
          twitter?: string | null
          vision?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
        }
        Insert: {
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          phone: string | null
          shipping_address: string | null
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          phone?: string | null
          shipping_address?: string | null
          status?: string
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          phone?: string | null
          shipping_address?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color_code: string
          created_at: string
          id: string
          image_url: string | null
          in_stock: boolean | null
          lip_image_url: string | null
          name: string
          name_ar: string | null
          price_adjustment: number | null
          product_id: string
          stock_quantity: number | null
        }
        Insert: {
          color_code: string
          created_at?: string
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          lip_image_url?: string | null
          name: string
          name_ar?: string | null
          price_adjustment?: number | null
          product_id: string
          stock_quantity?: number | null
        }
        Update: {
          color_code?: string
          created_at?: string
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          lip_image_url?: string | null
          name?: string
          name_ar?: string | null
          price_adjustment?: number | null
          product_id?: string
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string
          category_id: string | null
          created_at: string
          description: string | null
          description_ar: string | null
          has_free_sample: boolean | null
          id: string
          image_url: string | null
          images: string[] | null
          in_stock: boolean | null
          is_active: boolean | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          low_stock_threshold: number | null
          name: string
          name_ar: string | null
          original_price: number | null
          price: number
          rating: number | null
          reviews_count: number | null
          sample_description: string | null
          sample_description_ar: string | null
          shades_count: number | null
          stock_quantity: number | null
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          has_free_sample?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_active?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          low_stock_threshold?: number | null
          name: string
          name_ar?: string | null
          original_price?: number | null
          price: number
          rating?: number | null
          reviews_count?: number | null
          sample_description?: string | null
          sample_description_ar?: string | null
          shades_count?: number | null
          stock_quantity?: number | null
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          has_free_sample?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_active?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          low_stock_threshold?: number | null
          name?: string
          name_ar?: string | null
          original_price?: number | null
          price?: number
          rating?: number | null
          reviews_count?: number | null
          sample_description?: string | null
          sample_description_ar?: string | null
          shades_count?: number | null
          stock_quantity?: number | null
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          allow_supplier_registration: boolean | null
          free_shipping_threshold: number | null
          id: string
          min_order_amount: number | null
          show_supplier_name: boolean | null
          updated_at: string | null
        }
        Insert: {
          allow_supplier_registration?: boolean | null
          free_shipping_threshold?: number | null
          id?: string
          min_order_amount?: number | null
          show_supplier_name?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allow_supplier_registration?: boolean | null
          free_shipping_threshold?: number | null
          id?: string
          min_order_amount?: number | null
          show_supplier_name?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          address_ar: string | null
          commission_rate: number | null
          company_name: string
          company_name_ar: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          rating: number | null
          reviews_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          commission_rate?: number | null
          company_name: string
          company_name_ar?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          commission_rate?: number | null
          company_name?: string
          company_name_ar?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "supplier"
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
      app_role: ["admin", "customer", "supplier"],
    },
  },
} as const
