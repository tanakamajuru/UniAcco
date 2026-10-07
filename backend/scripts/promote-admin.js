// Gives the admin role to an existing account. Run once per admin, after they have
// signed up with their own password:   node scripts/promote-admin.js someone@example.com
require('dotenv').config();
const { Pool } = require('pg');

const email = String(process.argv[2] || '').trim().toLowerCase();
if (!email) {
  console.error('Usage: node scripts/promote-admin.js <email>');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool
  .query("UPDATE users SET role = 'admin', is_verified = true WHERE lower(email) = $1 RETURNING email", [email])
  .then(({ rows }) => {
    if (rows.length === 0) {
      console.error(`No account found for ${email}. Ask them to sign up first.`);
      process.exitCode = 1;
    } else {
      console.log(`Admin role given to ${rows[0].email}. They must sign in again.`);
    }
  })
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
