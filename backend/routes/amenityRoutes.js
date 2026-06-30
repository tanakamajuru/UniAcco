const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/amenities -> [{ id, label, icon }]
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, label, icon FROM amenities ORDER BY label');
    res.json(rows);
  } catch (error) {
    console.error('Amenities error:', error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
});

module.exports = router;
