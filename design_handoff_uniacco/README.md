# Handoff: UniAcco — complete student accommodation platform

## Overview
UniAcco is a two-sided marketplace for off-campus student housing in Zimbabwe. **Students** browse verified rooms/houses near their university, save favourites, pay a small one-time access fee via **PayNow** to unlock a landlord's contact details, apply to rent, and message hosts. **Hosts (landlords)** list properties, manage them from a dashboard, and review/accept applicants.

This package finishes the existing `tanakamajuru/UniAcco` app: it specifies every screen at high fidelity and defines the backend, database, and API needed to make the prototype a working product.

## About the design files
The file in `prototype/UniAcco.dc.html` is a **design reference created in HTML** — an interactive prototype showing the intended look, layout, copy, and behaviour. It is **not production code to copy**. Your task is to **recreate these screens inside the existing UniAcco React + Vite + Tailwind codebase** using its established patterns (the `useNavigation` context, the CSS-variable design tokens, the Tailwind `brand-*`/`bg-*`/`text-*` utilities, lucide-react icons, framer-motion), and to **build the backend + database** so the flows actually work.

To open the prototype: open `prototype/UniAcco.dc.html` in a browser. Use the **Student / Host** pill (top-left) to switch roles; the nav and default screen change per role.

## Fidelity
**High-fidelity.** Colours, typography, spacing, radii, shadows, copy, and interactions are final. Recreate the UI faithfully using the codebase's existing Tailwind tokens (see `DESIGN_TOKENS.md`). The prototype's display font is **Sora** and body font **Plus Jakarta Sans** — adopting these is recommended but optional; if you keep the current `system-ui`, preserve the weights/sizes.

## Target stack (existing repo — keep it)
- **Frontend:** React 18 + Vite, Tailwind (v4, CSS-variable tokens in `src/index.css`), custom `useNavigation()` context in `App.jsx` (no react-router), `lucide-react` icons, `framer-motion` animations.
- **Backend:** Node + Express, service/route layout already started under `backend/` (`services/paynowService.js`, `routes/paymentRoutes.js`).
- **Database:** PostgreSQL (migrations under `backend/database/migrations/`).
- **Auth:** JWT in `localStorage`; `parseJwt` reads `role` (`student` | `landlord`).
- **Payments:** PayNow (Zimbabwe) — web (card/bank redirect) and mobile money (**EcoCash** / **OneMoney**) with poll-based status checks. Already partly built.

> The prototype renames the renter role to **Student** and the owner role to **Host** in UI copy. Keep the DB role value `landlord` for hosts to stay compatible with existing JWTs, or migrate intentionally — your call, but be consistent.

---

## Screens / Views

All screens share a sticky top **navbar**: round gradient logo + "UniAcco" wordmark (`Uni` in `--text-primary`, `Acco` in `--brand-primary-dark`), a **Student/Host role pill**, a pill nav, a messages bell with unread badge, and an avatar chip. Max content width **1280px**, page padding **24px**.

### 1. Browse (student) — `pages/Listings.jsx` (rework)
- **Purpose:** Search and discover listings near a chosen university.
- **Layout:** Header row (title + map/list toggle), then a **filter bar** (search input, university selector, type chips, price slider). Below: a **split view** — left a responsive card grid (`repeat(2,1fr)` in split mode, `repeat(3,1fr)` in list-only mode, 20px gap), right a **sticky map** (`width:42%`, hidden in list-only mode).
- **Listing card:** rounded 18px, 1px `--border-default`, photo (180px, gradient placeholder behind), save heart (top-right), "X min walk to campus" chip (bottom-left, `rgba(15,23,42,.8)`). Body: type label (uppercase, `--brand-primary-dark`, 11.5px, **nowrap**), star rating, title (Sora 17px), `area · university`, specs row (`beds · cap/room · baths`), **access state chip**, price (`$NNN` Sora 20px + `/mo`) + availability. Hover: `translateY(-4px)` + shadow.
- **Access state chip:** locked = `🔒 Contact locked · $2 to unlock` on `#FFF7E6`/`#92660B`; unlocked = `🔓 Full access unlocked` on `#E8F7EE`/`#15803D`. Driven by whether the user has a valid payment for that accommodation.
- **Map:** stylised street grid, dashed campus radius with a `--brand-primary-dark` campus label, one **price pin** per listing (`$NNN`); the pin for the hovered/selected listing inverts to dark. Clicking a pin or card opens detail.
- **Filters:** search matches title+area; university selector cycles UZ/NUST/MSU/Africa Univ.; type chips (Ensuite / Studio / Shared) multi-select; price slider `$100–$500`. Empty state when nothing matches.

### 2. Listing detail (student) — `pages/PropertyDetails.jsx` (rework)
- **Purpose:** Full property info + apply.
- **Layout:** Back link, title row (title + `★ rating · reviews · area · walk-to-uni`) with a Save button, then a **5-cell gallery grid** (`2fr 1fr 1fr`, two rows, 274px, "+9 photos" overlay on last). Below: two columns — content (`1fr`) + **sticky apply card** (`350px`).
- **Content sections:** specs strip (Bedrooms / Bathrooms / Per room / Rating), host row (gradient avatar, "Hosted by …", "✓ Verified host" pill), About (line-height 1.7), **amenities grid** (2-col; available = full colour on `#EAF6FB`, unavailable = muted + strikethrough), reviews (2-col cards).
- **Apply card:** price `/month`, availability + lease. **Locked** → amber panel explaining the $2 PayNow unlock. **Unlocked** → green panel revealing host name / phone / email. Move-in / lease / sharing facts box. Primary button label is `Pay $2 to unlock & apply` (locked) or `Apply now` (unlocked); secondary "Message host".

### 3. Apply + PayNow flow — modal (new; replaces the two-modal jump in current `Listings.jsx`)
A single 3-step modal with a progress bar:
1. **Your details** — full name, university email, phone, year of study, move-in date, optional message, student-verification prompt (.ac.zw email or upload registration letter).
2. **Payment** — `$2.00` one-time access fee. PayNow branding. **Payment method** cards: **Mobile money** (EcoCash/OneMoney provider toggle + phone) or **Card/bank** (email for receipt). Copy adapts to the choice.
3. **Review** — applicant, property, pay-via, rent (paid to host later), **access fee now $2.00**; amber note that only the $2 is charged now.
Then a **processing** state ("Check your phone" for mobile / "Redirecting to PayNow" for web), then **success** — confirms payment, reveals contact details, and routes to Messages. Footer Back/Continue; final button "Pay $2.00 with PayNow".

### 4. Saved + student profile — `pages/Account.jsx` (extend) / new `Saved`
- Left **profile card:** avatar, name, "Year · Course · University", "✓ Verified student" pill, key facts (university, budget, move-in, active applications), Edit profile.
- Right: **Saved homes** grid (2-col); each card toggles save (heart). Empty state with a Browse CTA.

### 5. Messages — new `pages/Messages.jsx`
- Two-pane (`300px` thread list + chat). Thread row: avatar, name, time, preview; active row tinted `#EAF6FB`. Chat: header (host avatar + "Verified host"), message bubbles (mine = `--brand-primary-dark` right-aligned, theirs = white bordered left-aligned), composer (input + Send). Sending appends to the thread.

### 6. Host dashboard — new `pages/HostDashboard.jsx`
- Greeting + "List a new place" button. **4 stat cards** (Total views, Enquiries, Applications, Occupancy) each with icon chip + value + coloured delta.
- Two columns: **Your listings** (thumbnail, title, **status badge**, area · price, `👁 views · ✉ enquiries`, edit/more) and **New applicants** (avatar, name + ✓verified, meta, time, quoted message, **Accept / Message / Decline**). Status badges: Active `#E8F7EE/#15803D`, Pending `#FEF3C7/#92660B`, Rented `#E0F2FE/#0369A1`.

### 7. List a property (host) — `pages/ListPropertyPage.jsx` (restyle to tokens)
- Back link, title + value-prop, **4-step indicator** (Basics / Photos / Pricing / Review). Card: title, description, nearest university (select), suburb, rent (USD), bedrooms, people/room, **amenity toggles**, photo dropzone (≥3, ≤5MB each). Footer: Save draft / Continue to review. Reuse the existing create endpoint; restyle from the indigo Tailwind defaults to the `brand-*` tokens.

---

## Interactions & behavior
- **Role switch** swaps nav items and default screen (Student→Browse, Host→Dashboard).
- **Navigation:** use the existing `useNavigation()` context; add routes for `messages`, `saved`/`profile`, `host-dashboard`. Reset scroll on navigate (already done).
- **Save/favourite:** optimistic toggle, persisted per user (see API).
- **Apply/pay:** access fee unlocks `accommodation_details` for that accommodation for 30 days (existing payments model). On success, reveal contacts + create an application + open/seed a message thread.
- **Animations:** screen enter `fade+translateY(10px) .4s ease`; modal `fade .25s` backdrop + `pop .3s` panel; processing spinner `.8s` linear. Keep framer-motion where already used.
- **Loading/error/empty states:** spinners during fetch; error card with retry (pattern exists in `MyListings.jsx`); empty states for no results / no saved / no listings.
- **Responsive:** below ~900px collapse the browse split to a single column (list, map behind a toggle); stack detail columns; dashboard columns stack.

## State management
Per screen (mirror the prototype's logic class):
- Browse: `search`, `university`, `selectedTypes[]`, `maxPrice`, `mapMode`, `selectedId`, `saved{}`.
- Detail/apply: `selectedId`, `applyStep`, `applyPhase` (`form|processing|done`), `payMethod` (`mobile|web`), `mobileProvider` (`ecocash|onemoney`), form fields, `unlocked{}` (from payment verification — reuse `usePaymentVerification`).
- Messages: `threadId`, `draft`, optimistic `sent[]`.
- Data fetching: see `API.md`. Keep the existing `usePaymentVerification(feature, accommodationId)` hook as the source of truth for locked/unlocked.

## Design tokens, schema, API
See the companion files in this folder:
- **`DESIGN_TOKENS.md`** — exact colours, type scale, spacing, radii, shadows (matches `src/index.css`).
- **`SCHEMA.sql`** — PostgreSQL DDL for every table (extends the existing accommodations + payments tables with applications, messages, favourites, universities, amenities, map coords).
- **`API.md`** — REST endpoint contracts for auth, listings, favourites, applications, messages, payments, and the host dashboard.

## Assets
- **Logo:** `frontend/src/assets/logo.png` (existing round logo). The prototype draws a placeholder house glyph — use the real logo.
- **Listing photos:** the prototype uses Unsplash placeholders. Real photos come from host uploads (`accommodation_images`). Keep gradient placeholders as the loading/empty fallback.
- **Icons:** `lucide-react` (already a dependency). The prototype uses emoji for amenities; swap to the existing lucide amenity icon set in `Listings.jsx` (`Wifi`, `Utensils`, `Car`, `Sofa`, …).

## Files in this bundle
- `prototype/UniAcco.dc.html` — the interactive design reference (all 7 screens + flows).
- `prototype/support.js` — runtime for the prototype (so it opens offline; not part of your app).
- `DESIGN_TOKENS.md`, `SCHEMA.sql`, `API.md` — implementation specs.

## Suggested build order
1. **DB + auth:** apply `SCHEMA.sql`; confirm JWT roles. Seed universities + amenities.
2. **Listings API + Browse/Detail** recreate against tokens; wire `usePaymentVerification`.
3. **PayNow apply flow:** finish `paynowService` + `paymentRoutes`; the 3-step modal; unlock-on-success.
4. **Applications:** create on successful apply; host dashboard applicants Accept/Decline.
5. **Favourites + Saved/Profile.**
6. **Messaging:** threads + messages (seed a thread when an application is accepted).
7. **Host dashboard stats** (views/enquiries/occupancy) + restyle **List a property**.
8. **Responsive pass + empty/error/loading states.**
