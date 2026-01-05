// Environment variables with type safety
type Env = {
  supabaseUrl: string;
  supabaseKey: string;
};

const env: Env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '',
};

// Validate required environment variables
const requiredVars: (keyof Env)[] = ['supabaseUrl', 'supabaseKey'];
const missingVars = requiredVars.filter((key) => !env[key]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export const config = {
  supabase: {
    url: env.supabaseUrl,
    key: env.supabaseKey,
    options: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  },
  // Add other config options here
};
