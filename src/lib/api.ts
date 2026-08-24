import { supabase } from './supabase';

export async function authenticatedJsonHeaders(): Promise<Record<string, string>> {
  if (!supabase) throw new Error('Authentication is not configured.');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Please sign in before performing this action.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
