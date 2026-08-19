import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Loader2, Check, Lock, Smartphone, CreditCard, Phone, MessageCircle, AlertTriangle, Clock,
} from 'lucide-react';
import { paymentApi } from '../services/api';
import { ACCESS_FEE, ACCESS_FEE_LABEL } from '../lib/fees';
import { telLink, whatsappLink } from '../lib/contact';

// Poll payment status until settled or timeout.
// Returns { status: 'paid' | 'failed' | 'timeout', contact }.
async function waitForPayment(reference, { tries = 20, interval = 1500 } = {}) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await paymentApi.status(reference);
      if (res.status === 'paid') return { status: 'paid', contact: res.contact || {} };
      if (res.status === 'failed' || res.status === 'cancelled') return { status: 'failed' };
    } catch {
      /* transient network/gateway hiccup — keep polling */
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  return { status: 'timeout' };
}

// Anonymous unlock: pay the access fee, then reveal the host's phone so the
// visitor can call / WhatsApp them directly. No account, no application row.
export default function UnlockModal({ accommodation, onClose, onUnlocked }) {
  const [phase, setPhase] = useState('form'); // form | processing | done | pending | failed
  const [payMethod, setPayMethod] = useState('mobile');
  const [provider, setProvider] = useState('ecocash');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [contact, setContact] = useState(null);
  const [reference, setReference] = useState(null);
  const [rechecking, setRechecking] = useState(false);

  const providerName = provider === 'ecocash' ? 'EcoCash' : 'InnBucks';

  const settle = (result) => {
    if (result.status === 'paid') {
      setContact(result.contact);
      onUnlocked?.(result.contact);
      setPhase('done');
    } else if (result.status === 'failed') {
      setPhase('failed');
    } else {
      setPhase('pending'); // timeout — money may have moved; keep the reference
    }
  };

  const pay = async () => {
    setError(null);
    if (!email) return setError('Enter an email for your receipt.');
    if (payMethod === 'mobile' && !phone) return setError(`Enter the ${providerName} number to charge.`);

    setPhase('processing');
    try {
      const init = await paymentApi.initiate({
        accommodationId: accommodation.id,
        feature: 'accommodation_details',
        amount: ACCESS_FEE,
        email,
        paymentMethod: payMethod,
        phone: payMethod === 'mobile' ? phone : undefined,
        method: payMethod === 'mobile' ? provider : undefined,
      });
      setReference(init.reference);

      if (payMethod === 'web' && init.redirectUrl && init.pollUrl !== 'SIMULATED') {
        window.open(init.redirectUrl, '_blank', 'noopener'); // hosted card/bank checkout
      }

      // Mobile money (EcoCash/InnBucks) approval can take well over a minute, so
      // poll longer before falling back to the "still confirming" screen.
      const window_ =
        payMethod === 'mobile' ? { tries: 60, interval: 2500 } : { tries: 40, interval: 2000 };
      settle(await waitForPayment(init.reference, window_));
    } catch (e) {
      setError(e.message || 'We could not start the payment. Please try again.');
      setPhase('form');
    }
  };

  // Re-check a payment we have a reference for (used from the pending screen).
  const recheck = async () => {
    if (!reference) return;
    setRechecking(true);
    try {
      const res = await paymentApi.status(reference);
      if (res.status === 'paid') {
        setContact(res.contact || {});
        onUnlocked?.(res.contact || {});
        setPhase('done');
      } else if (res.status === 'failed' || res.status === 'cancelled') {
        setPhase('failed');
      }
    } catch {
      /* leave the user on the pending screen to try again */
    } finally {
      setRechecking(false);
    }
  };

  const input =
    'w-full rounded-[11px] border border-input-border bg-bg-surface px-3.5 py-3 text-sm text-text-primary outline-none focus:border-brand-primary';
  const label = 'mb-1.5 block text-sm font-bold text-text-primary';
  // Theme-aware selectable chip (readable in light and dark).
  const chip = (active) =>
    `transition-colors ${
      active
        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
        : 'border-border bg-bg-surface text-text-secondary'
    }`;

  const tel = contact?.phone ? telLink(contact.phone) : null;
  const wa = contact?.phone
    ? whatsappLink(contact.phone, `Hi, I saw your listing "${accommodation.title}" on UniAcco.`)
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.6)] p-3 backdrop-blur-sm sm:p-6"
      style={{ animation: 'uaFade 0.25s ease both' }}
    >
      <div className="ua-pop flex max-h-[94vh] w-[520px] max-w-full flex-col overflow-hidden rounded-[22px] bg-bg-page shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-border bg-bg-page px-6 py-5">
          <div>
            <div className="font-display text-[19px] font-extrabold text-text-primary">
              {phase === 'done' ? 'Contact unlocked ✓' : 'Unlock host contact'}
            </div>
            <div className="text-[13px] text-text-secondary">
              {accommodation.title} · ${accommodation.price_per_month}/mo
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary hover:text-text-primary"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="overflow-auto">
          {phase === 'form' && (
            <div className="px-6 py-5">
              {error && (
                <div className="mb-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}

              <div className="mb-[18px] flex items-center justify-between rounded-[13px] border border-border bg-bg-surface px-4 py-3.5">
                <div>
                  <div className="text-sm font-bold text-text-primary">Access fee (one-time)</div>
                  <div className="text-xs text-text-secondary">Reveals the host's phone — call or WhatsApp them directly</div>
                </div>
                <div className="font-display text-[22px] font-extrabold text-brand-primaryDark">{ACCESS_FEE_LABEL}</div>
              </div>

              <label className={label}>Payment method</label>
              <div className="mb-4 flex gap-2.5">
                {[
                  { key: 'mobile', icon: Smartphone, title: 'Mobile money', sub: 'EcoCash / InnBucks' },
                  { key: 'web', icon: CreditCard, title: 'Card or bank', sub: 'Visa · Mastercard' },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setPayMethod(m.key)}
                      className={`flex-1 rounded-[13px] border-2 p-3.5 text-center ${chip(payMethod === m.key)}`}
                    >
                      <Icon className="mx-auto mb-1 h-5 w-5" />
                      <div className="text-sm font-bold">{m.title}</div>
                      <div className="text-xs opacity-80">{m.sub}</div>
                    </button>
                  );
                })}
              </div>

              {payMethod === 'mobile' ? (
                <div className="ua-fade">
                  <label className={label}>Mobile money provider</label>
                  <div className="mb-3.5 flex gap-2">
                    {['ecocash', 'innbucks'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setProvider(p)}
                        className={`flex-1 rounded-[10px] border-[1.5px] p-2.5 text-[13.5px] font-bold ${chip(provider === p)}`}
                      >
                        {p === 'ecocash' ? 'EcoCash' : 'InnBucks'}
                      </button>
                    ))}
                  </div>
                  <label className={label}>{providerName} number</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={`${input} mb-3.5`} placeholder="077X XXX XXX or 071X XXX XXX" />
                  <label className={label}>Email for receipt</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="you@email.com" />
                  <p className="mt-2.5 text-xs text-text-secondary">
                    You'll get a prompt on your phone to approve the {providerName} payment.
                  </p>
                </div>
              ) : (
                <div className="ua-fade">
                  <label className={label}>Email for receipt</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="you@email.com" />
                  <p className="mt-2.5 text-xs text-text-secondary">
                    You'll be taken to Pesepay to pay securely by Visa, Mastercard or bank transfer.
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand-accent bg-brand-accent/10 px-4 py-3.5">
                <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-accent" />
                <p className="text-[12.5px] leading-relaxed text-text-secondary">
                  No account needed. Only the {ACCESS_FEE_LABEL} access fee is charged now — rent is arranged
                  directly with the verified host.
                </p>
              </div>
            </div>
          )}

          {phase === 'processing' && (
            <div className="px-8 py-11 text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-brand-primaryDark" />
              <h3 className="font-display mb-1.5 text-[18px] font-bold text-text-primary">
                {payMethod === 'mobile' ? 'Check your phone' : 'Opening Pesepay'}
              </h3>
              <p className="text-sm text-text-secondary">
                {payMethod === 'mobile'
                  ? `Approve the ${providerName} prompt to confirm ${ACCESS_FEE_LABEL}`
                  : `Completing your secure ${ACCESS_FEE_LABEL} payment...`}
              </p>
            </div>
          )}

          {phase === 'pending' && (
            <div className="px-8 py-10 text-center">
              <div className="mx-auto mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-brand-accent/15">
                <Clock className="h-9 w-9 text-brand-accent" />
              </div>
              <h3 className="font-display mb-2 text-[20px] font-extrabold text-text-primary">Still confirming…</h3>
              <p className="mb-4 text-[14px] leading-relaxed text-text-secondary">
                We haven't had confirmation from Pesepay yet. If you were charged, don't pay again — your
                access unlocks automatically once the payment clears. Check again in a moment.
              </p>
              {reference && (
                <div className="mb-5 rounded-lg border border-border bg-bg-surface px-3 py-2 text-[12.5px] text-text-secondary">
                  Keep this reference for support: <strong className="text-text-primary">{reference}</strong>
                </div>
              )}
              <button
                onClick={recheck}
                disabled={rechecking}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-[15px] font-bold text-white disabled:opacity-60"
              >
                {rechecking && <Loader2 className="h-4 w-4 animate-spin" />}
                {rechecking ? 'Checking…' : 'Check again'}
              </button>
            </div>
          )}

          {phase === 'failed' && (
            <div className="px-8 py-10 text-center">
              <div className="mx-auto mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-error/10">
                <AlertTriangle className="h-9 w-9 text-error" />
              </div>
              <h3 className="font-display mb-2 text-[20px] font-extrabold text-text-primary">Payment not completed</h3>
              <p className="mb-4 text-[14px] leading-relaxed text-text-secondary">
                The payment was declined or cancelled, so nothing was charged for access. You can try again.
              </p>
              {reference && (
                <div className="mb-5 rounded-lg border border-border bg-bg-surface px-3 py-2 text-[12.5px] text-text-secondary">
                  Reference: <strong className="text-text-primary">{reference}</strong>
                </div>
              )}
              <button
                onClick={() => { setError(null); setPhase('form'); }}
                className="rounded-xl bg-brand-primary px-6 py-3 text-[15px] font-bold text-white"
              >
                Try again
              </button>
            </div>
          )}

          {phase === 'done' && (
            <div className="ua-pop px-8 pb-8 pt-9 text-center">
              <div className="mx-auto mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-success/15">
                <Check className="h-9 w-9 text-success" strokeWidth={2.6} />
              </div>
              <h3 className="font-display mb-2 text-[23px] font-extrabold text-text-primary">You're unlocked 🎉</h3>
              <p className="mb-4 text-[15px] leading-relaxed text-text-secondary">
                Reach {contact?.name || 'the host'} directly to arrange a viewing.
              </p>

              <div className="mb-5 rounded-[13px] border border-success/40 bg-success/10 p-4 text-left text-[13px] leading-relaxed">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-success">
                  <Check className="h-3 w-3" /> Host contact
                </div>
                <div className="mt-2 space-y-1 text-text-primary">
                  {contact?.name && <div><strong>{contact.name}</strong></div>}
                  {contact?.phone && <div>📞 {contact.phone}</div>}
                  {contact?.email && <div>✉️ {contact.email}</div>}
                </div>
              </div>

              <div className="mb-3 flex gap-3">
                {tel && (
                  <a
                    href={tel}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-bg-surface py-3 text-[15px] font-bold text-text-primary"
                  >
                    <Phone className="h-4 w-4" /> Call host
                  </a>
                )}
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-[15px] font-bold text-white"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-xl border border-border bg-bg-surface py-3 text-[15px] font-bold text-text-primary"
              >
                View property details
              </button>
            </div>
          )}
        </div>

        {/* footer (form only) */}
        {phase === 'form' && (
          <div className="flex justify-between gap-3 border-t border-border bg-bg-page px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-xl border border-border bg-bg-surface px-5 py-3 text-[15px] font-bold text-text-secondary"
            >
              Cancel
            </button>
            <button
              onClick={pay}
              className="rounded-xl bg-brand-primary px-7 py-3 text-[15px] font-bold text-white shadow-md"
            >
              Pay {ACCESS_FEE_LABEL}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
