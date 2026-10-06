// Browser test: a landlord lists a property with a map pin and photos, and the
// listing reaches the API with coordinates. Desktop and phone.
const { test, expect } = require('playwright/test');
const path = require('path');

const API = 'http://localhost:5000/api';
const stamp = Date.now();
const photo = path.join(__dirname, 'test-photo.png');

for (const [name, viewport] of Object.entries({
  desktop: { width: 1366, height: 768 },
  mobile: { width: 390, height: 844 },
})) {
  test.describe(`${name} listing upload`, () => {
    test.use({ viewport });

    test('landlord publishes a property with a pin and photos', async ({ page, request }) => {
      const email = `up${name}${stamp}@example.com`;
      const reg = await request.post(`${API}/auth/register`, {
        data: { fullName: 'Upload Tester', email, password: 'TestPass123!', role: 'landlord' },
      });
      expect(reg.status()).toBeLessThan(300);
      const { token } = await reg.json();

      await page.goto('/', { waitUntil: 'networkidle' });
      await page.evaluate((t) => localStorage.setItem('token', t), token);
      await page.goto('/list-your-property', { waitUntil: 'networkidle' });

      await page.getByPlaceholder('e.g. Sunny ensuite room').fill(`UI upload ${name} ${stamp}`);
      await page.locator('textarea').first().fill('Automated test listing.');

      // Drop a pin on the map.
      const map = page.locator('.leaflet-container').first();
      await map.scrollIntoViewIfNeeded();
      const box = await map.boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

      await page.locator('#interior-input').setInputFiles(photo);
      await page.locator('#exterior-input').setInputFiles(photo);

      await page.getByRole('button', { name: /Publish listing/ }).click();

      // The published listing must reach the API with coordinates.
      await expect
        .poll(
          async () => {
            const r = await request.get(`${API}/accommodations/landlord`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const list = await r.json();
            return Array.isArray(list) ? list.length : 0;
          },
          { timeout: 20000 }
        )
        .toBeGreaterThan(0);

      const r = await request.get(`${API}/accommodations/landlord`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const [listing] = await r.json();
      expect(listing.lat, 'pinned latitude').not.toBeNull();
      expect(listing.lng, 'pinned longitude').not.toBeNull();
    });
  });
}
