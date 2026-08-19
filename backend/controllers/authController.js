// controllers/authController.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Map a users row to the public user object returned by the API.
const serializeUser = (u) => ({
  id: u.id,
  fullName: u.full_name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  universityId: u.university_id || null,
  isVerified: u.is_verified,
  avatarUrl: u.avatar_url || null,
  createdAt: u.created_at,
});

// POST /api/auth/register
exports.register = async (req, res) => {
  const { fullName, phone, password, role = 'student' } = req.body;
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'fullName, email and password are required' });
  }
  if (!['student', 'landlord'].includes(role)) {
    return res.status(400).json({ error: 'role must be student or landlord' });
  }

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    // .ac.zw emails are auto-verified as students.
    const autoVerified = role === 'student' && /\.ac\.zw$/i.test(email);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [fullName, email, phone || null, hashed, role, autoVerified]
    );

    const user = result.rows[0];
    res.status(201).json({ token: generateToken(user), user: serializeUser(user) });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE lower(email) = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ token: generateToken(user), user: serializeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'email is required' });

  try {
    const result = await pool.query('SELECT id, email FROM users WHERE lower(email) = $1', [email]);
    // Keep the response generic so account existence is not disclosed.
    if (result.rows.length === 0) return res.json({ message: 'If an account exists, reset instructions were created.' });

    const resetToken = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Email delivery is not configured in this project yet. The token is returned for local development.
    res.json({
      message: 'Reset instructions created. Use the reset token to choose a new password.',
      resetToken,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Unable to create password reset instructions' });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'token and password are required' });
  if (String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== 'password-reset' || !payload.id) {
      return res.status(400).json({ error: 'Invalid password reset token' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *',
      [hashed, payload.id]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid password reset token' });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'This password reset link is invalid or expired' });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Unable to reset password' });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: serializeUser(result.rows[0]) });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

// PATCH /api/users/me
exports.updateMe = async (req, res) => {
  const map = {
    fullName: 'full_name',
    phone: 'phone',
    universityId: 'university_id',
    avatarUrl: 'avatar_url',
  };

  const sets = [];
  const params = [];
  let i = 1;
  for (const [key, col] of Object.entries(map)) {
    if (req.body[key] !== undefined) {
      sets.push(`${col} = $${i++}`);
      params.push(req.body[key] === '' ? null : req.body[key]);
    }
  }
  if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  params.push(req.user.id);
  try {
    const result = await pool.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    res.json({ user: serializeUser(result.rows[0]) });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
};

// POST /api/users/verify  { method:'email'|'document', payload }
exports.verify = async (req, res) => {
  const { method, payload } = req.body;
  try {
    let verified = false;
    if (method === 'email') {
      // accept .ac.zw student emails
      verified = /\.ac\.zw$/i.test(String(payload || req.user.email || ''));
    } else if (method === 'document') {
      // a real impl would queue manual review; here an uploaded doc marks verified
      verified = Boolean(payload);
    }

    if (!verified) {
      return res.status(400).json({ error: 'Could not verify with the provided details' });
    }

    const result = await pool.query(
      'UPDATE users SET is_verified = true WHERE id = $1 RETURNING is_verified',
      [req.user.id]
    );
    res.json({ is_verified: result.rows[0].is_verified });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Error verifying account' });
  }
};

exports.serializeUser = serializeUser;
