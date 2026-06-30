const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/universities -> [{ id, name, short, city, lat, lng, campuses:[...] }]
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.short, u.city, u.lat, u.lng,
              COALESCE(
                json_agg(
                  json_build_object('id', c.id, 'name', c.name, 'city', c.city, 'province', c.province)
                  ORDER BY c.name
                ) FILTER (WHERE c.id IS NOT NULL), '[]'
              ) AS campuses
         FROM universities u
         LEFT JOIN campuses c ON c.university_id = u.id
         GROUP BY u.id
         ORDER BY u.name`
    );
    res.json(
      rows.map((r) => ({
        ...r,
        lat: r.lat != null ? Number(r.lat) : null,
        lng: r.lng != null ? Number(r.lng) : null,
      }))
    );
  } catch (error) {
    console.error('Universities error:', error);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
});

module.exports = router;
