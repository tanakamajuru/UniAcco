// API-level tests: accounts, property upload rules, favourites, coordinates,
// and the pay-to-reveal flow. Runs against the live local API on :5000.
const { test, expect } = require('playwright/test');
const fs = require('fs');
const path = require('path');

const API = 'http://localhost:5000/api';
const stamp = Date.now();
const student = { fullName: 'Test Student', email: `stu${stamp}@example.com`, password: 'TestPass123!', role: 'student' };
const landlord = { fullName: 'Test Landlord', email: `land${stamp}@example.com`, password: 'TestPass123!', role: 'landlord' };

let studentToken, landlordToken, createdId;

test.describe.configure({ mode: 'serial' });

test('student and landlord can register', async ({ request }) => {
  for (const u of [student, landlord]) {
    const r = await request.post(`${API}/auth/register`, { data: u });
    expect(r.status(), await r.text()).toBeLessThan(300);
    const body = await r.json();
    expect(body.token).toBeTruthy();
  }
});

test('login and /me work for both roles', async ({ request }) => {
  const s = await request.post(`${API}/auth/login`, { data: { email: student.email, password: student.password } });
  expect(s.status()).toBe(200);
  studentToken = (await s.json()).token;

  const l = await request.post(`${API}/auth/login`, { data: { email: landlord.email, password: landlord.password } });
  expect(l.status()).toBe(200);
  landlordToken = (await l.json()).token;

  const me = await request.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${studentToken}` } });
  expect(me.status()).toBe(200);
  expect((await me.json()).user.email).toBe(student.email);
});

test('wrong password is rejected', async ({ request }) => {
  const r = await request.post(`${API}/auth/login`, { data: { email: student.email, password: 'wrong' } });
  expect(r.status()).toBeGreaterThanOrEqual(400);
});

test('landlord cannot list a property without coordinates', async ({ request }) => {
  const r = await request.post(`${API}/accommodations`, {
    headers: { Authorization: `Bearer ${landlordToken}` },
    data: { title: 'No pin', pricePerMonth: 100, city: 'Harare' },
  });
  expect(r.status()).toBe(400);
});

test('landlord can list a property with coordinates and photos', async ({ request }) => {
  const bytes = fs.readFileSync(path.join(__dirname, 'test-photo.png'));
  const form = new FormData();
  for (const [k, v] of Object.entries({
    title: 'Test studio near UZ', pricePerMonth: '120', city: 'Harare', bedrooms: '1',
    lat: '-17.7836', lng: '31.0534', status: 'active',
    imageKinds: JSON.stringify(['interior', 'exterior']),
  })) form.append(k, v);
  form.append('images', new Blob([bytes], { type: 'image/png' }), 'interior.png');
  form.append('images', new Blob([bytes], { type: 'image/png' }), 'exterior.png');
  const res = await fetch(`${API}/accommodations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${landlordToken}` },
    body: form,
  });
  const text = await res.text();
  expect(res.status, text).toBeLessThan(300);
  createdId = JSON.parse(text).id;
  expect(createdId).toBeTruthy();
});

test('student cannot create a property', async ({ request }) => {
  const r = await request.post(`${API}/accommodations`, {
    headers: { Authorization: `Bearer ${studentToken}` },
    data: { title: 'Nope', pricePerMonth: 1, lat: -17.8, lng: 31.0 },
  });
  expect(r.status()).toBeGreaterThanOrEqual(400);
});

test('favourites add, list, remove', async ({ request }) => {
  const h = { Authorization: `Bearer ${studentToken}` };
  expect((await request.post(`${API}/favourites/${createdId}`, { headers: h })).status()).toBeLessThan(300);
  const list = await request.get(`${API}/favourites`, { headers: h });
  expect(list.status()).toBe(200);
  const items = await list.json();
  expect(JSON.stringify(items)).toContain(createdId);
  expect((await request.delete(`${API}/favourites/${createdId}`, { headers: h })).status()).toBeLessThan(300);
});

test('every active listing has coordinates for the map', async ({ request }) => {
  const r = await request.get(`${API}/accommodations?is_available=true`);
  const { results } = await r.json();
  const missing = results.filter((a) => a.lat == null || a.lng == null).map((a) => a.title);
  expect(missing, `listings without coordinates: ${missing.join(', ')}`).toEqual([]);
});

test('contact is withheld until payment is approved', async ({ request }) => {
  // Pesepay is configured, so the payer must approve on the gateway. Until then,
  // the status must be pending and the landlord contact must not be returned.
  const init = await request.post(`${API}/payments/initiate`, {
    data: { accommodationId: createdId, email: `buyer2${stamp}@example.com`, phone: '0771234568' },
  });
  expect(init.status(), await init.text()).toBeLessThan(300);
  const { reference } = await init.json();
  const st = await request.get(`${API}/payments/status/${reference}`);
  const body = await st.json();
  expect(['pending', 'failed']).toContain(body.status);
  expect(body.contact).toBeFalsy();
});

test.skip('pay-to-reveal (simulated) returns the contact after payment', async ({ request }) => {
  const init = await request.post(`${API}/payments/initiate`, {
    data: { accommodationId: createdId, email: `buyer${stamp}@example.com`, phone: '0771234567' },
  });
  expect(init.status(), await init.text()).toBeLessThan(300);
  const { reference } = await init.json();

  const st = await request.get(`${API}/payments/status/${reference}`);
  const body = await st.json();
  expect(body.status).toBe('paid');
  expect(body.contact).toBeTruthy();
  expect(body.contact.phone || body.contact.email).toBeTruthy();
});
