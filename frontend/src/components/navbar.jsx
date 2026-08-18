import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '../App';
import {
  Menu,
  X,
  ChevronDown,
  Plus,
  Moon,
  Sun,
  LogOut,
  LogIn,
  MessageSquare,
  Bookmark,
  LayoutDashboard,
  Compass,
  HelpCircle,
  ShieldCheck,
  Home as HomeIcon,
} from 'lucide-react';
import { authApi, threadApi } from '../services/api';

const initialsOf = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

const STUDENT_NAV = [
  { label: 'Browse', page: 'listings', Icon: Compass },
  { label: 'Saved', page: 'profile', Icon: Bookmark },
  { label: 'Messages', page: 'messages', Icon: MessageSquare },
];
const HOST_NAV = [
  { label: 'Dashboard', page: 'host-dashboard', Icon: LayoutDashboard },
  { label: 'List a place', page: 'list-your-property', Icon: Plus },
  { label: 'Messages', page: 'messages', Icon: MessageSquare },
];

export default function Navbar() {
  const { currentPage, navigate, role, setRole } = useNavigation();

  const token = localStorage.getItem('token');
  const isAuthenticated = Boolean(token);
  const isHost = role === 'landlord';
  const navItems = isHost ? HOST_NAV : STUDENT_NAV;

  const [user, setUser] = useState(null);
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false); // desktop account dropdown
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile drawer
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return setUser(null);
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

  // Close the desktop dropdown on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle('dark', next === 'dark');
    setIsDark(next === 'dark');
  };

  const go = (page) => {
    setMenuOpen(false);
    setDrawerOpen(false);
    navigate(page);
  };
  const switchRole = (next) => {
    setRole(next);
    go(next === 'landlord' ? 'host-dashboard' : 'listings');
  };
  const logout = () => {
    localStorage.removeItem('token');
    setMenuOpen(false);
    setDrawerOpen(false);
    navigate('home');
    window.location.reload();
  };

  const displayName = user?.fullName || (isHost ? 'Host' : 'Student');
  const firstName = displayName.split(' ')[0];

  // ---- shared bits ----
  const RoleSwitch = ({ size = 'sm' }) => (
    <div className="flex rounded-full bg-black/10 p-[3px] dark:bg-white/10">
      {['student', 'landlord'].map((r) => {
        const active = (r === 'landlord') === isHost;
        return (
          <button
            key={r}
            onClick={() => switchRole(r)}
            className={`flex-1 rounded-full font-bold transition-colors ${
              size === 'sm' ? 'px-3 py-1.5 text-[12.5px]' : 'py-2.5 text-[13px]'
            } ${active ? 'bg-brand-primaryDark text-white' : 'text-text-secondary'}`}
          >
            {r === 'student' ? 'Student' : 'Host'}
          </button>
        );
      })}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        {/* The brand bar — solid primary with a gold accent underline */}
        <nav className="rounded-2xl border-b-[3px] border-brand-accent bg-brand-primaryDark shadow-lg">
          <div className="flex items-center gap-4 px-4 py-3 sm:gap-9">
            {/* Logo */}
            <button
              onClick={() => go(isHost ? 'host-dashboard' : 'home')}
              className="flex flex-shrink-0 items-center gap-2.5"
              aria-label="UniAcco home"
            >
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-brand-accent">
                <HomeIcon className="h-4 w-4 text-brand-primaryDark" />
              </span>
              <span className="font-display text-[23px] font-bold tracking-tight text-white">UniAcco</span>
            </button>

            {/* Desktop links */}
            <div className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => {
                const active = currentPage === item.page;
                return (
                  <button
                    key={item.page}
                    onClick={() => go(item.page)}
                    className={`relative py-1 text-[14.5px] transition-colors ${
                      active ? 'font-semibold text-white' : 'font-medium text-white/70 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute -bottom-[13px] left-0 right-0 h-[2.5px] rounded bg-brand-accent" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex-1" />

            {/* Desktop right cluster */}
            <div className="hidden items-center gap-4 md:flex">
              <button
                onClick={() => go('list-your-property')}
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-white transition-opacity hover:opacity-80"
              >
                <Plus className="h-4 w-4" /> List your place
              </button>

              <div className="h-5 w-px bg-white/20" />

              {isAuthenticated ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-full border border-transparent py-1 pl-1 pr-2.5 text-white transition-colors hover:border-white/20 hover:bg-white/5"
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                  >
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent text-[12px] font-extrabold text-brand-primaryDark">
                      {initialsOf(displayName)}
                      {unread > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-brand-primaryDark bg-error" />
                      )}
                    </span>
                    <span className="text-[13.5px] font-semibold">{firstName}</span>
                    <ChevronDown className="h-3 w-3 opacity-75" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] w-[250px] rounded-2xl bg-bg-surface p-2.5 shadow-2xl ring-1 ring-border">
                      <div className="mb-2">
                        <RoleSwitch />
                      </div>
                      <MenuLink onClick={() => go('profile')} label="Saved listings" />
                      <MenuLink onClick={() => go('messages')} label="Messages" badge={unread || null} />
                      <MenuLink onClick={() => go('host-dashboard')} label="Host dashboard" />
                      <div className="my-1.5 h-px bg-border" />
                      <MenuLink onClick={() => go('about')} label="Safety & verification" />
                      <MenuLink onClick={() => go('about')} label="Help centre" />
                      <div className="my-1.5 h-px bg-border" />
                      <MenuLink onClick={logout} label="Log out" strong />
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => go('auth')}
                  className="flex items-center gap-2 rounded-full bg-brand-accent px-4 py-2 text-sm font-bold text-brand-primaryDark"
                >
                  <LogIn className="h-4 w-4" /> Sign in
                </button>
              )}

              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {isDark ? <Sun className="h-[15px] w-[15px]" /> : <Moon className="h-[15px] w-[15px]" />}
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] border border-white/20 bg-white/10 text-white md:hidden"
            >
              <Menu className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full border border-white/30 bg-error" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* ---------- Mobile drawer ---------- */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-[rgba(15,23,42,0.5)] md:hidden"
            style={{ animation: 'uaFade 0.2s ease both' }}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="fixed bottom-0 right-0 top-0 z-[61] flex w-[84%] max-w-[340px] flex-col overflow-y-auto bg-bg-surface p-4 shadow-2xl md:hidden"
            style={{ animation: 'uaSlideIn 0.26s cubic-bezier(.32,.72,0,1) both' }}
          >
            {/* header */}
            <div className="mb-4 flex items-center gap-2.5">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-extrabold text-white"
                style={{
                  background: isHost
                    ? 'linear-gradient(135deg,#F4C430,#E0A800)'
                    : 'linear-gradient(135deg,#4DB6E2,#2F8FB8)',
                }}
              >
                {initialsOf(displayName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14.5px] font-bold text-text-primary">{displayName}</div>
                <div className="text-[11px] font-semibold text-success">
                  {isAuthenticated ? (isHost ? 'host account' : 'verified student') : 'guest'}
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-surface-alt text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4">
              <RoleSwitch size="lg" />
            </div>

            <DrawerLabel>Menu</DrawerLabel>
            {navItems.map(({ label, page, Icon }) => (
              <DrawerLink
                key={page}
                Icon={Icon}
                label={label}
                active={currentPage === page}
                badge={page === 'messages' ? unread || null : null}
                onClick={() => go(page)}
              />
            ))}

            <DrawerLabel>Account</DrawerLabel>
            <DrawerLink Icon={Bookmark} label="Saved & profile" onClick={() => go('profile')} />
            <DrawerLink Icon={ShieldCheck} label="Safety & verification" onClick={() => go('about')} />
            <DrawerLink Icon={HelpCircle} label="Help centre" onClick={() => go('about')} />
            <div className="flex items-center justify-between border-b border-border py-3.5">
              <span className="flex items-center gap-3 text-[14.5px] font-medium text-text-primary">
                {isDark ? <Sun className="h-[18px] w-[18px] text-text-secondary" /> : <Moon className="h-[18px] w-[18px] text-text-secondary" />}
                Dark mode
              </span>
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className={`relative h-6 w-[42px] rounded-full transition-colors ${isDark ? 'bg-brand-primaryDark' : 'bg-border-strong'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-[20px]' : 'translate-x-0.5'}`}
                />
              </button>
            </div>

            <button
              onClick={() => go('list-your-property')}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand-primaryDark py-3.5 text-[15px] font-bold text-white"
            >
              <Plus className="h-4 w-4" /> List your place
            </button>

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="mt-3 flex items-center gap-3 py-3 text-[14.5px] font-bold text-error"
              >
                <LogOut className="h-[18px] w-[18px]" /> Log out
              </button>
            ) : (
              <button
                onClick={() => go('auth')}
                className="mt-3 flex items-center gap-3 py-3 text-[14.5px] font-bold text-brand-primaryDark"
              >
                <LogIn className="h-[18px] w-[18px]" /> Sign in
              </button>
            )}
          </div>
        </>
      )}
    </header>
  );
}

// ---- small presentational helpers ----
function MenuLink({ label, onClick, badge, strong }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left text-[13.5px] text-text-primary transition-colors hover:bg-bg-surface-alt ${
        strong ? 'font-bold' : 'font-medium'
      }`}
    >
      {label}
      {badge ? (
        <span className="rounded bg-brand-accent px-1.5 py-0.5 text-[10px] font-bold text-brand-primaryDark">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function DrawerLabel({ children }) {
  return (
    <div className="mb-1 mt-3.5 px-1 font-display text-[11px] font-bold uppercase tracking-wider text-text-muted">
      {children}
    </div>
  );
}

function DrawerLink({ Icon, label, onClick, active, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between border-b border-border py-3.5 text-left text-[14.5px] transition-colors ${
        active ? 'font-bold text-brand-primaryDark' : 'font-medium text-text-primary'
      }`}
    >
      <span className="flex items-center gap-3">
        {Icon && <Icon className="h-[18px] w-[18px] text-text-secondary" />}
        {label}
      </span>
      {badge ? (
        <span className="rounded bg-brand-accent px-1.5 py-0.5 text-[10px] font-bold text-brand-primaryDark">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
