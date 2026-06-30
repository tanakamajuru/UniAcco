const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.patch('/me', authenticateToken, auth.updateMe);
router.post('/verify', authenticateToken, auth.verify);

module.exports = router;
