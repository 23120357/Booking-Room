const express = require('express');
const router = express.Router();
const roomController = require('../../controllers/guest/roomController');
const { optionalAuthenticate } = require('../../middlewares/authMiddleware');

// Public: list rooms with query params (page, limit, filters)
router.get('/', roomController.listRooms);

// Public: get room detail (supports optional auth)
router.get('/:roomId', optionalAuthenticate, roomController.getRoomById);

module.exports = router;
