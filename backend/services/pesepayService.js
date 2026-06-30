/**
 * Pesepay payment gateway service.
 * Adapted from pesepay/server/index.js — handles the AES-CBC payload
 * encryption Pesepay requires and wraps the make-payment / initiate /
 * check-status endpoints.
 *
 * Transport uses Node's https module with `insecureHTTPParser: true`.
 * Pesepay's server returns slightly non-standard HTTP headers that the
 * strict llhttp parser (used by global fetch AND node-fetch) rejects with
 * "Missing expected CR after header value"; the lenient parser tolerates it.
 */
const https = require('https');
const { URL } = require('url');
const CryptoJS = require('crypto-js');

// Minimal HTTPS request helper that tolerates Pesepay's non-standard headers.
function httpRequest(method, urlStr, headers, bodyString) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const req = https.request(
      {
        method,
        hostname: u.hostname,
        path: u.pathname + u.search,
        port: u.port || 443,
        headers,
        insecureHTTPParser: true,
        timeout: 30000,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, text: data }));
      }
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('Pesepay request timed out')));
    if (bodyString) req.write(bodyString);
    req.end();
  });
}

class PesepayService {
  constructor() {
    this.integrationKey = process.env.PESEPAY_INTEGRATION_KEY || '';
    this.encryptionKey = process.env.PESEPAY_ENCRYPTION_KEY || '';
    this.isSandbox = process.env.PESEPAY_ENV !== 'production';

    this.baseUrl = this.isSandbox
      ? 'https://api.test.sandbox.pesepay.com/payments-engine/v1'
      : 'https://api.pesepay.com/api/payments-engine/v1';

    this.endpoints = {
      makePayment: this.isSandbox
        ? `${this.baseUrl}/payments/make-payment`
        : 'https://api.pesepay.com/api/payments-engine/v2/payments/make-payment',
      initiate: `${this.baseUrl}/payments/initiate`,
      checkStatus: `${this.baseUrl}/payments/check-payment`,
      currencies: `${this.baseUrl}/currencies/active`,
      paymentMethods: `${this.baseUrl}/payment-methods/by-currency`,
    };

    if (this.isConfigured()) {
      console.log(`💳 Pesepay running in ${this.isSandbox ? 'SANDBOX' : 'PRODUCTION'} mode`);
    } else {
      console.log('💳 Pesepay not configured — payments will run in SIMULATED mode');
    }
  }

  isConfigured() {
    return Boolean(this.integrationKey && this.encryptionKey);
  }

  // ─── crypto ────────────────────────────────────────────────────────────────
  encrypt(data) {
    const key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
    const iv = CryptoJS.enc.Utf8.parse(this.encryptionKey.substring(0, 16));
    return CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  }

  decrypt(encryptedStr) {
    const key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
    const iv = CryptoJS.enc.Utf8.parse(this.encryptionKey.substring(0, 16));
    const bytes = CryptoJS.AES.decrypt(encryptedStr, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // ─── transport ───────────────────────────────────────────────────────────────
  parse(text) {
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  }

  async post(url, body) {
    const { status, text } = await httpRequest(
      'POST',
      url,
      { Authorization: this.integrationKey, 'Content-Type': 'application/json' },
      JSON.stringify({ payload: this.encrypt(body) })
    );
    const raw = this.parse(text);
    if (raw.payload) {
      try {
        return { success: true, data: this.decrypt(raw.payload) };
      } catch {
        return { success: false, error: 'Failed to decrypt Pesepay response' };
      }
    }
    // Pesepay returns validation errors as plain JSON { error: "..." } or { message: "..." }
    const errMsg = raw.error || raw.message || `Pesepay request failed (HTTP ${status})`;
    console.error('[Pesepay] POST error — HTTP', status, '| body:', text.slice(0, 500));
    return { success: false, error: errMsg };
  }

  async get(url) {
    const { text } = await httpRequest('GET', url, { Authorization: this.integrationKey });
    const raw = this.parse(text);
    if (raw.payload) {
      try {
        return { success: true, data: this.decrypt(raw.payload) };
      } catch {
        return { success: true, data: raw };
      }
    }
    return { success: true, data: raw };
  }

  // ─── operations ──────────────────────────────────────────────────────────────
  /** Seamless payment (EcoCash / InnBucks / card). */
  makePayment(payload) {
    return this.post(this.endpoints.makePayment, payload);
  }

  /** Redirect payment — returns a hosted Pesepay redirectUrl. */
  initiate(payload) {
    return this.post(this.endpoints.initiate, payload);
  }

  /** Poll a transaction by Pesepay reference number. */
  checkStatus(referenceNumber) {
    const url = `${this.endpoints.checkStatus}?referenceNumber=${encodeURIComponent(referenceNumber)}`;
    return this.get(url);
  }
}

module.exports = PesepayService;
