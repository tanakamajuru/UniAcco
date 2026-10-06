import { useState } from 'react';
import { authApi, paymentApi } from '../services/api';

// Landlord pays $1 for 30 days of the verified badge on all their listings.
export default function VerifyLandlordButton() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const start = async () => {
    setStatus(null);
    setBusy(true);
    try {
      const { user } = await authApi.me();
      const init = await paymentApi.initiate({
        feature: 'landlord_verification',
        email: user.email,
        paymentMethod: 'web',
      });
      if (init.redirectUrl && init.pollUrl !== 'SIMULATED') {
        window.location.href = init.redirectUrl; // hosted card or mobile-money checkout
      } else {
        setStatus({ type: 'ok', text: 'Simulated payment: verification is active.' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Could not start verification' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-5 rounded-[18px] border border-border bg-bg-surface p-5 shadow-sm">
      <div className="mb-1 font-display text-[17px] font-bold text-text-primary">Get verified</div>
      <p className="mb-3 text-xs text-text-secondary">
        Verified landlords show a badge on every listing. $1 for 30 days.
      </p>
      <button onClick={start} disabled={busy} className="rounded-xl bg-brand-primaryDark px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
        {busy ? 'Starting…' : 'Pay $1 to get verified'}
      </button>
      {status && (
        <p className={`mt-2 text-xs ${status.type === 'ok' ? 'text-success' : 'text-error dark:text-red-400'}`}>{status.text}</p>
      )}
    </div>
  );
}
