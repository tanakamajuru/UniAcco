import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../App';
import {
  ChevronDown,
  ArrowLeftRight,
  Plus,
  LogOut,
  LogIn,
  Bookmark,
  LayoutDashboard,
  Compass,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { authApi } from '../services/api';
import logo from '../assets/logo.png';
import { ThemeSwitcher } from './kibo-ui/theme-switcher';

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
];

const HOST_NAV = [
  { label: 'Dashboard', page: 'host-dashboard', Icon: LayoutDashboard },
  { label: 'List a place', page: 'list-your-property', Icon: Plus },
];

export default function Navbar() {
  const { currentPage, navigate, role, setRole } = useNavigation();

  const token = localStorage.getItem('token');
  const isAuthenticated = Boolean(token);
  const isHost = role === 'landlord';
  const navItems = isHost ? HOST_NAV : STUDENT_NAV;

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return setUser(null);

    authApi
      .me()
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, [isAuthenticated]);

  // Close desktop dropdown on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (e) =>
      menuRef.current &&
      !menuRef.current.contains(e.target) &&
      setMenuOpen(false);

    const onKey = (e) =>
      e.key === 'Escape' && setMenuOpen(false);

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const go = (page) => {
    setMenuOpen(false);
    setDrawerOpen(false);
    navigate(page);
  };

  const switchRole = (next) => {
    setRole(next);
    go(
      next === 'landlord'
        ? 'host-dashboard'
        : 'listings'
    );
  };

  const logout = () => {
    localStorage.removeItem('token');
    setMenuOpen(false);
    setDrawerOpen(false);
    navigate('home');
    window.location.reload();
  };

  const displayName =
    user?.fullName || (isHost ? 'Host' : 'Student');

  const firstName = displayName.split(' ')[0];

  // ---- shared bits ----
  const RoleSwitch = ({ size = 'sm' }) => (
    <div className="flex items-center gap-1 rounded-full bg-black/10 p-[3px] dark:bg-white/10">
      <ArrowLeftRight
        className="ml-1 h-3.5 w-3.5 text-text-secondary"
        aria-hidden="true"
      />

      {['student', 'landlord'].map((r) => {
        const active =
          (r === 'landlord') === isHost;

        return (
          <button
            key={r}
            onClick={() => switchRole(r)}
            className={`flex-1 rounded-full font-bold transition-colors ${
              size === 'sm'
                ? 'px-3 py-1.5 text-[12.5px]'
                : 'py-2.5 text-[13px]'
            } ${
              active
                ? 'bg-brand-primaryDark text-white'
                : 'text-text-secondary'
            }`}
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

        {/* Navbar */}
        <nav className="rounded-2xl border-b-[3px] border-brand-accent bg-transparent">

          {/* FIXED NAVBAR HEIGHT */}
          <div className="relative flex h-16 items-center gap-4 px-4 sm:gap-9">

            {/* ========================= */}
            {/* LOGO */}
            {/* ========================= */}

            <button
              onClick={() =>
                go(
                  isHost
                    ? 'host-dashboard'
                    : 'home'
                )
              }
              className="relative z-10 flex h-16 w-[160px] flex-shrink-0 items-center md:w-[220px]"
              aria-label="UniAcco home"
            >
              <img
                src={logo}
                alt="UniAcco"
                className="absolute left-0 top-1/2 h-12 w-auto max-w-[160px] -translate-y-1/2 object-contain md:h-[100px] md:max-w-none md:w-[220px]"
              />
            </button>

            {/* ========================= */}
            {/* DESKTOP LINKS */}
            {/* ========================= */}

            <div className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => {
                const active =
                  currentPage === item.page;

                return (
                  <button
                    key={item.page}
                    onClick={() => go(item.page)}
                    className={`relative py-1 text-[14.5px] transition-colors ${
                      active
                        ? 'font-semibold text-text-primary dark:text-white'
                        : 'font-medium text-text-secondary hover:text-brand-primaryDark dark:text-brand-primaryLight dark:text-white/70 dark:hover:text-brand-primaryLight'
                    }`}
                  >
                    {item.label}

                    {active && (
                      <span className="absolute -bottom-[13px] left-0 right-0 h-[2.5px] rounded bg-brand-primaryDark dark:bg-brand-primaryLight" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Flexible spacer */}
            <div className="flex-1" />

            {/* ========================= */}
            {/* DESKTOP RIGHT CLUSTER */}
            {/* ========================= */}

            <div className="hidden items-center gap-4 md:flex">

              <button
                onClick={() =>
                  go('list-your-property')
                }
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-text-primary transition-opacity hover:text-brand-primaryDark dark:text-brand-primaryLight dark:text-white dark:hover:text-brand-primaryLight"
              >
                <Plus className="h-4 w-4" />
                List your place
              </button>

              <div className="h-5 w-px bg-bg-surface/20" />

              {isAuthenticated ? (
                <div
                  className="relative"
                  ref={menuRef}
                >
                  <button
                    onClick={() =>
                      setMenuOpen((o) => !o)
                    }
                    className="flex items-center gap-2 rounded-full border border-transparent py-1 pl-1 pr-2.5 text-text-primary transition-colors hover:border-brand-primary/30 hover:bg-brand-primaryDark/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/5"
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                  >
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent text-[12px] font-extrabold text-slate-900">
                      {initialsOf(displayName)}
                    </span>

                    <span className="text-[13.5px] font-semibold">
                      {firstName}
                    </span>

                    <ChevronDown className="h-3 w-3 opacity-75" />
                  </button>

                  {menuOpen && (
                    <div
                      className="absolute right-0 top-[calc(100%+10px)] z-[80] w-[250px] rounded-2xl p-2.5 shadow-2xl ring-1 ring-border"
                      style={{ backgroundColor: 'var(--bg-surface)', opacity: 1 }}
                    >
                      <div className="mb-2">
                        <RoleSwitch />
                      </div>

                      <MenuLink
                        onClick={() =>
                          go('profile')
                        }
                        label="Saved listings"
                      />

                      <MenuLink
                        onClick={() =>
                          go('host-dashboard')
                        }
                        label="Host dashboard"
                      />

                      <div className="my-1.5 h-px bg-border" />

                      <MenuLink
                        onClick={() =>
                          go('about')
                        }
                        label="Safety & verification"
                      />

                      <MenuLink
                        onClick={() =>
                          go('about')
                        }
                        label="Help centre"
                      />

                      <div className="my-1.5 h-px bg-border" />

                      <MenuLink
                        onClick={logout}
                        label="Log out"
                        strong
                      />
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => go('auth')}
                  className="flex items-center gap-2 rounded-full bg-brand-accent px-4 py-2 text-sm font-bold text-slate-900"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </button>
              )}

              {/* Theme */}
              <ThemeSwitcher />
            </div>

            {/* ========================= */}
            {/* MOBILE HAMBURGER */}
            {/* ========================= */}

          </div>
        </nav>
      </div>

      {/* ========================================= */}
      {/* MOBILE DRAWER */}
      {/* ========================================= */}

      {/* Clip-path circle reveal from the top-right button (thb-01 pattern). */}
      <div data-open={drawerOpen || undefined} className="group md:hidden">
        <nav
          id="ua-mobile-menu"
          aria-label="Site"
          className="invisible fixed inset-0 z-[61] overflow-y-auto group-data-open:visible"
          style={{
            background: 'var(--bg-surface)',
            clipPath: drawerOpen
              ? 'circle(150% at calc(100% - 52px) 44px)'
              : 'circle(0px at calc(100% - 52px) 44px)',
            transition: drawerOpen
              ? 'clip-path .65s cubic-bezier(.65,0,.35,1), visibility 0s 0s'
              : 'clip-path .65s cubic-bezier(.65,0,.35,1), visibility 0s .65s',
          }}
        >
          <div className="flex min-h-full flex-col p-4 pt-[72px] opacity-0 transition-opacity duration-300 group-data-open:opacity-100">

            {/* Drawer header */}
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
                <div className="truncate text-[14.5px] font-bold text-text-primary">
                  {displayName}
                </div>

                <div className="text-[11px] font-semibold text-success">
                  {isAuthenticated
                    ? isHost
                      ? 'host account'
                      : 'verified student'
                    : 'guest'}
                </div>
              </div>

            </div>

            {/* Role switch */}
            <div className="mb-4">
              <RoleSwitch size="lg" />
            </div>

            <DrawerLabel>
              Menu
            </DrawerLabel>

            {navItems.map(
              ({
                label,
                page,
                Icon,
              }) => (
                <DrawerLink
                  key={page}
                  Icon={Icon}
                  label={label}
                  active={
                    currentPage === page
                  }
                  onClick={() =>
                    go(page)
                  }
                />
              )
            )}

            <DrawerLabel>
              Account
            </DrawerLabel>

            <DrawerLink
              Icon={Bookmark}
              label="Saved & profile"
              onClick={() =>
                go('profile')
              }
            />

            <DrawerLink
              Icon={ShieldCheck}
              label="Safety & verification"
              onClick={() =>
                go('about')
              }
            />

            <DrawerLink
              Icon={HelpCircle}
              label="Help centre"
              onClick={() =>
                go('about')
              }
            />

            {/* Appearance */}
            <div className="flex items-center justify-between border-b border-border py-3.5">
              <span className="text-[14.5px] font-medium text-text-primary">
                Appearance
              </span>
              <ThemeSwitcher />
            </div>

            {/* List property */}
            <button
              onClick={() =>
                go('list-your-property')
              }
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand-primaryDark py-3.5 text-[15px] font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              List your place
            </button>

            {/* Authentication */}
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="mt-3 flex items-center gap-3 py-3 text-[14.5px] font-bold text-error dark:text-red-400"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Log out
              </button>
            ) : (
              <button
                onClick={() => go('auth')}
                className="mt-3 flex items-center gap-3 py-3 text-[14.5px] font-bold text-brand-primaryDark dark:text-brand-primaryLight"
              >
                <LogIn className="h-[18px] w-[18px]" />
                Sign in
              </button>
            )}
          </div>
        </nav>

        <button
          type="button"
          aria-expanded={drawerOpen}
          aria-controls="ua-mobile-menu"
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setDrawerOpen((o) => !o)}
          style={{ padding: 0 }}
          className="fixed right-7 top-5 z-[70] grid h-12 w-12 cursor-pointer place-items-center rounded-full border-0 bg-brand-primaryDark transition-[background,scale] duration-300 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-primary group-data-open:bg-text-primary motion-reduce:transition-none"
        >
          <span className="relative block h-3.5 w-5" aria-hidden="true">
            <i className="absolute left-0 top-0 h-0.5 w-5 rounded-sm bg-bg-surface transition-[translate,rotate] duration-300 group-data-open:translate-y-1.5 group-data-open:rotate-45 motion-reduce:transition-none" />
            <i className="absolute left-0 top-1.5 h-0.5 w-5 rounded-sm bg-bg-surface transition-[opacity,translate] duration-200 group-data-open:-translate-x-1.5 group-data-open:opacity-0 motion-reduce:transition-none" />
            <i className="absolute left-0 top-3 h-0.5 w-5 rounded-sm bg-bg-surface transition-[translate,rotate] duration-300 group-data-open:-translate-y-1.5 group-data-open:-rotate-45 motion-reduce:transition-none" />
          </span>
        </button>
      </div>
    </header>
  );
}

// =========================================
// SMALL PRESENTATIONAL HELPERS
// =========================================

function MenuLink({
  label,
  onClick,
  badge,
  strong,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left text-[13.5px] text-text-primary transition-colors hover:bg-bg-surface-alt ${
        strong
          ? 'font-bold'
          : 'font-medium'
      }`}
    >
      {label}
      {badge ? (
        <span className="rounded bg-brand-accent px-1.5 py-0.5 text-[10px] font-bold text-slate-900">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function DrawerLabel({ children }) {
  return (
    <div className="mb-1 mt-4 text-[11px] font-bold uppercase tracking-wide text-text-muted">
      {children}
    </div>
  );
}

function DrawerLink({
  onClick,
  Icon,
  label,
  active,
  badge,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between border-b border-border py-3.5 text-left text-[14.5px] transition-colors ${
        active
          ? 'font-bold text-brand-primaryDark dark:text-brand-primaryLight'
          : 'font-medium text-text-primary'
      }`}
    >
      <span className="flex items-center gap-3">
        {Icon && (
          <Icon className="h-[18px] w-[18px] text-text-secondary" />
        )}

        {label}
      </span>

      {badge ? (
        <span className="rounded bg-brand-accent px-1.5 py-0.5 text-[10px] font-bold text-slate-900">
          {badge}
        </span>
      ) : null}
    </button>
  );
}