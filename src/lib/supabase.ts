import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set.\n' +
    'For local development: Create a .env file with your Supabase credentials.\n' +
    'For GitHub Pages: Add these as repository secrets in GitHub Settings > Secrets and variables > Actions.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      feeding_sessions: {
        Row: {
          id: string;
          user_id: string;
          start_time: string;
          end_time: string | null;
          duration: number | null;
          breast_type: 'left' | 'right' | 'both' | 'bottle';
          bottle_volume: number | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_time: string;
          end_time?: string | null;
          duration?: number | null;
          breast_type: 'left' | 'right' | 'both' | 'bottle';
          bottle_volume?: number | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_time?: string;
          end_time?: string | null;
          duration?: number | null;
          breast_type?: 'left' | 'right' | 'both' | 'bottle';
          bottle_volume?: number | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          baby_name: string | null;
          baby_birth_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          baby_name?: string | null;
          baby_birth_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          baby_name?: string | null;
          baby_birth_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

