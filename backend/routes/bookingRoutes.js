// routes/bookingRoutes.js
const express = require('express');
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

const createBookingValidation = [
  body('accommodationId').isUUID().withMessage('Valid accommodation ID required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required')
];

// Student routes
router.post('/',
  authenticateToken,
  authorizeRoles('student'),
  createBookingValidation,
  bookingController.createBooking
);

router.get('/my-bookings',
  authenticateToken,
  authorizeRoles('student'),
  bookingController.getMyBookings
);

router.put('/:id/cancel',
  authenticateToken,
  authorizeRoles('student'),
  bookingController.cancelBooking
);

// Landlord routes
router.get('/property-bookings',
  authenticateToken,
  authorizeRoles('landlord'),
  bookingController.getPropertyBookings
);

router.put('/:id/status',
  authenticateToken,
  authorizeRoles('landlord'),
  bookingController.updateBookingStatus
);

module.exports = router;