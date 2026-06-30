import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Check, Lock, Smartphone, CreditCard } from 'lucide-react';
import { authApi, paymentApi, applicationApi, accommodationApi } from '../services/api';
import { ACCESS_FEE, ACCESS_FEE_LABEL } from '../lib/fees';

const STEPS = ['Your details', 'Payment', 'Review'];

// Poll payment status until paid/failed or timeout.
async function waitForPayment(reference, { tries = 20, interval = 1500 } = {}) {
  for (let i = 0; i < tries; i++) {
    const res = await paymentApi.status(reference);
    if (res.status === 'paid') return true;
    if (res.status === 'failed') return false;
    await new Promise((r) => setTimeout(r, interval));
  }
  return false;
}

export default function ApplyModal({ accommodation, unlocked, onClose, onUnlocked, onDone }) {
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState('form'); // form | processing | done
  const [payMethod, setPayMethod] = useState('mobile');
  const [provider, setProvider] = useState('ecocash');
  const [error, setError] = useState(null);
  // Refreshed accommodation data (with landlord) after successful payment
  const [freshAcc, setFreshAcc] = useState(null);
  const displayAcc = freshAcc || accommodation;

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    year: '',
    moveInDate: '',
    message: '',
  });

  useEffect(() => {
    authApi
      .me()
      .then((d) =>
        setForm((f) => ({
          ...f,
          fullName: d.user.fullName || '',
          email: d.user.email || '',
          phone: d.user.phone || '',
          year: d.user.year || '',
        }))
      )
      .catch(() => { });
  }, []);

  // If already unlocked, "apply" skips payment.
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const providerName = provider === 'ecocash' ? 'EcoCash' : 'InnBucks';
  const lastStep = unlocked ? 1 : 3;

  const submitApplication = async () => {
    await applicationApi.create({
      accommodationId: accommodation.id,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      yearOfStudy: form.year,
      moveInDate: form.moveInDate || undefined,
      message: form.message,
    });
  };

  const handleNext = async () => {
    setError(null);

    // Already unlocked → just submit the application.
    if (unlocked) {
      setPhase('processing');
      try {
        await submitApplication();
        setPhase('done');
        onUnlocked?.();
      } catch (e) {
        setError(e.message);
        setPhase('form');
      }
      return;
    }

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Final step: pay then apply.
    setPhase('processing');
    try {
      const init = await paymentApi.initiate({
        accommodationId: accommodation.id,
        feature: 'accommodation_details',
        amount: ACCESS_FEE,
        email: form.email,
        paymentMethod: payMethod,
        phone: payMethod === 'mobile' ? form.phone : undefined,
        method: payMethod === 'mobile' ? provider : undefined,
      });

      if (payMethod === 'web' && init.redirectUrl && init.pollUrl !== 'SIMULATED') {
        // Hosted card/bank checkout — open Pesepay in a new tab and keep
        // polling here so we can finalise the application once it's paid.
        window.open(init.redirectUrl, '_blank', 'noopener');
      }

      const paid = await waitForPayment(init.reference);
      if (!paid) throw new Error('Payment was not completed. Please try again.');

      await submitApplication();
      window.dispatchEvent(
        new CustomEvent('paymentSuccessful', {
          detail: { reference: init.reference, data: { accommodationId: accommodation.id } },
        })
      );

      // Fetch fresh accommodation data (landlord now visible) to show in done screen
      try {
        const updated = await accommodationApi.getById(accommodation.id);
        setFreshAcc(updated);
      } catch {
        // Non-critical: success screen will still show without contact details
      }

      setPhase('done');
      // Silently refresh the parent page in the background
      onUnlocked?.();
    } catch (e) {
      setError(e.message);
      setPhase('form');
    }
  };

  const handleBack = () => {
    if (unlocked || step === 1) onClose();
    else setStep(step - 1);
  };

  const heading =
    phase === 'done' ? 'Application sent ✓' : step === 2 ? 'Unlock & apply' : 'Apply to rent';

  const input =
    'w-full rounded-[11px] border border-input-border bg-bg-surface px-3.5 py-3 text-sm text-text-primary outline-none focus:border-brand-primary';
  const label = 'mb-1.5 block text-sm font-bold text-text-primary';

  // Rendered through a portal to document.body so the fixed overlay covers the
  // full viewport — the PropertyDetails container has a CSS transform (.ua-fade)
  // which would otherwise become the containing block for `position: fixed`.
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.55)] p-6 backdrop-blur-sm" style={{ animation: 'uaFade 0.25s ease both' }}>
      <div className="ua-pop flex max-h-[92vh] w-[580px] max-w-full flex-col overflow-hidden rounded-[22px] bg-bg-page shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-border bg-bg-page px-6 py-5">
          <div>
            <div className="font-display text-[19px] font-extrabold text-text-primary">{heading}</div>
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
          {/* progress */}
          {phase === 'form' && !unlocked && (
            <div className="px-6 pt-5">
              <div className="mb-5 flex gap-2">
                {STEPS.map((s, i) => {
                  const active = step >= i + 1;
                  return (
                    <div key={s} className="flex-1">
                      <div
                        className="h-[5px] rounded"
                        style={{ background: active ? '#2F8FB8' : '#E2E8F0' }}
                      />
                      <div
                        className="mt-1.5 text-xs font-bold"
                        style={{ color: active ? '#2F8FB8' : '#94A3B8' }}
                      >
                        {s}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* body */}
          {phase === 'form' && (
            <div className="px-6 pb-6">
              {error && (
                <div className="mb-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}

              {(step === 1 || unlocked) && (
                <div className="ua-fade">
                  <label className={label}>Full name</label>
                  <input value={form.fullName} onChange={set('fullName')} className={input} placeholder="Tariro Moyo" />
                  <div className="mt-4 flex gap-3">
                    <div className="flex-1">
                      <label className={label}>University email</label>
                      <input value={form.email} onChange={set('email')} className={input} placeholder="t.moyo@students.uz.ac.zw" />
                    </div>
                    <div className="flex-1">
                      <label className={label}>Phone</label>
                      <input value={form.phone} onChange={set('phone')} className={input} placeholder="077X XXX XXX" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <div className="flex-1">
                      <label className={label}>Year of study</label>
                      <input value={form.year} onChange={set('year')} className={input} placeholder="2nd year" />
                    </div>
                    <div className="flex-1">
                      <label className={label}>Move-in date</label>
                      <input type="date" value={form.moveInDate} onChange={set('moveInDate')} className={input} />
                    </div>
                  </div>
                  <label className={`${label} mt-4`}>
                    Message to the host <span className="font-medium text-text-muted">(optional)</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={set('message')}
                    className={`${input} h-[84px] resize-none`}
                    placeholder="Hi! I'm a quiet 2nd-year at UZ and would love to view the place..."
                  />
                </div>
              )}

              {step === 2 && !unlocked && (
                <div className="ua-fade">
                  <div className="mb-[18px] mt-1.5 flex items-center justify-between rounded-[13px] border border-border bg-bg-surface px-4 py-3.5">
                    <div>
                      <div className="text-sm font-bold text-text-primary">Access fee (one-time)</div>
                      <div className="text-xs text-text-secondary">Unlocks contact details &amp; sends your application</div>
                    </div>
                    <div className="font-display text-[22px] font-extrabold text-brand-primaryDark">{ACCESS_FEE_LABEL}</div>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="font-display text-[19px] font-extrabold text-text-primary">
                      Pese<span className="text-success">pay</span>
                    </span>
                    <span className="text-xs text-text-secondary">Secure checkout · Zimbabwe</span>
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
                          style={{
                            borderColor: active ? '#2F8FB8' : '#E2E8F0',
                            background: active ? '#EAF6FB' : 'transparent',
                          }}
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
                      <input value={form.phone} onChange={set('phone')} className={input} placeholder="077X XXX XXX or 071X XXX XXX" />
                      <p className="mt-2.5 text-xs text-text-secondary">
                        You'll get a prompt on your phone to approve the {providerName} payment.
                      </p>
                    </div>
                  ) : (
                    <div className="ua-fade">
                      <label className={label}>Email for receipt</label>
                      <input value={form.email} onChange={set('email')} className={input} placeholder="you@email.com" />
                      <p className="mt-2.5 text-xs text-text-secondary">
                        You'll be taken to Pesepay to pay securely by Visa, Mastercard or bank transfer.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && !unlocked && (
                <div className="ua-fade">
                  <div className="rounded-[14px] border border-border bg-bg-surface p-[18px]">
                    {[
                      ['Applicant', form.fullName],
                      ['Property', accommodation.title],
                      [
                        'Pay via',
                        payMethod === 'mobile'
                          ? `${providerName} · ${form.phone || 'your number'}`
                          : 'Card / bank (Pesepay)',
                      ],
                      ['Rent', `$${accommodation.price_per_month}/mo (paid to host later)`],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between border-b border-border py-3 text-sm first:pt-0"
                      >
                        <span className="text-text-secondary">{k}</span>
                        <span className="font-bold text-text-primary">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-3">
                      <span className="text-sm text-text-secondary">Access fee now</span>
                      <span className="font-display text-[18px] font-extrabold text-brand-primaryDark">{ACCESS_FEE_LABEL}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand-accent bg-[#FFF7E6] px-4 py-3.5">
                    <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#92660B]" />
                    <p className="text-[12.5px] leading-relaxed text-[#92660B]">
                      Only the {ACCESS_FEE_LABEL} access fee is charged now on this platform. Rent is arranged directly with the
                      verified host once they accept your application.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {phase === 'processing' && (
            <div className="px-8 py-11 text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-brand-primaryDark" />
              <h3 className="font-display mb-1.5 text-[18px] font-bold text-text-primary">
                {unlocked
                  ? 'Sending your application'
                  : payMethod === 'mobile'
                    ? 'Check your phone'
                    : 'Opening Pesepay'}
              </h3>
              <p className="text-sm text-text-secondary">
                {unlocked
                  ? 'Just a moment...'
                  : payMethod === 'mobile'
                    ? `Approve the ${providerName} prompt to confirm ${ACCESS_FEE_LABEL}`
                    : `Completing your secure ${ACCESS_FEE_LABEL} payment...`}
              </p>
            </div>
          )}

          {phase === 'done' && (
            <div className="ua-pop px-8 pb-11 pt-9 text-center">
              <div className="mx-auto mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#E8F7EE]">
                <Check className="h-9 w-9 text-success" strokeWidth={2.6} />
              </div>
              <h3 className="font-display mb-2 text-[23px] font-extrabold text-text-primary">You're in! 🎉</h3>
              <p className="mb-3.5 text-[15px] leading-relaxed text-text-secondary">
                Payment confirmed — contact details unlocked and your application was sent to{' '}
                {displayAcc.landlord?.name || 'the host'}.
              </p>
              {displayAcc.landlord ? (
                <div className="mb-5 rounded-[13px] border border-[#86E0AB] bg-[#E8F7EE] p-4 text-left text-[13px] leading-relaxed">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#15803D]">
                    <Check className="h-3 w-3" /> Host contact details
                  </div>
                  <div className="mt-2 space-y-1 text-[#166534]">
                    <div><strong>{displayAcc.landlord.name}</strong></div>
                    {displayAcc.landlord.phone && <div>📞 {displayAcc.landlord.phone}</div>}
                    {displayAcc.landlord.email && <div>✉️ {displayAcc.landlord.email}</div>}
                  </div>
                </div>
              ) : (
                <div className="mb-5 rounded-[13px] border border-border bg-bg-surface p-3.5 text-[13px] text-text-secondary">
                  Contact details are now visible on the property page.
                </div>
              )}
              <button
                onClick={onDone}
                className="rounded-xl bg-brand-primaryDark px-7 py-3 text-[15px] font-bold text-white"
              >
                View in Messages
              </button>
            </div>
          )}
        </div>

        {/* footer */}
        {phase === 'form' && (
          <div className="flex justify-between gap-3 border-t border-border bg-bg-page px-6 py-4">
            <button
              onClick={handleBack}
              className="rounded-xl border border-border bg-bg-surface px-5 py-3 text-[15px] font-bold text-text-secondary"
            >
              {unlocked || step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={handleNext}
              className="rounded-xl bg-brand-primaryDark px-7 py-3 text-[15px] font-bold text-white shadow-md"
            >
              {unlocked
                ? 'Submit application'
                : step < 3
                  ? 'Continue'
                  : `Pay ${ACCESS_FEE_LABEL}`}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
