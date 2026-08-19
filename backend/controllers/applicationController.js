const pool = require('../config/database');
const { hasUnlocked } = require('../utils/accommodation');
const { ensureThread } = require('../utils/messaging');

const initials = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

const timeAgo = (date) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days <= 0) {
    const hrs = Math.floor((Date.now() - new Date(date).getTime()) / 3600000);
    return hrs <= 0 ? 'just now' : `${hrs}h ago`;
  }
  return `${days}d ago`;
};

// POST /api/applications (student) — requires paid access to the accommodation
exports.create = async (req, res) => {
  try {
    const { accommodationId, fullName, email, phone, yearOfStudy, moveInDate, message } = req.body;
    if (!accommodationId || !fullName || !email) {
      return res.status(400).json({ error: 'accommodationId, fullName and email are required' });
    }

    const unlocked = await hasUnlocked(req.user.id, accommodationId);
    if (!unlocked) {
      return res.status(402).json({ error: 'Payment required to apply for this accommodation' });
    }

    const acc = await pool.query(
      'SELECT id, landlord_id FROM accommodations WHERE id = $1',
      [accommodationId]
    );
    if (acc.rows.length === 0) return res.status(404).json({ error: 'Accommodation not found' });

    // link the most recent paid access payment that gated this
    const pay = await pool.query(
      `SELECT id FROM payments
        WHERE user_id = $1 AND accommodation_id = $2
          AND feature = 'accommodation_details' AND status = 'paid'
        ORDER BY paid_at DESC NULLS LAST LIMIT 1`,
      [req.user.id, accommodationId]
    );

    const { rows } = await pool.query(
      `INSERT INTO applications
        (accommodation_id, student_id, full_name, email, phone, year_of_study, move_in_date, message, payment_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        accommodationId,
        req.user.id,
        fullName,
        email,
        phone || null,
        yearOfStudy || null,
        moveInDate || null,
        message || null,
        pay.rows[0] ? pay.rows[0].id : null,
      ]
    );

    // open a thread with an enquiry message so the host sees it
    await ensureThread({
      studentId: req.user.id,
      landlordId: acc.rows[0].landlord_id,
      accommodationId,
      seed: message ? { senderId: req.user.id, body: message } : undefined,
    });

    res.status(201).json({ application: rows[0] });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// GET /api/applications/mine (student) -> [{ application, accommodation }]
exports.mine = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT app.*,
              a.title, a.suburb, a.price_per_month,
              (SELECT image_url FROM accommodation_images
                WHERE accommodation_id = a.id ORDER BY position LIMIT 1) AS image
         FROM applications app
         JOIN accommodations a ON a.id = app.accommodation_id
        WHERE app.student_id = $1
        ORDER BY app.created_at DESC`,
      [req.user.id]
    );
    res.json(
      rows.map((r) => ({
        application: {
          id: r.id,
          status: r.status,
          message: r.message,
          moveInDate: r.move_in_date,
          createdAt: r.created_at,
        },
        accommodation: {
          id: r.accommodation_id,
          title: r.title,
          suburb: r.suburb,
          price_per_month: Number(r.price_per_month),
          image: r.image || null,
        },
      }))
    );
  } catch (error) {
    console.error('My applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// GET /api/applications/landlord (landlord) -> [{ application, student }] pending first
exports.forLandlord = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT app.*,
              a.title AS acc_title,
              s.full_name AS student_name, s.is_verified AS student_verified,
              u.short AS student_uni
         FROM applications app
         JOIN accommodations a ON a.id = app.accommodation_id
         JOIN users s ON s.id = app.student_id
         LEFT JOIN universities u ON u.id = s.university_id
        WHERE a.landlord_id = $1
        ORDER BY CASE app.status WHEN 'pending' THEN 0 ELSE 1 END,
                 app.created_at DESC`,
      [req.user.id]
    );

    res.json(
      rows.map((r) => {
        const metaParts = [r.student_uni].filter(Boolean);
        return {
          application: {
            id: r.id,
            status: r.status,
            message: r.message,
            moveInDate: r.move_in_date,
            createdAt: r.created_at,
            when: timeAgo(r.created_at),
            accommodation: { id: r.accommodation_id, title: r.acc_title },
          },
          student: {
            id: r.student_id,
            name: r.student_name,
            initials: initials(r.student_name),
            verified: r.student_verified,
            meta: metaParts.join(' · '),
          },
        };
      })
    );
  } catch (error) {
    console.error('Landlord applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
};

// PATCH /api/applications/:id (landlord) { status:'accepted'|'declined' }
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'status must be accepted or declined' });
    }

    const appRes = await pool.query(
      `SELECT app.*, a.landlord_id, a.title
         FROM applications app
         JOIN accommodations a ON a.id = app.accommodation_id
        WHERE app.id = $1`,
      [req.params.id]
    );
    if (appRes.rows.length === 0) return res.status(404).json({ error: 'Application not found' });
    const application = appRes.rows[0];
    if (application.landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your listing' });
    }

    const updated = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    // On accept, ensure a thread exists and seed a host welcome message.
    if (status === 'accepted') {
      await ensureThread({
        studentId: application.student_id,
        landlordId: application.landlord_id,
        accommodationId: application.accommodation_id,
        seed: {
          senderId: application.landlord_id,
          body: `Great news — your application for "${application.title}" has been accepted! Let's arrange a viewing.`,
        },
      });
    }

    res.json({ application: updated.rows[0] });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};
