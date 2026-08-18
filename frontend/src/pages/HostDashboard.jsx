import { useState, useEffect } from 'react';
import {
  Eye,
  Mail,
  FileText,
  Home,
  Plus,
  Pencil,
  MoreHorizontal,
  Check,
  Loader2,
} from 'lucide-react';
import { useNavigation } from '../App';
import { hostApi, accommodationApi, applicationApi, authApi, imageUrl } from '../services/api';
import { gradientFor } from '../components/listings/ListingCard';

const STATUS_BADGE = {
  active: 'bg-[#E8F7EE] text-[#15803D]',
  pending: 'bg-[#FEF3C7] text-[#92660B]',
  rented: 'bg-[#E0F2FE] text-[#0369A1]',
  draft: 'bg-bg-surface-alt text-text-secondary',
  rejected: 'bg-error/10 text-error',
};

const AVATAR_BGS = [
  'linear-gradient(135deg,#4DB6E2,#2F8FB8)',
  'linear-gradient(135deg,#F4C430,#E0A800)',
  'linear-gradient(135deg,#34D399,#059669)',
];

export default function HostDashboard() {
  const { navigate } = useNavigation();
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const loadApplicants = () => hostApi.applicants().then(setApplicants).catch(() => {});

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('auth');
      return;
    }
    authApi.me().then((d) => setUser(d.user)).catch(() => {});
    Promise.all([
      hostApi.stats().then(setStats).catch(() => null),
      accommodationApi.landlord().then(setListings).catch(() => []),
      loadApplicants(),
    ]).finally(() => setLoading(false));
  }, [navigate]);

  const decide = async (id, status) => {
    setApplicants((prev) =>
      prev.map((a) => (a.application.id === id ? { ...a, application: { ...a.application, status } } : a))
    );
    try {
      await applicationApi.setStatus(id, status);
      loadApplicants();
    } catch {
      loadApplicants();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-40 text-text-secondary">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const firstName = (user?.fullName || 'there').split(' ')[0];
  const pending = applicants.filter((a) => a.application.status === 'pending');

  const statCards = stats
    ? [
        {
          k: 'Total views',
          v: stats.totalViews.toLocaleString(),
          Icon: Eye,
          iconBg: '#EAF6FB',
          delta: `▲ ${stats.viewsDeltaPct}% this week`,
          color: '#16A34A',
        },
        {
          k: 'Enquiries',
          v: stats.enquiries,
          Icon: Mail,
          iconBg: '#FEF3C7',
          delta: `▲ ${stats.enquiriesNew} new`,
          color: '#16A34A',
        },
        {
          k: 'Applications',
          v: stats.applications,
          Icon: FileText,
          iconBg: '#E0F2FE',
          delta: `${stats.applicationsPending} pending review`,
          color: '#92660B',
        },
        {
          k: 'Occupancy',
          v: `${stats.occupancyPct}%`,
          Icon: Home,
          iconBg: '#E8F7EE',
          delta: `${stats.roomsFilled} of ${stats.roomsTotal} rooms filled`,
          color: '#475569',
        },
      ]
    : [];

  return (
    <div className="ua-fade mx-auto max-w-[1180px] px-4 pb-[70px] pt-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <h1 className="font-display text-[29px] font-extrabold tracking-tight text-text-primary">
            Welcome back, {firstName}
          </h1>
          <p className="text-[15px] text-text-secondary">Here's how your listings are doing this week</p>
        </div>
        <button
          onClick={() => navigate('list-your-property')}
          className="flex items-center gap-2 rounded-[13px] bg-brand-primaryDark px-5 py-3 text-[15px] font-bold text-white shadow-md"
        >
          <Plus className="h-4 w-4" /> List a new place
        </button>
      </div>

      {/* stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.k} className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-text-secondary">{s.k}</span>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-[9px]"
                style={{ background: s.iconBg }}
              >
                <s.Icon className="h-[15px] w-[15px] text-text-primary" />
              </span>
            </div>
            <div className="font-display mt-2.5 text-[26px] font-extrabold text-text-primary">{s.v}</div>
            <div className="mt-0.5 text-xs font-bold" style={{ color: s.color }}>
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[1.55fr_1fr]">
        {/* listings */}
        <div className="overflow-hidden rounded-[18px] border border-border bg-bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-display text-[17px] font-bold text-text-primary">Your listings</h3>
            <span className="text-[13px] text-text-secondary">{listings.length} total</span>
          </div>
          {listings.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-text-secondary">
              No listings yet — create your first one.
            </p>
          ) : (
            listings.map((l) => {
              const photo = l.images?.[0] ? imageUrl(l.images[0]) : null;
              return (
                <div
                  key={l.id}
                  className="flex items-center gap-3.5 border-b border-border px-5 py-4 last:border-0"
                >
                  <div
                    className="h-[62px] w-[62px] flex-shrink-0 overflow-hidden rounded-xl"
                    style={{ background: gradientFor(l.id) }}
                  >
                    {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-[15px] font-bold text-text-primary">{l.title}</h4>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                          STATUS_BADGE[l.status] || STATUS_BADGE.draft
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-text-secondary">
                      {l.suburb} · ${l.price_per_month}/mo
                    </div>
                    <div className="mt-1.5 flex gap-3.5 text-xs font-semibold text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {l.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> {l.enquiries} enquiries
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => navigate('list-your-property')}
                      className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-border bg-bg-surface text-text-secondary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-border bg-bg-surface text-text-secondary">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* applicants */}
        <div className="overflow-hidden rounded-[18px] border border-border bg-bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-display text-[17px] font-bold text-text-primary">New applicants</h3>
            <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-bold text-[#92660B]">
              {pending.length} pending
            </span>
          </div>
          {applicants.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-text-secondary">No applicants yet.</p>
          ) : (
            applicants.map((a, i) => (
              <div key={a.application.id} className="border-b border-border px-5 py-4 last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: AVATAR_BGS[i % AVATAR_BGS.length] }}
                  >
                    {a.student.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-text-primary">{a.student.name}</span>
                      {a.student.verified && <Check className="h-3 w-3 text-[#16A34A]" />}
                    </div>
                    <div className="text-xs text-text-secondary">{a.student.meta}</div>
                  </div>
                  <span className="text-[11px] text-text-muted">{a.application.when}</span>
                </div>
                {a.application.message && (
                  <div className="my-2.5 text-[12.5px] leading-relaxed text-text-secondary">
                    "{a.application.message}"
                  </div>
                )}
                {a.application.status === 'pending' ? (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => decide(a.application.id, 'accepted')}
                      className="flex-1 rounded-[9px] bg-brand-primaryDark py-2.5 text-[13px] font-bold text-white"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => navigate('messages')}
                      className="flex-1 rounded-[9px] border border-border bg-bg-surface py-2.5 text-[13px] font-bold text-text-secondary"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => decide(a.application.id, 'declined')}
                      className="rounded-[9px] border border-border bg-bg-surface px-3 py-2.5 text-[13px] font-bold text-text-muted"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                      a.application.status === 'accepted'
                        ? 'bg-[#E8F7EE] text-[#15803D]'
                        : 'bg-bg-surface-alt text-text-secondary'
                    }`}
                  >
                    {a.application.status}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
