const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

router.use(authenticateToken, authorizeRoles('landlord'));

// GET /api/host/stats
router.get('/stats', async (req, res) => {
  try {
    const me = req.user.id;

    const viewsRes = await pool.query(
      'SELECT COALESCE(sum(views),0)::int AS total_views FROM accommodations WHERE landlord_id = $1',
      [me]
    );

    const appsRes = await pool.query(
      `SELECT
         count(*)::int AS applications,
         count(*) FILTER (WHERE app.status = 'pending')::int AS applications_pending
         FROM applications app
         JOIN accommodations a ON a.id = app.accommodation_id
        WHERE a.landlord_id = $1`,
      [me]
    );

    const occRes = await pool.query(
      `SELECT COALESCE(sum(rooms_total),0)::int AS rooms_total,
              COALESCE(sum(rooms_filled),0)::int AS rooms_filled
         FROM accommodations WHERE landlord_id = $1`,
      [me]
    );

    const roomsTotal = occRes.rows[0].rooms_total;
    const roomsFilled = occRes.rows[0].rooms_filled;
    const occupancyPct = roomsTotal ? Math.round((roomsFilled / roomsTotal) * 100) : 0;

    res.json({
      totalViews: viewsRes.rows[0].total_views,
      viewsDeltaPct: 18, // weekly delta — placeholder until view history is tracked
      enquiries: 0, // messaging retired; kept so older clients don't break
      enquiriesNew: 0,
      applications: appsRes.rows[0].applications,
      applicationsPending: appsRes.rows[0].applications_pending,
      occupancyPct,
      roomsFilled,
      roomsTotal,
    });
  } catch (error) {
    console.error('Host stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/host/applicants -> same payload as /api/applications/landlord
router.get('/applicants', applicationController.forLandlord);

module.exports = router;
