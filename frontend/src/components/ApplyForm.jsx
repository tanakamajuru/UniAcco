import { useState } from 'react';
import { applicationApi } from '../services/api';
import { getUnlockReference } from '../lib/unlocks';
import { useNavigation } from '../App';

// Applies to a property. Only shown once the contact is unlocked. A payer who
// unlocked without an account signs in here, and the unlock's payment reference
// is attached to the application so the server links it to their account.
export default function ApplyForm({ accommodationId }) {
  const { navigate } = useNavigation();
  const signedIn = Boolean(localStorage.getItem('token'));
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', moveInDate: '', message: '' });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setBusy(true);
    try {
      await applicationApi.create({
        accommodationId,
        ...form,
        paymentReference: getUnlockReference(accommodationId),
      });
      setStatus({ type: 'ok', text: 'Application sent. The landlord will reply to you directly.' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Could not send the application' });
    } finally {
      setBusy(false);
    }
  };

  const box = 'mb-4 rounded-xl border border-border bg-bg-surface p-4';
  if (!signedIn) {
    return (
      <div className={box}>
        <div className="mb-2 text-sm font-bold text-text-primary">Apply for this home</div>
        <p className="mb-3 text-xs text-text-secondary">
          Create a free account or sign in to apply. Your unlock is kept, so you won’t pay again.
        </p>
        <button onClick={() => navigate('auth')} className="w-full rounded-xl bg-brand-primaryDark py-2.5 text-sm font-bold text-white">
          Sign in to apply
        </button>
      </div>
    );
  }

  const input =
    'w-full rounded-[11px] border border-input-border bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary';

  return (
    <form onSubmit={submit} className={box}>
      <div className="mb-3 text-sm font-bold text-text-primary">Apply for this home</div>
      <div className="grid gap-2.5">
        <input required value={form.fullName} onChange={set('fullName')} className={input} placeholder="Full name" />
        <input required type="email" value={form.email} onChange={set('email')} className={input} placeholder="Email" />
        <input value={form.phone} onChange={set('phone')} className={input} placeholder="Phone (optional)" />
        <input type="date" value={form.moveInDate} onChange={set('moveInDate')} className={input} />
        <textarea rows={3} value={form.message} onChange={set('message')} className={input} placeholder="A short note for the landlord" />
      </div>
      <button type="submit" disabled={busy} className="mt-3 w-full rounded-xl bg-brand-primaryDark py-2.5 text-sm font-bold text-white disabled:opacity-60">
        {busy ? 'Sending…' : 'Send application'}
      </button>
      {status && (
        <p className={`mt-2 text-xs ${status.type === 'ok' ? 'text-success' : 'text-error dark:text-red-400'}`}>{status.text}</p>
      )}
    </form>
  );
}
