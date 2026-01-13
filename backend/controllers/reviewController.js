// controllers/reviewController.js
const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Create review
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { accommodationId, rating, comment } = req.body;

    // Check if user has a completed booking for this accommodation
    const bookingCheck = await pool.query(
      `SELECT id FROM bookings 
       WHERE student_id = $1 AND accommodation_id = $2 AND status = 'completed'`,
      [req.user.id, accommodationId]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(400).json({ 
        error: 'You can only review accommodations you have stayed at.' 
      });
    }

    // Check if already reviewed
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE student_id = $1 AND accommodation_id = $2',
      [req.user.id, accommodationId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this accommodation.' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (accommodation_id, student_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [accommodationId, req.user.id, rating, comment]
    );

    res.status(201).json({
      message: 'Review created successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Error creating review.' });
  }
};

// Get reviews for accommodation
exports.getAccommodationReviews = async (req, res) => {
  try {
    const { accommodationId } = req.params;

    const query = `
      SELECT 
        r.*,
        u.first_name || ' ' || u.last_name as student_name,
        p.avatar_url as student_avatar
      FROM reviews r
      JOIN users u ON r.student_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE r.accommodation_id = $1
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [accommodationId]);

    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Error fetching reviews.' });
  }
};

// Get current student's reviews
exports.getMyReviews = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.*,
        a.title as accommodation_title,
        a.main_image_url as accommodation_image
      FROM reviews r
      JOIN accommodations a ON r.accommodation_id = a.id
      WHERE r.student_id = $1
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [req.user.id]);
    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ error: 'Error fetching your reviews.' });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // First, get the review to check ownership
    const reviewResult = await pool.query(
      'SELECT * FROM reviews WHERE id = $1',
      [id]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    const review = reviewResult.rows[0];

    // Check if the user is the owner of the review or an admin
    if (review.student_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Not authorized to delete this review.' 
      });
    }

    // Delete the review
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Error deleting review.' });
  }
};