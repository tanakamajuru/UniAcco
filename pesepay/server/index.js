require('dotenv').config();
const express = require('express');
const cors = require('cors');
const CryptoJS = require('crypto-js');
const fetch = require('node-fetch');

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

const INTEGRATION_KEY = process.env.PESEPAY_INTEGRATION_KEY;
const ENCRYPTION_KEY = process.env.PESEPAY_ENCRYPTION_KEY;
const IS_SANDBOX = process.env.PESEPAY_ENV !== 'production';

const BASE_URL = IS_SANDBOX
  ? 'https://api.test.sandbox.pesepay.com/payments-engine/v1'
  : 'https://api.pesepay.com/api/payments-engine/v1';

const ENDPOINTS = {
  makePayment:       `${BASE_URL}/payments/make-payment`,
  initiate:          `${BASE_URL}/payments/initiate`,
  checkStatus:       `${BASE_URL}/payments/check-payment-status`,
  currencies:        `${BASE_URL}/currencies/active`,
  paymentMethods:    `${BASE_URL}/payment-methods/by-currency`,
};

// ─── Crypto helpers ──────────────────────────────────────────────────────────

function encrypt(data) {
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const iv  = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY.substring(0, 16));
  return CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

function decrypt(encryptedStr) {
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const iv  = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY.substring(0, 16));
  const bytes = CryptoJS.AES.decrypt(encryptedStr, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// ─── Pesepay fetch wrapper ────────────────────────────────────────────────────

async function pesepayPost(url, body) {
  const encrypted = encrypt(body);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: INTEGRATION_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payload: encrypted }),
  });

  const raw = await res.json();

  // Response is also encrypted
  if (raw.payload) {
    try {
      return { success: true, data: decrypt(raw.payload), raw };
    } catch (e) {
      return { success: false, error: 'Failed to decrypt response', raw };
    }
  }

  return { success: false, error: raw.message || 'Unknown error', raw };
}

async function pesepayGet(url) {
  const res = await fetch(url, {
    headers: { Authorization: INTEGRATION_KEY },
  });
  const raw = await res.json();
  if (raw.payload) {
    try {
      return { success: true, data: decrypt(raw.payload), raw };
    } catch {
      return { success: true, data: raw, raw };
    }
  }
  return { success: true, data: raw };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: IS_SANDBOX ? 'sandbox' : 'production',
    baseUrl: BASE_URL,
  });
});

// POST /api/pay — seamless payment (EcoCash, InnBucks, card)
app.post('/api/pay', async (req, res) => {
  try {
    const {
      amount,
      currencyCode,
      reasonForPayment,
      merchantReference,
      paymentMethodCode,
      customer,
      paymentMethodRequiredFields,
    } = req.body;

    if (!amount || !currencyCode || !paymentMethodCode || !customer) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const payload = {
      amountDetails: { amount: parseFloat(amount), currencyCode },
      reasonForPayment,
      merchantReference: merchantReference || `REF-${Date.now()}`,
      resultUrl: process.env.RESULT_URL,
      returnUrl: process.env.RETURN_URL,
      paymentMethodCode,
      customer,
      paymentMethodRequiredFields: paymentMethodRequiredFields || {},
    };

    console.log('\n[PAY] →', JSON.stringify(payload, null, 2));

    const result = await pesepayPost(ENDPOINTS.makePayment, payload);

    console.log('[PAY] ←', result.success ? result.data : result.error);

    if (result.success) {
      return res.json({ success: true, transaction: result.data });
    } else {
      return res.status(502).json({ success: false, error: result.error, raw: result.raw });
    }
  } catch (err) {
    console.error('[PAY] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/initiate — redirect-based payment (sends user to Pesepay page)
app.post('/api/initiate', async (req, res) => {
  try {
    const { amount, currencyCode, reasonForPayment, merchantReference } = req.body;

    const payload = {
      amountDetails: { amount: parseFloat(amount), currencyCode },
      reasonForPayment,
      merchantReference: merchantReference || `REF-${Date.now()}`,
      resultUrl: process.env.RESULT_URL,
      returnUrl: process.env.RETURN_URL,
    };

    console.log('\n[INITIATE] →', payload);
    const result = await pesepayPost(ENDPOINTS.initiate, payload);
    console.log('[INITIATE] ←', result.success ? result.data : result.error);

    if (result.success) {
      return res.json({ success: true, transaction: result.data });
    } else {
      return res.status(502).json({ success: false, error: result.error, raw: result.raw });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/status/:reference — check transaction status
app.get('/api/status/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const url = `${ENDPOINTS.checkStatus}?referenceNumber=${encodeURIComponent(reference)}`;

    console.log('\n[STATUS] checking:', reference);
    const result = await pesepayGet(url);
    console.log('[STATUS] ←', result.data);

    res.json({ success: true, transaction: result.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/currencies — list active currencies
app.get('/api/currencies', async (req, res) => {
  try {
    const result = await pesepayGet(ENDPOINTS.currencies);
    res.json({ success: true, currencies: result.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/payment-methods/:currency — get methods for a currency
app.get('/api/payment-methods/:currency', async (req, res) => {
  try {
    const url = `${ENDPOINTS.paymentMethods}?currencyCode=${req.params.currency}`;
    const result = await pesepayGet(url);
    res.json({ success: true, paymentMethods: result.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /pesepay/result — Pesepay calls this with payment result (webhook)
app.post('/pesepay/result', (req, res) => {
  console.log('\n[WEBHOOK] Pesepay result received:', req.body);
  // In production: update your DB here
  res.status(200).send('OK');
});

// GET /payment/return — user redirected back after paying (redirect flow)
app.get('/payment/return', (req, res) => {
  const { referenceNumber, status } = req.query;
  res.json({ message: 'Payment return received', referenceNumber, status });
});

// ─── Start ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nPesepay server running on http://localhost:${PORT}`);
  console.log(`Environment: ${IS_SANDBOX ? 'SANDBOX' : 'PRODUCTION'}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('\nRoutes:');
  console.log('  GET  /health');
  console.log('  POST /api/pay');
  console.log('  POST /api/initiate');
  console.log('  GET  /api/status/:reference');
  console.log('  GET  /api/currencies');
  console.log('  GET  /api/payment-methods/:currency\n');
});
