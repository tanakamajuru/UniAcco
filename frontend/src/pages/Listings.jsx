import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, GraduationCap, Loader2, RotateCw } from 'lucide-react';
import { useNavigation } from '../App';
import { accommodationApi, universityApi, favouriteApi, currentRole } from '../services/api';
import ListingCard from '../components/listings/ListingCard';

const TYPES = [
  { value: 'Ensuite room', label: 'Ensuite' },
  { value: 'Studio flat', label: 'Studio' },
  { value: 'Shared house', label: 'Shared' },
];

// Map a [lat,lng] to an x/y % inside the map panel, normalised to the result set.
function computePins(list) {
  const withCoords = list.filter((a) => a.lat != null && a.lng != null);
  if (withCoords.length < 2) {
    return Object.fromEntries(
      list.map((a, i) => [a.id, { x: 28 + ((i * 37) % 50), y: 24 + ((i * 53) % 50) }])
    );
  }
  const lats = withCoords.map((a) => a.lat);
  const lngs = withCoords.map((a) => a.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const span = (v, lo, hi) => (hi === lo ? 0.5 : (v - lo) / (hi - lo));
  return Object.fromEntries(
    list.map((a) => {
      if (a.lat == null || a.lng == null) return [a.id, { x: 50, y: 50 }];
      return [
        a.id,
        { x: 18 + span(a.lng, minLng, maxLng) * 64, y: 22 + (1 - span(a.lat, minLat, maxLat)) * 56 },
      ];
    })
  );
}

export default function Listings() {
  const { navigate } = useNavigation();
  const isStudent = currentRole() !== 'landlord';

  const [universities, setUniversities] = useState([]);
  const [uniIdx, setUniIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(320);
  const [mapMode, setMapMode] = useState('split');
  const [selectedId, setSelectedId] = useState(null);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  const activeUni = universities[uniIdx];

  useEffect(() => {
    universityApi.getAll().then(setUniversities).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isStudent) return;
    favouriteApi
      .list()
      .then((items) => setSavedIds(new Set(items.map((a) => a.id))))
      .catch(() => {});
  }, [isStudent]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    accommodationApi
      .getAll({
        university: activeUni?.short,
        maxPrice,
        q: search,
        type: selectedTypes.length === 1 ? selectedTypes[0] : undefined,
      })
      .then((data) => {
        let list = data.results || [];
        // client-side multi-type filter (API takes a single type)
        if (selectedTypes.length > 1) list = list.filter((a) => selectedTypes.includes(a.type));
        setResults(list);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeUni, maxPrice, search, selectedTypes]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search/price
    return () => clearTimeout(t);
  }, [load]);

  const pins = useMemo(() => computePins(results), [results]);

  const toggleType = (value) =>
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );

  const toggleSave = async (acc) => {
    if (!isStudent || !localStorage.getItem('token')) {
      navigate('auth');
      return;
    }
    const isSaved = savedIds.has(acc.id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(acc.id);
      else next.add(acc.id);
      return next;
    });
    try {
      if (isSaved) await favouriteApi.remove(acc.id);
      else await favouriteApi.add(acc.id);
    } catch {
      load(); // revert on failure
    }
  };

  const open = (acc) => navigate('property-details', { id: acc.id });

  const uniShort = activeUni?.short || 'UZ';
  const gridCols = mapMode === 'split' ? 'repeat(2,minmax(0,1fr))' : 'repeat(3,minmax(0,1fr))';

  return (
    <div className="ua-fade pt-[78px]">
      <div className="mx-auto max-w-[1280px] px-6 pb-1 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="font-display text-[32px] font-extrabold tracking-tight text-text-primary">
              Student homes near <span className="text-brand-primaryDark">{uniShort}</span>
            </h1>
            <p className="mt-1 text-[15px] text-text-secondary">
              {results.length} verified rooms &amp; houses · {activeUni?.city || 'Harare'} · prices in USD/month
            </p>
          </div>
          <div className="flex gap-1 rounded-xl border border-border bg-bg-surface p-1">
            {['split', 'hidden'].map((mode) => (
              <button
                key={mode}
                onClick={() => setMapMode(mode)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[13.5px] font-bold ${
                  mapMode === mode ? 'bg-brand-primaryDark text-white' : 'text-text-secondary'
                }`}
              >
                {mode === 'split' ? 'Map + list' : 'List'}
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-[18px] flex flex-wrap items-center gap-2.5 rounded-2xl border border-border bg-bg-surface p-3 shadow-sm">
          <div className="flex min-w-[190px] flex-1 items-center gap-2 rounded-[11px] bg-bg-surface-alt px-3 py-2.5">
            <Search className="h-[17px] w-[17px] text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by property, suburb or street"
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <button
            onClick={() => setUniIdx((i) => (universities.length ? (i + 1) % universities.length : 0))}
            className="flex items-center gap-1.5 rounded-[11px] border border-border bg-bg-surface px-3.5 py-2.5 text-sm font-semibold text-text-secondary"
          >
            <GraduationCap className="h-4 w-4" /> {uniShort}
          </button>
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => toggleType(t.value)}
              className={`rounded-[11px] border px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors ${
                selectedTypes.includes(t.value)
                  ? 'border-brand-primaryDark bg-brand-primaryDark text-white'
                  : 'border-border bg-bg-surface text-text-secondary'
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2.5 px-1">
            <span className="whitespace-nowrap text-[13px] font-semibold text-text-secondary">
              Max ${maxPrice}
            </span>
            <input
              type="range"
              min="100"
              max="500"
              step="20"
              value={maxPrice}
              onChange={(e) => setMaxPrice(+e.target.value)}
              className="w-[110px] accent-brand-primaryDark"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1280px] items-start gap-[22px] px-6 pb-14 pt-4">
        <div className={mapMode === 'split' ? 'min-w-0 flex-1' : 'w-full'}>
          {loading ? (
            <div className="flex justify-center py-24 text-text-secondary">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-border bg-bg-surface py-16 text-center">
              <p className="font-bold text-text-primary">Couldn't load listings</p>
              <p className="mt-1 text-sm text-text-secondary">{error}</p>
              <button
                onClick={load}
                className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-brand-primaryDark px-4 py-2 text-sm font-semibold text-white"
              >
                <RotateCw className="h-4 w-4" /> Retry
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center text-text-secondary">
              <div className="mb-2 text-4xl">🔍</div>
              <p className="mb-1 font-bold text-text-primary">No homes match those filters</p>
              <p className="text-sm">Try raising the price or clearing a filter.</p>
            </div>
          ) : (
            <div className="grid gap-5" style={{ gridTemplateColumns: gridCols }}>
              {results.map((acc) => (
                <ListingCard
                  key={acc.id}
                  acc={acc}
                  saved={savedIds.has(acc.id)}
                  onOpen={open}
                  onHover={(a) => setSelectedId(a.id)}
                  onToggleSave={isStudent ? toggleSave : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {mapMode === 'split' && (
          <div className="hidden w-[42%] flex-shrink-0 lg:block">
            <div className="sticky top-[100px] h-[calc(100vh-124px)] overflow-hidden rounded-[20px] border border-[#DCE6EE] bg-[#E5EEF3]">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, transparent 0 82px, rgba(255,255,255,.6) 82px 90px), repeating-linear-gradient(0deg, transparent 0 100px, rgba(255,255,255,.6) 100px 108px), radial-gradient(circle at 46% 40%, #cfe6ef, transparent 42%), linear-gradient(160deg,#e7f1f5,#dbe9f0)',
                }}
              />
              <div
                className="absolute flex flex-col items-center gap-1.5"
                style={{ left: '46%', top: '40%', transform: 'translate(-50%,-50%)' }}
              >
                <div className="whitespace-nowrap rounded-xl bg-brand-primaryDark px-3.5 py-2 text-[13px] font-bold text-white shadow-lg">
                  🎓 {uniShort}
                </div>
                <div className="h-[90px] w-[90px] rounded-full border-2 border-dashed border-[rgba(47,143,184,0.45)] bg-[rgba(77,182,226,0.16)]" />
              </div>
              {results.map((acc) => {
                const p = pins[acc.id] || { x: 50, y: 50 };
                const active = selectedId === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => open(acc)}
                    onMouseEnter={() => setSelectedId(acc.id)}
                    className="font-display absolute rounded-full border-2 border-white px-2.5 py-1.5 text-[13px] font-extrabold shadow-md transition-transform hover:scale-110"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      transform: 'translate(-50%,-50%)',
                      background: active ? '#0F172A' : '#fff',
                      color: active ? '#fff' : '#0F172A',
                    }}
                  >
                    ${acc.price_per_month}
                  </button>
                );
              })}
              <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 px-3.5 py-2.5 text-xs text-text-secondary shadow">
                <strong className="text-text-primary">{results.length} homes</strong> in this area
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
