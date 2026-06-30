const pool = require('../config/database');

/**
 * Finds or creates a thread between a student and landlord for an accommodation.
 * Returns the thread row. Optionally seeds an initial message from `seed`.
 */
async function ensureThread({ studentId, landlordId, accommodationId, seed }) {
  // Try to find an existing thread (treat NULL accommodation distinctly).
  const existing = await pool.query(
    `SELECT * FROM message_threads
      WHERE student_id = $1 AND landlord_id = $2
        AND accommodation_id IS NOT DISTINCT FROM $3
      LIMIT 1`,
    [studentId, landlordId, accommodationId || null]
  );

  let thread = existing.rows[0];
  if (!thread) {
    const created = await pool.query(
      `INSERT INTO message_threads (student_id, landlord_id, accommodation_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [studentId, landlordId, accommodationId || null]
    );
    thread = created.rows[0];
  }

  if (seed && seed.body && seed.senderId) {
    await pool.query(
      `INSERT INTO messages (thread_id, sender_id, body) VALUES ($1, $2, $3)`,
      [thread.id, seed.senderId, seed.body]
    );
  }

  return thread;
}

module.exports = { ensureThread };
