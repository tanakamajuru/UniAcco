# Pesepay Integration — React + Node.js

Full-stack Pesepay payment integration with seamless payment support.

## Structure

```
pesepay-app/
├── server/          ← Express backend (API proxy + encryption)
│   ├── index.js
│   ├── .env
│   └── package.json
└── client/          ← React frontend (Vite)
    ├── src/
    │   ├── App.jsx
    │   ├── hooks/usePesepay.js
    │   └── components/
    │       ├── PaymentForm.jsx
    │       └── TransactionResult.jsx
    └── package.json
```

## Quick start

Open two terminals:

### Terminal 1 — Backend
```bash
cd server
npm install
npm run dev
# Running on http://localhost:3001
```

### Terminal 2 — Frontend
```bash
cd client
npm install
npm run dev
# Running on http://localhost:5173
```

Open http://localhost:5173

## API Routes (backend)

| Method | Route | Description |
|--------|-------|-------------|
| GET | /health | Server + env check |
| POST | /api/pay | Seamless payment (EcoCash, InnBucks, card) |
| POST | /api/initiate | Redirect payment |
| GET | /api/status/:reference | Poll transaction status |
| GET | /api/currencies | Active currencies |
| GET | /api/payment-methods/:currency | Payment methods by currency |
| POST | /pesepay/result | Webhook — Pesepay posts result here |

## Environment variables (server/.env)

```env
PESEPAY_INTEGRATION_KEY=d558e811-cc09-475e-80ad-509367f03e88
PESEPAY_ENCRYPTION_KEY=c0c7361983454105ac083aa8cdad5101
PESEPAY_ENV=sandbox        # change to 'production' when going live
PORT=3001
RESULT_URL=http://localhost:3001/pesepay/result
RETURN_URL=http://localhost:5173/payment/return
```

## Test cards (Visa)
- Number: `4867960000005461`
- Expiry: `12/26`
- CVV: `123`

## Going to production
1. Set `PESEPAY_ENV=production` in `.env`
2. Update `RESULT_URL` to your live webhook URL (must be HTTPS and publicly accessible)
3. Update `RETURN_URL` to your live return page
4. Replace keys with your production keys from Pesepay dashboard
