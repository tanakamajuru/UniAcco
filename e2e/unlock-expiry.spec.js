// Unlock validity in the browser: a lapsed or undated unlock must not reveal the
// contact, and a valid unlock must.
const { test, expect } = require('playwright/test');

const API = 'http://localhost:5000/api';

test.use({ viewport: { width: 1366, height: 768 } });

async function openFirstProperty(page, request, unlocks) {
  const { results } = await (await request.get(`${API}/accommodations?is_available=true`)).json();
  const id = results[0].id;
  await page.addInitScript((u) => localStorage.setItem('uniacco.unlocks', u), unlocks(id));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate((i) => localStorage.setItem('selectedAccommodationId', i), id);
  await page.goto('/property-details', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}

test('a lapsed unlock does not reveal the contact and is removed', async ({ page, request }) => {
  const past = new Date(Date.now() - 86400000).toISOString();
  await openFirstProperty(page, request, (id) =>
    JSON.stringify({ [id]: { contact: { phone: '0771' }, validUntil: past } }));
  await expect(page.getByRole('button', { name: /Unlock (contact )?·/ }).first()).toBeVisible();
  const left = await page.evaluate(() => localStorage.getItem('uniacco.unlocks'));
  expect(left).toBe('{}');
});

test('an unlock saved before expiry dates existed is treated as lapsed', async ({ page, request }) => {
  await openFirstProperty(page, request, (id) =>
    JSON.stringify({ [id]: { name: 'Old', phone: '0771', email: 'a@b.c' } }));
  await expect(page.getByRole('button', { name: /Unlock (contact )?·/ }).first()).toBeVisible();
});

test('a valid unlock keeps the contact visible', async ({ page, request }) => {
  const future = new Date(Date.now() + 86400000 * 10).toISOString();
  await openFirstProperty(page, request, (id) =>
    JSON.stringify({ [id]: { contact: { name: 'Rumbi', phone: '0771' }, validUntil: future } }));
  await expect(page.getByText('Contact unlocked').filter({ visible: true }).first()).toBeVisible();
});
