# Deploying UniAcco — Vercel (frontend) + Railway (backend + Postgres)

| Piece | Host | Root Directory | Config |
|---|---|---|---|
| Frontend (Vite/React) | Vercel | `frontend` | [`frontend/vercel.json`](frontend/vercel.json) |
| Backend (Express 5) | Railway | `backend` | [`backend/railway.json`](backend/railway.json) |
| Database | Railway Postgres | — | `backend/database/*.sql` |
| Domain | `uniacco.co.zw` | — | Phase 5 |

## The two URLs you don't have yet

Neither URL exists until you deploy — **the platforms generate them**. That's the whole reason
for the phase order below:

| Value | Current value | Where it comes from |
|---|---|---|
| **Backend URL** | ✅ **`https://uniacco-production.up.railway.app`** (live) | Railway → backend service → **Settings → Networking → Public Networking → Generate Domain**. Railway gives you **no public URL until you click that.** |
| **Frontend URL** | *(not created yet)* e.g. `https://uni-acco.vercel.app` | Vercel creates it when the project is created (Project → **Domains**). |

Order that resolves the circular dependency:
**Phase 1** Railway backend (no frontend URL needed yet) → **Phase 2** load DB →
**Phase 3** Vercel (uses the backend URL) → **Phase 4** back to Railway to fill in the frontend URL.

---

# Phase 1 — Railway backend

**1.1 Confirm Postgres exists.** Canvas should show two cards: your backend service + `Postgres`.
If not: **+ New → Database → Add PostgreSQL**.

**1.2 Root Directory** (this is the usual cause of a failed build)
Backend service → **Settings → Source → Root Directory** = `backend`.
Leave Build/Start commands empty — [`backend/railway.json`](backend/railway.json) sets them
(Nixpacks, `pnpm start`, healthcheck `/api/health`).

**1.3 Variables** → **Raw Editor**, paste exactly this (no placeholders left):

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
JWT_SECRET=imHNeXIaXOYDct6Yw1HwCqfqol5xSUUTdTpxVSODYNkJE7xireH7rwKJKKpSZ4cI
PESEPAY_ENV=production
```

- `${{Postgres.DATABASE_URL}}` is a **literal Railway reference** — type it as-is; Railway resolves
  it to the Postgres service's internal URL. Don't paste a real URL here.
- `ALLOWED_ORIGINS` / `FRONTEND_URL` are added in **Phase 4** (you don't have the Vercel URL yet).
  Their absence doesn't block anything: CORS defaults to localhost and only matters once the
  frontend calls the API.
- **Omit the Pesepay keys for now** → payments run in **simulated mode** (instant unlock, no real
  money). Add them in Phase 5 when you're ready for live charges.

**1.4 Deploy** → **Deployments** tab → watch the log. If it fails, copy the error (see Troubleshooting).

**1.5 Generate the public domain**
**Settings → Networking → Public Networking → Generate Domain.** If it asks for a port, pick the
one it auto-detects — the app binds Railway's injected `PORT` automatically.
**Copy this URL — it is your `<backend-url>` for Phase 3.**

**1.6 Verify**
Open `<backend-url>/api/health` → expect:
```json
{"status":"healthy","database":"connected"}
```
`"database":"disconnected"` → the DB isn't reachable; see Troubleshooting.

**1.7 Volume (persistent uploads)**
Volumes are attached from the **canvas**, not the Settings page: right-click the backend service
(or **+ New → Volume**) → **Attach Volume** → mount path **`/app/uploads/user`**.

> ⚠️ **Not `/app/uploads`.** That path already contains the 28 seed images baked into the repo;
> mounting a volume over it hides them and blanks the photos on all 25 seeded listings.
> Host uploads are written to `uploads/user` precisely so the volume has its own home.

---

# Phase 2 — Load the database schema

**Railway has no web shell**, so run this **from your own machine** using the database's *public* URL.

**2.1 Get the public URL:** Railway → **Postgres** service → **Variables** → copy
**`DATABASE_PUBLIC_URL`** (host looks like `switchback.proxy.rlwy.net:52341` — *not* the
`.railway.internal` one, which is only reachable from inside Railway).

**2.2 Run it** (PowerShell, from the repo):

```powershell
cd backend
$env:DATABASE_URL="<paste DATABASE_PUBLIC_URL>"
pnpm db:setup
Remove-Item Env:DATABASE_URL     # so local dev goes back to your local Postgres
```

Git Bash equivalent:
```bash
cd backend
DATABASE_URL="<paste DATABASE_PUBLIC_URL>" pnpm db:setup
```

Expect:
```
  • uniacco.sql ... done
  • universities.sql ... done
  • properties.sql ... done
✅ Database setup complete
```
That's 21 universities, 51 campuses, 25 active listings.
Later re-seeds without wiping: `pnpm db:seed`.

- If you see **"The server does not support SSL connections"** → prefix with `DB_SSL=false`.
- If you see **"self signed certificate"** → prefix with `DB_SSL=true`.
- ⚠️ **Never run `backend/database/migrations/*`** — legacy schema, conflicts with the current code.
  `backend/database/uniacco.sql` is canonical.

**2.3 Re-check** `<backend-url>/api/health` → `"database":"connected"`, and
`<backend-url>/api/accommodations` → 25 results.

---

# Phase 3 — Vercel frontend

**3.1 Root Directory** = `frontend` (Project → Settings → General). This also clears the
"multiple projects detected" warning. [`frontend/vercel.json`](frontend/vercel.json) handles the
Vite build + the SPA rewrite.

**3.2 Environment variable** → Settings → Environment Variables:
```
VITE_API_URL = <backend-url from Phase 1.5, no trailing slash>
```
e.g. `https://uniacco-production-a1b2.up.railway.app`

**3.3 Deploy.** Vite inlines `VITE_API_URL` **at build time** → changing it later *requires a redeploy*.

**3.4 Copy your frontend URL** (Project → Domains, e.g. `https://uni-acco.vercel.app`) —
that's `<frontend-url>` for Phase 4.

**3.5 Verify**
- Home loads, **featured property images appear** (proves `VITE_API_URL` + image serving)
- `<frontend-url>/listings` opened **directly** loads (proves the SPA rewrite)
- No CORS errors in the console (fixed in Phase 4 if present)

---

# Phase 4 — Close the loop (CORS)

Railway → backend → **Variables**, add:
```
ALLOWED_ORIGINS=<frontend-url>
FRONTEND_URL=<frontend-url>
```
Both without a trailing slash, e.g. `https://uni-acco.vercel.app`. Railway redeploys automatically.
Multiple origins are comma-separated (add previews/custom domain later).

Verify: sign up / log in on the live site → should succeed and persist to Postgres.

---

# Phase 5 — Domain + going live

1. **Vercel → Domains:** add `uniacco.co.zw` and `www.uniacco.co.zw`; create the A/CNAME records it
   shows at your registrar.
2. **Railway → backend → Settings → Networking → Custom Domain:** add `api.uniacco.co.zw`; create the
   CNAME it shows.
3. After DNS resolves, confirm `https://api.uniacco.co.zw/api/health`.
4. **Vercel:** `VITE_API_URL=https://api.uniacco.co.zw` → **redeploy**.
5. **Railway:** `ALLOWED_ORIGINS=https://uniacco.co.zw,https://www.uniacco.co.zw`,
   `FRONTEND_URL=https://uniacco.co.zw`, `API_BASE_URL=https://api.uniacco.co.zw`.
6. **Go live on payments:** add `PESEPAY_INTEGRATION_KEY` + `PESEPAY_ENCRYPTION_KEY` (from your local
   `backend/.env`) in Railway. In the Pesepay dashboard whitelist:
   - webhook: `https://api.uniacco.co.zw/api/payments/webhook`
   - return: `https://uniacco.co.zw/payment-return`
7. **Restore the real fee** — it's stubbed to **$0.01**: set `ACCESS_FEE_AMOUNT` back to `2.00` in
   `backend/routes/paymentRoutes.js` and `ACCESS_FEE` to `2.00` / `'$2.00'` in `frontend/src/lib/fees.js`.
   Pesepay production keys charge **real money**.

---

# Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Build fails immediately, no `pnpm` output | Root Directory isn't `backend` (Phase 1.2) |
| `Cannot find module 'express'` | Same — Railway built the repo root, not `backend` |
| Health = `"database":"disconnected"` | `DATABASE_URL` missing/typo'd. Must be the literal `${{Postgres.DATABASE_URL}}` |
| `The server does not support SSL connections` | Add `DB_SSL=false` |
| `self signed certificate` | Add `DB_SSL=true` |
| `relation "accommodations" does not exist` | Phase 2 not run yet |
| CORS error in browser console | Phase 4 — `ALLOWED_ORIGINS` must match the frontend origin exactly (https, no trailing slash) |
| Listing photos missing in prod | Volume mounted at `/app/uploads` instead of `/app/uploads/user` |
| Deep link `/listings` 404s | Root Directory isn't `frontend`, so `vercel.json` wasn't picked up |
| Frontend calls `localhost:5000` | `VITE_API_URL` unset at build time → set it and **redeploy** |
