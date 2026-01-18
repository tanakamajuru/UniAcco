const pool = require('../config/database');

const parseOptionalId = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'number') return Number.isNaN(value) ? null : Math.trunc(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    // If it looks like a UUID, return as-is
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)) {
      return trimmed;
    }
    // Otherwise try to parse as integer
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return null;
    return Math.trunc(parsed);
  }
  return null;
};

// @desc    Get all campuses (optionally filtered by university_id)
// @route   GET /api/campuses?university_id=1
// @access  Public
const getCampuses = async (req, res) => {
  try {
    const universityIdRaw = req.query.university_id ?? req.query.universityId;
    const universityId = universityIdRaw === undefined ? undefined : parseOptionalId(universityIdRaw);

    if (universityId === null) {
      return res.status(400).json({ error: 'university_id must be a valid integer or UUID' });
    }

    let query = `
      SELECT id, university_id, name, address, city
      FROM campuses
    `;
    const queryParams = [];
    
    if (universityId !== undefined) {
      query += ` WHERE university_id = $1`;
      queryParams.push(universityId);
    }
    
    query += ` ORDER BY name ASC`;

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching campuses:', error);
    res.status(500).json({ error: 'Server error while fetching campuses' });
  }
};

module.exports = {
  getCampuses
};
