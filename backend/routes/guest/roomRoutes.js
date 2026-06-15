const express = require('express');
const router = express.Router();

const roomController = require('../../controllers/guest/roomController');

// Public: list rooms with query params (page, limit, filters)
router.get('/', roomController.listRooms);

// Public: get room detail
router.get('/:roomId', roomController.getRoomById);

module.exports = router;
