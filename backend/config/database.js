const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'uniacco',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
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