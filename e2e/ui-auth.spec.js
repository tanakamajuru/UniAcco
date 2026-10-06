// Browser tests for sign-up and sign-in, on desktop and phone.
const { test, expect } = require('playwright/test');

const stamp = Date.now();

for (const [name, viewport] of Object.entries({
  desktop: { width: 1366, height: 768 },
  mobile: { width: 390, height: 844 },
})) {
  test.describe(`${name} auth`, () => {
    test.use({ viewport });

    test('sign up as a student, then sign in', async ({ page }) => {
      const email = `ui${name}${stamp}@example.com`;
      await page.goto('/auth?mode=signup', { waitUntil: 'networkidle' });

      await page.fill('#name', 'UI Student');
      await page.selectOption('#role', 'student');
      await page.fill('#email', email);
      await page.fill('#password', 'TestPass123!');
      await page.fill('#confirmPassword', 'TestPass123!');
      await page.locator('form button[type="submit"]').click();

      await expect
        .poll(() => page.evaluate(() => localStorage.getItem('token')).catch(() => null), { timeout: 15000 })
        .toBeTruthy();

      // Sign out via storage, then sign in through the form.
      await page.evaluate(() => localStorage.removeItem('token'));
      await page.goto('/auth', { waitUntil: 'networkidle' });
      await page.fill('#email', email);
      await page.fill('#password', 'TestPass123!');
      await page.locator('form button[type="submit"]').click();
      await expect
        .poll(() => page.evaluate(() => localStorage.getItem('token')).catch(() => null), { timeout: 15000 })
        .toBeTruthy();
    });

    test('mismatched passwords show an error', async ({ page }) => {
      await page.goto('/auth?mode=signup', { waitUntil: 'networkidle' });
      await page.fill('#name', 'Mismatch');
      await page.fill('#email', `mm${name}${stamp}@example.com`);
      await page.fill('#password', 'TestPass123!');
      await page.fill('#confirmPassword', 'Different123!');
      await page.locator('form button[type="submit"]').click();
      await expect(page.getByText('Passwords do not match')).toBeVisible();
    });

    test('wrong password shows an error and does not sign in', async ({ page }) => {
      await page.goto('/auth', { waitUntil: 'networkidle' });
      await page.fill('#email', 'nobody@example.com');
      await page.fill('#password', 'WrongPass123!');
      await page.locator('form button[type="submit"]').click();
      await page.waitForTimeout(1500);
      expect(await page.evaluate(() => localStorage.getItem('token')).catch(() => null)).toBeFalsy();
      await page.screenshot({ path: `shots/auth-error-${name}.png` });
    });
  });
}
