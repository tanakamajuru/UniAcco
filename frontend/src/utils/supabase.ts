import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { config } from '@/config';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.key,
  config.supabase.options
);

export default supabase;
