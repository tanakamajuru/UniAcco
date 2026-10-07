import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';

// Admin: universities and their campuses. Create, edit and delete both.
const cell = 'border-b border-border px-3 py-2 text-sm text-text-primary align-top';
const btn = 'rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-secondary';
const danger = 'rounded-lg border border-error/40 px-2.5 py-1 text-xs font-bold text-error';
const input = 'rounded-lg border border-input-border bg-bg-surface px-3 py-2 text-sm text-text-primary';

const blankUni = { name: '', short: '', city: '', lat: '', lng: '' };
const blankCampus = { name: '', city: '', province: '', lat: '', lng: '' };

export default function UniversitiesTab({ setError }) {
  const [unis, setUnis] = useState([]);
  const [uniForm, setUniForm] = useState(blankUni);
  const [campusForm, setCampusForm] = useState({}); // { [uniId]: campus form }
  const [open, setOpen] = useState({}); // { [uniId]: true } shows campuses

  const load = () => adminApi.universities().then((d) => setUnis(d.universities)).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const run = (promise) => promise.then(load).catch((e) => setError(e.message));

  const addUni = (e) => {
    e.preventDefault();
    run(adminApi.createUniversity(uniForm)).then(() => setUniForm(blankUni));
  };

  const editUni = (u) => {
    const name = window.prompt('University name', u.name);
    if (name === null) return;
    const short = window.prompt('Short name', u.short);
    if (short === null) return;
    const city = window.prompt('City', u.city);
    if (city === null) return;
    run(adminApi.updateUniversity(u.id, { name, short, city }));
  };

  const removeUni = (u) => {
    if (!window.confirm(`Delete ${u.name} and all its campuses?`)) return;
    run(adminApi.deleteUniversity(u.id));
  };

  const addCampus = (e, uniId) => {
    e.preventDefault();
    const f = campusForm[uniId] || blankCampus;
    run(adminApi.createCampus(uniId, f)).then(() => setCampusForm((c) => ({ ...c, [uniId]: blankCampus })));
  };

  const editCampus = (c) => {
    const name = window.prompt('Campus name', c.name);
    if (name === null) return;
    const city = window.prompt('City', c.city || '');
    if (city === null) return;
    const lat = window.prompt('Latitude (leave blank if unknown)', c.lat ?? '');
    if (lat === null) return;
    const lng = window.prompt('Longitude (leave blank if unknown)', c.lng ?? '');
    if (lng === null) return;
    run(adminApi.updateCampus(c.id, { name, city, lat: lat === '' ? null : Number(lat), lng: lng === '' ? null : Number(lng) }));
  };

  const removeCampus = (c) => {
    const note = c.listings ? ` ${c.listings} listing(s) will lose their campus and distance.` : '';
    if (!window.confirm(`Delete campus ${c.name}?${note}`)) return;
    run(adminApi.deleteCampus(c.id));
  };

  return (
    <div className="grid gap-5">
      <form onSubmit={addUni} className="grid gap-2 rounded-xl border border-border bg-bg-surface p-4 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-bold text-text-primary">Add a university</div>
        <input required value={uniForm.name} onChange={(e) => setUniForm({ ...uniForm, name: e.target.value })} placeholder="Full name" className={input} />
        <input required value={uniForm.short} onChange={(e) => setUniForm({ ...uniForm, short: e.target.value })} placeholder="Short name (e.g. UZ)" className={input} />
        <input required value={uniForm.city} onChange={(e) => setUniForm({ ...uniForm, city: e.target.value })} placeholder="City" className={input} />
        <div className="flex gap-2">
          <input value={uniForm.lat} onChange={(e) => setUniForm({ ...uniForm, lat: e.target.value })} placeholder="Latitude" className={`${input} w-1/2`} />
          <input value={uniForm.lng} onChange={(e) => setUniForm({ ...uniForm, lng: e.target.value })} placeholder="Longitude" className={`${input} w-1/2`} />
        </div>
        <button type="submit" className="sm:col-span-2 rounded-lg bg-brand-primaryDark py-2 text-sm font-bold text-white">Add university</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className={cell}>University</th>
              <th className={cell}>City</th>
              <th className={cell}>Campuses</th>
              <th className={cell}>Listings</th>
              <th className={cell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {unis.map((u) => (
              <tr key={u.id}>
                <td className={cell}>
                  <div className="font-bold">{u.name}</div>
                  <div className="text-xs text-text-secondary">{u.short}</div>
                </td>
                <td className={cell}>{u.city}</td>
                <td className={cell}>
                  <button className={btn} onClick={() => setOpen((o) => ({ ...o, [u.id]: !o[u.id] }))} aria-expanded={!!open[u.id]}>
                    {u.campuses.length} campus{u.campuses.length === 1 ? '' : 'es'} {open[u.id] ? '▲' : '▼'}
                  </button>
                  {open[u.id] && (
                    <div className="mt-3 grid gap-2">
                      {u.campuses.map((c) => (
                        <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
                          <div className="min-w-[160px] flex-1">
                            <div className="text-sm font-semibold">{c.name}</div>
                            <div className="text-xs text-text-secondary">
                              {c.city || 'no city'} · {c.lat != null ? `${c.lat}, ${c.lng}` : 'no coordinates'} · {c.listings} listing(s)
                            </div>
                          </div>
                          <button className={btn} onClick={() => editCampus(c)}>Edit</button>
                          <button className={danger} onClick={() => removeCampus(c)}>Delete</button>
                        </div>
                      ))}
                      <form onSubmit={(e) => addCampus(e, u.id)} className="grid gap-2 rounded-lg border border-dashed border-border p-2 sm:grid-cols-2">
                        <input required value={(campusForm[u.id] || blankCampus).name} onChange={(e) => setCampusForm((c) => ({ ...c, [u.id]: { ...(c[u.id] || blankCampus), name: e.target.value } }))} placeholder="New campus name" className={input} />
                        <input value={(campusForm[u.id] || blankCampus).city} onChange={(e) => setCampusForm((c) => ({ ...c, [u.id]: { ...(c[u.id] || blankCampus), city: e.target.value } }))} placeholder="City" className={input} />
                        <input value={(campusForm[u.id] || blankCampus).lat} onChange={(e) => setCampusForm((c) => ({ ...c, [u.id]: { ...(c[u.id] || blankCampus), lat: e.target.value } }))} placeholder="Latitude (optional)" className={input} />
                        <input value={(campusForm[u.id] || blankCampus).lng} onChange={(e) => setCampusForm((c) => ({ ...c, [u.id]: { ...(c[u.id] || blankCampus), lng: e.target.value } }))} placeholder="Longitude (optional)" className={input} />
                        <button type="submit" className="sm:col-span-2 rounded-lg bg-brand-primaryDark py-1.5 text-xs font-bold text-white">Add campus</button>
                      </form>
                    </div>
                  )}
                </td>
                <td className={cell}>{u.listings}</td>
                <td className={cell}>
                  <div className="flex gap-2">
                    <button className={btn} onClick={() => editUni(u)}>Edit</button>
                    <button className={danger} onClick={() => removeUni(u)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
