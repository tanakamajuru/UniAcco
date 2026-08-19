import { useState, useEffect, useCallback } from 'react';
import { Search, GraduationCap, Loader2, RotateCw, MapPin, Users, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigation } from '../App';
import { accommodationApi, universityApi, favouriteApi, currentRole } from '../services/api';
import ListingCard from '../components/listings/ListingCard';
import ListingMap from '../components/listings/ListingMap';
import { AmenityIcon, ALL_AMENITIES, LABELS } from '../lib/amenityIcons';
import { Card, Chip } from '../components/kit';

const TYPES = [
  { value: 'Ensuite room', label: 'Ensuite' },
  { value: 'Studio flat', label: 'Studio' },
  { value: 'Shared house', label: 'Shared' },
];

// Roommates → occupancy of the room (people_per_room). `query` becomes API params.
const ROOMMATES = [
  { label: 'Any', query: {} },
  { label: 'Just me', query: { peoplePerRoom: 1 } },
  { label: '1 roommate', query: { peoplePerRoom: 2 } },
  { label: '2 roommates', query: { peoplePerRoom: 3 } },
  { label: '3+ roommates', query: { peoplePerRoomMin: 4 } },
];

const PAGE_SIZE = 12;

export default function Listings() {
  const { navigate } = useNavigation();
  const isStudent = currentRole() !== 'landlord';

  const [universities, setUniversities] = useState([]);
  const [uniIdx, setUniIdx] = useState(-1);
  const [universityMenuOpen, setUniversityMenuOpen] = useState(false);
  const [search, setSearch] = useState(() => {
    const saved = localStorage.getItem('searchQuery') || '';
    localStorage.removeItem('searchQuery');
    return saved;
  });
  const [campus, setCampus] = useState(() => {
    const saved = localStorage.getItem('searchCampus') || '';
    localStorage.removeItem('searchCampus');
    return saved;
  });
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [roommates, setRoommates] = useState('Any');
  const [maxPrice, setMaxPrice] = useState(320);
  const [mapMode, setMapMode] = useState('split');
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  const activeUni = universities[uniIdx];

  useEffect(() => {
    universityApi
      .getAll()
      .then((data) => {
        setUniversities(data);
        const savedUni = localStorage.getItem('searchUniversity');
        if (savedUni) {
          const idx = data.findIndex((u) => u.short === savedUni || u.name === savedUni);
          if (idx !== -1) setUniIdx(idx);
          localStorage.removeItem('searchUniversity');
        }
      })
      .catch(() => {});
  }, []);

  // Favourites are stored locally (no account needed).
  useEffect(() => {
    setSavedIds(new Set(favouriteApi.ids()));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const roommateQuery = ROOMMATES.find((r) => r.label === roommates)?.query || {};
    accommodationApi
      .getAll({
        university: activeUni?.short,
        campus,
        maxPrice,
        q: search,
        page,
        type: selectedTypes.length === 1 ? selectedTypes[0] : undefined,
        amenities: selectedAmenities.length ? selectedAmenities.join(',') : undefined,
        ...roommateQuery,
      })
      .then((data) => {
        let list = data.results || [];
        if (selectedTypes.length > 1) list = list.filter((a) => selectedTypes.includes(a.type));
        setResults(list);
        setTotal(data.total || 0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeUni, campus, maxPrice, search, selectedTypes, selectedAmenities, roommates, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [activeUni, campus, maxPrice, search, selectedTypes, selectedAmenities, roommates]);

  const toggleType = (v) => {
    setPage(1);
    setSelectedTypes((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));
  };
  const toggleAmenity = (a) => {
    setPage(1);
    setSelectedAmenities((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));
  };

  const toggleSave = (acc) => {
    const isSaved = savedIds.has(acc.id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(acc.id);
      else next.add(acc.id);
      return next;
    });
    if (isSaved) favouriteApi.remove(acc.id);
    else favouriteApi.add(acc.id);
  };

  const open = (acc) => navigate('property-details', { id: acc.id });
  const uniShort = activeUni?.short || 'UZ';
  const gridColsClass =
    mapMode === 'split' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, pageIndex) => firstPage + pageIndex
  );

  return (
    <div className="ua-fade mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[32px] font-bold text-text-primary">
            Student homes near <span className="text-brand-primary">{uniShort}</span>
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {total} verified rooms &amp; houses · {activeUni?.city || 'Harare'} · prices in USD/month
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-bg-surface-alt p-1">
          {['split', 'hidden'].map((mode) => (
            <button
              key={mode}
              onClick={() => setMapMode(mode)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold ${
                mapMode === mode ? 'bg-brand-primaryDark text-white' : 'text-text-secondary'
              }`}
            >
              {mode === 'split' ? 'Map + list' : 'List'}
            </button>
          ))}
        </div>
      </div>

      {/* search bar */}
      <Card className="mb-3 flex flex-wrap items-center gap-2.5 p-3.5">
        <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-lg bg-bg-surface-alt px-3 py-2.5">
          <Search className="h-4 w-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search property, suburb or university"
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>
        <div className="relative flex items-center gap-1.5 rounded-lg bg-bg-surface-alt px-3 py-2.5">
          <GraduationCap className="h-4 w-4 flex-shrink-0 text-text-muted" />
          <button
            type="button"
            onClick={() => setUniversityMenuOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={universityMenuOpen}
            className="flex min-w-[112px] items-center justify-between gap-2 bg-transparent text-left text-sm font-semibold text-text-primary"
          >
            <span>{activeUni?.short || 'All universities'}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-text-muted" />
          </button>
          {universityMenuOpen && (
            <div
              role="listbox"
              aria-label="Select university"
              className="absolute right-0 top-[calc(100%+8px)] z-[70] grid max-h-[280px] min-w-[320px] grid-cols-3 gap-1 overflow-y-auto rounded-xl border border-border p-2 shadow-xl"
              style={{ backgroundColor: 'var(--bg-surface)', opacity: 1 }}
            >
              <button
                type="button"
                role="option"
                aria-selected={uniIdx === -1}
                onClick={() => {
                  setUniIdx(-1);
                  setCampus('');
                  setUniversityMenuOpen(false);
                }}
                className={`rounded-lg px-2 py-2 text-left text-xs font-semibold ${
                  uniIdx === -1 ? 'bg-brand-primaryDark text-white' : 'text-text-primary hover:bg-bg-surface-alt'
                }`}
              >
                All universities
              </button>
              {universities.map((u, i) => (
                <button
                  key={u.id}
                  type="button"
                  role="option"
                  aria-selected={uniIdx === i}
                  onClick={() => {
                    setUniIdx(i);
                    setCampus('');
                    setUniversityMenuOpen(false);
                  }}
                  className={`rounded-lg px-2 py-2 text-left text-xs font-semibold ${
                    uniIdx === i ? 'bg-brand-primaryDark text-white' : 'text-text-primary hover:bg-bg-surface-alt'
                  }`}
                  title={u.name}
                >
                  {u.short}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="font-num ml-auto flex items-center gap-2 text-xs font-semibold text-text-secondary">
          Max ${maxPrice}
          <input
            type="range"
            min={100}
            max={500}
            step={20}
            value={maxPrice}
            onChange={(e) => setMaxPrice(+e.target.value)}
            className="w-24 cursor-pointer accent-brand-primaryDark"
          />
        </div>
      </Card>

      {/* roommates */}
      <Card className="mb-3 flex flex-wrap items-center gap-2 p-3.5">
        <span className="font-display mr-1 text-xs font-bold tracking-wide text-text-secondary">Roommates:</span>
        {ROOMMATES.map((r) => (
          <Chip
            key={r.label}
            active={roommates === r.label}
            onClick={() => setRoommates(r.label)}
            style={r.label === 'Any' ? { color: 'var(--text-primary)' } : undefined}
          >
            <Users className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />
            {r.label}
          </Chip>
        ))}
      </Card>

      {/* type & amenities */}
      <Card className="mb-6 flex flex-wrap items-center gap-2 p-3.5">
        <span className="font-display mr-1 text-xs font-bold tracking-wide text-text-secondary">
          Type &amp; amenities:
        </span>
        {TYPES.map((tp) => (
          <Chip key={tp.value} active={selectedTypes.includes(tp.value)} onClick={() => toggleType(tp.value)}>
            <GraduationCap className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />
            {tp.label}
          </Chip>
        ))}
        {ALL_AMENITIES.map((aid) => (
          <Chip key={aid} active={selectedAmenities.includes(aid)} onClick={() => toggleAmenity(aid)}>
            <AmenityIcon id={aid} className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />
            {LABELS[aid]}
          </Chip>
        ))}
      </Card>

      {/* list + map */}
      <div className="flex items-start gap-5">
        <div className={mapMode === 'split' ? 'min-w-0 flex-1' : 'w-full'}>
          {loading ? (
            <div className="flex justify-center py-24 text-text-secondary">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Card className="py-16 text-center">
              <p className="font-bold text-text-primary">Couldn't load listings</p>
              <p className="mt-1 text-sm text-text-secondary">{error}</p>
              <button
                onClick={load}
                className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
              >
                <RotateCw className="h-4 w-4" /> Retry
              </button>
            </Card>
          ) : results.length === 0 ? (
            <div className="py-16 text-center text-text-secondary">
              <div className="mb-2 text-4xl">🔍</div>
              <p className="mb-1 font-bold text-text-primary">No homes match those filters</p>
              <p className="text-sm">Try raising the price or clearing a filter.</p>
            </div>
          ) : (
            <>
              <div className={`grid gap-5 ${gridColsClass}`}>
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

              {totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Listings pagination">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={page === 1}
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-primary transition-colors hover:bg-bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      aria-label={`Page ${pageNumber}`}
                      aria-current={page === pageNumber ? 'page' : undefined}
                      onClick={() => setPage(pageNumber)}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition-colors ${
                        page === pageNumber
                          ? 'border-brand-primaryDark bg-brand-primaryDark text-white'
                          : 'border-border text-text-primary hover:bg-bg-surface-alt'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={page === totalPages}
                    onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-primary transition-colors hover:bg-bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>

        {mapMode === 'split' && (
          <div className="hidden w-[40%] flex-shrink-0 lg:block">
            <Card className="sticky top-[100px] h-[calc(100vh-140px)] overflow-hidden p-0">
              {results.length ? (
                <ListingMap results={results} selectedId={selectedId} activeUni={activeUni} onSelect={open} />
              ) : (
                <div className="flex h-full items-center justify-center text-center text-text-muted">
                  <div>
                    <MapPin className="mx-auto mb-2 h-6 w-6" />
                    <p className="text-xs">Map view · sticky while you scroll</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
