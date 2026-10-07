import { createPortal } from 'react-dom';
import { X, Check, Minus } from 'lucide-react';
import { imageUrl } from '../../services/api';
import { useNavigation } from '../../App';
import { ACCESS_FEE_LABEL } from '../../lib/fees';

// Side-by-side comparison of two listings. Uses the data the listings page already has.
// Rendered into <body> so no page layout can push it off screen.
const row = (label, a, b, render = (v) => v) => (
  <tr key={label} className="border-t border-border">
    <th scope="row" className="w-[28%] py-3 pr-3 text-left align-top text-xs font-bold uppercase tracking-wide text-text-secondary">
      {label}
    </th>
    <td className="py-3 pr-3 align-top text-sm text-text-primary">{render(a)}</td>
    <td className="py-3 align-top text-sm text-text-primary">{render(b)}</td>
  </tr>
);

const yesNo = (v) =>
  v ? <Check className="h-4 w-4 text-success" aria-label="yes" /> : <Minus className="h-4 w-4 text-text-muted" aria-label="no" />;

export default function CompareModal({ items, onClose }) {
  const { navigate } = useNavigation();
  const [a, b] = items;
  const amenities = (x) => (x.amenities || []).join(', ') || 'None listed';
  const km = (x) => (x.distance_km != null ? `${x.distance_km} km` : 'Not measured');
  const photo = (x) =>
    x.images?.[0] ? (
      <img src={imageUrl(x.images[0])} alt="" className="h-28 w-full rounded-lg object-cover" />
    ) : (
      <div className="h-28 rounded-lg bg-brand-primaryDark" />
    );
  // Each home's contact: shown as unlocked, or with a button to unlock on its property page.
  const contact = (x) =>
    x.access?.unlocked ? (
      <span className="text-xs font-bold text-success">Contact unlocked</span>
    ) : (
      <div className="flex flex-col items-start gap-1.5">
        <span className="text-xs font-semibold text-[#8A5A12] dark:text-brand-accentSoft">Contact locked · {ACCESS_FEE_LABEL}</span>
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('property-details', { id: x.id });
          }}
          className="rounded-lg bg-brand-primaryDark px-3 py-1.5 text-xs font-bold text-white"
        >
          Unlock contact
        </button>
      </div>
    );

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.6)] p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Compare homes"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[22px] bg-bg-page shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-bg-page px-5 py-4">
          <h2 className="font-display text-lg font-extrabold text-text-primary">Compare homes</h2>
          <button
            onClick={onClose}
            aria-label="Close comparison"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-surface p-0 text-text-secondary"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-[28%]" />
                <th className="pb-3 pr-3 text-left align-top text-sm font-bold text-text-primary">
                  {photo(a)}
                  <div className="mt-2">{a.title}</div>
                </th>
                <th className="pb-3 text-left align-top text-sm font-bold text-text-primary">
                  {photo(b)}
                  <div className="mt-2">{b.title}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {row('Contact', a, b, contact)}
              {row('Price / month', a, b, (x) => `$${x.price_per_month}`)}
              {row('Distance to campus', a, b, km)}
              {row('Bedrooms', a, b, (x) => x.bedrooms)}
              {row('Bathrooms', a, b, (x) => x.bathrooms)}
              {row('Type', a, b, (x) => x.type || '—')}
              {row('Amenities', a, b, amenities)}
              {row('Verified landlord', a, b, (x) => yesNo(x.landlord_verified))}
              {row('Rating', a, b, (x) => (x.rating ? `${x.rating} (${x.reviews_count} reviews)` : 'No reviews yet'))}
              {row('Available', a, b, (x) => (x.available_from ? new Date(x.available_from).toLocaleDateString() : 'Now'))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  );
}
