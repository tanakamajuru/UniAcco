# UniAcco — API contracts

Base URL: `VITE_API_URL` (default `http://localhost:5000`). All authed routes take `Authorization: Bearer <jwt>`. JWT payload includes `{ id, role }` (`student` | `landlord`). JSON in/out. Money is USD.

Conventions: `200/201` success, `400` validation, `401` unauth, `403` wrong role, `404` missing, `409` conflict. Errors: `{ "error": "message" }`.

---

## Auth
```
POST /api/auth/register   { fullName, email, phone?, password, role }      -> { token, user }
POST /api/auth/login      { email, password }                              -> { token, user }
GET  /api/auth/me                                                          -> { user }
PATCH /api/users/me       { fullName?, phone?, universityId?, year?, course? } -> { user }
POST /api/users/verify    { method:'email'|'document', payload }           -> { is_verified }
```

## Universities / amenities (public)
```
GET /api/universities     -> [{ id, name, short, city, lat, lng, campuses:[...] }]
GET /api/amenities        -> [{ id, label, icon }]
```

## Listings
```
GET /api/accommodations?university=&type=&maxPrice=&amenities=wifi,kitchen&q=&page=
    -> { results:[Accommodation], total }
    Accommodation = {
      id, title, type, suburb, city, university:{id,name,short},
      price_per_month, bedrooms, bathrooms, people_per_room,
      walk_minutes, lat, lng, rating, reviews_count, available_from, lease_terms,
      images:[url], amenities:[id], status,
      access:{ unlocked:boolean },              // computed for the caller (see payments)
      landlord:{ name, phone, email } | null    // null unless unlocked
    }

GET  /api/accommodations/:id     -> Accommodation (+ description, reviews:[{author,initials,when,text,rating}])
                                    increments views server-side
POST /api/accommodations         (landlord)  multipart or json -> Accommodation
     { title, description, type, suburb, city, universityId, campusId?,
       pricePerMonth, bedrooms, peoplePerRoom, amenities:[id], images:[file], leaseTerms, availableFrom }
PATCH/DELETE /api/accommodations/:id   (owner landlord)
GET  /api/accommodations/landlord  (landlord) -> own listings with { views, enquiries, status }
```

## Favourites (student)
```
GET    /api/favourites                 -> [Accommodation]
POST   /api/favourites/:accommodationId -> { saved:true }
DELETE /api/favourites/:accommodationId -> { saved:false }
```

## Applications
```
POST /api/applications        (student, requires paid access to the accommodation)
     { accommodationId, fullName, email, phone, yearOfStudy?, moveInDate?, message?, paymentReference }
     -> { application }   // 402 if no valid payment for accommodation_details
GET  /api/applications/mine   (student)   -> [{ application, accommodation }]
GET  /api/applications/landlord (landlord)-> [{ application, student:{name,verified,meta} }]  // pending first
PATCH /api/applications/:id   (landlord)  { status:'accepted'|'declined' } -> { application }
     // on 'accepted' -> ensure a message_thread exists and seed a system/host message
```

## Messaging
```
GET  /api/threads                       -> [{ id, counterpart:{name,initials,verified}, accommodation:{title}, lastMessage, lastAt, unread }]
GET  /api/threads/:id/messages          -> [{ id, mine:boolean, body, created_at }]
POST /api/threads/:id/messages          { body } -> { message }
POST /api/threads                        { accommodationId } -> { thread }   // start from "Message host"
```

## Payments (PayNow) — extends existing paymentRoutes.js
```
POST /api/payments/initiate
     { accommodationId, feature:'accommodation_details', amount:2.00, email,
       paymentMethod:'web'|'mobile', phone?, method?:'ecocash'|'onemoney' }
     web    -> { success, redirectUrl, reference }
     mobile -> { success, instructions, pollUrl, reference }

GET  /api/payments/status/:reference  -> { success, status:'pending'|'paid'|'failed' }
POST /api/payments/webhook            (PayNow server callback) -> 200
     // on 'paid': set status, paid_at=now(), valid_until=now()+30d -> unlocks accommodation_details
```
**Access check (used by listings/detail/applications):** a user has unlocked an accommodation when a `payments` row exists with `feature='accommodation_details'`, `status='paid'`, and `valid_until > now()`. Reuse the existing `usePaymentVerification(feature, accommodationId)` hook on the client.

## Host dashboard
```
GET /api/host/stats   (landlord) -> {
  totalViews, viewsDeltaPct,
  enquiries, enquiriesNew,
  applications, applicationsPending,
  occupancyPct, roomsFilled, roomsTotal
}
GET /api/host/applicants (landlord) -> same as /api/applications/landlord (pending first, with quoted message)
```

---

### Notes
- **Roles:** listing-management, dashboard, and applicant routes are `landlord`-only (403 otherwise). Favourites/applications are `student`-only.
- **Ratings/reviews** can be a later phase; the schema omits a reviews table — add `reviews(id, accommodation_id, author_id, rating, body, created_at)` and compute `rating`/`reviews_count` as aggregates when you build it. The prototype shows the intended card design.
- **Money now vs later:** only the **$2 access fee** is charged via PayNow. Rent is arranged off-platform between student and host after acceptance — do not collect rent in this flow.
- **Pagination/sorting:** default `page=1`, 12 per page; sort by `created_at desc` then `price asc` when filtered.
