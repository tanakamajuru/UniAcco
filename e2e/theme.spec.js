// Theme pass: every route in light and dark, desktop and phone. Measures the
// contrast of visible text against its background (WCAG AA = 4.5:1 for normal
// text) and writes a report. Photos and gradients behind text can produce false
// positives, so the report lists the worst offenders for review.
const { test } = require('playwright/test');
const fs = require('fs');
const path = require('path');

const ROUTES = [
  '/', '/listings', '/about', '/auth', '/list-your-property',
  '/premium-features', '/profile', '/host-dashboard',
];
const THEMES = ['light', 'dark'];
const VIEWPORTS = {
  desktop: { width: 1366, height: 768 },
  mobile: { width: 390, height: 844 },
};

const REPORT = path.join(__dirname, 'shots', 'theme-report.json');
const report = [];

// Runs in the page: returns text elements whose contrast is below 4.5:1.
const scan = () => {
  const ctx = document.createElement('canvas').getContext('2d');
  const toRgb = (css) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a: a / 255 };
  };
  const lum = ({ r, g, b }) => {
    const f = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const bgOf = (el) => {
    // Walk up until an opaque background is found; default to the page background.
    let node = el;
    while (node && node !== document.documentElement) {
      const c = toRgb(getComputedStyle(node).backgroundColor);
      if (c.a > 0.5) return c;
      node = node.parentElement;
    }
    return toRgb(getComputedStyle(document.body).backgroundColor);
  };

  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent.trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el || seen.has(el) || el.closest('script,style,svg')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (el.closest('[aria-hidden="true"]') || el.disabled) continue;
    // Skip text inside an invisible or clipped ancestor (e.g. the closed mobile menu).
    if (el.closest('.invisible')) continue;
    seen.add(el);

    const fg = toRgb(cs.color);
    const bg = bgOf(el);
    const alpha = fg.a;
    const blended = {
      r: fg.r * alpha + bg.r * (1 - alpha),
      g: fg.g * alpha + bg.g * (1 - alpha),
      b: fg.b * alpha + bg.b * (1 - alpha),
    };
    const cr = ratio(blended, bg);
    const size = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    if (cr < need) {
      out.push({
        text: text.slice(0, 60),
        ratio: Math.round(cr * 100) / 100,
        need,
        color: cs.color,
        background: `rgb(${bg.r},${bg.g},${bg.b})`,
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.baseVal === undefined ? el.className : '').toString().slice(0, 80),
      });
    }
  }
  return out;
};

for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  for (const theme of THEMES) {
    test.describe(`${vpName} ${theme}`, () => {
      test.use({ viewport });

      for (const route of ROUTES) {
        test(`${route}`, async ({ page }) => {
          await page.addInitScript((t) => {
            try {
              localStorage.setItem('theme', t);
            } catch {
              /* ignore */
            }
          }, theme);
          await page.goto(route, { waitUntil: 'networkidle' });
          await page.waitForTimeout(700);

          const issues = await page.evaluate(scan);
          report.push({ viewport: vpName, theme, route, count: issues.length, issues: issues.slice(0, 25) });

          const slug = route.replace(/\//g, '_') || '_home';
          await page.screenshot({ path: path.join(__dirname, 'shots', `theme-${vpName}-${theme}${slug}.png`), fullPage: true });
        });
      }
    });
  }
}

test.afterAll(() => {
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
  const total = report.reduce((n, r) => n + r.count, 0);
  console.log(`\nTheme report: ${total} low-contrast text items across ${report.length} page views. See ${REPORT}`);
});
