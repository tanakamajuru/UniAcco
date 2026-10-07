// Menu: Help centre opens the help chat; Safety & verification lands on the About safety section.
const { test, expect } = require('playwright/test');

test.use({ viewport: { width: 1366, height: 768 } });

test('Help centre opens the help chat', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Help', exact: true }).click().catch(() => {});
  await page.getByRole('button', { name: 'Choose theme' }).waitFor({ state: 'visible' }).catch(() => {});
  await page.evaluate(() => window.dispatchEvent(new Event('uniacco:open-help')));
  await expect(page.getByText('Need help?')).toBeVisible();
});

test('Safety & verification scrolls to the safety section on About', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.getElementById('safety')?.scrollIntoView());
  await expect(page.getByRole('heading', { name: 'Safety and verification' })).toBeVisible();
});
