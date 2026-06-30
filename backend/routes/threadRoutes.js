const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { ensureThread } = require('../utils/messaging');

const initials = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

const timeAgo = (date) => {
  if (!date) return '';
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

router.use(authenticateToken);

// GET /api/threads -> conversation list for the current user (student or landlord)
router.get('/', async (req, res) => {
  try {
    const me = req.user.id;
    const { rows } = await pool.query(
      `SELECT t.id, t.accommodation_id,
              a.title AS acc_title,
              CASE WHEN t.student_id = $1 THEN land.full_name ELSE stu.full_name END AS counterpart_name,
              CASE WHEN t.student_id = $1 THEN land.is_verified ELSE stu.is_verified END AS counterpart_verified,
              lm.body AS last_message, lm.created_at AS last_at,
              (SELECT count(*) FROM messages m
                 WHERE m.thread_id = t.id AND m.sender_id <> $1 AND m.read_at IS NULL)::int AS unread
         FROM message_threads t
         LEFT JOIN accommodations a ON a.id = t.accommodation_id
         JOIN users stu  ON stu.id  = t.student_id
         JOIN users land ON land.id = t.landlord_id
         LEFT JOIN LATERAL (
           SELECT body, created_at FROM messages
            WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1
         ) lm ON true
        WHERE t.student_id = $1 OR t.landlord_id = $1
        ORDER BY COALESCE(lm.created_at, t.created_at) DESC`,
      [me]
    );

    res.json(
      rows.map((r) => ({
        id: r.id,
        counterpart: {
          name: r.counterpart_name,
          initials: initials(r.counterpart_name),
          verified: r.counterpart_verified,
        },
        accommodation: r.accommodation_id ? { id: r.accommodation_id, title: r.acc_title } : null,
        lastMessage: r.last_message || '',
        lastAt: r.last_at,
        time: timeAgo(r.last_at),
        unread: r.unread,
      }))
    );
  } catch (error) {
    console.error('Threads list error:', error);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

// GET /api/threads/:id/messages
router.get('/:id/messages', async (req, res) => {
  try {
    const me = req.user.id;
    const t = await pool.query(
      'SELECT * FROM message_threads WHERE id = $1 AND (student_id = $2 OR landlord_id = $2)',
      [req.params.id, me]
    );
    if (t.rows.length === 0) return res.status(404).json({ error: 'Thread not found' });

    // mark incoming as read
    await pool.query(
      'UPDATE messages SET read_at = now() WHERE thread_id = $1 AND sender_id <> $2 AND read_at IS NULL',
      [req.params.id, me]
    );

    const { rows } = await pool.query(
      'SELECT id, sender_id, body, created_at FROM messages WHERE thread_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json(
      rows.map((m) => ({ id: m.id, mine: m.sender_id === me, body: m.body, created_at: m.created_at }))
    );
  } catch (error) {
    console.error('Messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/threads/:id/messages { body }
router.post('/:id/messages', async (req, res) => {
  try {
    const me = req.user.id;
    const { body } = req.body;
    if (!body || !body.trim()) return res.status(400).json({ error: 'Message body required' });

    const t = await pool.query(
      'SELECT * FROM message_threads WHERE id = $1 AND (student_id = $2 OR landlord_id = $2)',
      [req.params.id, me]
    );
    if (t.rows.length === 0) return res.status(404).json({ error: 'Thread not found' });

    const { rows } = await pool.query(
      'INSERT INTO messages (thread_id, sender_id, body) VALUES ($1,$2,$3) RETURNING id, body, created_at',
      [req.params.id, me, body.trim()]
    );
    res.status(201).json({ message: { ...rows[0], mine: true } });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST /api/threads { accommodationId } — start from "Message host"
router.post('/', async (req, res) => {
  try {
    const { accommodationId } = req.body;
    if (!accommodationId) return res.status(400).json({ error: 'accommodationId required' });

    const acc = await pool.query(
      'SELECT landlord_id FROM accommodations WHERE id = $1',
      [accommodationId]
    );
    if (acc.rows.length === 0) return res.status(404).json({ error: 'Accommodation not found' });

    // Only students start threads via this endpoint.
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can start a conversation here' });
    }

    const thread = await ensureThread({
      studentId: req.user.id,
      landlordId: acc.rows[0].landlord_id,
      accommodationId,
    });
    res.status(201).json({ thread });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

module.exports = router;
