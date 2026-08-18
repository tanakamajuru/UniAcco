import { Heart, Star, Lock, Unlock } from 'lucide-react';
import { imageUrl } from '../../services/api';
import { ACCESS_FEE_LABEL } from '../../lib/fees';

// Brand green gradient used as the photo placeholder across the app.
export const gradientFor = () => 'linear-gradient(135deg,#2F8FB8,#276E8C)';

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
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(47,143,184,0.14)]"
    >
      <div className="relative h-40" style={{ background: gradientFor(acc.id) }}>
        {photo && <img src={photo} alt={acc.title} className="h-full w-full object-cover" loading="lazy" />}
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
          <span className="font-num absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] text-white">
            {acc.walk_minutes} min walk to campus
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-num whitespace-nowrap text-[10px] uppercase tracking-wide text-brand-primary">
            {acc.type}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-brand-accent">
            <Star className="h-3 w-3 fill-current" />
            {acc.rating ? acc.rating.toFixed(1) : 'New'}
          </span>
        </div>
        <h3 className="mb-1 text-sm font-bold text-text-primary">{acc.title}</h3>
        <p className="mb-3 text-xs text-text-secondary">
          {acc.suburb} · {acc.university?.short || acc.city}
        </p>

        <div
          className={`mb-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
            unlocked
              ? 'bg-success/15 text-success'
              : 'bg-brand-accent/20 text-[#8A5A12] dark:text-brand-accentSoft'
          }`}
        >
          {unlocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          {unlocked ? 'Full access unlocked' : `Contact locked · ${ACCESS_FEE_LABEL} to unlock`}
        </div>

        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-lg font-extrabold text-text-primary">
            ${acc.price_per_month}
            <span className="text-xs font-medium text-text-secondary">/mo</span>
          </span>
          <span className="font-num text-[11px] text-text-muted">{formatAvailable(acc.available_from)}</span>
        </div>
      </div>
    </article>
  );
}
