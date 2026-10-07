// The compare dialog opens fully on screen, without scrolling, and shows a locked contact per home.
const { test, expect } = require('playwright/test');

for (const [name, viewport] of Object.entries({
  desktop: { width: 1366, height: 768 },
  mobile: { width: 390, height: 844 },
})) {
  test.describe(`${name} compare`, () => {
    test.use({ viewport });

    test('dialog is on screen and shows contact unlock per home', async ({ page }) => {
      await page.goto('/listings', { waitUntil: 'networkidle' });
      const boxes = page.getByRole('checkbox', { name: 'Compare' });
      await expect(boxes.first()).toBeVisible();
      await boxes.nth(0).check();
      await boxes.nth(1).check();
      await page.getByRole('button', { name: 'Compare these 2 homes' }).click();
      const dialog = page.getByRole('dialog', { name: 'Compare homes' });
      await expect(dialog).toBeVisible();
      const box = await dialog.boundingBox();
      const vp = page.viewportSize();
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
      await expect(dialog.getByText(/Contact locked · \$1 for 14 days/).first()).toBeVisible();
      expect(await dialog.getByRole('button', { name: 'Unlock contact' }).count()).toBeGreaterThanOrEqual(1);
    });
  });
}
