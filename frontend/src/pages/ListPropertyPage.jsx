import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronDown, Camera, Loader2 } from 'lucide-react';
import { useNavigation } from '../App';
import { accommodationApi, universityApi } from '../services/api';
import { AmenityIcon, ALL_AMENITIES, LABELS } from '../lib/amenityIcons';

const STEPS = ['Basics', 'Photos', 'Pricing', 'Review'];
const TYPES = ['Ensuite room', 'Studio flat', 'Shared house'];

export default function ListPropertyPage() {
  const { navigate } = useNavigation();
  const [universities, setUniversities] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    universityId: '',
    campusId: '',
    suburb: '',
    type: 'Ensuite room',
    pricePerMonth: '180',
    bedrooms: '1',
    peoplePerRoom: '1',
    leaseTerms: 'Per semester or 12 mo',
  });
  const [amenities, setAmenities] = useState(new Set(['wifi']));
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    universityApi
      .getAll()
      .then((u) => {
        setUniversities(u);
        if (u.length) setForm((f) => ({ ...f, universityId: f.universityId || u[0].id }));
      })
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  // Changing university resets the chosen campus.
  const onUniversity = (e) =>
    setForm((f) => ({ ...f, universityId: e.target.value, campusId: '' }));

  const selectedUni = universities.find((u) => u.id === form.universityId);
  const campuses = selectedUni?.campuses || [];
  const selectedCampus = campuses.find((c) => c.id === form.campusId);
  const toggleAmenity = (id) =>
    setAmenities((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const onFiles = (e) => {
    const picked = Array.from(e.target.files || []).filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        setError(`${f.name} is larger than 5MB`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
  };

  const submit = async (status) => {
    if (!form.title || !form.pricePerMonth) {
      setError('Please add a title and rent.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('type', form.type);
      fd.append('suburb', form.suburb);
      // City follows the selected campus (falls back to the university's city).
      fd.append('city', selectedCampus?.city || selectedUni?.city || 'Harare');
      fd.append('universityId', form.universityId);
      if (form.campusId) fd.append('campusId', form.campusId);
      fd.append('pricePerMonth', form.pricePerMonth);
      fd.append('bedrooms', form.bedrooms);
      fd.append('peoplePerRoom', form.peoplePerRoom);
      fd.append('leaseTerms', form.leaseTerms);
      fd.append('status', status);
      fd.append('amenities', JSON.stringify([...amenities]));
      files.forEach((f) => fd.append('images', f));

      await accommodationApi.create(fd);
      navigate('host-dashboard');
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const input =
    'w-full rounded-[11px] border border-input-border bg-bg-surface px-3.5 py-3 text-sm text-text-primary outline-none focus:border-brand-primary';
  const label = 'mb-1.5 block text-sm font-bold text-text-primary';

  return (
    <div className="ua-fade mx-auto max-w-[760px] px-4 pb-20 pt-6 sm:px-6">
      <button
        onClick={() => navigate('host-dashboard')}
        className="mb-2.5 flex items-center gap-1.5 py-1.5 text-sm font-semibold text-text-secondary"
      >
        <ChevronLeft className="h-4 w-4" /> Back to dashboard
      </button>
      <h1 className="font-display mb-1 text-[28px] font-extrabold tracking-tight text-text-primary">
        List your property
      </h1>
      <p className="mb-[22px] text-[15px] text-text-secondary">
        Reach thousands of verified students near campus. Free to list — you only pay when you find a tenant.
      </p>

      {/* step indicator */}
      <div className="mb-6 flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                i === 0 ? 'bg-brand-primaryDark text-white' : 'bg-bg-surface-alt text-text-muted'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-[12.5px] font-bold ${i === 0 ? 'text-text-primary' : 'text-text-muted'}`}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="rounded-[20px] border border-border bg-bg-surface p-6 shadow-sm">
        <h3 className="font-display mb-[18px] text-[18px] font-bold text-text-primary">The basics</h3>

        <label className={label}>Property title</label>
        <input
          value={form.title}
          onChange={set('title')}
          className={`${input} mb-4`}
          placeholder="e.g. Sunny ensuite room in Mount Pleasant"
        />

        <label className={label}>Description</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          className={`${input} mb-4 h-[90px] resize-none`}
          placeholder="Describe the room, the house, the vibe, who it suits..."
        />

        <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className={label}>Nearest university</label>
            <div className="relative">
              <select value={form.universityId} onChange={onUniversity} className={`${input} appearance-none pr-9`}>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-text-muted" />
            </div>
          </div>
          <div>
            <label className={label}>Campus</label>
            <div className="relative">
              <select
                value={form.campusId}
                onChange={set('campusId')}
                disabled={campuses.length === 0}
                className={`${input} appearance-none pr-9 disabled:opacity-60`}
              >
                <option value="">{campuses.length ? 'Select a campus' : 'No campuses listed'}</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.city ? ` — ${c.city}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-text-muted" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className={label}>Suburb</label>
          <input value={form.suburb} onChange={set('suburb')} className={input} placeholder="Mount Pleasant" />
        </div>

        <div className="mb-4">
          <label className={label}>Property type</label>
          <div className="relative">
            <select value={form.type} onChange={set('type')} className={`${input} appearance-none pr-9`}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-text-muted" />
          </div>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3.5">
          <div>
            <label className={label}>Rent (USD/mo)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 font-semibold text-text-muted">$</span>
              <input
                value={form.pricePerMonth}
                onChange={set('pricePerMonth')}
                type="number"
                className={`${input} pl-6`}
              />
            </div>
          </div>
          <div>
            <label className={label}>Bedrooms</label>
            <input value={form.bedrooms} onChange={set('bedrooms')} type="number" className={input} />
          </div>
          <div>
            <label className={label}>People / room</label>
            <input
              value={form.peoplePerRoom}
              onChange={set('peoplePerRoom')}
              type="number"
              className={input}
            />
          </div>
        </div>

        <label className={`${label} mb-2.5`}>Amenities</label>
        <div className="mb-5 flex flex-wrap gap-2">
          {ALL_AMENITIES.map((id) => {
            const active = amenities.has(id);
            return (
              <button
                key={id}
                onClick={() => toggleAmenity(id)}
                className="flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[13px] font-semibold transition-colors"
                style={{
                  borderColor: active ? '#2F8FB8' : '#E2E8F0',
                  background: active ? '#EAF6FB' : 'transparent',
                  color: active ? '#2F8FB8' : '#475569',
                }}
              >
                <AmenityIcon id={id} className="h-3.5 w-3.5" /> {LABELS[id]}
              </button>
            );
          })}
        </div>

        <label className={`${label} mb-2.5`}>Photos</label>
        <label
          htmlFor="photo-input"
          className="block cursor-pointer rounded-[14px] border-2 border-dashed border-border-strong bg-bg-page p-8 text-center"
        >
          <Camera className="mx-auto mb-2 h-8 w-8 text-text-muted" />
          <p className="mb-1 text-sm font-bold text-text-primary">Drag photos here or click to upload</p>
          <p className="text-[12.5px] text-text-muted">PNG or JPG up to 5MB each · add at least 3</p>
          <input id="photo-input" type="file" multiple accept="image/*" className="sr-only" onChange={onFiles} />
        </label>
        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <span
                key={i}
                className="rounded-lg bg-bg-surface-alt px-2.5 py-1 text-xs font-medium text-text-secondary"
              >
                {f.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-[22px] flex justify-between">
        <button
          onClick={() => submit('draft')}
          disabled={loading}
          className="rounded-xl border border-border bg-bg-surface px-5 py-3 text-[15px] font-bold text-text-secondary disabled:opacity-60"
        >
          Save draft
        </button>
        <button
          onClick={() => submit('pending')}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-brand-primaryDark px-7 py-3 text-[15px] font-bold text-white shadow-md disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Publish listing →
        </button>
      </div>
    </div>
  );
}
