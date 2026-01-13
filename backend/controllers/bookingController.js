// controllers/bookingController.js
const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { accommodationId, startDate, endDate } = req.body;

    // Check accommodation exists and is available
    const accommodationCheck = await pool.query(
      'SELECT * FROM accommodations WHERE id = $1 AND is_available = true',
      [accommodationId]
    );

    if (accommodationCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Accommodation not found or not available.' });
    }

    const accommodation = accommodationCheck.rows[0];

    // Check for overlapping bookings
    const overlapCheck = await pool.query(
      `SELECT id FROM bookings 
       WHERE accommodation_id = $1 
       AND status IN ('pending', 'confirmed')
       AND (
         (start_date <= $2 AND end_date >= $2) OR
         (start_date <= $3 AND end_date >= $3) OR
         (start_date >= $2 AND end_date <= $3)
       )`,
      [accommodationId, startDate, endDate]
    );

    if (overlapCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Accommodation is already booked for these dates.' 
      });
    }

    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());
    const totalPrice = months * parseFloat(accommodation.price_per_month);

    // Create booking
    const result = await pool.query(
      `INSERT INTO bookings 
       (accommodation_id, student_id, start_date, end_date, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [accommodationId, req.user.id, startDate, endDate, totalPrice, 'pending']
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Error creating booking.' });
  }
};

// Get user's bookings (student view)
exports.getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        b.*,
        a.title, a.address, a.city, a.price_per_month,
        u.first_name || ' ' || u.last_name as landlord_name,
        u.phone as landlord_phone,
        u.email as landlord_email,
        (SELECT image_url FROM accommodation_images 
         WHERE accommodation_id = a.id AND is_primary = true 
         LIMIT 1) as primary_image
      FROM bookings b
      JOIN accommodations a ON b.accommodation_id = a.id
      JOIN users u ON a.landlord_id = u.id
      WHERE b.student_id = $1
    `;

    const params = [req.user.id];

    if (status) {
      query += ` AND b.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY b.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Error fetching bookings.' });
  }
};

// Get bookings for landlord's properties
exports.getPropertyBookings = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        b.*,
        a.title as accommodation_title,
        a.address,
        u.first_name || ' ' || u.last_name as student_name,
        u.phone as student_phone,
        u.email as student_email,
        p.university_id,
        uni.name as university_name
      FROM bookings b
      JOIN accommodations a ON b.accommodation_id = a.id
      JOIN users u ON b.student_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN universities uni ON p.university_id = uni.id
      WHERE a.landlord_id = $1
    `;

    const params = [req.user.id];

    if (status) {
      query += ` AND b.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY b.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Get property bookings error:', error);
    res.status(500).json({ error: 'Error fetching bookings.' });
  }
};

// Update booking status (landlord only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be confirmed or cancelled.' 
      });
    }

    // Check if landlord owns the accommodation
    const ownerCheck = await pool.query(
      `SELECT b.id FROM bookings b
       JOIN accommodations a ON b.accommodation_id = a.id
       WHERE b.id = $1 AND a.landlord_id = $2`,
      [id, req.user.id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ 
        error: 'You can only update bookings for your properties.' 
      });
    }

    const result = await pool.query(
      `UPDATE bookings 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json({
      message: `Booking ${status} successfully`,
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Error updating booking status.' });
  }
};

// Cancel booking (student can cancel their own)
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const bookingCheck = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND student_id = $2',
      [id, req.user.id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (bookingCheck.rows[0].status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled.' });
    }

    await pool.query(
      `UPDATE bookings 
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Error cancelling booking.' });
  }
};