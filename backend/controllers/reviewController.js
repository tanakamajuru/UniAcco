// Reviews. A student can review a home only after unlocking it, once per home.
// Only a first name is shown with a review, never the surname or the account.
const pool = require('../config/database');
const { validationResult } = require('express-validator');
const { hasUnlocked } = require('../utils/accommodation');

const firstName = (full) => String(full || 'Student').trim().split(/\s+/)[0] || 'Student';

// POST /api/reviews (student)
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { accommodationId, rating, comment } = req.body;
    if (!(await hasUnlocked(req.user.id, accommodationId))) {
      return res.status(402).json({ error: 'Unlock this home before you review it.' });
    }

    const existing = await pool.query(
      'SELECT id FROM reviews WHERE author_id = $1 AND accommodation_id = $2',
      [req.user.id, accommodationId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this home.' });
    }

    const who = await pool.query('SELECT full_name FROM users WHERE id = $1', [req.user.id]);
    const { rows } = await pool.query(
      `INSERT INTO reviews (accommodation_id, author_id, author_name, rating, body)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, accommodation_id, author_name, rating, body, created_at`,
      [accommodationId, req.user.id, firstName(who.rows[0]?.full_name), Number(rating), comment || null]
    );
    res.status(201).json({ review: rows[0] });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Could not post your review.' });
  }
};

// GET /api/reviews/accommodation/:accommodationId — public
exports.getAccommodationReviews = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, author_name, rating, body, created_at
         FROM reviews WHERE accommodation_id = $1
        ORDER BY created_at DESC LIMIT 100`,
      [req.params.accommodationId]
    );
    res.json({ reviews: rows });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Could not load reviews.' });
  }
};

// GET /api/reviews/my-reviews (student)
exports.getMyReviews = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.rating, r.body, r.created_at, a.title AS accommodation_title
         FROM reviews r JOIN accommodations a ON a.id = r.accommodation_id
        WHERE r.author_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ reviews: rows });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ error: 'Could not load your reviews.' });
  }
};

// DELETE /api/reviews/:id — the author, or an admin
exports.deleteReview = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT author_id FROM reviews WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Review not found.' });
    if (rows[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this review.' });
    }
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Could not delete the review.' });
  }
};
