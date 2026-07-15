/**
 * Runs the SQL setup files against the configured database.
 *   node scripts/setup-db.js         -> full setup (DROPS + recreates, then seeds)
 *   node scripts/setup-db.js seed    -> idempotent seed only (universities + properties)
 *
 * Uses DATABASE_URL when present (Render/Neon/etc., SSL on), else DB_* vars.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const dir = path.join(__dirname, '..', 'database');
const FULL = ['uniacco.sql', 'universities.sql', 'properties.sql']; // uniacco.sql DROPS tables
const SEED = ['universities.sql', 'properties.sql']; // additive / idempotent

const useUrl = Boolean(process.env.DATABASE_URL);
const sslEnabled =
  process.env.DB_SSL === 'true' || (useUrl && process.env.DB_SSL !== 'false');

const pool = new Pool({
  ...(useUrl
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'uniacco',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
      }),
  ...(sslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
});

(async () => {
  const mode = process.argv[2] === 'seed' ? 'seed' : 'full';
  const files = mode === 'seed' ? SEED : FULL;
  console.log(`Running DB ${mode} setup: ${files.join(', ')}`);

  const client = await pool.connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      process.stdout.write(`  • ${file} ... `);
      await client.query(sql);
      console.log('done');
    }
    console.log('✅ Database setup complete');
  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
