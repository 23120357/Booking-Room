const express = require('express');
const router = express.Router();
const aiController = require('../../controllers/guest/aiController');

/**
 * AI Room Recommendations routes.
 * Mounted at: /api/ai
 */

// POST /api/ai/room-recommendations — Get AI recommendation (Public)
router.post('/room-recommendations', aiController.ask);

module.exports = router;
