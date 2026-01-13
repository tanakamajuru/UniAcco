// Environment variables with type safety
type Env = {
  apiUrl: string;
};

const config: Env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
};

// Validate required environment variables
const requiredVars: (keyof Env)[] = ['apiUrl'];
const missingVars = requiredVars.filter((key) => !config[key]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export const API_BASE_URL = config.apiUrl;
