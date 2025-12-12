import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          expo_token: string | null;
          video_url: string | null;
          is_eligible: boolean;
          estimated_steps: number | null;
          notes: string | null;
          assessed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          expo_token?: string | null;
          video_url?: string | null;
          is_eligible?: boolean;
          estimated_steps?: number | null;
          notes?: string | null;
          assessed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          expo_token?: string | null;
          video_url?: string | null;
          is_eligible?: boolean;
          estimated_steps?: number | null;
          notes?: string | null;
          assessed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
