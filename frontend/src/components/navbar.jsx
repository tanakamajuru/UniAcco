import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '../App';
import { ThemeToggle } from './ThemeToggle';
import { MessageSquare, LogIn, LogOut } from 'lucide-react';
import { authApi, threadApi, currentRole } from '../services/api';
import logo from '../assets/logo.png';

const initialsOf = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

export default function Navbar() {
  const { currentPage, navigate, role, setRole } = useNavigation();

  const token = localStorage.getItem('token');
  const isAuthenticated = Boolean(token);
  const realRole = currentRole();

  const [user, setUser] = useState(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setUser(null);
      return;
    }
    authApi.me().then((d) => setUser(d.user)).catch(() => {});
  }, [isAuthenticated]);

  const refreshUnread = useCallback(() => {
    if (!isAuthenticated) return;
    threadApi
      .list()
      .then((threads) => setUnread(threads.reduce((n, t) => n + (t.unread || 0), 0)))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread, currentPage]);

  const studentNav = [
    { label: 'Browse', page: 'listings' },
    { label: 'Saved', page: 'profile' },
    { label: 'Messages', page: 'messages' },
  ];
  const hostNav = [
    { label: 'Dashboard', page: 'host-dashboard' },
    { label: 'List a place', page: 'list-your-property' },
    { label: 'Messages', page: 'messages' },
  ];
  const navItems = role === 'landlord' ? hostNav : studentNav;

  const switchRole = (next) => {
    setRole(next);
    navigate(next === 'landlord' ? 'host-dashboard' : 'listings');
  };

  const pill = (active) =>
    `cursor-pointer rounded-full px-4 py-1.5 text-[13.5px] font-bold transition-colors ${
      active ? 'bg-brand-primaryDark text-white' : 'bg-transparent text-text-secondary'
    }`;

  const navPill = (active) =>
    `cursor-pointer rounded-full px-4 py-2 text-[14.5px] transition-colors ${
      active
        ? 'bg-[#EAF6FB] text-brand-primaryDark font-bold'
        : 'text-text-secondary font-semibold hover:bg-bg-surface-alt'
    }`;

  const isHost = role === 'landlord';
  const displayName = user?.fullName || (isHost ? 'Host' : 'Student');
  const firstName = displayName.split(' ')[0];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-page/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6">
        {/* Logo + wordmark */}
        <div
          onClick={() => navigate(isHost ? 'host-dashboard' : 'home')}
          className="flex flex-shrink-0 cursor-pointer items-center gap-2.5"
        >
          <img src={logo} alt="UniAcco" className="h-9 w-9 rounded-full shadow-md sm:h-10 sm:w-10" />
          <span className="font-display hidden text-[22px] font-extrabold tracking-tight text-text-primary sm:inline">
            Uni<span className="text-brand-primaryDark">Acco</span>
          </span>
        </div>

        {/* Role pill */}
        <div className="flex flex-shrink-0 gap-0.5 rounded-full border border-border bg-bg-surface p-1 shadow-sm">
          <button className={pill(!isHost)} onClick={() => switchRole('student')}>
            Student
          </button>
          <button className={pill(isHost)} onClick={() => switchRole('landlord')}>
            Host
          </button>
        </div>

        {/* Nav pills (desktop) */}
        <nav className="hidden gap-0.5 rounded-full border border-border bg-bg-surface px-1.5 py-1 shadow-sm md:flex">
          {navItems.map((item) => (
            <button
              key={item.page + item.label}
              className={navPill(currentPage === item.page)}
              onClick={() => navigate(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex flex-shrink-0 items-center gap-1.5 sm:gap-2.5">
          {isAuthenticated && (
            <button
              onClick={() => navigate('messages')}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-surface shadow-sm hover:bg-bg-surface-alt"
              aria-label="Messages"
            >
              <MessageSquare className="h-[18px] w-[18px] text-text-secondary" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-bg-page bg-brand-accent px-1 text-[11px] font-extrabold text-[#4A3A00]">
                  {unread}
                </span>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(isHost ? 'host-dashboard' : 'profile')}
                className="flex items-center gap-2 rounded-full border border-border bg-bg-surface py-1 pl-1 pr-3 shadow-sm hover:bg-bg-surface-alt"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold text-white"
                  style={{
                    background: isHost
                      ? 'linear-gradient(135deg,#F4C430,#E0A800)'
                      : 'linear-gradient(135deg,#4DB6E2,#2F8FB8)',
                  }}
                >
                  {initialsOf(displayName)}
                </span>
                <span className="hidden text-sm font-semibold text-text-primary sm:inline">{firstName}</span>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('home');
                  window.location.reload();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary shadow-sm hover:bg-bg-surface-alt"
                aria-label="Sign out"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('auth')}
              className="flex items-center gap-2 rounded-full bg-brand-primaryDark px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
            >
              <LogIn className="h-4 w-4" /> Sign in
            </button>
          )}

          <div className="rounded-full border border-border bg-bg-surface p-1 shadow-sm">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Nav pills (mobile) */}
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
        {navItems.map((item) => (
          <button
            key={`m-${item.page}${item.label}`}
            className={`${navPill(currentPage === item.page)} flex-shrink-0 whitespace-nowrap border border-border`}
            onClick={() => navigate(item.page)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
