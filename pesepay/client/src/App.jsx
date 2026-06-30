import { useState, useEffect } from 'react'
import { usePesepay } from './hooks/usePesepay'
import PaymentForm from './components/PaymentForm'
import TransactionResult from './components/TransactionResult'
import styles from './App.module.css'

export default function App() {
  const [serverOk, setServerOk] = useState(null)
  const [view, setView] = useState('form') // 'form' | 'result'
  const { loading, transaction, error, statusLog, makePayment, checkStatus, clearLog } = usePesepay()

  // Check server health on load
  useEffect(() => {
    fetch('/api/../health')
      .then(r => r.json())
      .then(d => setServerOk(d.status === 'ok' ? d : null))
      .catch(() => setServerOk(false))
  }, [])

  const handleSubmit = async (formData) => {
    const tx = await makePayment(formData)
    if (tx) setView('result')
  }

  const handleReset = () => {
    setView('form')
    clearLog()
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>Pesepay</div>
          <div className={styles.headerRight}>
            <span className={`${styles.envBadge} ${serverOk ? styles.sandbox : styles.offline}`}>
              {serverOk === null ? '...' : serverOk ? `Sandbox — ${serverOk.env}` : 'Server offline'}
            </span>
          </div>
        </header>

        {/* Server offline banner */}
        {serverOk === false && (
          <div className={styles.banner}>
            <strong>Backend not running.</strong> Start it with: <code>cd server && npm install && npm run dev</code>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className={styles.errorBanner}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className={styles.layout}>
          {/* Left: form */}
          <div className={styles.left}>
            {view === 'form' ? (
              <PaymentForm onSubmit={handleSubmit} loading={loading} />
            ) : (
              <div className={styles.backWrap}>
                <button className={styles.backBtn} onClick={handleReset}>← New payment</button>
              </div>
            )}
          </div>

          {/* Right: result + log */}
          <div className={styles.right}>
            {view === 'result' || statusLog.length > 0 ? (
              <TransactionResult
                transaction={transaction}
                statusLog={statusLog}
                onCheckStatus={checkStatus}
                onReset={handleReset}
                loading={loading}
              />
            ) : (
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon}>⚡</div>
                <p>Fill in the form and click Pay.<br/>The live API response will appear here.</p>
                {serverOk && (
                  <div className={styles.serverInfo}>
                    <strong>Backend connected</strong><br/>
                    <span>{serverOk.baseUrl}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
