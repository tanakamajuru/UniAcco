const pool = require('../config/database');

const favoriteController = {
  // Add accommodation to favorites
  addToFavorites: async (req, res) => {
    const { accommodationId } = req.body;
    const userId = req.user.id;

    try {
      // Check if already in favorites
      const existingFavorite = await pool.query(
        'SELECT * FROM favorites WHERE user_id = $1 AND accommodation_id = $2',
        [userId, accommodationId]
      );

      if (existingFavorite.rows.length > 0) {
        return res.status(400).json({ error: 'Accommodation already in favorites' });
      }

      // Add to favorites
      await pool.query(
        'INSERT INTO favorites (user_id, accommodation_id) VALUES ($1, $2) RETURNING *',
        [userId, accommodationId]
      );

      res.status(201).json({ message: 'Added to favorites' });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      res.status(500).json({ error: 'Server error while adding to favorites' });
    }
  },

  // Get user's favorite accommodations
  getFavorites: async (req, res) => {
    const userId = req.user.id;

    try {
      const result = await pool.query(
        `SELECT a.* FROM accommodations a
         JOIN favorites f ON a.id = f.accommodation_id
         WHERE f.user_id = $1`,
        [userId]
      );

      res.json({ favorites: result.rows });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ error: 'Server error while fetching favorites' });
    }
  },

  // Remove accommodation from favorites
  removeFromFavorites: async (req, res) => {
    const { accommodationId } = req.params;
    const userId = req.user.id;

    try {
      const result = await pool.query(
        'DELETE FROM favorites WHERE user_id = $1 AND accommodation_id = $2 RETURNING *',
        [userId, accommodationId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Favorite not found' });
      }

      res.json({ message: 'Removed from favorites' });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      res.status(500).json({ error: 'Server error while removing from favorites' });
    }
  }
};

module.exports = favoriteController;
