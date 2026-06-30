const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/applicationController');

router.post('/', authenticateToken, authorizeRoles('student'), ctrl.create);
router.get('/mine', authenticateToken, authorizeRoles('student'), ctrl.mine);
router.get('/landlord', authenticateToken, authorizeRoles('landlord'), ctrl.forLandlord);
router.patch('/:id', authenticateToken, authorizeRoles('landlord'), ctrl.updateStatus);

module.exports = router;
