# PayNow Test Mode Setup Guide

## 🧪 **Test Mode Configuration**

Your PayNow integration now supports test mode for safe testing without real transactions.

### 📋 **Environment Setup**

Update your `.env` file with test mode enabled:

```bash
# Copy the example file
cp .env.example .env

# Edit .env file and ensure:
PAYNOW_INTEGRATION_ID=23096
PAYNOW_INTEGRATION_KEY=5d69562c-f389-47dd-867b-4448e5a89968
PAYNOW_TEST_MODE=true
```

### 🔄 **Test Mode Features**

When `PAYNOW_TEST_MODE=true`:

- ✅ **No Real Charges**: All transactions are simulated
- ✅ **Test URLs**: Uses PayNow sandbox environment
- ✅ **Debug Logging**: Enhanced logging for testing
- ✅ **Safe Testing**: Won't affect real money

### 🧪 **Test Payment Methods**

#### **Web Payments (Test)**
```javascript
// Test card numbers (from PayNow docs):
// Visa: 4242424242424242
// Mastercard: 5555555555554444
// Any future expiry date
// Any CVV
```

#### **Mobile Payments (Test)**
```javascript
// Test phone numbers:
// EcoCash: 0771234567
// OneMoney: 0711234567
```

### 🧪 **Test Scenarios**

#### **1. Successful Payment Flow**
```bash
# Start server in test mode
cd backend
npm start

# Test payment initiation
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "accommodationId": "test-accommodation-id",
    "amount": 150.00,
    "email": "test@example.com",
    "paymentMethod": "web"
  }'
```

#### **2. Mobile Payment Test**
```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "accommodationId": "test-accommodation-id",
    "amount": 200.00,
    "email": "test@example.com",
    "paymentMethod": "mobile",
    "phone": "0771234567",
    "method": "ecocash"
  }'
```

#### **3. Payment Status Check**
```bash
curl -X GET http://localhost:5000/api/payments/status/UNIACCO-123456789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🔧 **Test Mode Indicators**

The service will log:
```
🧪 PayNow running in TEST MODE
```

And responses include:
```json
{
  "success": true,
  "testMode": true,
  "redirectUrl": "https://sandbox.paynow.co.zw/...",
  "pollUrl": "https://sandbox.paynow.co.zw/poll/..."
}
```

### 🧪 **Test Webhook**

For testing webhooks locally:
```bash
# Use ngrok to expose localhost
ngrok http 5000

# Update PayNow dashboard with ngrok URL:
# https://your-ngrok-url.ngrok.io/api/payments/webhook
```

### 🧪 **Expected Test Responses**

#### **Successful Web Payment**
```json
{
  "success": true,
  "reference": "UNIACCO-123456789",
  "redirectUrl": "https://sandbox.paynow.co.zw/gateway/...",
  "pollUrl": "https://sandbox.paynow.co.zw/poll/...",
  "testMode": true
}
```

#### **Successful Mobile Payment**
```json
{
  "success": true,
  "reference": "UNIACCO-123456789",
  "instructions": "Dial *151*1234567# and follow instructions",
  "pollUrl": "https://sandbox.paynow.co.zw/poll/...",
  "testMode": true
}
```

### 🧪 **Testing Checklist**

- [ ] Server starts with "🧪 PayNow running in TEST MODE"
- [ ] Web payment redirects to sandbox URL
- [ ] Mobile payment shows test instructions
- [ ] Status checking works with test references
- [ ] Webhook receives test notifications
- [ ] Database records test payments correctly
- [ ] Frontend handles test mode responses

### 🚀 **Switching to Production**

When ready for production:

```bash
# Update .env file
PAYNOW_TEST_MODE=false

# Restart server
npm start
```

Server will log:
```
🚀 PayNow running in PRODUCTION MODE
```

### 📞 **Test Mode Support**

- **PayNow Test Docs**: https://developers.paynow.co.zw/docs/test-mode
- **PayNow Support**: https://forums.paynow.co.zw/
- **Test Cards**: Use the provided test card numbers

### ⚠️ **Important Notes**

1. **Never commit real credentials** to version control
2. **Always use test mode** during development
3. **Test all scenarios** before going live
4. **Monitor logs** for test mode indicators
5. **Verify webhook URLs** are accessible in production

---

**🧪 Your PayNow integration is now ready for safe testing!**
