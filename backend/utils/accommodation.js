// Shared helpers for assembling the Accommodation response shape (see API.md)
// and for the "has the user unlocked this accommodation?" access check.
const pool = require('../config/database');

const ACCESS_FEATURE = 'accommodation_details';

/**
 * Returns the set of accommodation ids the given user has unlocked
 * (a paid, non-expired `accommodation_details` payment).
 */
async function unlockedAccommodationIds(userId) {
  if (!userId) return new Set();
  const { rows } = await pool.query(
    `SELECT DISTINCT accommodation_id
       FROM payments
      WHERE user_id = $1
        AND feature = $2
        AND status = 'paid'
        AND (valid_until IS NULL OR valid_until > now())`,
    [userId, ACCESS_FEATURE]
  );
  return new Set(rows.map((r) => r.accommodation_id));
}

async function hasUnlocked(userId, accommodationId) {
  if (!userId || !accommodationId) return false;
  const { rows } = await pool.query(
    `SELECT 1 FROM payments
      WHERE user_id = $1 AND accommodation_id = $2 AND feature = $3
        AND status = 'paid' AND (valid_until IS NULL OR valid_until > now())
      LIMIT 1`,
    [userId, accommodationId, ACCESS_FEATURE]
  );
  return rows.length > 0;
}

// SQL fragment that aggregates everything a listing card / detail needs.
const ACC_SELECT = `
  SELECT
    a.*,
    u.short  AS uni_short,
    u.name   AS uni_name,
    l.full_name AS landlord_name,
    l.phone     AS landlord_phone,
    l.email     AS landlord_email,
    COALESCE(img.images, '{}')          AS images,
    COALESCE(am.amenities, '{}')        AS amenities,
    COALESCE(rv.rating, 0)::float       AS rating,
    COALESCE(rv.reviews_count, 0)::int  AS reviews_count
  FROM accommodations a
  JOIN users l ON l.id = a.landlord_id
  LEFT JOIN universities u ON u.id = a.university_id
  LEFT JOIN LATERAL (
    SELECT array_agg(image_url ORDER BY position) AS images
    FROM accommodation_images WHERE accommodation_id = a.id
  ) img ON true
  LEFT JOIN LATERAL (
    SELECT array_agg(amenity_id) AS amenities
    FROM accommodation_amenities WHERE accommodation_id = a.id
  ) am ON true
  LEFT JOIN LATERAL (
    SELECT round(avg(rating)::numeric, 1) AS rating, count(*) AS reviews_count
    FROM reviews WHERE accommodation_id = a.id
  ) rv ON true
`;

/**
 * Maps a joined accommodation row to the API Accommodation object.
 * @param {boolean} unlocked - whether the caller has paid access (reveals landlord).
 */
function serializeAccommodation(row, unlocked = false) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    suburb: row.suburb,
    city: row.city,
    address: unlocked ? row.address : null,
    university: row.university_id
      ? { id: row.university_id, name: row.uni_name, short: row.uni_short }
      : null,
    price_per_month: Number(row.price_per_month),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    people_per_room: row.people_per_room,
    walk_minutes: row.walk_minutes,
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    rating: Number(row.rating) || 0,
    reviews_count: row.reviews_count || 0,
    available_from: row.available_from,
    lease_terms: row.lease_terms,
    images: row.images || [],
    amenities: row.amenities || [],
    status: row.status,
    views: row.views,
    rooms_total: row.rooms_total,
    rooms_filled: row.rooms_filled,
    access: { unlocked },
    landlord: unlocked
      ? { name: row.landlord_name, phone: row.landlord_phone, email: row.landlord_email }
      : null,
  };
}

module.exports = {
  ACCESS_FEATURE,
  ACC_SELECT,
  unlockedAccommodationIds,
  hasUnlocked,
  serializeAccommodation,
};
