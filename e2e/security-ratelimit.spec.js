// Run on its own: floods sign-in from this machine to confirm the limiter answers 429.
// Sign-in stays blocked for 15 minutes afterwards on this IP.
const { test, expect } = require('playwright/test');

test('sign-in is rate limited after repeated failures', async ({ request }) => {
  let limited = false;
  for (let i = 0; i < 25; i++) {
    const r = await request.post('http://localhost:5000/api/auth/login', {
      data: { email: 'nobody@example.com', password: 'wrong' },
    });
    if (r.status() === 429) {
      limited = true;
      expect(r.headers()['retry-after']).toBeTruthy();
      break;
    }
  }
  expect(limited).toBe(true);
});
