const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/roommateController');

router.get('/', authenticateToken, authorizeRoles('student'), ctrl.list);
router.get('/mine', authenticateToken, authorizeRoles('student'), ctrl.mine);
router.put('/mine', authenticateToken, authorizeRoles('student'), ctrl.save);
router.delete('/mine', authenticateToken, authorizeRoles('student'), ctrl.remove);

module.exports = router;
