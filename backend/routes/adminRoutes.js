const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

const admin = [authenticateToken, authorizeRoles('admin')];

router.get('/users', ...admin, ctrl.listUsers);
router.patch('/users/:id', ...admin, ctrl.updateUser);
router.delete('/users/:id', ...admin, ctrl.deleteUser);
router.get('/listings', ...admin, ctrl.listListings);
router.patch('/listings/:id', ...admin, ctrl.updateListing);
router.delete('/listings/:id', ...admin, ctrl.deleteListing);
router.get('/support', ...admin, ctrl.listSupport);
router.post('/support/:id/reply', ...admin, ctrl.replySupport);
router.get('/audit', ...admin, ctrl.listAudit);

module.exports = router;
