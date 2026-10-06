const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { rateLimit } = require('../utils/rateLimit');

const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many sign-in attempts. Try again in 15 minutes.' });

router.post('/register', authLimit, auth.register);
router.post('/login', authLimit, auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.get('/me', authenticateToken, auth.me);

module.exports = router;
