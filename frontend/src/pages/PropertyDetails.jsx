import { useState, useEffect, useCallback } from 'react';
import {
  Heart, Star, Check, Lock, Unlock, Loader2, MapPin, MessageCircle,
  BedDouble, Bath, Users,
} from 'lucide-react';
import { useNavigation } from '../App';
import { accommodationApi, favouriteApi, threadApi, imageUrl, currentRole } from '../services/api';
import { AmenityIcon, ALL_AMENITIES, LABELS } from '../lib/amenityIcons';
import { formatAvailable } from '../components/listings/ListingCard';
import ApplyModal from '../components/ApplyModal';
import { ACCESS_FEE_LABEL } from '../lib/fees';
import { Card, PrimaryBtn, OutlineBtn } from '../components/kit';

const GREEN = '#2F8FB8', GREEN_SOFT = '#276E8C', BRICK = '#4DB6E2', YELLOW = '#F4C430', MINT = '#22C55E';
const GALLERY_BG = [
  `linear-gradient(135deg, ${BRICK}AA, ${BRICK}66)`,
  `linear-gradient(135deg, ${YELLOW}AA, ${YELLOW}66)`,
  `linear-gradient(135deg, ${MINT}AA, ${MINT}66)`,
];

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
    accommodationApi.getById(id).then(setAcc).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!id) return;
    setSaved(favouriteApi.has(id));
  }, [id]);

  const toggleSave = () => {
    setSaved((s) => !s);
    favouriteApi.has(id) ? favouriteApi.remove(id) : favouriteApi.add(id);
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

  const openApply = () => (localStorage.getItem('token') ? setApplyOpen(true) : navigate('auth'));

  if (loading) {
    return (
      <div className="flex justify-center pt-40 text-text-secondary">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (error || !acc) {
    return (
      <div className="mx-auto max-w-5xl px-6 pt-32 text-center">
        <p className="font-bold text-text-primary">{error || 'Property not found'}</p>
        <PrimaryBtn className="mx-auto mt-4" onClick={() => navigate('listings')}>Back to search</PrimaryBtn>
      </div>
    );
  }

  const unlocked = acc.access?.unlocked;
  const photos = (acc.images || []).map(imageUrl);
  const applyLabel = unlocked ? 'Apply now' : 'Unlock Contact';
  const specs = [
    [BedDouble, `${acc.bedrooms} bed`],
    [Bath, `${acc.bathrooms} bath`],
    [Users, `${acc.people_per_room}/room`],
    [Star, acc.rating ? acc.rating.toFixed(1) : 'New'],
  ];

  return (
    <div className="ua-fade pb-24 lg:pb-8">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => navigate('listings')} className="text-sm font-bold text-brand-primary">
            ← Back to listings
          </button>
          {isStudent && (
            <button
              onClick={toggleSave}
              className="flex items-center gap-2 rounded-xl border border-border bg-bg-surface px-4 py-2 text-sm font-bold text-text-primary"
            >
              <Heart className="h-[17px] w-[17px]" style={{ fill: saved ? BRICK : 'none', color: saved ? BRICK : '#94A3B8' }} />
              {saved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>

        {/* gallery */}
        <div className="mb-6 grid h-[300px] grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden rounded-2xl md:h-[360px]">
          <div className="col-span-2 row-span-2" style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_SOFT})` }}>
            {photos[0] && <img src={photos[0]} alt="" className="h-full w-full object-cover" />}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="hidden sm:block" style={{ background: GALLERY_BG[i - 1] }}>
              {photos[i] && <img src={photos[i]} alt="" className="h-full w-full object-cover" />}
            </div>
          ))}
          <div className="hidden items-center justify-center bg-bg-surface-alt sm:flex">
            {photos[4] ? (
              <img src={photos[4]} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-num text-xs text-text-muted">+{Math.max(photos.length - 4, 6)} photos</span>
            )}
          </div>
        </div>

        {/* title + price */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="font-num text-xs uppercase tracking-wide text-brand-primary">{acc.type} · Verified</span>
            <h1 className="font-display text-[30px] font-bold text-text-primary">{acc.title}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
              <MapPin className="h-3.5 w-3.5" />
              {acc.suburb} · {acc.university?.short} · {acc.walk_minutes} min walk to campus
            </p>
          </div>
          <div className="text-3xl font-extrabold text-text-primary">
            ${acc.price_per_month}
            <span className="text-sm font-medium text-text-secondary">/mo</span>
          </div>
        </div>

        {/* specs */}
        <div className="mb-8 flex flex-wrap gap-6 border-b border-border pb-6">
          {specs.map(([Icon, label]) => (
            <div key={label} className="flex items-center gap-2 text-text-secondary">
              <Icon className="h-4 w-4 text-brand-primary" />
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display mb-3 text-lg font-bold text-text-primary">About this place</h2>
            <p className="mb-6 text-sm leading-relaxed text-text-secondary">{acc.description}</p>

            {/* host */}
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-bg-surface-alt p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-accent text-sm font-extrabold text-brand-primaryDark">
                {(acc.landlord?.name || 'Host').split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-text-primary">
                  Hosted by {unlocked ? acc.landlord?.name : 'a verified host'}
                </div>
                <div className="text-xs text-text-secondary">Replies quickly · UniAcco verified</div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-success/15 px-3 py-1.5 text-xs font-bold text-success">
                <Check className="h-3 w-3" /> Verified
              </span>
            </div>

            <h2 className="font-display mb-3 text-lg font-bold text-text-primary">Amenities</h2>
            <div className="mb-6 grid grid-cols-2 gap-3">
              {ALL_AMENITIES.map((aid) => {
                const has = acc.amenities?.includes(aid);
                return (
                  <div
                    key={aid}
                    className={`flex items-center gap-2 text-sm ${has ? 'text-text-secondary' : 'text-text-muted line-through'}`}
                  >
                    <AmenityIcon id={aid} className={`h-4 w-4 ${has ? 'text-brand-primary' : 'text-text-muted'}`} />
                    {LABELS[aid]}
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl bg-bg-surface-alt p-4">
              <div className="font-display mb-1 text-sm font-bold text-text-primary">Walk to campus</div>
              <p className="text-xs text-text-secondary">
                {acc.walk_minutes} minutes on foot to {acc.university?.name || 'campus'} — {acc.lease_terms}.
              </p>
            </div>

            {acc.reviews?.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display mb-3 text-lg font-bold text-text-primary">Recent reviews</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {acc.reviews.map((r, i) => (
                    <Card key={i} className="p-4">
                      <div className="mb-2 flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/15 text-[13px] font-bold text-brand-primary">
                          {r.initials}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-text-primary">{r.author}</div>
                          <div className="text-xs text-text-muted">{r.when}</div>
                        </div>
                      </div>
                      <p className="text-[13px] leading-relaxed text-text-secondary">{r.text}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* sticky contact card (desktop) */}
          <div className="hidden lg:block">
            <Card className="sticky top-[100px] p-5">
              <div className="mb-1">
                <span className="text-2xl font-extrabold text-text-primary">${acc.price_per_month}</span>
                <span className="text-sm font-medium text-text-secondary">/month</span>
              </div>
              <p className="mb-4 text-xs text-text-secondary">
                {formatAvailable(acc.available_from)} · {acc.people_per_room} per room
              </p>

              {unlocked ? (
                <div className="mb-4 rounded-lg border border-success/30 bg-success/10 p-3">
                  <div className="mb-1.5 flex items-center gap-2 text-[13px] font-bold text-success">
                    <Unlock className="h-3.5 w-3.5" /> Contact unlocked
                  </div>
                  <div className="text-[13px] leading-relaxed text-text-secondary">
                    <strong className="text-text-primary">{acc.landlord?.name}</strong>
                    <br />
                    {acc.landlord?.phone}
                    <br />
                    {acc.landlord?.email}
                  </div>
                </div>
              ) : (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-brand-accent/20 px-3 py-2 text-xs font-semibold text-[#8A5A12] dark:text-brand-accentSoft">
                  <Lock className="h-3.5 w-3.5" /> Contact locked · {ACCESS_FEE_LABEL} to unlock
                </div>
              )}

              {isStudent ? (
                <>
                  <PrimaryBtn
                    className="mb-2 w-full"
                    onClick={openApply}
                    aria-label={applyLabel}
                  >
                    {applyLabel}
                  </PrimaryBtn>
                  <OutlineBtn className="w-full" onClick={messageHost}>
                    Message host
                  </OutlineBtn>
                  <p className="mt-3 text-center text-[11px] text-text-muted">One tap unlocks phone &amp; email</p>
                </>
              ) : (
                <p className="rounded-lg bg-bg-surface-alt px-3 py-3 text-center text-[13px] text-text-secondary">
                  Switch to a student account to apply.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* mobile bottom bar */}
      {isStudent && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-bg-surface p-3 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-lg font-extrabold leading-none text-text-primary">
                ${acc.price_per_month}
                <span className="text-xs font-medium text-text-secondary">/mo</span>
              </div>
            </div>
            <PrimaryBtn className="flex-1" onClick={openApply}>
              <MessageCircle className="h-4 w-4" /> {applyLabel}
            </PrimaryBtn>
          </div>
        </div>
      )}

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
