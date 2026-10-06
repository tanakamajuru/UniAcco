const pool = require('../config/database');

// Profiles that have not expired, newest first. Students only.
exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.first_name, u.short AS university, r.budget, r.move_in, r.note, r.phone, r.created_at
         FROM roommate_profiles r
         LEFT JOIN universities u ON u.id = r.university_id
        WHERE r.expires_at > now()
        ORDER BY r.created_at DESC
        LIMIT 100`
    );
    res.json({ profiles: rows });
  } catch (error) {
    console.error('Roommate list error:', error);
    res.status(500).json({ error: 'Failed to fetch roommate profiles' });
  }
};

// GET /api/roommates/mine
exports.mine = async (req, res) => {
  const { rows } = await pool.query(
    'SELECT first_name, university_id, budget, move_in, note, phone, expires_at FROM roommate_profiles WHERE student_id = $1',
    [req.user.id]
  );
  res.json({ profile: rows[0] || null });
};

// PUT /api/roommates/mine — create or replace your profile.
exports.save = async (req, res) => {
  try {
    const first = String(req.body.firstName || '').trim().slice(0, 30);
    if (!first) return res.status(400).json({ error: 'First name is required' });
    const budget = req.body.budget === '' || req.body.budget == null ? null : Number(req.body.budget);
    if (budget != null && (Number.isNaN(budget) || budget < 0)) {
      return res.status(400).json({ error: 'Budget must be a positive number' });
    }
    const { rows } = await pool.query(
      `INSERT INTO roommate_profiles (student_id, first_name, university_id, budget, move_in, note, phone, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now() + interval '30 days')
       ON CONFLICT (student_id) DO UPDATE SET
         first_name = EXCLUDED.first_name, university_id = EXCLUDED.university_id,
         budget = EXCLUDED.budget, move_in = EXCLUDED.move_in, note = EXCLUDED.note,
         phone = EXCLUDED.phone, expires_at = now() + interval '30 days'
       RETURNING first_name, budget, move_in, note, phone, expires_at`,
      [
        req.user.id,
        first,
        req.body.universityId || null,
        budget,
        req.body.moveIn || null,
        String(req.body.note || '').slice(0, 280) || null,
        String(req.body.phone || '').trim() || null,
      ]
    );
    res.json({ profile: rows[0] });
  } catch (error) {
    console.error('Roommate save error:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
};

// DELETE /api/roommates/mine — remove your profile now.
exports.remove = async (req, res) => {
  await pool.query('DELETE FROM roommate_profiles WHERE student_id = $1', [req.user.id]);
  res.json({ deleted: true });
};
