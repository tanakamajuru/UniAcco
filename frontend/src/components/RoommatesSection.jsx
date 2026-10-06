import { useEffect, useState } from 'react';
import { roommateApi } from '../services/api';

// Students looking for a flatmate. Profiles show first name, university, budget,
// move-in month and a short note. A phone number is shown only if its owner added one.
// Every profile expires after 30 days, and its owner can delete it any time.
export default function RoommatesSection() {
  const [universities, setUniversities] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [mine, setMine] = useState(null);
  const [form, setForm] = useState({ firstName: '', universityId: '', budget: '', moveIn: '', note: '', phone: '' });
  const [status, setStatus] = useState(null);

  const load = () => {
    roommateApi.list().then((d) => setProfiles(d.profiles || [])).catch(() => {});
    roommateApi
      .mine()
      .then((d) => {
        setMine(d.profile);
        if (d.profile) {
          setForm({
            firstName: d.profile.first_name || '',
            universityId: d.profile.university_id || '',
            budget: d.profile.budget || '',
            moveIn: d.profile.move_in ? String(d.profile.move_in).slice(0, 7) : '',
            note: d.profile.note || '',
            phone: d.profile.phone || '',
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${base}/api/universities`)
      .then((r) => r.json())
      .then((list) => setUniversities(Array.isArray(list) ? list : []))
      .catch(() => {});
    load();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      await roommateApi.save({ ...form, moveIn: form.moveIn ? `${form.moveIn}-01` : null });
      setStatus({ type: 'ok', text: 'Profile saved. It stays live for 30 days.' });
      load();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Could not save profile' });
    }
  };

  const remove = async () => {
    await roommateApi.remove().catch(() => {});
    setMine(null);
    setForm({ firstName: '', universityId: '', budget: '', moveIn: '', note: '', phone: '' });
    load();
  };

  const input =
    'w-full rounded-[11px] border border-input-border bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary';

  return (
    <section className="mt-10 rounded-[18px] border border-border bg-bg-surface p-5 shadow-sm">
      <h2 className="font-display mb-1 text-[19px] font-extrabold text-text-primary">Find a roommate</h2>
      <p className="mb-4 text-xs text-text-secondary">
        Share only a first name and what you’re looking for. Profiles expire after 30 days.
      </p>

      <form onSubmit={save} className="mb-6 grid gap-2.5 sm:grid-cols-2">
        <input required value={form.firstName} onChange={set('firstName')} className={input} placeholder="First name" maxLength={30} />
        <select value={form.universityId} onChange={set('universityId')} className={input}>
          <option value="">University (optional)</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.short} — {u.name}
            </option>
          ))}
        </select>
        <input type="number" min="0" value={form.budget} onChange={set('budget')} className={input} placeholder="Budget per month (USD)" />
        <input type="month" value={form.moveIn} onChange={set('moveIn')} className={input} />
        <textarea rows={2} maxLength={280} value={form.note} onChange={set('note')} className={`${input} sm:col-span-2`} placeholder="A short note (no surname, no address)" />
        <input value={form.phone} onChange={set('phone')} className={`${input} sm:col-span-2`} placeholder="Phone — optional, shown to other students" />
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className="rounded-xl bg-brand-primaryDark px-5 py-2.5 text-sm font-bold text-white">
            {mine ? 'Update profile' : 'Post my profile'}
          </button>
          {mine && (
            <button type="button" onClick={remove} className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-text-secondary">
              Remove my profile
            </button>
          )}
        </div>
        {status && (
          <p className={`text-xs sm:col-span-2 ${status.type === 'ok' ? 'text-success' : 'text-error dark:text-red-400'}`}>{status.text}</p>
        )}
      </form>

      {profiles.length === 0 ? (
        <p className="text-sm text-text-secondary">No roommate profiles yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {profiles.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-bg-page p-4">
              <div className="text-sm font-bold text-text-primary">
                {p.first_name}
                {p.university ? ` · ${p.university}` : ''}
              </div>
              <div className="text-xs text-text-secondary">
                {p.budget ? `Up to $${p.budget}/mo` : 'Budget not set'}
                {p.move_in ? ` · from ${String(p.move_in).slice(0, 7)}` : ''}
              </div>
              {p.note && <p className="mt-2 text-xs text-text-secondary">{p.note}</p>}
              {p.phone && <div className="mt-2 text-xs font-semibold text-text-primary">{p.phone}</div>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
