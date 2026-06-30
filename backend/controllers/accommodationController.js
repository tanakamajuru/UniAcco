const pool = require('../config/database');
const {
  ACC_SELECT,
  unlockedAccommodationIds,
  serializeAccommodation,
} = require('../utils/accommodation');

const PAGE_SIZE = 12;

// GET /api/accommodations?university=&type=&maxPrice=&amenities=wifi,kitchen&q=&page=
exports.list = async (req, res) => {
  try {
    const { university, type, maxPrice, amenities, q } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const where = [`a.status = 'active'`];
    const params = [];
    let i = 1;

    if (university) {
      // accept a university id (uuid) or a short code like "UZ"
      where.push(`(a.university_id::text = $${i} OR u.short ILIKE $${i})`);
      params.push(university);
      i++;
    }
    if (type) {
      where.push(`a.type = $${i++}`);
      params.push(type);
    }
    if (maxPrice) {
      where.push(`a.price_per_month <= $${i++}`);
      params.push(Number(maxPrice));
    }
    if (q) {
      where.push(`(a.title ILIKE $${i} OR a.suburb ILIKE $${i})`);
      params.push(`%${q}%`);
      i++;
    }
    if (amenities) {
      const ids = String(amenities)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length) {
        where.push(`a.id IN (
          SELECT accommodation_id FROM accommodation_amenities
          WHERE amenity_id = ANY($${i})
          GROUP BY accommodation_id
          HAVING count(*) = $${i + 1}
        )`);
        params.push(ids, ids.length);
        i += 2;
      }
    }

    const whereSql = `WHERE ${where.join(' AND ')}`;
    const filtered = Boolean(type || maxPrice || q || amenities || university);
    const orderSql = filtered
      ? 'ORDER BY a.created_at DESC, a.price_per_month ASC'
      : 'ORDER BY a.created_at DESC';

    const countRes = await pool.query(
      `SELECT count(*)::int AS total FROM accommodations a
       LEFT JOIN universities u ON u.id = a.university_id ${whereSql}`,
      params
    );
    const total = countRes.rows[0].total;

    const dataParams = params.slice();
    const listSql = `${ACC_SELECT} ${whereSql} ${orderSql} LIMIT $${i} OFFSET $${i + 1}`;
    dataParams.push(PAGE_SIZE, (page - 1) * PAGE_SIZE);
    const { rows } = await pool.query(listSql, dataParams);

    const unlocked = await unlockedAccommodationIds(req.user && req.user.id);
    const results = rows.map((r) => serializeAccommodation(r, unlocked.has(r.id)));

    res.json({ results, total });
  } catch (error) {
    console.error('List accommodations error:', error);
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
};

// GET /api/accommodations/landlord  (landlord) -> own listings + stats
exports.landlordListings = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `${ACC_SELECT}
       WHERE a.landlord_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );

    // enquiries = distinct message threads per accommodation
    const enqRes = await pool.query(
      `SELECT accommodation_id, count(*)::int AS enquiries
         FROM message_threads
        WHERE landlord_id = $1 AND accommodation_id IS NOT NULL
        GROUP BY accommodation_id`,
      [req.user.id]
    );
    const enquiriesByAcc = Object.fromEntries(
      enqRes.rows.map((r) => [r.accommodation_id, r.enquiries])
    );

    const results = rows.map((r) => ({
      ...serializeAccommodation(r, true),
      enquiries: enquiriesByAcc[r.id] || 0,
    }));
    res.json(results);
  } catch (error) {
    console.error('Landlord listings error:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

// GET /api/accommodations/:id -> detail (+description, reviews); increments views
exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`${ACC_SELECT} WHERE a.id = $1`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Accommodation not found' });

    // increment views (don't count the owner viewing their own listing)
    if (!req.user || req.user.id !== rows[0].landlord_id) {
      await pool.query('UPDATE accommodations SET views = views + 1 WHERE id = $1', [id]);
    }

    const reviewsRes = await pool.query(
      `SELECT r.rating, r.body, r.created_at,
              COALESCE(r.author_name, u.full_name, 'Student') AS author
         FROM reviews r
         LEFT JOIN users u ON u.id = r.author_id
        WHERE r.accommodation_id = $1
        ORDER BY r.created_at DESC`,
      [id]
    );

    const unlocked = await unlockedAccommodationIds(req.user && req.user.id);
    const acc = serializeAccommodation(rows[0], unlocked.has(id));
    acc.reviews = reviewsRes.rows.map((r) => ({
      author: r.author,
      initials: initials(r.author),
      when: timeAgo(r.created_at),
      text: r.body,
      rating: Number(r.rating),
    }));

    res.json(acc);
  } catch (error) {
    console.error('Detail error:', error);
    res.status(500).json({ error: 'Failed to fetch accommodation' });
  }
};

// POST /api/accommodations (landlord) — multipart (images[]) or json
exports.create = async (req, res) => {
  const client = await pool.connect();
  try {
    const b = req.body;
    const title = b.title;
    const pricePerMonth = b.pricePerMonth || b.price_per_month;
    if (!title || !pricePerMonth) {
      return res.status(400).json({ error: 'title and pricePerMonth are required' });
    }

    await client.query('BEGIN');

    const bedrooms = parseInt(b.bedrooms, 10) || 1;
    const peoplePerRoom = parseInt(b.peoplePerRoom || b.people_per_room, 10) || 1;
    const status = b.status === 'draft' ? 'draft' : 'pending';

    const accRes = await client.query(
      `INSERT INTO accommodations
        (landlord_id, title, description, type, suburb, city, university_id, campus_id,
         price_per_month, bedrooms, bathrooms, people_per_room, walk_minutes,
         available_from, lease_terms, status, rooms_total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING id`,
      [
        req.user.id,
        title,
        b.description || null,
        b.type || null,
        b.suburb || null,
        b.city || 'Harare',
        b.universityId || b.university_id || null,
        b.campusId || b.campus_id || null,
        Number(pricePerMonth),
        bedrooms,
        parseInt(b.bathrooms, 10) || 1,
        peoplePerRoom,
        b.walkMinutes || b.walk_minutes || null,
        b.availableFrom || b.available_from || null,
        b.leaseTerms || b.lease_terms || null,
        status,
        bedrooms,
      ]
    );
    const accId = accRes.rows[0].id;

    // amenities
    let amenityIds = b.amenities;
    if (typeof amenityIds === 'string') {
      try {
        amenityIds = JSON.parse(amenityIds);
      } catch {
        amenityIds = amenityIds.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    if (Array.isArray(amenityIds)) {
      for (const aid of amenityIds) {
        await client.query(
          `INSERT INTO accommodation_amenities (accommodation_id, amenity_id)
           VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [accId, aid]
        );
      }
    }

    // images: uploaded files take priority, else JSON urls
    const files = req.files || [];
    if (files.length) {
      let pos = 0;
      for (const f of files) {
        await client.query(
          `INSERT INTO accommodation_images (accommodation_id, image_url, position)
           VALUES ($1,$2,$3)`,
          [accId, `/uploads/accommodations/${f.filename}`, pos++]
        );
      }
    } else if (Array.isArray(b.images)) {
      let pos = 0;
      for (const url of b.images) {
        await client.query(
          `INSERT INTO accommodation_images (accommodation_id, image_url, position)
           VALUES ($1,$2,$3)`,
          [accId, url, pos++]
        );
      }
    }

    await client.query('COMMIT');

    const { rows } = await pool.query(`${ACC_SELECT} WHERE a.id = $1`, [accId]);
    res.status(201).json(serializeAccommodation(rows[0], true));
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Create accommodation error:', error);
    res.status(500).json({ error: 'Failed to create accommodation' });
  } finally {
    client.release();
  }
};

// PATCH /api/accommodations/:id (owner)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const owned = await pool.query(
      'SELECT landlord_id FROM accommodations WHERE id = $1',
      [id]
    );
    if (owned.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (owned.rows[0].landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your listing' });
    }

    const map = {
      title: 'title',
      description: 'description',
      type: 'type',
      suburb: 'suburb',
      city: 'city',
      pricePerMonth: 'price_per_month',
      bedrooms: 'bedrooms',
      bathrooms: 'bathrooms',
      peoplePerRoom: 'people_per_room',
      leaseTerms: 'lease_terms',
      availableFrom: 'available_from',
      status: 'status',
      roomsFilled: 'rooms_filled',
    };
    const sets = [];
    const params = [];
    let i = 1;
    for (const [key, col] of Object.entries(map)) {
      if (req.body[key] !== undefined) {
        sets.push(`${col} = $${i++}`);
        params.push(req.body[key]);
      }
    }
    if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update' });
    params.push(id);
    await pool.query(`UPDATE accommodations SET ${sets.join(', ')} WHERE id = $${i}`, params);

    const { rows } = await pool.query(`${ACC_SELECT} WHERE a.id = $1`, [id]);
    res.json(serializeAccommodation(rows[0], true));
  } catch (error) {
    console.error('Update accommodation error:', error);
    res.status(500).json({ error: 'Failed to update accommodation' });
  }
};

// DELETE /api/accommodations/:id (owner)
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const owned = await pool.query(
      'SELECT landlord_id FROM accommodations WHERE id = $1',
      [id]
    );
    if (owned.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (owned.rows[0].landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your listing' });
    }
    await pool.query('DELETE FROM accommodations WHERE id = $1', [id]);
    res.json({ deleted: true });
  } catch (error) {
    console.error('Delete accommodation error:', error);
    res.status(500).json({ error: 'Failed to delete accommodation' });
  }
};

// ---------- small presentation helpers ----------
function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

function timeAgo(date) {
  const d = new Date(date);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}
