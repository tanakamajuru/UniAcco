// Shared UI primitives matching the UniAcco preview design.
// Token-based (no `t` prop): brand-primaryDark = nav/green, brand-primary = brick/blue CTA,
// brand-accent = gold. Headings use font-display (Sora); numerals use font-num.

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`rounded-2xl border border-border bg-bg-surface shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Chip({ active, children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-[11px] border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
        active
          ? 'border-brand-primaryDark bg-brand-primaryDark text-white'
          : 'border-border bg-bg-surface text-text-secondary hover:bg-bg-surface-alt'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function PrimaryBtn({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`font-display inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold tracking-[0.02em] text-white transition-opacity hover:opacity-90 ${className}`}
    >
      {children}
    </button>
  );
}

export function OutlineBtn({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`font-display inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-primaryDark bg-transparent px-5 py-3 text-sm font-bold tracking-[0.02em] text-brand-primaryDark transition-colors hover:bg-brand-primaryDark/5 ${className}`}
    >
      {children}
    </button>
  );
}

export function StatCard({ value, label }) {
  return (
    <Card className="p-6 text-center">
      <div className="font-display mb-1 text-3xl font-bold text-brand-primary">{value}</div>
      <div className="font-num text-[11px] uppercase tracking-wide text-text-secondary">{label}</div>
    </Card>
  );
}
