const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams để nhận :roomId từ parent route
const reviewController = require('../../controllers/guest/reviewController');
const { requireAuth } = require('../../middlewares/authMiddleware');

/**
 * Review routes.
 *
 * Mounted twice in app.js:
 *   app.use('/api/rooms/:roomId/reviews', reviewRoutes)  → listRoomReviews
 *   app.use('/api/reviews', reviewRoutes)                → create, update
 */

// GET /api/rooms/:roomId/reviews — public
router.get('/', reviewController.listRoomReviews);

// POST /api/reviews — TENANT only
router.post('/', requireAuth, reviewController.createReview);

module.exports = router;

