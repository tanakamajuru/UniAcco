import { useState, useEffect } from 'react';
import { Heart, Check, Loader2 } from 'lucide-react';
import { useNavigation } from '../App';
import { authApi, favouriteApi, applicationApi, imageUrl } from '../services/api';
import { gradientFor } from '../components/listings/ListingCard';

const initialsOf = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

export default function Account() {
  const { navigate } = useNavigation();
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState([]);
  const [activeApps, setActiveApps] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('auth');
      return;
    }
    Promise.all([
      authApi.me().then((d) => d.user).catch(() => null),
      favouriteApi.list().catch(() => []),
      applicationApi.mine().catch(() => []),
    ])
      .then(([u, favs, apps]) => {
        setUser(u);
        setSaved(favs);
        setActiveApps(apps.filter((a) => a.application.status === 'pending').length);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const unsave = async (acc) => {
    setSaved((prev) => prev.filter((a) => a.id !== acc.id));
    try {
      await favouriteApi.remove(acc.id);
    } catch {
      favouriteApi.list().then(setSaved).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-40 text-text-secondary">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const profileRows = [
    { k: 'University', v: user?.universityId ? 'UZ' : '—' },
    { k: 'Budget', v: user?.budget || '$120–260' },
    { k: 'Move-in', v: user?.moveIn || 'Aug 2026' },
    { k: 'Applications', v: `${activeApps} active` },
  ];

  return (
    <div className="ua-fade mx-auto max-w-[1080px] px-4 pb-[70px] pt-6 sm:px-6">
      <div className="flex flex-wrap items-start gap-7">
        {/* profile card */}
        <div className="w-full flex-shrink-0 rounded-[20px] border border-border bg-bg-surface p-6 shadow-sm md:w-[290px]">
          <div
            className="mb-3.5 flex h-[72px] w-[72px] items-center justify-center rounded-full text-[26px] font-extrabold text-white"
            style={{ background: 'linear-gradient(135deg,#4DB6E2,#2F8FB8)' }}
          >
            {initialsOf(user?.fullName)}
          </div>
          <h2 className="font-display mb-0.5 text-[21px] font-extrabold text-text-primary">
            {user?.fullName || 'Student'}
          </h2>
          <p className="mb-3.5 text-[13px] text-text-secondary">
            {[user?.year, user?.course].filter(Boolean).join(' · ') || 'Student'}
          </p>
          {user?.isVerified && (
            <div className="mb-[18px] flex items-center gap-2 rounded-[10px] bg-[#E8F7EE] px-3 py-2.5">
              <Check className="h-4 w-4 text-[#15803D]" />
              <span className="text-[13px] font-bold text-[#15803D]">Verified student</span>
            </div>
          )}
          <div className="grid gap-3">
            {profileRows.map((r) => (
              <div key={r.k} className="flex justify-between text-[13px]">
                <span className="text-text-secondary">{r.k}</span>
                <span className="font-bold text-text-primary">{r.v}</span>
              </div>
            ))}
          </div>
          <button className="mt-[18px] w-full rounded-[11px] border border-border bg-bg-surface py-2.5 text-sm font-bold text-text-primary">
            Edit profile
          </button>
        </div>

        {/* saved homes */}
        <div className="min-w-[300px] flex-1">
          <h1 className="font-display mb-1 text-[27px] font-extrabold tracking-tight text-text-primary">
            Saved homes
          </h1>
          <p className="mb-5 text-sm text-text-secondary">
            {saved.length} places you're keeping an eye on
          </p>

          {saved.length > 0 ? (
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              {saved.map((acc) => {
                const photo = acc.images?.[0] ? imageUrl(acc.images[0]) : null;
                return (
                  <article
                    key={acc.id}
                    onClick={() => navigate('property-details', { id: acc.id })}
                    className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-sm"
                  >
                    <div className="relative h-[140px]" style={{ background: gradientFor(acc.id) }}>
                      {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          unsave(acc);
                        }}
                        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-primaryDark"
                        aria-label="Remove"
                      >
                        <Heart className="h-4 w-4 fill-brand-primaryDark" />
                      </button>
                    </div>
                    <div className="px-4 py-3">
                      <h3 className="font-display text-base font-bold text-text-primary">{acc.title}</h3>
                      <p className="mb-2 text-xs text-text-secondary">{acc.suburb}</p>
                      <span>
                        <span className="font-display text-[17px] font-extrabold text-text-primary">
                          ${acc.price_per_month}
                        </span>
                        <span className="text-xs text-text-secondary">/mo</span>
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-border-strong bg-bg-surface px-5 py-12 text-center">
              <Heart className="mx-auto mb-2 h-9 w-9 text-text-muted" />
              <p className="mb-1 font-bold text-text-primary">No saved homes yet</p>
              <p className="mb-4 text-sm text-text-secondary">
                Tap the heart on any listing to keep it here.
              </p>
              <button
                onClick={() => navigate('listings')}
                className="rounded-[11px] bg-brand-primary px-5 py-2.5 text-sm font-bold text-white"
              >
                Browse homes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
