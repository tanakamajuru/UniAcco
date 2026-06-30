import { useState } from 'react'
import styles from './PaymentForm.module.css'

const PAYMENT_METHODS = [
  { code: 'PZW211', name: 'EcoCash', currency: 'USD', icon: '📱' },
  { code: 'PZW201', name: 'EcoCash', currency: 'ZWL', icon: '📱' },
  { code: 'PZW206', name: 'InnBucks', currency: 'USD', icon: '💰' },
  { code: 'PZW204', name: 'Visa / Mastercard', currency: 'USD', icon: '💳' },
]

const INITIAL = {
  amount: '1',
  currencyCode: 'USD',
  reasonForPayment: 'Test payment',
  merchantReference: `REF-${Date.now()}`,
  paymentMethodCode: 'PZW211',
  customer: { name: 'Test User', email: 'test@example.com', phoneNumber: '0771234567' },
  paymentMethodRequiredFields: { customerPhoneNumber: '0771234567' },
  // card fields (only used when PZW204 selected)
  _card: { number: '4867960000005461', expiry: '12/26', cvv: '123' },
}

export default function PaymentForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL)

  const set = (path, val) => {
    setForm(prev => {
      const next = { ...prev }
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] }
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = val
      return next
    })
  }

  const selectMethod = (code) => {
    set('paymentMethodCode', code)
    const method = PAYMENT_METHODS.find(m => m.code === code)
    if (method) set('currencyCode', method.currency)
    if (code !== 'PZW204') {
      set('paymentMethodRequiredFields', { customerPhoneNumber: form.customer.phoneNumber })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      amount: form.amount,
      currencyCode: form.currencyCode,
      reasonForPayment: form.reasonForPayment,
      merchantReference: form.merchantReference,
      paymentMethodCode: form.paymentMethodCode,
      customer: form.customer,
      paymentMethodRequiredFields: form.paymentMethodCode === 'PZW204'
        ? {
            creditCardNumber: form._card.number.replace(/\s/g, ''),
            creditCardExpiryDate: form._card.expiry,
            creditCardSecurityNumber: form._card.cvv,
          }
        : { customerPhoneNumber: form.customer.phoneNumber },
    }
    onSubmit(payload)
  }

  const isCard = form.paymentMethodCode === 'PZW204'

  return (
    <form className={styles.form} onSubmit={handleSubmit}>

      {/* Amount */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Payment details</h3>
        <div className={styles.row2}>
          <div className={styles.field}>
            <label>Amount</label>
            <input type="number" value={form.amount} min="0.01" step="0.01"
              onChange={e => set('amount', e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Currency</label>
            <input readOnly value={form.currencyCode} />
          </div>
        </div>
        <div className={styles.field}>
          <label>Reason for payment</label>
          <input value={form.reasonForPayment}
            onChange={e => set('reasonForPayment', e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label>Merchant reference</label>
          <input value={form.merchantReference}
            onChange={e => set('merchantReference', e.target.value)} required />
        </div>
      </section>

      {/* Customer */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Customer details</h3>
        <div className={styles.row2}>
          <div className={styles.field}>
            <label>Full name</label>
            <input value={form.customer.name}
              onChange={e => set('customer.name', e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={form.customer.email}
              onChange={e => set('customer.email', e.target.value)} required />
          </div>
        </div>
        <div className={styles.field}>
          <label>Phone number</label>
          <input value={form.customer.phoneNumber}
            onChange={e => {
              set('customer.phoneNumber', e.target.value)
              if (!isCard) set('paymentMethodRequiredFields.customerPhoneNumber', e.target.value)
            }} required />
        </div>
      </section>

      {/* Payment method */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Payment method</h3>
        <div className={styles.methodGrid}>
          {PAYMENT_METHODS.map(m => (
            <button
              key={m.code}
              type="button"
              className={`${styles.methodBtn} ${form.paymentMethodCode === m.code ? styles.methodSel : ''}`}
              onClick={() => selectMethod(m.code)}
            >
              <span className={styles.methodIcon}>{m.icon}</span>
              <span className={styles.methodName}>{m.name}</span>
              <span className={styles.methodCurrency}>{m.currency}</span>
              <span className={styles.methodCode}>{m.code}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Card fields */}
      {isCard && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Card details <span className={styles.testBadge}>test card pre-filled</span></h3>
          <div className={styles.field}>
            <label>Card number</label>
            <input value={form._card.number}
              onChange={e => set('_card.number', e.target.value)} />
          </div>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Expiry (MM/YY)</label>
              <input value={form._card.expiry}
                onChange={e => set('_card.expiry', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>CVV</label>
              <input value={form._card.cvv}
                onChange={e => set('_card.cvv', e.target.value)} />
            </div>
          </div>
        </section>
      )}

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'Processing...' : `Pay ${form.currencyCode} ${parseFloat(form.amount || 0).toFixed(2)}`}
      </button>
    </form>
  )
}
