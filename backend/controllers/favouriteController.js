// controllers/favoriteController.js
const pool = require('../config/database');

// Add to favorites
exports.addFavorite = async (req, res) => {
  try {
    const { accommodationId } = req.body;

    // Check if already favorited
    const existingFavorite = await pool.query(
      'SELECT id FROM favorites WHERE student_id = $1 AND accommodation_id = $2',
      [req.user.id, accommodationId]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(400).json({ error: 'Already in favorites.' });
    }

    await pool.query(
      'INSERT INTO favorites (student_id, accommodation_id) VALUES ($1, $2)',
      [req.user.id, accommodationId]
    );

    res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Error adding to favorites.' });
  }
};

// Remove from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { accommodationId } = req.params;

    const result = await pool.query(
      'DELETE FROM favorites WHERE student_id = $1 AND accommodation_id = $2 RETURNING id',
      [req.user.id, accommodationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Favorite not found.' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Error removing from favorites.' });
  }
};

// Get user's favorites
exports.getMyFavorites = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.*,
        u.first_name || ' ' || u.last_name as landlord_name,
        am.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as review_count,
        f.created_at as favorited_at,
        (SELECT image_url FROM accommodation_images 
         WHERE accommodation_id = a.id AND is_primary = true 
         LIMIT 1) as primary_image
      FROM favorites f
      JOIN accommodations a ON f.accommodation_id = a.id
      LEFT JOIN users u ON a.landlord_id = u.id
      LEFT JOIN accommodation_amenities am ON a.id = am.accommodation_id
      LEFT JOIN reviews r ON a.id = r.accommodation_id
      WHERE f.student_id = $1
      GROUP BY a.id, u.first_name, u.last_name, am.id, f.created_at
      ORDER BY f.created_at DESC
    `;

    const result = await pool.query(query, [req.user.id]);

    res.json({ favorites: result.rows });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Error fetching favorites.' });
  }
};