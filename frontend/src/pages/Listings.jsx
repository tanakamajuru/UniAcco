import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, GraduationCap, Loader2, RotateCw } from 'lucide-react';
import { useNavigation } from '../App';
import { accommodationApi, universityApi, favouriteApi, currentRole } from '../services/api';
import ListingCard from '../components/listings/ListingCard';
import ListingMap from '../components/listings/ListingMap';
import { AmenityIcon, ALL_AMENITIES, LABELS } from '../lib/amenityIcons';

const TYPES = [
  { value: 'Ensuite room', label: 'Ensuite' },
  { value: 'Studio flat', label: 'Studio' },
  { value: 'Shared house', label: 'Shared' },
];



export default function Listings() {
  const { navigate } = useNavigation();
  const isStudent = currentRole() !== 'landlord';

  const [universities, setUniversities] = useState([]);
  const [uniIdx, setUniIdx] = useState(0);
  const [search, setSearch] = useState(() => {
    const saved = localStorage.getItem('searchQuery') || '';
    localStorage.removeItem('searchQuery');
    return saved;
  });
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [maxPrice, setMaxPrice] = useState(320);
  const [mapMode, setMapMode] = useState('split');
  const [selectedId, setSelectedId] = useState(null);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  const activeUni = universities[uniIdx];

  useEffect(() => {
    universityApi.getAll().then((data) => {
      setUniversities(data);
      const savedUni = localStorage.getItem('searchUniversity');
      if (savedUni) {
        const idx = data.findIndex(u => u.short === savedUni || u.name === savedUni);
        if (idx !== -1) {
          setUniIdx(idx);
        }
        localStorage.removeItem('searchUniversity');
      }
    }).catch(() => {});
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
        amenities: selectedAmenities.length ? selectedAmenities.join(',') : undefined,
      })
      .then((data) => {
        let list = data.results || [];
        // client-side multi-type filter (API takes a single type)
        if (selectedTypes.length > 1) list = list.filter((a) => selectedTypes.includes(a.type));
        setResults(list);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeUni, maxPrice, search, selectedTypes, selectedAmenities]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search/price/amenities
    return () => clearTimeout(t);
  }, [load]);

  const toggleType = (value) =>
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );

  const toggleAmenity = (aid) =>
    setSelectedAmenities((prev) =>
      prev.includes(aid) ? prev.filter((a) => a !== aid) : [...prev, aid]
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
            className="flex items-center gap-1.5 rounded-[11px] border border-border bg-bg-surface px-3.5 py-2.5 text-sm font-semibold text-text-secondary cursor-pointer"
          >
            <GraduationCap className="h-4 w-4" /> {uniShort}
          </button>
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => toggleType(t.value)}
              className={`rounded-[11px] border px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors cursor-pointer ${
                selectedTypes.includes(t.value)
                  ? 'border-brand-primaryDark bg-brand-primaryDark text-white'
                  : 'border-border bg-bg-surface text-text-secondary hover:bg-bg-surface-alt'
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
              className="w-[110px] accent-brand-primaryDark cursor-pointer"
            />
          </div>
        </div>

        {/* Amenities Filters */}
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-bg-surface p-3 shadow-sm animate-fade-in">
          <span className="text-[13px] font-bold text-text-secondary px-1 uppercase tracking-wider">Amenities:</span>
          <div className="flex flex-wrap gap-2">
            {ALL_AMENITIES.map((aid) => {
              const active = selectedAmenities.includes(aid);
              return (
                <button
                  key={aid}
                  onClick={() => toggleAmenity(aid)}
                  className={`flex items-center gap-1.5 rounded-[11px] border px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
                    active
                      ? 'border-brand-primaryDark bg-brand-primary/10 text-brand-primaryDark ring-1 ring-brand-primaryDark font-bold'
                      : 'border-border bg-bg-surface text-text-secondary hover:bg-bg-surface-alt'
                  }`}
                >
                  <AmenityIcon id={aid} className="h-3.5 w-3.5" />
                  {LABELS[aid]}
                </button>
              );
            })}
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
            <div className="sticky top-[100px] h-[calc(100vh-124px)] overflow-hidden rounded-[20px] border border-border shadow-md bg-bg-surface">
              <ListingMap
                results={results}
                selectedId={selectedId}
                activeUni={activeUni}
                onSelect={open}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
