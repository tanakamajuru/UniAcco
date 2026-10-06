import { useEffect, useState } from 'react';
import { viewingApi } from '../services/api';

const STATUS_STYLE = {
  requested: 'bg-[#FEF3C7] text-[#92660B]',
  confirmed: 'bg-success/15 text-success',
  declined: 'bg-bg-surface-alt text-text-secondary',
  cancelled: 'bg-bg-surface-alt text-text-secondary',
};

// Landlord's viewing requests across their listings. Confirm or decline each one.
export default function ViewingRequests() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = () =>
    viewingApi
      .landlord()
      .then((d) => setItems(d.viewings || []))
      .catch(() => setError('Could not load viewing requests'));

  useEffect(() => {
    load();
  }, []);

  const decide = async (id, status) => {
    try {
      await viewingApi.update(id, status);
      load();
    } catch {
      setError('Could not update that request');
    }
  };

  return (
    <div className="mb-6 overflow-hidden rounded-[18px] border border-border bg-bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-display text-[17px] font-bold text-text-primary">Viewing requests</h3>
      </div>
      {error && <p className="px-5 py-3 text-xs text-error dark:text-red-400">{error}</p>}
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-text-secondary">No viewing requests yet.</p>
      ) : (
        items.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4 last:border-0">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-text-primary">{v.title}</div>
              <div className="text-xs text-text-secondary">
                {new Date(v.requested_at).toLocaleString()} · {v.full_name || 'Details removed'} {v.phone ? `· ${v.phone}` : ''}
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[v.status] || ''}`}>{v.status}</span>
            {v.status === 'requested' && (
              <div className="flex gap-2">
                <button onClick={() => decide(v.id, 'confirmed')} className="rounded-lg bg-brand-primaryDark px-3 py-1.5 text-xs font-bold text-white">Confirm</button>
                <button onClick={() => decide(v.id, 'declined')} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text-secondary">Decline</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
