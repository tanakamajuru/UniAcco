const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const PesepayService = require('../services/pesepayService');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const pesepay = new PesepayService();

const ACCESS_DAYS = 30;
const SIMULATED = 'SIMULATED'; // sentinel poll_url used when Pesepay isn't configured

// TEMP: access fee stubbed to 1 cent for live testing. Revert to 2.00 for launch.
const ACCESS_FEE_AMOUNT = 0.01;

// Mobile-money / card provider -> Pesepay payment method code (USD).
const METHOD_CODES = {
  ecocash: 'PZW211',
  innbucks: 'PZW212',
  card: 'PZW204',
};

const validUntil = () => {
  const d = new Date();
  d.setDate(d.getDate() + ACCESS_DAYS);
  return d;
};

// A Pesepay transaction is settled when paid===true or status is SUCCESS.
const isPaid = (tx) =>
  Boolean(tx && (tx.paid === true || tx.transactionStatus === 'SUCCESS'));

// POST /api/payments/initiate
// optionalAuth: anonymous visitors can pay to unlock a contact without an account.
router.post('/initiate', optionalAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      accommodationId,
      feature = 'accommodation_details',
      email,
      paymentMethod = 'web', // 'web' (hosted redirect / card) | 'mobile'
      phone,
      method, // 'ecocash' | 'innbucks' for mobile
    } = req.body;

    if (!accommodationId || !email) {
      return res.status(400).json({ error: 'accommodationId and email are required' });
    }
    // Amount is enforced server-side (ignore any client value).
    const paymentAmount = ACCESS_FEE_AMOUNT;

    const accRes = await client.query('SELECT title FROM accommodations WHERE id = $1', [
      accommodationId,
    ]);
    if (accRes.rows.length === 0) {
      return res.status(404).json({ error: 'Accommodation not found' });
    }

    const merchantReference = `UNIACCO-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const reasonForPayment = `UniAcco access fee — ${accRes.rows[0].title}`;

    let reference; // Pesepay reference we poll on
    let pollUrl = null;
    let redirectUrl = null;
    let instructions = null;

    if (!pesepay.isConfigured()) {
      // Simulated — instant success path for local development.
      reference = merchantReference;
      pollUrl = SIMULATED;
      redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-return?referenceNumber=${reference}`;
      instructions = 'Simulated payment — approve to continue (dev mode).';
    } else {
      // API_BASE_URL falls back to the host's injected public URL (Railway/Render).
      const apiBase =
        process.env.API_BASE_URL ||
        (process.env.RAILWAY_PUBLIC_DOMAIN && `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`) ||
        process.env.RENDER_EXTERNAL_URL ||
        'http://localhost:5000';
      const base = {
        amountDetails: { amount: paymentAmount, currencyCode: 'USD' },
        reasonForPayment,
        merchantReference,
        resultUrl: `${apiBase}/api/payments/webhook`,
        returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-return`,
      };

      let result;
      if (paymentMethod === 'mobile') {
        const code = METHOD_CODES[method] || METHOD_CODES.ecocash;
        const mobilePayload = {
          ...base,
          paymentMethodCode: code,
          customer: { email, phoneNumber: phone, name: email },
          paymentMethodRequiredFields: { customerPhoneNumber: phone },
        };
        console.log('[Pesepay] makePayment payload:', JSON.stringify(mobilePayload, null, 2));
        result = await pesepay.makePayment(mobilePayload);
      } else {
        // hosted redirect (card / bank)
        console.log('[Pesepay] initiate payload:', JSON.stringify(base, null, 2));
        result = await pesepay.initiate(base);
      }

      if (!result.success) {
        return res.status(502).json({ error: result.error || 'Pesepay request failed' });
      }
      const tx = result.data || {};
      reference = tx.referenceNumber || merchantReference;
      pollUrl = tx.pollUrl || null;
      redirectUrl = tx.redirectUrl || null;
    }

    await client.query(
      `INSERT INTO payments
        (user_id, accommodation_id, feature, amount, method, mobile_provider, email, phone, gateway_reference, poll_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')`,
      [
        req.user?.id || null,
        accommodationId,
        feature,
        paymentAmount,
        paymentMethod,
        paymentMethod === 'mobile' ? method || null : null,
        email,
        phone || null,
        reference,
        pollUrl,
      ]
    );

    res.json({ success: true, reference, redirectUrl, pollUrl, instructions, paymentMethod });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  } finally {
    client.release();
  }
});

// Landlord contact for an accommodation — revealed only after payment.
async function contactFor(client, accommodationId) {
  const { rows } = await client.query(
    `SELECT l.full_name AS name, l.phone, l.email
       FROM accommodations a JOIN users l ON l.id = a.landlord_id
      WHERE a.id = $1`,
    [accommodationId]
  );
  return rows[0] || null;
}

// GET /api/payments/status/:reference  (reference = Pesepay reference number)
// The reference is the capability: whoever holds it (the anonymous payer's
// browser) may check status and, once paid, receive the host contact.
router.get('/status/:reference', optionalAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { reference } = req.params;
    const payRes = await client.query(
      'SELECT * FROM payments WHERE gateway_reference = $1',
      [reference]
    );
    if (payRes.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });

    const payment = payRes.rows[0];
    if (payment.status === 'paid') {
      return res.json({
        success: true,
        status: 'paid',
        accommodationId: payment.accommodation_id,
        contact: await contactFor(client, payment.accommodation_id),
      });
    }

    let paid = false;
    if (payment.poll_url === SIMULATED) {
      paid = true; // dev mode: confirm immediately on first poll
    } else {
      const result = await pesepay.checkStatus(reference);
      if (!result.success) return res.status(502).json({ error: 'Status check failed' });
      paid = isPaid(result.data);
    }

    if (paid) {
      await client.query(
        'UPDATE payments SET status = $1, paid_at = now(), valid_until = $2 WHERE id = $3',
        ['paid', validUntil(), payment.id]
      );
    }

    res.json({
      success: true,
      status: paid ? 'paid' : 'pending',
      accommodationId: payment.accommodation_id,
      contact: paid ? await contactFor(client, payment.accommodation_id) : null,
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ error: 'Status check failed' });
  } finally {
    client.release();
  }
});

// POST /api/payments/webhook (Pesepay result callback -> resultUrl)
router.post('/webhook', async (req, res) => {
  const client = await pool.connect();
  try {
    // Pesepay posts the reference; re-verify with the API before trusting it.
    let reference = req.body && (req.body.referenceNumber || req.body.reference);
    if (!reference && req.body && req.body.payload) {
      try {
        reference = pesepay.decrypt(req.body.payload).referenceNumber;
      } catch {
        /* ignore */
      }
    }
    if (!reference) return res.status(400).json({ error: 'No reference in webhook' });

    let paid = false;
    if (pesepay.isConfigured()) {
      const result = await pesepay.checkStatus(reference);
      paid = result.success && isPaid(result.data);
    }

    if (paid) {
      await client.query(
        `UPDATE payments SET status='paid', paid_at=now(), valid_until=$1
          WHERE gateway_reference=$2 AND status<>'paid'`,
        [validUntil(), reference]
      );
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  } finally {
    client.release();
  }
});

// GET /api/payments/history — used by usePaymentVerification on the client
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.accommodation_id, p.feature, p.amount, p.status, p.method,
              p.valid_until, p.paid_at, p.created_at, a.title AS accommodation_title
         FROM payments p
         LEFT JOIN accommodations a ON a.id = p.accommodation_id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    const payments = rows.map((p) => ({
      ...p,
      status:
        p.status === 'paid' && p.valid_until && new Date(p.valid_until) < new Date()
          ? 'expired'
          : p.status,
    }));
    res.json({ payments });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

module.exports = router;
