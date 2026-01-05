export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          role: 'student' | 'landlord' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: 'student' | 'landlord' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: 'student' | 'landlord' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      universities: {
        Row: {
          id: string
          name: string
          location: string | null
          description: string | null
          logo_url: string | null
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          description?: string | null
          logo_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          description?: string | null
          logo_url?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          avatar_url: string | null
          bio: string | null
          date_of_birth: string | null
          gender: string | null
          university_id: string | null
          course: string | null
          year_of_study: number | null
        }
        Insert: {
          id: string
          avatar_url?: string | null
          bio?: string | null
          date_of_birth?: string | null
          gender?: string | null
          university_id?: string | null
          course?: string | null
          year_of_study?: number | null
        }
        Update: {
          id?: string
          avatar_url?: string | null
          bio?: string | null
          date_of_birth?: string | null
          gender?: string | null
          university_id?: string | null
          course?: string | null
          year_of_study?: number | null
        }
      }
      accommodations: {
        Row: {
          id: string
          landlord_id: string
          title: string
          description: string | null
          address: string
          city: string
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          price_per_month: number
          deposit_amount: number | null
          available_from: string | null
          available_to: string | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          landlord_id: string
          title: string
          description?: string | null
          address: string
          city: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          price_per_month: number
          deposit_amount?: number | null
          available_from?: string | null
          available_to?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          landlord_id?: string
          title?: string
          description?: string | null
          address?: string
          city?: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          price_per_month?: number
          deposit_amount?: number | null
          available_from?: string | null
          available_to?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables (accommodation_amenities, accommodation_images, etc.)
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
