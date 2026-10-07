import { useEffect, useState } from 'react';
import { supportApi } from '../services/api';

// Floating help button. Messages go to the admin panel's Support tab.
export default function HelpChat() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('uniacco:open-help', show);
    return () => window.removeEventListener('uniacco:open-help', show);
  }, []);
  const [body, setBody] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      await supportApi.send(body, contact);
      setStatus({ type: 'ok', text: 'Thanks. We will reply as soon as we can.' });
      setBody('');
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Could not send your message' });
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full rounded-lg border border-input-border bg-bg-surface px-3 py-2 text-sm text-text-primary';
  return (
    <div className="fixed bottom-4 right-4 z-[70]">
      {open && (
        <form onSubmit={send} className="mb-3 w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-bg-surface p-4 shadow-2xl">
          <div className="mb-2 text-sm font-bold text-text-primary">Need help?</div>
          <textarea required rows={4} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} className={input} placeholder="Tell us what you need" />
          <input value={contact} onChange={(e) => setContact(e.target.value)} className={`${input} mt-2`} placeholder="Phone or email for a reply (optional)" />
          <button type="submit" disabled={busy} className="mt-3 w-full rounded-lg bg-brand-primaryDark py-2 text-sm font-bold text-white disabled:opacity-60">
            {busy ? 'Sending…' : 'Send'}
          </button>
          {status && <p className={`mt-2 text-xs ${status.type === 'ok' ? 'text-success' : 'text-error dark:text-red-400'}`}>{status.text}</p>}
        </form>
      )}
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="rounded-full bg-brand-primaryDark px-4 py-3 text-sm font-bold text-white shadow-lg">
        {open ? 'Close' : 'Help'}
      </button>
    </div>
  );
}
