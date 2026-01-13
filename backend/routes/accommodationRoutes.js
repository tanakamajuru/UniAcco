const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
} = require('../controllers/accommodationController');

/**
 * @swagger
 * /api/accommodations:
 *   get:
 *     summary: Get all accommodations
 *     tags: [Accommodations]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter accommodations by city
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price per month
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price per month
 *       - in: query
 *         name: availableFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Available from date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of accommodations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Accommodation'
 */
router.get('/', getAccommodations);

/**
 * @swagger
 * /api/accommodations/{id}:
 *   get:
 *     summary: Get accommodation by ID
 *     tags: [Accommodations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Accommodation ID
 *     responses:
 *       200:
 *         description: Accommodation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Accommodation'
 *       404:
 *         description: Accommodation not found
 */
router.get('/:id', getAccommodationById);

/**
 * @swagger
 * /api/accommodations:
 *   post:
 *     summary: Create a new accommodation
 *     tags: [Accommodations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               pricePerMonth:
 *                 type: number
 *               depositAmount:
 *                 type: number
 *               availableFrom:
 *                 type: string
 *                 format: date
 *               availableTo:
 *                 type: string
 *                 format: date
 *               peoplePerRoom:
 *                 type: integer
 *                 minimum: 1
 *               amenities:
 *                 type: object
 *                 properties:
 *                   wifi:
 *                     type: boolean
 *                   furnished:
 *                     type: boolean
 *                   parking:
 *                     type: boolean
 *                   laundry:
 *                     type: boolean
 *                   kitchen:
 *                     type: boolean
 *                   heating:
 *                     type: boolean
 *                   tv:
 *                     type: boolean
 *                   petsAllowed:
 *                     type: boolean
 *                   smokingAllowed:
 *                     type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Accommodation created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', authenticateToken, authorizeRoles('landlord'), upload.array('images', 10), createAccommodation);

/**
 * @swagger
 * /api/accommodations/{id}:
 *   put:
 *     summary: Update an accommodation
 *     tags: [Accommodations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Accommodation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Accommodation'
 *     responses:
 *       200:
 *         description: Accommodation updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Accommodation not found
 */
router.put('/:id', authenticateToken, authorizeRoles('landlord'), upload.array('images', 10), updateAccommodation);

/**
 * @swagger
 * /api/accommodations/{id}:
 *   delete:
 *     summary: Delete an accommodation
 *     tags: [Accommodations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Accommodation ID
 *     responses:
 *       200:
 *         description: Accommodation deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Accommodation not found
 */
router.delete('/:id', authenticateToken, authorizeRoles('landlord'), deleteAccommodation);

module.exports = router;
