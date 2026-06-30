import { Heart, Star, Lock, Unlock } from 'lucide-react';
import { imageUrl } from '../../services/api';
import { ACCESS_FEE_LABEL } from '../../lib/fees';

const GRADIENTS = [
  'linear-gradient(135deg,#bcd6e8,#7da9c8)',
  'linear-gradient(135deg,#c7dac9,#90b39a)',
  'linear-gradient(135deg,#d6cebc,#b09b78)',
  'linear-gradient(135deg,#c2cfe0,#94abc8)',
  'linear-gradient(135deg,#cdd9c6,#9bb592)',
  'linear-gradient(135deg,#d9d2c4,#b3a187)',
];

export const gradientFor = (id) => {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) % GRADIENTS.length;
  return GRADIENTS[h];
};

export const formatAvailable = (date) => {
  if (!date) return 'Available now';
  const d = new Date(date);
  if (d <= new Date()) return 'Avail. now';
  return `Avail. ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

export default function ListingCard({ acc, saved, onOpen, onToggleSave, onHover }) {
  const unlocked = acc.access?.unlocked;
  const photo = acc.images?.[0] ? imageUrl(acc.images[0]) : null;

  return (
    <article
      onClick={() => onOpen?.(acc)}
      onMouseEnter={() => onHover?.(acc)}
      className="group cursor-pointer overflow-hidden rounded-[18px] border border-border bg-bg-surface shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(47,143,184,0.14)]"
    >
      <div className="relative h-[180px]" style={{ background: gradientFor(acc.id) }}>
        {photo && (
          <img src={photo} alt={acc.title} className="h-full w-full object-cover" loading="lazy" />
        )}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(acc);
            }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md"
            aria-label={saved ? 'Remove from saved' : 'Save'}
          >
            <Heart
              className="h-[18px] w-[18px]"
              style={{ fill: saved ? '#2F8FB8' : 'none', color: saved ? '#2F8FB8' : '#475569' }}
            />
          </button>
        )}
        {acc.walk_minutes != null && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-[rgba(15,23,42,0.8)] px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {acc.walk_minutes} min walk to campus
          </span>
        )}
      </div>

      <div className="px-4 pb-4 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="whitespace-nowrap text-[11.5px] font-bold uppercase tracking-wide text-brand-primaryDark">
            {acc.type}
          </span>
          <span className="flex items-center gap-1 text-[13px] font-bold text-text-primary">
            <Star className="h-3.5 w-3.5 fill-brand-accent text-brand-accent" />
            {acc.rating ? acc.rating.toFixed(1) : 'New'}
          </span>
        </div>
        <h3 className="font-display mb-0.5 mt-1.5 text-[17px] font-bold tracking-tight text-text-primary">
          {acc.title}
        </h3>
        <p className="mb-3 text-[13px] text-text-secondary">
          {acc.suburb} · {acc.university?.short || acc.city}
        </p>
        <div className="flex items-center gap-2.5 text-[13px] font-semibold text-text-secondary">
          <span>{acc.bedrooms} bed</span>
          <span className="text-border-strong">·</span>
          <span>{acc.people_per_room}/room</span>
          <span className="text-border-strong">·</span>
          <span>{acc.bathrooms} bath</span>
        </div>

        <div className="mt-2.5">
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-bold"
            style={
              unlocked
                ? { background: '#E8F7EE', color: '#15803D' }
                : { background: '#FFF7E6', color: '#92660B' }
            }
          >
            {unlocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {unlocked ? 'Full access unlocked' : `Contact locked · ${ACCESS_FEE_LABEL} to unlock`}
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <span>
            <span className="font-display text-[20px] font-extrabold text-text-primary">
              ${acc.price_per_month}
            </span>
            <span className="text-[13px] font-semibold text-text-secondary">/mo</span>
          </span>
          <span className="text-xs text-text-secondary">{formatAvailable(acc.available_from)}</span>
        </div>
      </div>
    </article>
  );
}
