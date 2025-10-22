export type Json =
  | string
  | number
  | boolean
  | null
  | { [key]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      programs: {
        Row: {
          id: string
          name: string
          description: string | null
          duration: string | null
          level: string | null
          curriculum: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration?: string | null
          level?: string | null
          curriculum?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration?: string | null
          level?: string | null
          curriculum?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          program_id: string | null
          code: string
          name: string
          description: string | null
          credits: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          program_id?: string | null
          code: string
          name: string
          description?: string | null
          credits?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          program_id?: string | null
          code?: string
          name?: string
          description?: string | null
          credits?: number
          is_active?: boolean
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          student_id: string
          batch_id: string | null
          program_id: string | null
          enrollment_date: string
          status: string
          payment_status: string
          created_at: string
        }
        Insert: {
          id: string
          student_id: string
          batch_id?: string | null
          program_id?: string | null
          enrollment_date?: string
          status?: string
          payment_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          batch_id?: string | null
          program_id?: string | null
          enrollment_date?: string
          status?: string
          payment_status?: string
          created_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          course_id: string
          instructor_id: string | null
          title: string
          description: string | null
          due_date: string | null
          max_score: number
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          instructor_id?: string | null
          title: string
          description?: string | null
          due_date?: string | null
          max_score?: number
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          instructor_id?: string | null
          title?: string
          description?: string | null
          due_date?: string | null
          max_score?: number
          file_url?: string | null
          created_at?: string
        }
      }
      assignment_submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          file_url: string | null
          file_name: string | null
          file_size: number | null
          comments: string | null
          submitted_at: string
          score: number | null
          feedback: string | null
          graded_at: string | null
          graded_by: string | null
          status: string
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          comments?: string | null
          submitted_at?: string
          score?: number | null
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          status?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          comments?: string | null
          submitted_at?: string
          score?: number | null
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          status?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          program_id: string | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          program_id?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          program_id?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          program_id: string | null
          address: string | null
          payment_slip_url: string | null
          status: string
          processed_by: string | null
          processed_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          program_id?: string | null
          address?: string | null
          payment_slip_url?: string | null
          status?: string
          processed_by?: string | null
          processed_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          program_id?: string | null
          address?: string | null
          payment_slip_url?: string | null
          status?: string
          processed_by?: string | null
          processed_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}
