import { useState } from 'react';
import { viewingApi } from '../services/api';

// Asks to see a property at a chosen time. Only shown after the contact is unlocked.
export default function ViewingRequestForm({ accommodationId }) {
  const [when, setWhen] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(null); // { type: 'ok' | 'error', text }
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setBusy(true);
    try {
      // datetime-local has no timezone, so send it as local time.
      await viewingApi.create({
        accommodationId,
        requestedAt: new Date(when).toISOString(),
        fullName: name,
        phone,
      });
      setStatus({ type: 'ok', text: 'Request sent. The landlord will confirm the time.' });
      setWhen('');
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Could not send the request' });
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full rounded-[11px] border border-input-border bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary';

  return (
    <form onSubmit={submit} className="mb-4 rounded-xl border border-border bg-bg-surface p-4">
      <div className="mb-3 text-sm font-bold text-text-primary">Request a viewing</div>
      <div className="grid gap-2.5">
        <input type="datetime-local" required value={when} onChange={(e) => setWhen(e.target.value)} className={input} />
        <input required value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Your full name" />
        <input required value={phone} onChange={(e) => setPhone(e.target.value)} className={input} placeholder="077X XXX XXX" />
      </div>
      <button type="submit" disabled={busy} className="mt-3 w-full rounded-xl bg-brand-primaryDark py-2.5 text-sm font-bold text-white disabled:opacity-60">
        {busy ? 'Sending…' : 'Send request'}
      </button>
      {status && (
        <p className={`mt-2 text-xs ${status.type === 'ok' ? 'text-success' : 'text-error dark:text-red-400'}`}>{status.text}</p>
      )}
    </form>
  );
}
