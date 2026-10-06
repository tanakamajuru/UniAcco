import { useState } from 'react';
import { restoreApi } from '../services/api';
import { saveUnlock } from '../lib/unlocks';
import { useNavigation } from '../App';

// Recovers a paid unlock on a new device, or after signing up, from the payment
// reference on the receipt. Signed-in users also get the unlock on their account.
export default function RestoreUnlock() {
  const { navigate } = useNavigation();
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setBusy(true);
    try {
      const res = await restoreApi.restore(reference.trim());
      saveUnlock(res.accommodationId, res.contact, res.validUntil, res.reference);
      setStatus({
        type: 'ok',
        text: 'Unlock restored.',
        id: res.accommodationId,
      });
      setReference('');
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Could not restore the unlock' });
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full rounded-[11px] border border-input-border bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary';

  return (
    <section className="mt-10 rounded-[18px] border border-border bg-bg-surface p-5 shadow-sm">
      <h2 className="font-display mb-1 text-[19px] font-extrabold text-text-primary">Restore a paid unlock</h2>
      <p className="mb-4 text-xs text-text-secondary">
        On a new device, or after signing up? Enter the payment reference from your receipt to restore access.
      </p>
      <form onSubmit={submit} className="flex flex-wrap gap-2.5">
        <input
          required
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className={`${input} min-w-[220px] flex-1`}
          placeholder="Payment reference"
        />
        <button type="submit" disabled={busy} className="rounded-xl bg-brand-primaryDark px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
          {busy ? 'Checking…' : 'Restore'}
        </button>
      </form>
      {status && (
        <p className={`mt-3 text-xs ${status.type === 'ok' ? 'text-success' : 'text-error dark:text-red-400'}`}>
          {status.text}
          {status.type === 'ok' && (
            <button onClick={() => navigate('property-details', { id: status.id })} className="ml-2 font-bold underline">
              Open the home
            </button>
          )}
        </p>
      )}
    </section>
  );
}
