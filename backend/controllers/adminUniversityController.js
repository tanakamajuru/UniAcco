// Admin: manage universities and their campuses. Every change is written to admin_audit.
const pool = require('../config/database');

const audit = (adminId, action, target, detail) =>
  pool.query('INSERT INTO admin_audit (admin_id, action, target, detail) VALUES ($1,$2,$3,$4)', [
    adminId,
    action,
    target,
    detail ? String(detail).slice(0, 500) : null,
  ]);

const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
const text = (v, max = 200) => (String(v ?? '').trim().slice(0, max) || null);

// GET /api/admin/universities — every university with its campuses and listing counts.
exports.listUniversities = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.short, u.city, u.lat, u.lng,
            (SELECT count(*)::int FROM accommodations a WHERE a.university_id = u.id) AS listings,
            COALESCE(json_agg(json_build_object(
              'id', c.id, 'name', c.name, 'city', c.city, 'province', c.province,
              'lat', c.lat, 'lng', c.lng,
              'listings', (SELECT count(*)::int FROM accommodations a WHERE a.campus_id = c.id)
            ) ORDER BY c.name) FILTER (WHERE c.id IS NOT NULL), '[]') AS campuses
       FROM universities u
       LEFT JOIN campuses c ON c.university_id = u.id
      GROUP BY u.id
      ORDER BY u.name`
  );
  res.json({ universities: rows });
};

// POST /api/admin/universities
exports.createUniversity = async (req, res) => {
  const name = text(req.body.name);
  const short = text(req.body.short, 20);
  const city = text(req.body.city);
  if (!name || !short || !city) return res.status(400).json({ error: 'Name, short name and city are required' });
  const { rows } = await pool.query(
    'INSERT INTO universities (name, short, city, lat, lng) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, short, city, lat, lng',
    [name, short, city, num(req.body.lat), num(req.body.lng)]
  );
  await audit(req.user.id, 'university.create', rows[0].id, name);
  res.status(201).json({ university: rows[0] });
};

// PATCH /api/admin/universities/:id
exports.updateUniversity = async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE universities SET name = COALESCE($2, name), short = COALESCE($3, short),
            city = COALESCE($4, city), lat = COALESCE($5, lat), lng = COALESCE($6, lng)
      WHERE id = $1 RETURNING id, name, short, city, lat, lng`,
    [req.params.id, text(req.body.name), text(req.body.short, 20), text(req.body.city), num(req.body.lat), num(req.body.lng)]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'University not found' });
  await audit(req.user.id, 'university.update', req.params.id, JSON.stringify(req.body));
  res.json({ university: rows[0] });
};

// DELETE /api/admin/universities/:id — refused while listings still use it.
exports.deleteUniversity = async (req, res) => {
  const used = await pool.query('SELECT count(*)::int AS n FROM accommodations WHERE university_id = $1', [req.params.id]);
  if (used.rows[0].n > 0) {
    return res.status(409).json({ error: `${used.rows[0].n} listing(s) use this university. Move or delete them first.` });
  }
  const { rows } = await pool.query('DELETE FROM universities WHERE id = $1 RETURNING name', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'University not found' });
  await audit(req.user.id, 'university.delete', req.params.id, rows[0].name);
  res.json({ deleted: true });
};

// POST /api/admin/universities/:id/campuses
exports.createCampus = async (req, res) => {
  const name = text(req.body.name);
  if (!name) return res.status(400).json({ error: 'Campus name is required' });
  const { rows } = await pool.query(
    `INSERT INTO campuses (university_id, name, city, province, lat, lng)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, city, province, lat, lng`,
    [req.params.id, name, text(req.body.city), text(req.body.province), num(req.body.lat), num(req.body.lng)]
  );
  await audit(req.user.id, 'campus.create', rows[0].id, name);
  res.status(201).json({ campus: rows[0] });
};

// PATCH /api/admin/campuses/:id
exports.updateCampus = async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE campuses SET name = COALESCE($2, name), city = COALESCE($3, city),
            province = COALESCE($4, province), lat = COALESCE($5, lat), lng = COALESCE($6, lng)
      WHERE id = $1 RETURNING id, name, city, province, lat, lng`,
    [req.params.id, text(req.body.name), text(req.body.city), text(req.body.province), num(req.body.lat), num(req.body.lng)]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Campus not found' });
  await audit(req.user.id, 'campus.update', req.params.id, JSON.stringify(req.body));
  res.json({ campus: rows[0] });
};

// DELETE /api/admin/campuses/:id — listings on it lose their campus (their distance clears).
exports.deleteCampus = async (req, res) => {
  await pool.query(
    'UPDATE accommodations SET campus_id = NULL, distance_to_campus_m = NULL WHERE campus_id = $1',
    [req.params.id]
  );
  const { rows } = await pool.query('DELETE FROM campuses WHERE id = $1 RETURNING name', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Campus not found' });
  await audit(req.user.id, 'campus.delete', req.params.id, rows[0].name);
  res.json({ deleted: true });
};
