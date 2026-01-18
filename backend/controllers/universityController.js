const pool = require('../config/database');

// @desc    Get all universities
// @route   GET /api/universities
// @access  Public
const getUniversities = async (_req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, name
        FROM universities
        ORDER BY name ASC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: 'Server error while fetching universities' });
  }
};

module.exports = {
  getUniversities
};
