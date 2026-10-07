// Admin panel API. Every route here requires the admin role. Every change is written
// to admin_audit with the admin, the action and the target.
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const audit = (adminId, action, target, detail) =>
  pool.query('INSERT INTO admin_audit (admin_id, action, target, detail) VALUES ($1,$2,$3,$4)', [
    adminId, action, target, detail ? String(detail).slice(0, 500) : null,
  ]);

// ---- Users ----
// GET /api/admin/users?role=student|landlord|admin&q=search
exports.listUsers = async (req, res) => {
  const q = `%${String(req.query.q || '').trim()}%`;
  const role = ['student', 'landlord', 'admin'].includes(req.query.role) ? req.query.role : null;
  const { rows } = await pool.query(
    `SELECT id, full_name, email, phone, role, is_verified, created_at
       FROM users
      WHERE (full_name ILIKE $1 OR email ILIKE $1) AND ($2::text IS NULL OR role = $2)
      ORDER BY created_at DESC LIMIT 200`,
    [q, role]
  );
  res.json({ users: rows });
};

// POST /api/admin/users — create a student, landlord or admin account.
exports.createUser = async (req, res) => {
  const fullName = String(req.body.fullName || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const role = req.body.role || 'student';
  if (!fullName || !email || password.length < 8) {
    return res.status(400).json({ error: 'Name, email and a password of at least 8 characters are required' });
  }
  if (!['student', 'landlord', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student, landlord or admin' });
  }
  const exists = await pool.query('SELECT 1 FROM users WHERE lower(email) = $1', [email]);
  if (exists.rows.length) return res.status(409).json({ error: 'An account with that email already exists' });
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING id, full_name, email, phone, role, is_verified`,
    [fullName, email, req.body.phone || null, hash, role]
  );
  await audit(req.user.id, 'user.create', rows[0].id, `${email} (${role})`);
  res.status(201).json({ user: rows[0] });
};

exports.updateUser = async (req, res) => {
  const { full_name, phone, role, is_verified } = req.body;
  if (role && !['student', 'landlord', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student, landlord or admin' });
  }
  const { rows } = await pool.query(
    `UPDATE users SET full_name = COALESCE($2, full_name), phone = COALESCE($3, phone),
            role = COALESCE($4, role), is_verified = COALESCE($5, is_verified)
      WHERE id = $1
      RETURNING id, full_name, email, phone, role, is_verified`,
    [req.params.id, full_name ?? null, phone ?? null, role ?? null, is_verified ?? null]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
  await audit(req.user.id, 'user.update', req.params.id, JSON.stringify(req.body));
  res.json({ user: rows[0] });
};

exports.deleteUser = async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own admin account' });
  const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING email', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
  await audit(req.user.id, 'user.delete', req.params.id, rows[0].email);
  res.json({ deleted: true });
};

// ---- Listings ----
exports.listListings = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT a.id, a.title, a.suburb, a.price_per_month, a.status, a.needs_review, a.created_at,
            u.email AS landlord_email, c.name AS campus
       FROM accommodations a
       JOIN users u ON u.id = a.landlord_id
       LEFT JOIN campuses c ON c.id = a.campus_id
      ORDER BY a.created_at DESC LIMIT 300`
  );
  res.json({ listings: rows });
};

exports.updateListing = async (req, res) => {
  const { title, price_per_month, status, needs_review } = req.body;
  if (status && !['draft', 'pending', 'active', 'rented', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const { rows } = await pool.query(
    `UPDATE accommodations SET title = COALESCE($2, title),
            price_per_month = COALESCE($3, price_per_month),
            status = COALESCE($4, status), needs_review = COALESCE($5, needs_review)
      WHERE id = $1 RETURNING id, title, price_per_month, status, needs_review`,
    [req.params.id, title ?? null, price_per_month ?? null, status ?? null, needs_review ?? null]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
  await audit(req.user.id, 'listing.update', req.params.id, JSON.stringify(req.body));
  res.json({ listing: rows[0] });
};

exports.deleteListing = async (req, res) => {
  const { rows } = await pool.query('DELETE FROM accommodations WHERE id = $1 RETURNING title', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
  await audit(req.user.id, 'listing.delete', req.params.id, rows[0].title);
  res.json({ deleted: true });
};

// ---- Support inbox ----
exports.listSupport = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, contact, body, status, admin_reply, replied_at, created_at
       FROM support_messages ORDER BY (status = 'open') DESC, created_at DESC LIMIT 200`
  );
  res.json({ messages: rows });
};

exports.replySupport = async (req, res) => {
  const reply = String(req.body.reply || '').trim();
  if (!reply) return res.status(400).json({ error: 'Reply cannot be empty' });
  const { rows } = await pool.query(
    `UPDATE support_messages SET admin_reply = $2, replied_at = now(), status = 'closed'
      WHERE id = $1 RETURNING id, status`,
    [req.params.id, reply]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Message not found' });
  await audit(req.user.id, 'support.reply', req.params.id, reply);
  res.json({ message: rows[0] });
};

// ---- Audit log ----
exports.listAudit = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT l.id, l.action, l.target, l.detail, l.created_at, u.email AS admin_email
       FROM admin_audit l LEFT JOIN users u ON u.id = l.admin_id
      ORDER BY l.created_at DESC LIMIT 200`
  );
  res.json({ entries: rows });
};

// ---- Public: the help chat ----
exports.createSupport = async (req, res) => {
  const body = String(req.body.body || '').trim().slice(0, 2000);
  if (!body) return res.status(400).json({ error: 'Please type your message' });
  const contact = String(req.body.contact || '').trim().slice(0, 200) || null;
  const userId = req.user ? req.user.id : null;
  const { rows } = await pool.query(
    'INSERT INTO support_messages (user_id, contact, body) VALUES ($1,$2,$3) RETURNING id, created_at',
    [userId, contact, body]
  );
  res.status(201).json({ message: rows[0] });
};
