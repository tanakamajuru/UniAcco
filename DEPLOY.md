# Deploying UniAcco — Vercel (frontend) + Railway (backend + Postgres)

| Piece | Host | Root Directory | Config |
|---|---|---|---|
| Frontend (Vite/React) | Vercel | `frontend` | [`frontend/vercel.json`](frontend/vercel.json) |
| Backend (Express 5) | Railway | `backend` | [`backend/railway.json`](backend/railway.json) |
| Database | Railway Postgres | — | `backend/database/*.sql` |
| Domain | `uniacco.co.zw` | — | see step 5 |

---

## 1. Railway — backend service env vars

In the **backend service → Variables**:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
ALLOWED_ORIGINS=https://uniacco.co.zw,https://www.uniacco.co.zw,https://<your-project>.vercel.app
FRONTEND_URL=https://uniacco.co.zw
JWT_SECRET=<long random string>
PESEPAY_INTEGRATION_KEY=<your live integration key>
PESEPAY_ENCRYPTION_KEY=<your live encryption key>
PESEPAY_ENV=production
```

> 🔐 Never commit the real Pesepay keys — set them only in the Railway dashboard.
> They live in `backend/.env` locally, which is gitignored.

Notes:
- **The payment gateway is Pesepay, not PayNow.** `PAYNOW_SETUP.md` / `PAYNOW_TEST_MODE.md` are **stale**
  — PayNow was removed. The only payment vars are the three `PESEPAY_*` above.
- Leave `PESEPAY_INTEGRATION_KEY`/`PESEPAY_ENCRYPTION_KEY` **unset** to run payments in *simulated* mode
  (instant success, no real charge) — useful for a first smoke test.
- `API_BASE_URL` is optional; the Pesepay webhook URL falls back to Railway's injected
  `RAILWAY_PUBLIC_DOMAIN`/`RENDER_EXTERNAL_URL`. Set `API_BASE_URL=https://api.uniacco.co.zw`
  after DNS is live so callbacks use the custom domain.
- `DB_SSL` is auto-decided: **off** for Railway's private `*.railway.internal` host, **on** for any
  public/proxy URL. Override with `DB_SSL=true|false` if you hit an SSL error.

## 2. Railway — load the database schema

The repo ships a Node runner, so you don't need `psql`:

```bash
# from the backend service shell, or locally with DATABASE_URL set to Railway's PUBLIC url
pnpm db:setup    # schema + seed (DROPS and recreates the marketplace tables)
pnpm db:seed     # idempotent re-seed only (universities + properties), safe on live data
```

Run order is handled for you: `uniacco.sql` → `universities.sql` → `properties.sql`.

> ⚠️ **Do NOT run `backend/database/migrations/*`.** Those are the superseded legacy schema
> (`first_name`/`last_name` users, JSONB accommodations) and conflict with the current code.
> `backend/database/uniacco.sql` is the canonical schema.

Verify: `SELECT count(*) FROM accommodations;` → 25 active listings, 21 universities, 51 campuses.

## 3. Railway — persistent uploads volume

Host photo uploads go to **`uploads/user`**, kept separate from the 28 seed images committed at
`uploads/accommodations` (which ship with every deploy).

- Add a **Volume** mounted at **`/app/uploads/user`**.
- ⚠️ Do **not** mount at `/app/uploads` — that would shadow the committed seed images and break
  the photos on all seeded listings.

Test: upload a photo via *List a property* → redeploy → confirm the image still loads.

## 4. Vercel — frontend

- **Root Directory:** `frontend` (`vercel.json` sets the Vite build + SPA rewrite for client-side routing).
- **Environment variables:**
  ```
  VITE_API_URL=https://<your-backend>.up.railway.app     # later: https://api.uniacco.co.zw
  ```
  `VITE_API_URL` is baked in at **build time** — change it, then **redeploy**.
- No other `VITE_*` vars are needed. (`@supabase/supabase-js` is an unused leftover dependency —
  only `src/types/supabase.ts` references Supabase; no runtime code uses it.)

## 5. Domain cutover (`uniacco.co.zw`)

1. **Vercel → Project → Settings → Domains:** add `uniacco.co.zw` + `www.uniacco.co.zw`, then create the
   A/CNAME records it shows at your registrar.
2. **Railway → backend service → Settings → Networking → Custom Domain:** add `api.uniacco.co.zw` and
   create the CNAME it shows.
3. Wait for DNS propagation, then confirm `https://api.uniacco.co.zw/api/health`.
4. Set `VITE_API_URL=https://api.uniacco.co.zw` in Vercel → **redeploy**.
5. Update `ALLOWED_ORIGINS` + `FRONTEND_URL` + `API_BASE_URL` on Railway to the final domains → redeploy.
6. In the **Pesepay dashboard**, whitelist the production URLs:
   - Result/webhook: `https://api.uniacco.co.zw/api/payments/webhook`
   - Return: `https://uniacco.co.zw/payment-return`

## 6. Smoke test

- [ ] `https://api.uniacco.co.zw/api/health` → `{"status":"healthy","database":"connected"}`
- [ ] `https://uniacco.co.zw` loads, no console errors, **featured properties show images**
- [ ] Signup/login works (writes to Postgres, returns a JWT)
- [ ] Browse loads real listings; university filter works
- [ ] Deep link (e.g. `https://uniacco.co.zw/listings`) loads directly → confirms the SPA rewrite
- [ ] Image upload persists across a redeploy → confirms the volume
- [ ] Apply flow reaches Pesepay (or simulated mode) without errors
- [ ] `https://api.uniacco.co.zw/api-docs` (Swagger UI) loads

---

### Live-money warning
Pesepay production keys charge **real money**. The access fee is currently **stubbed to $0.01**
(`ACCESS_FEE_AMOUNT` in `backend/routes/paymentRoutes.js`, `ACCESS_FEE` in `frontend/src/lib/fees.js`).
Set both back to `2.00` for launch.
