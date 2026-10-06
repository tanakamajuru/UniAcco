import { useState } from 'react';
import { reviewApi } from '../services/api';

// Lets a student who has unlocked a home leave one review of it.
export default function ReviewForm({ accommodationId, onPosted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setBusy(true);
    try {
      await reviewApi.create({ accommodationId, rating: Number(rating), comment: comment.trim() });
      setStatus({ type: 'ok', text: 'Thanks — your review is posted.' });
      setComment('');
      onPosted?.();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Could not post your review' });
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full rounded-[11px] border border-input-border bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary';

  return (
    <form onSubmit={submit} className="mb-4 rounded-xl border border-border bg-bg-surface p-4">
      <div className="mb-3 text-sm font-bold text-text-primary">Leave a review</div>
      <label className="mb-2 block text-xs font-semibold text-text-secondary">
        Rating
        <select value={rating} onChange={(e) => setRating(e.target.value)} className={`${input} mt-1`}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n === 1 ? '' : 's'}
            </option>
          ))}
        </select>
      </label>
      <textarea
        rows={3}
        maxLength={1000}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className={input}
        placeholder="What was it like? Be specific: power, water, safety, the landlord."
      />
      <button type="submit" disabled={busy} className="mt-3 w-full rounded-xl bg-brand-primaryDark py-2.5 text-sm font-bold text-white disabled:opacity-60">
        {busy ? 'Posting…' : 'Post review'}
      </button>
      {status && (
        <p className={`mt-2 text-xs ${status.type === 'ok' ? 'text-success' : 'text-error dark:text-red-400'}`}>{status.text}</p>
      )}
    </form>
  );
}
