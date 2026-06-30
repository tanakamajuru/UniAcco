const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/accommodationController');

// Public browse / detail (optionalAuth so we can compute per-user access)
router.get('/', optionalAuth, ctrl.list);

// Landlord's own listings — must come before "/:id"
router.get('/landlord', authenticateToken, authorizeRoles('landlord'), ctrl.landlordListings);

router.get('/:id', optionalAuth, ctrl.detail);

// Landlord management
router.post(
  '/',
  authenticateToken,
  authorizeRoles('landlord'),
  upload.array('images', 5),
  ctrl.create
);
router.patch('/:id', authenticateToken, authorizeRoles('landlord'), ctrl.update);
router.delete('/:id', authenticateToken, authorizeRoles('landlord'), ctrl.remove);

module.exports = router;
