import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabase = (): boolean => !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = hasSupabase()
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : (null as any);
