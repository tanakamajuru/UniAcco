// Unlock dialog: background is solid, text in it has enough contrast, fields accept
// typing, and the dialog closes. Runs in light and dark, desktop and phone.
// Stops before submitting, so no payment is created.
const { test, expect } = require('playwright/test');
const path = require('path');

const API = 'http://localhost:5000/api';

// Runs in the page. Same contrast rule as theme.spec.js, limited to the dialog.
const scanWithin = (root) => {
  const ctx = document.createElement('canvas').getContext('2d');
  const toRgb = (css) => {
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data; return { r, g, b, a: a / 255 };
  };
  const lum = ({ r, g, b }) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05); };
  const bgOf = (el) => { let n = el; while (n && n !== document.documentElement) { const c = toRgb(getComputedStyle(n).backgroundColor); if (c.a > 0.5) return c; n = n.parentElement; } return toRgb(getComputedStyle(document.body).backgroundColor); };
  const out = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const t = w.currentNode.textContent.trim(); if (!t) continue;
    const el = w.currentNode.parentElement; if (!el) continue;
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const fg = toRgb(cs.color), bg = bgOf(el), a = fg.a;
    const blend = { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a) };
    const cr = ratio(blend, bg);
    if (cr < 4.5) out.push({ text: t.slice(0, 50), ratio: Math.round(cr * 100) / 100, color: cs.color, bg: `rgb(${bg.r},${bg.g},${bg.b})` });
  }
  return out;
};

for (const [vp, viewport] of Object.entries({ desktop: { width: 1366, height: 768 }, mobile: { width: 390, height: 844 } })) {
  for (const theme of ['light', 'dark']) {
    test.describe(`${vp} ${theme}`, () => {
      test.use({ viewport });

      test('unlock dialog: solid background, readable, fields accept input, closes', async ({ page, request }) => {
        await page.addInitScript((t) => localStorage.setItem('theme', t), theme);

        const { results } = await (await request.get(`${API}/accommodations?is_available=true`)).json();
        const id = results[0].id;
        await page.goto('/', { waitUntil: 'networkidle' });
        await page.evaluate((i) => localStorage.setItem('selectedAccommodationId', i), id);
        await page.goto('/property-details', { waitUntil: 'networkidle' });

        await page.getByRole('button', { name: /Unlock (contact )?·/ }).first().click();
        const panel = page.locator('.ua-pop').first();
        await expect(panel).toBeVisible();
        await page.waitForTimeout(400);

        // The close icon must render (it was 0px before the button-padding fix).
        await expect(panel.locator('button[aria-label="Close"] svg')).toBeVisible();

        // Solid panel background, not transparent.
        const bg = await panel.evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(bg, 'dialog background').not.toMatch(/rgba\(.*,\s*0\)|transparent/);

        // Text inside the dialog has enough contrast.
        const issues = await panel.evaluate(scanWithin);
        expect(issues, `low-contrast text in dialog: ${JSON.stringify(issues.slice(0, 5))}`).toEqual([]);

        // Fields accept typing.
        const phone = panel.locator('input').first();
        await phone.fill('0771234567');
        await expect(phone).toHaveValue('0771234567');
        const email = panel.locator('input[type="email"], input').nth(1);
        await email.fill('typing.test@example.com');
        await expect(email).toHaveValue('typing.test@example.com');

        await page.screenshot({ path: path.join(__dirname, 'shots', `modal-${vp}-${theme}.png`) });

        // Closes with Escape, or the close button if Escape is not wired.
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        if (await panel.isVisible()) {
          await panel.locator('button').first().click();
        }
        await expect(panel).toBeHidden();
      });
    });
  }
}
