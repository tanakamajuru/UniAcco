import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const themes = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export function ThemeSwitcher({ className = '' }) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const activeTheme = mounted ? theme : 'light';
  const ActiveIcon = themes.find((item) => item.value === activeTheme)?.Icon ||
    (resolvedTheme === 'dark' ? Moon : Sun);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Choose theme"
        aria-haspopup="menu"
        aria-expanded={open}
        style={{ color: 'var(--text-primary)' }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-primary/30 transition-colors hover:bg-brand-primary/10 hover:text-brand-primaryDark dark:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ActiveIcon
          aria-hidden="true"
          width={18}
          height={18}
          strokeWidth={2.5}
          style={{ color: 'var(--text-primary)', width: 18, height: 18, flexShrink: 0 }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-[80] min-w-[132px] rounded-xl border border-border p-1.5 text-text-primary shadow-xl"
          style={{ backgroundColor: 'var(--bg-surface)', opacity: 1 }}
        >
          {themes.map((item) => {
            const ThemeIcon = item.Icon;

            return (
              <button
                key={item.value}
                type="button"
                role="menuitemradio"
                aria-checked={activeTheme === item.value}
                onClick={() => {
                  setTheme(item.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-brand-primary/10 hover:text-brand-primaryDark dark:hover:text-brand-primaryLight"
              >
                <ThemeIcon className="h-4 w-4 stroke-current" />
                <span className="flex-1">{item.label}</span>
                {activeTheme === item.value && (
                  <Check className="h-4 w-4 text-brand-primaryDark dark:text-brand-primaryLight" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
