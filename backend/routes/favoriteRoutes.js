const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const favoriteController = require('../controllers/favoriteController');

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Add accommodation to favorites (Student only)
 *     tags: [Favorites]
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
 *             properties:
 *               accommodationId:
 *                 type: string
 *                 format: uuid
 *                 example: a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1
 *     responses:
 *       201:
 *         description: Added to favorites
 *       400:
 *         description: Already in favorites
 */
router.post('/',
  authenticateToken,
  authorizeRoles('student'),
  favoriteController.addToFavorites
);

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get current student's favorite accommodations
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite accommodations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorites:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Accommodation'
 */
router.get('/',
  authenticateToken,
  authorizeRoles('student'),
  favoriteController.getFavorites
);

/**
 * @swagger
 * /api/favorites/{accommodationId}:
 *   delete:
 *     summary: Remove accommodation from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accommodationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Removed from favorites
 *       404:
 *         description: Favorite not found
 */
router.delete('/:accommodationId',
  authenticateToken,
  authorizeRoles('student'),
  favoriteController.removeFromFavorites
);

module.exports = router;
