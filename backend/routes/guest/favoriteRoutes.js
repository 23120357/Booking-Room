const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/guest/favoriteController');
const { requireAuth } = require('../../middlewares/authMiddleware');

/**
 * Favorite routes.
 * Mounted at: /api/favorites
 */

// GET /api/favorites — Retrieve the list of favorites for the logged-in Tenant
router.get('/', requireAuth, favoriteController.listFavorites);

// POST /api/favorites/toggle — Add/remove favorite
router.post('/toggle', requireAuth, favoriteController.toggleFavorite);

module.exports = router;
