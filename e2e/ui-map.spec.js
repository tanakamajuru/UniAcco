// Map check: the listings map renders one marker per property with coordinates.
const { test, expect } = require('playwright/test');

const API = 'http://localhost:5000/api';

for (const [name, viewport] of Object.entries({
  desktop: { width: 1366, height: 768 },
  mobile: { width: 390, height: 844 },
})) {
  test.describe(`${name} map`, () => {
    test.use({ viewport });

    test('listings map shows a marker for each property with coordinates', async ({ page, request }) => {
      const r = await request.get(`${API}/accommodations?is_available=true`);
      const { results } = await r.json();
      const withCoords = results.filter((a) => a.lat != null && a.lng != null);
      expect(withCoords.length).toBeGreaterThan(0);

      await page.goto('/listings', { waitUntil: 'networkidle' });
      const mapEl = page.locator('.leaflet-container').first();
      await expect(mapEl).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(800);

      const markers = await page.locator('.leaflet-marker-icon').count();
      await mapEl.screenshot({ path: `shots/map-${name}.png` });
      expect(markers, `markers on map vs ${withCoords.length} listings with coordinates`).toBeGreaterThanOrEqual(withCoords.length);
    });
  });
}
