import { createClient } from '@supabase/supabase-js';

const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};
const procEnv = typeof process !== 'undefined' ? process.env || {} : {};

const supabaseUrl =
  metaEnv.VITE_SUPABASE_URL ||
  procEnv.SUPABASE_URL ||
  '';

const supabaseAnonKey =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  procEnv.SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  if (!supabase) {
    return {
      connected: false,
      message: 'Supabase URL or Anon Key not configured in Secrets.',
    };
  }

  try {
    const { error } = await supabase.from('stores').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          connected: true,
          message: 'Connected to Supabase! Tables need to be initialized with schema.sql.',
        };
      }
      return {
        connected: false,
        message: error.message,
      };
    }
    return {
      connected: true,
      message: 'Supabase Auth & Database active and connected!',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Connection failed',
    };
  }
}
