import { useState, useEffect } from 'react';
import { Search, ArrowRight, Star } from 'lucide-react';
import { fetchAccommodations } from '../utils/api';
import { universityApi, imageUrl } from '../services/api';
import { useNavigation } from '../App';
import { Card, PrimaryBtn, StatCard } from '../components/kit';

// Map an API accommodation into the shape the featured cards render.
const toFeatured = (p) => ({
  id: p.id,
  name: p.title || 'Property',
  loc: `${p.suburb || p.city || ''}${p.university?.short ? ` · ${p.university.short}` : ''}`,
  price: p.price_per_month ?? 0,
  walk: p.walk_minutes ? `${p.walk_minutes} min walk` : 'On campus',
  image: (p.images ?? []).map(imageUrl).filter(Boolean)[0] || null,
});

const GREEN = '#2F8FB8';
const GREEN_SOFT = '#276E8C';

export default function Home() {
  const { navigate } = useNavigation();
  const [university, setUniversity] = useState('');
  const [campus, setCampus] = useState('');
  const [query, setQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    universityApi.getAll().then(setUniversities).catch(() => setUniversities([]));
  }, []);

  useEffect(() => {
    fetchAccommodations({ is_available: true })
      .then((data) => setFeatured((data || []).slice(0, 3).map(toFeatured)))
      .catch(() => setFeatured([]));
  }, []);

  const campuses = universities.find((u) => u.short === university)?.campuses || [];

  const runSearch = () => {
    if (query) localStorage.setItem('searchQuery', query);
    if (university) localStorage.setItem('searchUniversity', university);
    navigate('listings');
  };

  return (
    <div>
      {/* Hero + search board */}
      <section className="relative overflow-hidden px-6 pb-10 pt-14 text-center">
        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="font-num text-[11px] tracking-wide text-brand-primary">
            {universities.length ? `${universities.length} universities` : 'Verified student housing'} · Zimbabwe
          </span>
          <h1 className="font-display mb-5 mt-3 text-[38px] font-bold leading-[1.02] text-text-primary md:text-[58px]">
            Find Your Perfect
            <br />
            <span className="text-brand-primary">Student Home</span>
          </h1>
          <p className="mx-auto mb-9 max-w-xl text-base text-text-secondary">
            Discover comfortable, affordable accommodation near your campus — every listing verified before it goes live.
          </p>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-lg md:flex-row">
            <div className="flex-1 border-b border-border px-5 py-4 text-left md:border-b-0 md:border-r">
              <div className="font-display mb-1 text-[10.5px] tracking-wide text-text-muted">University</div>
              <select
                value={university}
                onChange={(e) => {
                  setUniversity(e.target.value);
                  setCampus('');
                }}
                className="w-full bg-transparent text-sm font-medium text-text-primary outline-none"
              >
                <option value="">All Universities</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.short}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 border-b border-border px-5 py-4 text-left md:border-b-0 md:border-r">
              <div className="font-display mb-1 text-[10.5px] tracking-wide text-text-muted">Campus / Location</div>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                disabled={!campuses.length}
                className="w-full bg-transparent text-sm font-medium text-text-primary outline-none disabled:opacity-60"
              >
                <option value="">All Campuses</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-[1.4] px-5 py-4 text-left">
              <div className="font-display mb-1 text-[10.5px] tracking-wide text-text-muted">
                Search Location or Property
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                placeholder="Enter area, street name..."
                className="w-full bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-muted"
              />
            </div>
            <button
              onClick={runSearch}
              className="flex items-center justify-center bg-brand-primary px-8 py-4 font-bold text-white transition-opacity hover:opacity-90"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust stats */}
      <section className="border-y border-border bg-bg-surface-alt px-6 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-5 md:grid-cols-4">
          <StatCard value="500+" label="Active Listings" />
          <StatCard value="2,000+" label="Happy Students" />
          <StatCard value={universities.length ? `${universities.length}+` : '15+'} label="Universities" />
          <StatCard value="4.7★" label="Average Rating" />
        </div>
      </section>

      {/* Featured */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-[26px] font-bold text-text-primary">Featured Properties</h2>
              <p className="mt-1 text-sm text-text-secondary">Handpicked, verified this week</p>
            </div>
            <button
              onClick={() => navigate('listings')}
              className="flex items-center gap-1 text-sm font-bold text-brand-primary"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featured.map((p) => (
              <Card
                key={p.id}
                className="cursor-pointer overflow-hidden"
                onClick={() => navigate('property-details', { id: p.id })}
              >
                <div
                  className="relative h-36"
                  style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_SOFT})` }}
                >
                  {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                  <span className="absolute left-2 top-2 rounded-md bg-brand-accent px-2 py-0.5 text-[10px] font-bold text-brand-primaryDark">
                    Verified
                  </span>
                  <span className="font-num absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] text-white">
                    {p.walk}
                  </span>
                </div>
                <div className="p-4">
                  <div className="mb-1 text-sm font-bold text-text-primary">{p.name}</div>
                  <div className="mb-2 text-xs text-text-secondary">{p.loc}</div>
                  <div className="font-num text-sm font-bold text-brand-primary">${p.price}/mo</div>
                </div>
              </Card>
            ))}
            {featured.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-text-secondary">
                Loading featured homes…
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Host CTA */}
      <section className="bg-brand-primaryDark px-6 py-16 text-center">
        <h2 className="font-display mb-3 text-[28px] font-bold text-white">Own a Property Near Campus?</h2>
        <p className="mx-auto mb-6 max-w-md text-sm text-white/80">
          List your accommodation and connect with verified students looking for their perfect home.
        </p>
        <PrimaryBtn onClick={() => navigate('list-your-property')}>List Your Property</PrimaryBtn>
      </section>
    </div>
  );
}
