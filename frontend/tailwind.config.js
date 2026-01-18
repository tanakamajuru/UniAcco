/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* =========================
           Brand
        ========================= */
        brand: {
          primary: 'var(--brand-primary)',
          primaryDark: 'var(--brand-primary-dark)',
          primaryLight: 'var(--brand-primary-light)',
          accent: 'var(--brand-accent)',
          accentSoft: 'var(--brand-accent-soft)',
        },

        /* =========================
           Backgrounds
        ========================= */
        bg: {
          page: 'var(--bg-page)',
          surface: 'var(--bg-surface)',
          surfaceAlt: 'var(--bg-surface-alt)',
          elevated: 'var(--bg-elevated)',
        },

        /* =========================
           Text
        ========================= */
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
          link: 'var(--text-link)',
        },

        /* =========================
           Borders
        ========================= */
        border: {
          DEFAULT: 'var(--border-default)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
        },

        /* =========================
           Inputs
        ========================= */
        input: {
          bg: 'var(--input-bg)',
          border: 'var(--input-border)',
          focus: 'var(--input-border-focus)',
          text: 'var(--input-text)',
          placeholder: 'var(--input-placeholder)',
          disabled: 'var(--input-disabled-bg)',
        },

        /* =========================
           Semantic
        ========================= */
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',

        /* =========================
           Button Theme-Aware Colors
        ========================= */
        'btn-primary': 'var(--brand-primary)',
        'btn-primary-hover': 'var(--brand-primary-dark)',
        'btn-secondary': 'var(--bg-surface-alt)',
        'btn-secondary-hover': 'var(--border-default)',
        'btn-secondary-text': 'var(--text-primary)',
        'btn-ghost': 'transparent',
        'btn-ghost-hover': 'var(--bg-surface-alt)',
        'btn-danger': 'var(--color-error)',
        'btn-danger-hover': '#DC2626',
      },

      boxShadow: {
        card: '0 10px 20px rgba(0,0,0,0.08)',
      },

      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
