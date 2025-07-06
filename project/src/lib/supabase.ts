import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid Supabase configuration
const hasValidConfig = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseUrl.includes('supabase.co');

// Create client with error handling
export const supabase = hasValidConfig 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Export configuration status
export const isSupabaseConfigured = hasValidConfig;

// Mock data for when Supabase is not configured
export const mockData = {
  user: {
    id: 'demo-user-id',
    email: 'demo@example.com',
    user_metadata: {
      full_name: 'Usuário Demo'
    }
  },
  profile: {
    id: 'demo-user-id',
    email: 'demo@example.com',
    full_name: 'Usuário Demo',
    plan_type: 'freemium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  cleanupSession: {
    id: 'demo-session-id',
    user_id: 'demo-user-id',
    ex_partner_name: 'Ex Demo',
    relationship_end_date: '2024-01-01',
    status: 'pending',
    items_found: 150,
    items_processed: 45,
    progress_percentage: 30,
    created_at: new Date().toISOString()
  },
  milestones: [
    {
      id: 'demo-milestone-1',
      title: 'Configuração Inicial',
      description: 'Você configurou sua conta e está pronto para começar!',
      achieved: true,
      achieved_at: new Date().toISOString()
    }
  ],
  cleanupStats: {
    total_cleanups: 1,
    total_items_removed: 45,
    networks_cleaned: ['instagram', 'whatsapp'],
    time_saved_minutes: 120,
    recovery_score: 75,
    last_cleanup_date: new Date().toISOString()
  }
};

// Type definitions for better TypeScript support
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          plan_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          plan_type?: string | null;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          plan_type?: string | null;
          updated_at?: string;
        };
      };
      cleanup_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          ex_partner_name: string;
          relationship_start_date: string | null;
          relationship_end_date: string | null;
          social_networks: string[] | null;
          cleanup_actions: string[] | null;
          status: string | null;
          items_found: number | null;
          items_processed: number | null;
          progress_percentage: number | null;
          results: any | null;
          created_at: string;
          completed_at: string | null;
          recovery_timeline: any | null;
        };
        Insert: {
          user_id?: string | null;
          ex_partner_name: string;
          relationship_start_date?: string | null;
          relationship_end_date?: string | null;
          social_networks?: string[] | null;
          cleanup_actions?: string[] | null;
          status?: string | null;
          items_found?: number | null;
          items_processed?: number | null;
          progress_percentage?: number | null;
          results?: any | null;
          completed_at?: string | null;
          recovery_timeline?: any | null;
        };
        Update: {
          ex_partner_name?: string;
          relationship_start_date?: string | null;
          relationship_end_date?: string | null;
          social_networks?: string[] | null;
          cleanup_actions?: string[] | null;
          status?: string | null;
          items_found?: number | null;
          items_processed?: number | null;
          progress_percentage?: number | null;
          results?: any | null;
          completed_at?: string | null;
          recovery_timeline?: any | null;
        };
      };
      recovery_milestones: {
        Row: {
          id: string;
          user_id: string | null;
          cleanup_session_id: string | null;
          milestone_type: string;
          title: string;
          description: string | null;
          achieved: boolean | null;
          achieved_at: string | null;
          target_date: string | null;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          cleanup_session_id?: string | null;
          milestone_type: string;
          title: string;
          description?: string | null;
          achieved?: boolean | null;
          achieved_at?: string | null;
          target_date?: string | null;
        };
        Update: {
          milestone_type?: string;
          title?: string;
          description?: string | null;
          achieved?: boolean | null;
          achieved_at?: string | null;
          target_date?: string | null;
        };
      };
      social_connections: {
        Row: {
          id: string;
          user_id: string | null;
          platform: string;
          platform_user_id: string | null;
          platform_username: string | null;
          access_token: string | null;
          is_connected: boolean | null;
          connected_at: string | null;
          last_sync: string | null;
          created_at: string;
          cached_data: string | null;
        };
        Insert: {
          user_id?: string | null;
          platform: string;
          platform_user_id?: string | null;
          platform_username?: string | null;
          access_token?: string | null;
          is_connected?: boolean | null;
          connected_at?: string | null;
          last_sync?: string | null;
          cached_data?: string | null;
        };
        Update: {
          platform?: string;
          platform_user_id?: string | null;
          platform_username?: string | null;
          access_token?: string | null;
          is_connected?: boolean | null;
          connected_at?: string | null;
          last_sync?: string | null;
          cached_data?: string | null;
        };
      };
      cleanup_stats: {
        Row: {
          id: string;
          user_id: string | null;
          total_cleanups: number | null;
          total_items_removed: number | null;
          networks_cleaned: string[] | null;
          time_saved_minutes: number | null;
          recovery_score: number | null;
          last_cleanup_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string | null;
          total_cleanups?: number | null;
          total_items_removed?: number | null;
          networks_cleaned?: string[] | null;
          time_saved_minutes?: number | null;
          recovery_score?: number | null;
          last_cleanup_date?: string | null;
        };
        Update: {
          total_cleanups?: number | null;
          total_items_removed?: number | null;
          networks_cleaned?: string[] | null;
          time_saved_minutes?: number | null;
          recovery_score?: number | null;
          last_cleanup_date?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};