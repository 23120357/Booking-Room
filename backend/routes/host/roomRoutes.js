const express = require('express');
const router = express.Router();
const { requireAuth, authorize } = require('../../middlewares/authMiddleware');
const roomController = require('../../controllers/host/roomController');
const { uploadRoomImages } = require('../../middlewares/uploadMiddleware');

// Host: list own rooms
router.get('/my', requireAuth, authorize('LANDLORD'), roomController.listMyRooms);

// Host: create a room (multipart images in field `images`)
router.post('/', requireAuth, authorize('LANDLORD'), uploadRoomImages, roomController.createRoom);

// Host: update room (supports multipart images in field `images`)
router.patch('/:roomId', requireAuth, authorize('LANDLORD'), uploadRoomImages, roomController.updateRoom);

// Host: delete room
router.delete('/:roomId', requireAuth, authorize('LANDLORD'), roomController.deleteRoom);

// Host: update status (e.g., PENDING -> APPROVED by admin normally)
router.patch('/:roomId/status', requireAuth, authorize('LANDLORD'), roomController.updateRoomStatus);

module.exports = router;
