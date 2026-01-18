const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const PayNowService = require('../services/paynowService');
const { authenticateToken } = require('../middleware/auth');

const paynowService = new PayNowService();

// @desc    Initiate payment for accommodation booking
// @route   POST /api/payments/initiate
// @access  Private
router.post('/initiate', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { 
      accommodationId, 
      amount, 
      paymentMethod = 'web', // 'web' or 'mobile'
      phone,
      email,
      method // 'ecocash' or 'onemoney' for mobile payments
    } = req.body;

    // Validate required fields
    if (!accommodationId || !amount || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields: accommodationId, amount, email' 
      });
    }

    // Validate amount
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount' 
      });
    }

    // Get accommodation details
    const accommodationResult = await client.query(
      'SELECT title FROM accommodations WHERE id = $1',
      [accommodationId]
    );

    if (accommodationResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Accommodation not found' 
      });
    }

    // Generate unique payment reference
    const reference = `UNIACCO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const bookingDetails = {
      reference,
      email,
      amount: paymentAmount,
      description: `Payment for accommodation booking`,
      accommodationTitle: accommodationResult.rows[0].title
    };

    let paymentResponse;
    
    if (paymentMethod === 'mobile' && phone && method) {
      // Mobile payment
      paymentResponse = await paynowService.createMobilePayment({
        ...bookingDetails,
        phone,
        method
      });
    } else {
      // Web payment
      paymentResponse = await paynowService.createPayment(bookingDetails);
    }

    if (!paymentResponse.success) {
      return res.status(400).json({
        error: paymentResponse.error
      });
    }

    // Save payment to database
    await client.query(
      `INSERT INTO payments (
        accommodation_id, user_id, paynow_reference, poll_url, 
        amount, status, payment_method, customer_email, 
        customer_phone, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        accommodationId,
        req.user.id,
        reference,
        paymentResponse.pollUrl,
        paymentAmount,
        'pending',
        paymentMethod,
        email,
        phone || null,
        `Payment for ${accommodationResult.rows[0].title}`
      ]
    );

    res.json({
      success: true,
      reference,
      redirectUrl: paymentResponse.redirectUrl,
      pollUrl: paymentResponse.pollUrl,
      instructions: paymentResponse.instructions,
      paymentMethod
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  } finally {
    client.release();
  }
});

// @desc    Check payment status
// @route   GET /api/payments/status/:reference
// @access  Private
router.get('/status/:reference', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { reference } = req.params;

    // Get payment from database
    const paymentResult = await client.query(
      'SELECT * FROM payments WHERE paynow_reference = $1 AND user_id = $2',
      [reference, req.user.id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Payment not found' 
      });
    }

    const payment = paymentResult.rows[0];

    // If payment is already marked as paid, return current status
    if (payment.status === 'paid') {
      return res.json({
        success: true,
        status: 'paid',
        paidAt: payment.paid_at
      });
    }

    // Check status with PayNow
    const statusResponse = await paynowService.checkPaymentStatus(payment.poll_url);

    if (statusResponse.error) {
      return res.status(500).json({ 
        error: 'Status check failed' 
      });
    }

    // Update payment status in database
    if (statusResponse.paid) {
      await client.query(
        'UPDATE payments SET status = $1, paid_at = $2 WHERE id = $3',
        ['paid', statusResponse.paidAt || new Date(), payment.id]
      );
    }

    res.json({
      success: true,
      status: statusResponse.paid ? 'paid' : 'pending',
      paidAt: statusResponse.paidAt
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ error: 'Status check failed' });
  } finally {
    client.release();
  }
});

// @desc    Handle PayNow webhook
// @route   POST /api/payments/webhook
// @access  Public
router.post('/webhook', async (req, res) => {
  const client = await pool.connect();
  try {
    const webhookData = req.body;
    
    // Process webhook
    const paymentInfo = paynowService.processWebhook(webhookData);
    
    if (!paymentInfo) {
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    // Update payment status in database
    await client.query(
      'UPDATE payments SET status = $1, paid_at = $2 WHERE paynow_reference = $3',
      [
        paymentInfo.status,
        paymentInfo.paid ? new Date() : null,
        paymentInfo.reference
      ]
    );

    // If payment is paid, you might want to trigger booking confirmation
    if (paymentInfo.paid) {
      // TODO: Send booking confirmation email
      // TODO: Update booking status to confirmed
      console.log(`Payment ${paymentInfo.reference} has been paid!`);
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  } finally {
    client.release();
  }
});

// @desc    Get user payment history
// @route   GET /api/payments/history
// @access  Private
router.get('/history', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const paymentsResult = await client.query(
      `SELECT 
        p.*,
        a.title as accommodation_title,
        a.city as accommodation_city
      FROM payments p
      JOIN accommodations a ON p.accommodation_id = a.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const countResult = await client.query(
      'SELECT COUNT(*) FROM payments WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      payments: paymentsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  } finally {
    client.release();
  }
});

module.exports = router;
