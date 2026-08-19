import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Check, Lock, Smartphone, CreditCard, Phone, MessageCircle } from 'lucide-react';
import { paymentApi } from '../services/api';
import { ACCESS_FEE, ACCESS_FEE_LABEL } from '../lib/fees';
import { telLink, whatsappLink } from '../lib/contact';

// Poll payment status until paid/failed or timeout. Returns the contact on success.
async function waitForPayment(reference, { tries = 20, interval = 1500 } = {}) {
  for (let i = 0; i < tries; i++) {
    const res = await paymentApi.status(reference);
    if (res.status === 'paid') return res.contact || {};
    if (res.status === 'failed') return null;
    await new Promise((r) => setTimeout(r, interval));
  }
  return null;
}

// Anonymous unlock: pay the access fee, then reveal the host's phone so the
// visitor can call / WhatsApp them directly. No account, no application row.
export default function UnlockModal({ accommodation, onClose, onUnlocked }) {
  const [phase, setPhase] = useState('form'); // form | processing | done
  const [payMethod, setPayMethod] = useState('mobile');
  const [provider, setProvider] = useState('ecocash');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [contact, setContact] = useState(null);

  const providerName = provider === 'ecocash' ? 'EcoCash' : 'InnBucks';

  const pay = async () => {
    setError(null);
    if (!email) {
      setError('Enter an email for your receipt.');
      return;
    }
    if (payMethod === 'mobile' && !phone) {
      setError(`Enter the ${providerName} number to charge.`);
      return;
    }
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

      if (payMethod === 'web' && init.redirectUrl && init.pollUrl !== 'SIMULATED') {
        // Hosted card/bank checkout in a new tab; keep polling here.
        window.open(init.redirectUrl, '_blank', 'noopener');
      }

      const paidContact = await waitForPayment(init.reference);
      if (!paidContact) throw new Error('Payment was not completed. Please try again.');

      setContact(paidContact);
      onUnlocked?.(paidContact);
      setPhase('done');
    } catch (e) {
      setError(e.message);
      setPhase('form');
    }
  };

  const input =
    'w-full rounded-[11px] border border-input-border bg-bg-surface px-3.5 py-3 text-sm text-text-primary outline-none focus:border-brand-primary';
  const label = 'mb-1.5 block text-sm font-bold text-text-primary';

  const tel = contact?.phone ? telLink(contact.phone) : null;
  const wa = contact?.phone
    ? whatsappLink(contact.phone, `Hi, I saw your listing "${accommodation.title}" on UniAcco.`)
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.6)] p-3 backdrop-blur-sm sm:p-6"
      style={{ animation: 'uaFade 0.25s ease both' }}
    >
      <div className="ua-pop flex max-h-[94vh] w-[520px] max-w-full flex-col overflow-hidden rounded-[22px] bg-[#F8FAFC] shadow-2xl dark:bg-[#0B1220]">
        {/* header */}
        <div className="flex items-center justify-between border-b border-border bg-[#F8FAFC] px-6 py-5 dark:bg-[#0B1220]">
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary"
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
                  const active = payMethod === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setPayMethod(m.key)}
                      className="flex-1 rounded-[13px] border-2 p-3.5 text-center transition-colors"
                      style={{ borderColor: active ? '#2F8FB8' : '#E2E8F0', background: active ? '#EAF6FB' : 'transparent' }}
                    >
                      <Icon className="mx-auto mb-1 h-5 w-5 text-text-primary" />
                      <div className="text-sm font-bold text-text-primary">{m.title}</div>
                      <div className="text-xs text-text-secondary">{m.sub}</div>
                    </button>
                  );
                })}
              </div>

              {payMethod === 'mobile' ? (
                <div className="ua-fade">
                  <label className={label}>Mobile money provider</label>
                  <div className="mb-3.5 flex gap-2">
                    {['ecocash', 'innbucks'].map((p) => {
                      const active = provider === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setProvider(p)}
                          className="flex-1 rounded-[10px] border-[1.5px] p-2.5 text-[13.5px] font-bold transition-colors"
                          style={{
                            borderColor: active ? '#2F8FB8' : '#E2E8F0',
                            background: active ? '#EAF6FB' : 'transparent',
                            color: active ? '#2F8FB8' : '#475569',
                          }}
                        >
                          {p === 'ecocash' ? 'EcoCash' : 'InnBucks'}
                        </button>
                      );
                    })}
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

              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand-accent bg-[#FFF7E6] px-4 py-3.5">
                <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#92660B]" />
                <p className="text-[12.5px] leading-relaxed text-[#92660B]">
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

          {phase === 'done' && (
            <div className="ua-pop px-8 pb-9 pt-9 text-center">
              <div className="mx-auto mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#E8F7EE]">
                <Check className="h-9 w-9 text-success" strokeWidth={2.6} />
              </div>
              <h3 className="font-display mb-2 text-[23px] font-extrabold text-text-primary">You're unlocked 🎉</h3>
              <p className="mb-4 text-[15px] leading-relaxed text-text-secondary">
                Reach {contact?.name || 'the host'} directly to arrange a viewing.
              </p>

              <div className="mb-5 rounded-[13px] border border-[#86E0AB] bg-[#E8F7EE] p-4 text-left text-[13px] leading-relaxed">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#15803D]">
                  <Check className="h-3 w-3" /> Host contact
                </div>
                <div className="mt-2 space-y-1 text-[#166534]">
                  {contact?.name && <div><strong>{contact.name}</strong></div>}
                  {contact?.phone && <div>📞 {contact.phone}</div>}
                  {contact?.email && <div>✉️ {contact.email}</div>}
                </div>
              </div>

              <div className="flex gap-3">
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
            </div>
          )}
        </div>

        {/* footer */}
        {phase === 'form' && (
          <div className="flex justify-between gap-3 border-t border-border bg-[#F8FAFC] px-6 py-4 dark:bg-[#0B1220]">
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
