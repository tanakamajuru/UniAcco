const { Pool } = require('pg');
require('dotenv').config();

// Managed hosts (Railway, Neon, Supabase, Render) hand out a single
// DATABASE_URL connection string. Fall back to discrete DB_* vars locally.
const useConnectionString = Boolean(process.env.DATABASE_URL);

// SSL rules:
//   DB_SSL=true/false always wins.
//   Railway's private network (*.railway.internal) and localhost don't offer
//   SSL, so default it off there; default on for any other remote URL.
const isPrivateHost = (url) =>
  /@([^:/@]*\.railway\.internal|localhost|127\.0\.0\.1)[:/]/i.test(url || '');

const sslEnabled =
  process.env.DB_SSL === 'true'
    ? true
    : process.env.DB_SSL === 'false'
      ? false
      : useConnectionString && !isPrivateHost(process.env.DATABASE_URL);

const pool = new Pool({
  ...(useConnectionString
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'uniacco',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
      }),
  ...(sslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
  max: Number(process.env.DB_MAX_CONNECTIONS) || 20,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT) || 10000,
});

// Test connection on startup
const testConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database');
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  } finally {
    client.release();
  }
};

// Event listeners
pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('New client connected to the pool');
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Test the connection on startup
testConnection().catch(console.error);

// Export the pool directly
module.exports = pool;

// Enhanced getClient with better error handling and query tracking
module.exports.getClient = async () => {
  const client = await pool.connect();
  const release = client.release;
  
  // Set a timeout to detect long-running queries
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
    console.error(`Last query: ${client.lastQuery || 'No query executed'}`);
  }, 5000);
  
  // Store the original query method
  const query = client.query;
  
  // Override the query method to track the last query
  client.query = (...args) => {
    client.lastQuery = args[0].text || args[0];
    return query.apply(client, args);
  };
  
  // Override the release method
  client.release = () => {
    clearTimeout(timeout);
    // Restore the original methods
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  
  return client;
};