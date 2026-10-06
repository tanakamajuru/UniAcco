// Security checks against the live local API: access control, input handling, and
// the payment and review gates. Run on its own (the rate-limit check uses this
// machine's IP and locks sign-in for 15 minutes; see security-ratelimit.spec.js).
const { test, expect } = require('playwright/test');

const API = 'http://localhost:5000/api';
const stamp = Date.now();

let studentToken, landlordToken, listingId;

test.beforeAll(async ({ request }) => {
  const s = await request.post(`${API}/auth/register`, {
    data: { fullName: 'Sec Student', email: `sec-s${stamp}@example.com`, password: 'TestPass123!', role: 'student' },
  });
  studentToken = (await s.json()).token;
  const l = await request.post(`${API}/auth/register`, {
    data: { fullName: 'Sec Landlord', email: `sec-l${stamp}@example.com`, password: 'TestPass123!', role: 'landlord' },
  });
  landlordToken = (await l.json()).token;
  const { results } = await (await request.get(`${API}/accommodations?is_available=true`)).json();
  listingId = results[0].id;
});

test('protected routes refuse anonymous callers', async ({ request }) => {
  for (const url of ['/favourites', '/applications/mine', '/viewings/landlord', '/reviews/my-reviews', '/roommates/mine']) {
    const r = await request.get(`${API}${url}`);
    expect(r.status(), url).toBe(401);
  }
});

test('a student cannot use landlord-only routes', async ({ request }) => {
  const h = { Authorization: `Bearer ${studentToken}` };
  expect((await request.get(`${API}/viewings/landlord`, { headers: h })).status()).toBe(403);
  expect((await request.get(`${API}/applications/landlord`, { headers: h })).status()).toBe(403);
  expect((await request.patch(`${API}/accommodations/${listingId}`, { headers: h, data: { title: 'hacked' } })).status()).toBe(403);
});

test('a landlord cannot edit someone else’s listing', async ({ request }) => {
  const r = await request.patch(`${API}/accommodations/${listingId}`, {
    headers: { Authorization: `Bearer ${landlordToken}` },
    data: { title: 'not mine' },
  });
  expect([403, 404]).toContain(r.status());
});

test('a bad or forged token is rejected', async ({ request }) => {
  const r = await request.get(`${API}/auth/me`, { headers: { Authorization: 'Bearer not.a.token' } });
  expect(r.status()).toBe(401);
});

test('SQL injection in search is harmless', async ({ request }) => {
  for (const q of ["' OR '1'='1", "x'; DROP TABLE users; --", '%'] ) {
    const r = await request.get(`${API}/accommodations`, { params: { q } });
    expect(r.status(), q).toBeLessThan(500);
  }
  const check = await request.get(`${API}/accommodations?is_available=true`);
  expect(check.status()).toBe(200);
});

test('reviews need an unlock', async ({ request }) => {
  const r = await request.post(`${API}/reviews`, {
    headers: { Authorization: `Bearer ${studentToken}` },
    data: { accommodationId: listingId, rating: 5, comment: 'Great' },
  });
  expect(r.status()).toBe(402);
});

test('invalid review input is rejected', async ({ request }) => {
  const r = await request.post(`${API}/reviews`, {
    headers: { Authorization: `Bearer ${studentToken}` },
    data: { accommodationId: 'not-a-uuid', rating: 9 },
  });
  expect(r.status()).toBe(400);
});

test('payment and restore reject unknown or missing references', async ({ request }) => {
  const init = await request.post(`${API}/payments/initiate`, {
    data: { accommodationId: '00000000-0000-0000-0000-000000000000', email: 'x@example.com' },
  });
  expect(init.status()).toBe(404);
  const restore = await request.post(`${API}/payments/restore`, { data: { reference: 'nope' } });
  expect(restore.status()).toBe(404);
  const empty = await request.post(`${API}/payments/restore`, { data: {} });
  expect(empty.status()).toBe(400);
});

test('only landlords can start a verification payment', async ({ request }) => {
  const r = await request.post(`${API}/payments/initiate`, {
    headers: { Authorization: `Bearer ${studentToken}` },
    data: { feature: 'landlord_verification', email: 'x@example.com' },
  });
  expect(r.status()).toBe(403);
});

test('error responses do not leak stack traces', async ({ request }) => {
  const r = await request.get(`${API}/accommodations/not-a-uuid`);
  const body = await r.text();
  expect(body).not.toMatch(/at .*\.js:\d+/);
});
