/**
 * Forward-only, idempotent schema migrations — safe to run on every boot.
 * Unlike db:setup (which DROPS and recreates), this only applies additive
 * ALTERs, so it never destroys live data.
 *
 * Add new idempotent migration files to MIGRATIONS as the schema evolves.
 * Uses DATABASE_URL when present (Railway/Neon, SSL on), else DB_* vars.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const dir = path.join(__dirname, '..', 'database', 'migrations');

// Only forward, idempotent ALTERs — never the table-creating 00x files.
const MIGRATIONS = [
  '005_drop_unused_profile_columns.sql',
  '006_anonymous_payments.sql',
  '007_image_kind.sql',
];

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
  const client = await pool.connect();
  try {
    for (const file of MIGRATIONS) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      await client.query(sql);
      console.log(`✓ migration applied: ${file}`);
    }
    console.log('All migrations applied.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
