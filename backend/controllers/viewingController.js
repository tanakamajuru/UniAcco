const pool = require('../config/database');
const { hasUnlocked } = require('../utils/accommodation');

// POST /api/viewings (student) — asks to see a property at a chosen time.
// Requires paid access, the same rule as applications.
exports.create = async (req, res) => {
  try {
    const { accommodationId, requestedAt, fullName, phone } = req.body;
    if (!accommodationId || !requestedAt || !fullName || !phone) {
      return res.status(400).json({ error: 'accommodationId, requestedAt, fullName and phone are required' });
    }
    const when = new Date(requestedAt);
    if (Number.isNaN(when.getTime()) || when <= new Date()) {
      return res.status(400).json({ error: 'Choose a future date and time for the viewing' });
    }
    if (!(await hasUnlocked(req.user.id, accommodationId))) {
      return res.status(402).json({ error: 'Unlock the contact before requesting a viewing' });
    }
    const { rows } = await pool.query(
      `INSERT INTO viewing_requests (accommodation_id, student_id, full_name, phone, requested_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, accommodation_id, requested_at, status`,
      [accommodationId, req.user.id, fullName, phone, when]
    );
    res.status(201).json({ viewing: rows[0] });
  } catch (error) {
    console.error('Create viewing error:', error);
    res.status(500).json({ error: 'Failed to request viewing' });
  }
};

// GET /api/viewings/landlord — the landlord's requests across their listings.
exports.forLandlord = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT v.id, v.accommodation_id, a.title, v.full_name, v.phone,
              v.requested_at, v.status
         FROM viewing_requests v
         JOIN accommodations a ON a.id = v.accommodation_id
        WHERE a.landlord_id = $1
        ORDER BY v.requested_at ASC`,
      [req.user.id]
    );
    res.json({ viewings: rows });
  } catch (error) {
    console.error('Landlord viewings error:', error);
    res.status(500).json({ error: 'Failed to fetch viewings' });
  }
};

// PATCH /api/viewings/:id (landlord) — confirm or decline.
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'status must be confirmed or declined' });
    }
    const { rows } = await pool.query(
      `UPDATE viewing_requests v SET status = $1
         FROM accommodations a
        WHERE v.id = $2 AND a.id = v.accommodation_id AND a.landlord_id = $3
        RETURNING v.id, v.status`,
      [status, req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Viewing not found' });
    res.json({ viewing: rows[0] });
  } catch (error) {
    console.error('Update viewing error:', error);
    res.status(500).json({ error: 'Failed to update viewing' });
  }
};
