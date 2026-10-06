// Smoke pass: every route on desktop and phone. Records JS errors, horizontal
// overflow (a responsiveness bug), and saves a screenshot for visual review.
const { test, expect } = require('playwright/test');

const ROUTES = [
  '/', '/listings', '/about', '/auth', '/list-your-property',
  '/premium-features', '/profile', '/my-listings', '/host-dashboard',
];

const VIEWPORTS = {
  desktop: { width: 1366, height: 768 },
  mobile: { width: 390, height: 844 },
};

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`${name} smoke`, () => {
    test.use({ viewport });

    for (const route of ROUTES) {
      test(`${route} renders without errors`, async ({ page }, info) => {
        const errors = [];
        page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
        page.on('console', (m) => {
          if (m.type() === 'error') errors.push(`console: ${m.text()}`);
        });

        await page.goto(route, { waitUntil: 'networkidle' });
        await page.waitForTimeout(800);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        const slug = route.replace(/\//g, '_') || '_home';
        await page.screenshot({
          path: `${info.outputDir}/${name}${slug}.png`,
          fullPage: true,
        });

        await info.attach(`${name}${slug}-errors`, {
          body: errors.join('\n') || 'none',
          contentType: 'text/plain',
        });
        expect(overflow, 'horizontal scroll on page').toBeLessThanOrEqual(1);
        expect(errors.filter((e) => !/favicon|Failed to load resource/.test(e))).toEqual([]);
      });
    }
  });
}
