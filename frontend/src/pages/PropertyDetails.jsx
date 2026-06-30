import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  Heart,
  Star,
  Check,
  Lock,
  Unlock,
  Loader2,
  BedDouble,
  Bath,
  Users,
} from 'lucide-react';
import { useNavigation } from '../App';
import {
  accommodationApi,
  favouriteApi,
  threadApi,
  imageUrl,
  currentRole,
} from '../services/api';
import { AmenityIcon, ALL_AMENITIES, LABELS } from '../lib/amenityIcons';
import { gradientFor, formatAvailable } from '../components/listings/ListingCard';
import ApplyModal from '../components/ApplyModal';
import { ACCESS_FEE_LABEL } from '../lib/fees';

const GALLERY_GRADIENTS = [
  'linear-gradient(135deg,#cfe0ec,#a8c4d8)',
  'linear-gradient(135deg,#d8e3ee,#b3cbdd)',
  'linear-gradient(135deg,#d2dce8,#aec3d6)',
  'linear-gradient(135deg,#cdd9e6,#a6bdd2)',
];

const initialsOf = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

export default function PropertyDetails() {
  const { navigate, selectedId } = useNavigation();
  const id = selectedId || localStorage.getItem('selectedAccommodationId');
  const isStudent = currentRole() !== 'landlord';

  const [acc, setAcc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  const load = useCallback(() => {
    if (!id) {
      setError('No property selected');
      setLoading(false);
      return;
    }
    setLoading(true);
    accommodationApi
      .getById(id)
      .then(setAcc)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isStudent || !id || !localStorage.getItem('token')) return;
    favouriteApi
      .list()
      .then((items) => setSaved(items.some((a) => a.id === id)))
      .catch(() => {});
  }, [isStudent, id]);

  const toggleSave = async () => {
    if (!localStorage.getItem('token')) return navigate('auth');
    setSaved((s) => !s);
    try {
      saved ? await favouriteApi.remove(id) : await favouriteApi.add(id);
    } catch {
      setSaved((s) => !s);
    }
  };

  const messageHost = async () => {
    if (!localStorage.getItem('token')) return navigate('auth');
    try {
      await threadApi.start(id);
    } catch {
      /* thread may already exist */
    }
    navigate('messages');
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-40 text-text-secondary">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !acc) {
    return (
      <div className="mx-auto max-w-[1080px] px-6 pt-32 text-center">
        <p className="font-bold text-text-primary">{error || 'Property not found'}</p>
        <button
          onClick={() => navigate('listings')}
          className="mx-auto mt-4 rounded-xl bg-brand-primaryDark px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to search
        </button>
      </div>
    );
  }

  const unlocked = acc.access?.unlocked;
  const photos = (acc.images || []).map(imageUrl);
  const specs = [
    { k: 'Bedrooms', v: acc.bedrooms, Icon: BedDouble },
    { k: 'Bathrooms', v: acc.bathrooms, Icon: Bath },
    { k: 'Per room', v: acc.people_per_room, Icon: Users },
    { k: 'Rating', v: acc.rating ? acc.rating.toFixed(1) : 'New', Icon: Star },
  ];
  const leaseShort = (acc.lease_terms || '').toLowerCase().includes('semester')
    ? 'Per semester'
    : acc.lease_terms || '12 months';

  const applyLabel = unlocked ? 'Apply now' : `Pay ${ACCESS_FEE_LABEL} to unlock & apply`;

  return (
    <div className="ua-fade mx-auto max-w-[1080px] px-6 pb-20 pt-[92px]">
      <button
        onClick={() => navigate('listings')}
        className="mb-3 flex items-center gap-1.5 py-1.5 text-sm font-semibold text-text-secondary"
      >
        <ChevronLeft className="h-4 w-4" /> Back to search
      </button>

      <div className="mb-3.5 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display mb-1.5 text-[28px] font-extrabold tracking-tight text-text-primary">
            {acc.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 text-sm font-semibold text-text-secondary">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-brand-accent text-brand-accent" />
              {acc.rating ? acc.rating.toFixed(1) : 'New'} · {acc.reviews_count} reviews
            </span>
            <span className="text-border-strong">·</span>
            <span>{acc.suburb}</span>
            <span className="text-border-strong">·</span>
            <span className="text-brand-primaryDark">
              {acc.walk_minutes} min walk to {acc.university?.short}
            </span>
          </div>
        </div>
        {isStudent && (
          <button
            onClick={toggleSave}
            className="flex items-center gap-2 rounded-xl border border-border bg-bg-surface px-4 py-2.5 text-sm font-bold text-text-primary"
          >
            <Heart
              className="h-[17px] w-[17px]"
              style={{ fill: saved ? '#2F8FB8' : 'none', color: saved ? '#2F8FB8' : '#475569' }}
            />
            {saved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>

      {/* gallery */}
      <div
        className="grid h-[274px] gap-2.5 overflow-hidden rounded-[20px]"
        style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '132px 132px' }}
      >
        <div className="row-span-2" style={{ background: gradientFor(acc.id) }}>
          {photos[0] && <img src={photos[0]} alt="" className="h-full w-full object-cover" />}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative" style={{ background: GALLERY_GRADIENTS[i - 1] }}>
            {photos[i] && <img src={photos[i]} alt="" className="h-full w-full object-cover" />}
            {i === 4 && (
              <span className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.42)] text-sm font-bold text-white">
                +{Math.max(photos.length - 5, 9)} photos
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        className="mt-7 grid items-start gap-9"
        style={{ gridTemplateColumns: 'minmax(0,1fr) 350px' }}
      >
        <div>
          {/* specs */}
          <div className="flex gap-6 border-b border-border pb-5">
            {specs.map((s) => (
              <div key={s.k}>
                <div className="font-display text-[21px] font-extrabold text-text-primary">{s.v}</div>
                <div className="text-[13px] font-semibold text-text-secondary">{s.k}</div>
              </div>
            ))}
          </div>

          {/* host */}
          <div className="flex items-center gap-3.5 border-b border-border py-5">
            <div
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-[18px] font-extrabold text-[#4A3A00]"
              style={{ background: 'linear-gradient(135deg,#F4C430,#E0A800)' }}
            >
              {initialsOf(acc.landlord?.name || 'Host')}
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-bold text-text-primary">
                Hosted by {unlocked ? acc.landlord?.name : 'a verified host'}
              </div>
              <div className="text-[13px] text-text-secondary">Replies quickly · UniAcco verified</div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-[#E8F7EE] px-3 py-1.5 text-xs font-bold text-[#16A34A]">
              <Check className="h-3 w-3" /> Verified host
            </span>
          </div>

          {/* about */}
          <div className="border-b border-border py-5">
            <h3 className="font-display mb-2.5 text-[18px] font-bold text-text-primary">About this place</h3>
            <p className="text-[15px] leading-relaxed text-text-secondary" style={{ textWrap: 'pretty' }}>
              {acc.description}
            </p>
          </div>

          {/* amenities */}
          <div className="border-b border-border py-5">
            <h3 className="font-display mb-3.5 text-[18px] font-bold text-text-primary">
              What this place offers
            </h3>
            <div className="grid grid-cols-2 gap-3.5">
              {ALL_AMENITIES.filter((a) => a !== 'water').map((aid) => {
                const has = acc.amenities?.includes(aid);
                return (
                  <div
                    key={aid}
                    className="flex items-center gap-2.5 text-sm font-medium"
                    style={{ color: has ? '#1E293B' : '#94A3B8' }}
                  >
                    <span
                      className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px]"
                      style={{ background: has ? '#EAF6FB' : '#F1F5F9' }}
                    >
                      <AmenityIcon id={aid} className="h-4 w-4" />
                    </span>
                    <span style={{ textDecoration: has ? 'none' : 'line-through' }}>{LABELS[aid]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* reviews */}
          {acc.reviews?.length > 0 && (
            <div className="py-5">
              <h3 className="font-display mb-3.5 text-[18px] font-bold text-text-primary">Recent reviews</h3>
              <div className="grid grid-cols-2 gap-4">
                {acc.reviews.map((r, i) => (
                  <div key={i} className="rounded-[14px] border border-border bg-bg-surface p-4">
                    <div className="mb-2 flex items-center gap-2.5">
                      <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#DBEAFE] text-[13px] font-bold text-brand-primaryDark">
                        {r.initials}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-text-primary">{r.author}</div>
                        <div className="text-xs text-text-muted">{r.when}</div>
                      </div>
                    </div>
                    <p className="text-[13px] leading-relaxed text-text-secondary">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* apply card */}
        <aside className="sticky top-[100px] rounded-[20px] border border-border bg-bg-surface p-[22px] shadow-card">
          <div className="mb-1 flex items-baseline gap-1.5">
            <span className="font-display text-[27px] font-extrabold text-text-primary">
              ${acc.price_per_month}
            </span>
            <span className="font-semibold text-text-secondary">/month</span>
          </div>
          <p className="mb-4 text-[13px] text-text-secondary">
            {formatAvailable(acc.available_from)} · {acc.lease_terms}
          </p>

          {unlocked ? (
            <div className="mb-3.5 rounded-[13px] border border-[#86E0AB] bg-[#E8F7EE] p-3.5">
              <div className="mb-2 flex items-center gap-2 text-[13px] font-bold text-[#15803D]">
                <Unlock className="h-3.5 w-3.5" /> Full access unlocked
              </div>
              <div className="text-[13px] leading-relaxed text-[#166534]">
                <strong>{acc.landlord?.name}</strong>
                <br />
                {acc.landlord?.phone}
                <br />
                {acc.landlord?.email}
              </div>
            </div>
          ) : (
            <div className="mb-3.5 rounded-[13px] border border-brand-accent bg-[#FFF7E6] p-3.5">
              <div className="mb-1.5 flex items-center gap-2 text-[13px] font-bold text-[#92660B]">
                <Lock className="h-3.5 w-3.5" /> Contact locked
              </div>
              <p className="text-[12.5px] leading-relaxed text-[#92660B]">
                Unlock the landlord's phone, email &amp; full address with a one-time {ACCESS_FEE_LABEL} access fee via Pesepay.
              </p>
            </div>
          )}

          <div className="mb-3.5 overflow-hidden rounded-[13px] border border-border">
            <div className="flex">
              <div className="flex-1 border-r border-border px-3.5 py-2.5">
                <div className="text-[11px] font-bold uppercase text-text-muted">Move in</div>
                <div className="text-sm font-semibold text-text-primary">
                  {formatAvailable(acc.available_from)}
                </div>
              </div>
              <div className="flex-1 px-3.5 py-2.5">
                <div className="text-[11px] font-bold uppercase text-text-muted">Lease</div>
                <div className="text-sm font-semibold text-text-primary">{leaseShort}</div>
              </div>
            </div>
            <div className="border-t border-border px-3.5 py-2.5">
              <div className="text-[11px] font-bold uppercase text-text-muted">Sharing</div>
              <div className="text-sm font-semibold text-text-primary">
                {acc.people_per_room} per room
              </div>
            </div>
          </div>

          {isStudent ? (
            <>
              <button
                onClick={() => (localStorage.getItem('token') ? setApplyOpen(true) : navigate('auth'))}
                className="w-full rounded-[13px] bg-brand-primaryDark py-3.5 text-base font-bold text-white shadow-md transition-opacity hover:opacity-90"
              >
                {applyLabel}
              </button>
              <button
                onClick={messageHost}
                className="mt-2.5 w-full rounded-[13px] border border-border bg-bg-surface py-3 text-[15px] font-bold text-text-primary"
              >
                Message host
              </button>
            </>
          ) : (
            <p className="rounded-[13px] bg-bg-surface-alt px-3.5 py-3 text-center text-[13px] text-text-secondary">
              Switch to a student account to apply.
            </p>
          )}
          <p className="mt-3.5 text-center text-xs text-text-muted">You won't be charged rent yet</p>
        </aside>
      </div>

      {applyOpen && (
        <ApplyModal
          accommodation={acc}
          unlocked={unlocked}
          onClose={() => setApplyOpen(false)}
          onUnlocked={load}
          onDone={() => {
            setApplyOpen(false);
            navigate('messages');
          }}
        />
      )}
    </div>
  );
}
