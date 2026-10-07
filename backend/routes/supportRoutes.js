const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { rateLimit } = require('../utils/rateLimit');
const ctrl = require('../controllers/adminController');

// Anyone can send a help message; signed-in users are linked to their account.
const messageLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: 'Too many messages. Try again later.' });
router.post('/', messageLimit, optionalAuth, ctrl.createSupport);

module.exports = router;
