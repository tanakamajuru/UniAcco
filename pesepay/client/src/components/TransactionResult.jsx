import styles from './TransactionResult.module.css'

const STATUS_COLOR = {
  SUCCESS: 'green',
  PAID: 'green',
  PENDING: 'amber',
  AWAITING_DELIVERY: 'amber',
  FAILED: 'red',
  CANCELLED: 'red',
}

export default function TransactionResult({ transaction, statusLog, onCheckStatus, onReset, loading }) {
  if (!transaction && !statusLog.length) return null

  const status = transaction?.transactionStatus || 'PENDING'
  const paid = transaction?.paid || status === 'SUCCESS'
  const color = STATUS_COLOR[status] || 'amber'

  const copyRef = () => {
    if (transaction?.referenceNumber) {
      navigator.clipboard.writeText(transaction.referenceNumber).catch(() => {})
    }
  }

  return (
    <div className={styles.wrap}>

      {/* Transaction card */}
      {transaction && (
        <div className={`${styles.txCard} ${styles[color]}`}>
          <div className={styles.txHeader}>
            <span className={`${styles.badge} ${styles[color]}`}>
              {paid ? '✓ Paid' : status.replace(/_/g, ' ')}
            </span>
            <button className={styles.copyBtn} onClick={copyRef} title="Copy reference">
              Copy ref
            </button>
          </div>

          <div className={styles.txRef}>{transaction.referenceNumber}</div>

          {transaction.amount && (
            <div className={styles.txAmount}>
              {transaction.currencyCode} {parseFloat(transaction.amount).toFixed(2)}
            </div>
          )}

          <div className={styles.txFields}>
            {transaction.pollUrl && (
              <div className={styles.txField}>
                <span className={styles.txKey}>Poll URL</span>
                <span className={styles.txVal} style={{fontSize:'11px',wordBreak:'break-all'}}>{transaction.pollUrl}</span>
              </div>
            )}
            {transaction.redirectUrl && (
              <div className={styles.txField}>
                <span className={styles.txKey}>Redirect URL</span>
                <a href={transaction.redirectUrl} target="_blank" rel="noreferrer" className={styles.txLink}>
                  Open payment page ↗
                </a>
              </div>
            )}
            {transaction.merchantReference && (
              <div className={styles.txField}>
                <span className={styles.txKey}>Merchant ref</span>
                <span className={styles.txVal}>{transaction.merchantReference}</span>
              </div>
            )}
          </div>

          {!paid && (
            <div className={styles.txActions}>
              <button
                className={styles.pollBtn}
                onClick={() => onCheckStatus(transaction.referenceNumber)}
                disabled={loading}
              >
                {loading ? 'Checking...' : '↻ Check status now'}
              </button>
              <button className={styles.resetBtn} onClick={onReset}>New payment</button>
            </div>
          )}

          {paid && (
            <button className={styles.resetBtn} style={{marginTop:'12px',width:'100%'}} onClick={onReset}>
              New payment
            </button>
          )}
        </div>
      )}

      {/* Live log */}
      {statusLog.length > 0 && (
        <div className={styles.logWrap}>
          <div className={styles.logTitle}>Live log</div>
          <div className={styles.log}>
            {statusLog.map((entry, i) => (
              <div key={i} className={`${styles.logLine} ${styles[entry.type]}`}>
                <span className={styles.logTime}>{entry.time}</span>
                <span>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw JSON */}
      {transaction && (
        <details className={styles.raw}>
          <summary>Raw JSON response</summary>
          <pre>{JSON.stringify(transaction, null, 2)}</pre>
        </details>
      )}
    </div>
  )
}
