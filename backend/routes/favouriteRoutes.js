const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  ACC_SELECT,
  unlockedAccommodationIds,
  serializeAccommodation,
} = require('../utils/accommodation');

router.use(authenticateToken, authorizeRoles('student'));

// GET /api/favourites -> [Accommodation]
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `${ACC_SELECT}
       JOIN favourites f ON f.accommodation_id = a.id AND f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    const unlocked = await unlockedAccommodationIds(req.user.id);
    res.json(rows.map((r) => serializeAccommodation(r, unlocked.has(r.id))));
  } catch (error) {
    console.error('Favourites list error:', error);
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
});

// POST /api/favourites/:accommodationId -> { saved:true }
router.post('/:accommodationId', async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO favourites (user_id, accommodation_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, req.params.accommodationId]
    );
    res.json({ saved: true });
  } catch (error) {
    console.error('Favourite add error:', error);
    res.status(500).json({ error: 'Failed to save' });
  }
});

// DELETE /api/favourites/:accommodationId -> { saved:false }
router.delete('/:accommodationId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM favourites WHERE user_id = $1 AND accommodation_id = $2',
      [req.user.id, req.params.accommodationId]
    );
    res.json({ saved: false });
  } catch (error) {
    console.error('Favourite remove error:', error);
    res.status(500).json({ error: 'Failed to remove' });
  }
});

module.exports = router;
