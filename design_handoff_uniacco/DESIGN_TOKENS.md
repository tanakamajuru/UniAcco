# UniAcco — Design Tokens

These match `frontend/src/index.css` (CSS variables) and `tailwind.config.js`. Use the existing Tailwind utilities (`bg-brand-primary`, `text-text-secondary`, `border-border`, `shadow-card`, etc.) rather than hard-coding hex where a token exists. Hex values are listed so the recreation is exact.

## Brand
| Token | Tailwind | Light | Use |
|---|---|---|---|
| `--brand-primary` | `brand-primary` | `#4DB6E2` | primary sky blue, pins, accents |
| `--brand-primary-dark` | `brand-primaryDark` | `#2F8FB8` | **primary buttons, links, active nav** |
| `--brand-primary-light` | `brand-primaryLight` | `#8FD3EE` | tints, dark-mode link |
| `--brand-accent` | `brand-accent` | `#F4C430` | gold accent (badges, host avatars, unread) |
| `--brand-accent-soft` | `brand-accentSoft` | `#FFE08A` | soft gold backgrounds |

> Primary CTAs in the prototype use **`#2F8FB8`** (`brand-primaryDark`) with hover `#287AA0`, shadow `0 8px 20px rgba(47,143,184,.3)`.

## Backgrounds
| Token | Light | Dark |
|---|---|---|
| `--bg-page` | `#F8FAFC` | `#0B1220` |
| `--bg-surface` | `#FFFFFF` | `#111827` |
| `--bg-surface-alt` | `#F1F5F9` | `#1F2933` |
| `--bg-elevated` | `#FFFFFF` | `#172033` |

## Text
| Token | Light | Dark |
|---|---|---|
| `--text-primary` | `#0F172A` | `#F8FAFC` |
| `--text-secondary` | `#475569` | `#CBD5E1` |
| `--text-muted` | `#94A3B8` | `#94A3B8` |
| `--text-inverse` | `#FFFFFF` | `#FFFFFF` |
| `--text-link` | `#2F8FB8` | `#8FD3EE` |

## Borders
| Token | Light | Dark |
|---|---|---|
| `--border-default` | `#E2E8F0` | `#243044` |
| `--border-strong` | `#CBD5E1` | `#334155` |
| `--border-focus` | `#4DB6E2` | `#8FD3EE` |

Prototype also uses a slightly warmer card border `#E6EBF1` and divider `#EEF2F6`/`#F1F5F9` — `--border-default` is an acceptable substitute.

## Semantic
| Token | Hex | Used for |
|---|---|---|
| `--color-success` | `#22C55E` | verified, unlocked (text `#15803D`/`#166534`, bg `#E8F7EE`) |
| `--color-warning` | `#F59E0B` | locked / pending (text `#92660B`, bg `#FFF7E6`/`#FEF3C7`) |
| `--color-error` | `#EF4444` | destructive |
| `--color-info` | `#0EA5E9` | info / rented badge text `#0369A1`, bg `#E0F2FE` |

## Typography
- **Display:** `Sora` 600/700/800 — headings, prices, stat values, titles. (Recommended addition.)
- **Body/UI:** `Plus Jakarta Sans` 400–800 — everything else. (Current repo uses `system-ui`; keep if you prefer, preserve sizes/weights.)
- Scale used: page H1 28–32px/800, section H3 17–19px/700, card title 16–18px/700, body 14–15px/400–500, meta 12–13px, micro 11–12px. Letter-spacing −0.02em on large display headings. `text-wrap: pretty` on body paragraphs.

## Radius
| Token | Value |
|---|---|
| `borderRadius.xl` | `0.75rem` (12px) — inputs, chips, buttons |
| `borderRadius.2xl` | `1rem` (16px) — cards, panels |
| cards in prototype | 16–20px |
| pills / role switch | `999px` |
| avatars | `50%` |

## Shadow
| Token | Value |
|---|---|
| `shadow-card` | `0 10px 20px rgba(0,0,0,0.08)` |
| hairline | `0 1px 2px rgba(15,23,42,.04)` |
| card hover | `0 14px 30px rgba(47,143,184,.14)` |
| CTA | `0 8px 20px rgba(47,143,184,.3)` |
| modal | `0 30px 70px rgba(0,0,0,.3)` |

## Spacing
8px base. Common: card padding 14–22px, section gaps 20–28px, grid gap 16–20px, page padding 24px, max width 1280px (browse/dashboard), 1080px (detail/saved/messages), 760px (create form).

## Motion
- Screen enter: `@keyframes fade { from{opacity:0;translateY(10px)} to{opacity:1;translateY(0)} } .4s ease`.
- Modal: backdrop `fade .25s`; panel `pop .3s` (`scale .96→1`).
- Spinner: `.8s linear infinite`.
- Hover lift: `transform: translateY(-4px)` `.18s ease`.
