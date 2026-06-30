import { useState, useCallback, useRef } from 'react'

const API = '/api'

export function usePesepay() {
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [error, setError] = useState(null)
  const [statusLog, setStatusLog] = useState([])
  const pollTimer = useRef(null)

  const log = useCallback((msg, type = 'info') => {
    setStatusLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }])
  }, [])

  const clearLog = useCallback(() => setStatusLog([]), [])

  // ── make seamless payment ──────────────────────────────────────────────────
  const makePayment = useCallback(async (formData) => {
    setLoading(true)
    setError(null)
    setTransaction(null)
    clearLog()

    log('Building payload...')
    log(`Method: ${formData.paymentMethodCode} | Amount: ${formData.amount} ${formData.currencyCode}`)

    try {
      log('Sending to backend → POST /api/pay')
      const res = await fetch(`${API}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const tx = data.transaction
      setTransaction(tx)
      log(`Reference: ${tx.referenceNumber}`, 'success')
      log(`Status: ${tx.transactionStatus}`, 'success')
      log(`Poll URL: ${tx.pollUrl}`, 'info')

      if (tx.transactionStatus === 'PENDING' || tx.transactionStatus === 'AWAITING_DELIVERY') {
        log('Starting auto-poll every 5s...', 'info')
        startPolling(tx.referenceNumber)
      }

      return tx
    } catch (err) {
      setError(err.message)
      log(`Error: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }, [log, clearLog])

  // ── check status ───────────────────────────────────────────────────────────
  const checkStatus = useCallback(async (reference) => {
    try {
      log(`Polling status for ${reference}...`)
      const res = await fetch(`${API}/status/${encodeURIComponent(reference)}`)
      const data = await res.json()

      if (!data.success) throw new Error(data.error)

      const tx = data.transaction
      setTransaction(prev => ({ ...prev, ...tx }))
      log(`Status: ${tx.transactionStatus} | Paid: ${tx.paid}`, tx.paid ? 'success' : 'info')

      if (tx.paid || tx.transactionStatus === 'SUCCESS') {
        log('Payment confirmed!', 'success')
        stopPolling()
      }

      return tx
    } catch (err) {
      log(`Poll error: ${err.message}`, 'error')
    }
  }, [log])

  // ── auto polling ──────────────────────────────────────────────────────────
  const startPolling = useCallback((reference, intervalMs = 5000) => {
    stopPolling()
    pollTimer.current = setInterval(() => checkStatus(reference), intervalMs)
  }, [checkStatus])

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current)
      pollTimer.current = null
      log('Polling stopped.')
    }
  }, [log])

  // ── currencies & methods ───────────────────────────────────────────────────
  const getCurrencies = useCallback(async () => {
    const res = await fetch(`${API}/currencies`)
    return res.json()
  }, [])

  const getPaymentMethods = useCallback(async (currency) => {
    const res = await fetch(`${API}/payment-methods/${currency}`)
    return res.json()
  }, [])

  return {
    loading, transaction, error, statusLog,
    makePayment, checkStatus, startPolling, stopPolling,
    getCurrencies, getPaymentMethods,
    clearLog,
  }
}
