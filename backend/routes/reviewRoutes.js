// routes/reviewRoutes.js
const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

const createReviewValidation = [
  body('accommodationId').isUUID().withMessage('Valid accommodation ID required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim()
];

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create review for completed booking (Student only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accommodationId
 *               - rating
 *             properties:
 *               accommodationId:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Clean rooms, great location, very responsive landlord.
 *     responses:
 *       201:
 *         description: Review submitted
 *       400:
 *         description: Booking not completed or already reviewed
 */
router.post('/',
  authenticateToken,
  authorizeRoles('student'),
  createReviewValidation,
  reviewController.createReview
);

/**
 * @swagger
 * /api/reviews/accommodation/{id}:
 *   get:
 *     summary: Get reviews for an accommodation
 *     tags: [Reviews]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 averageRating:
 *                   type: number
 *                   example: 4.3
 */
router.get('/accommodation/:accommodationId',
  reviewController.getAccommodationReviews
);

/**
 * @swagger
 * /api/reviews/my-reviews:
 *   get:
 *     summary: Get current student's reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of student's reviews
 */
router.get('/my-reviews',
  authenticateToken,
  authorizeRoles('student'),
  reviewController.getMyReviews
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete review (Student only - own review)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review deleted
 *       403:
 *         description: Not allowed to delete this review
 */
router.delete('/:id',
  authenticateToken,
  authorizeRoles('student'),
  reviewController.deleteReview
);

module.exports = router;