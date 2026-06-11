const express = require('express');
const roomController = require('../../controllers/host/roomController');
const { authenticate } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

const router = express.Router();

router.post('/', authenticate, authorize('HOST'), roomController.createRoom);
router.get('/my', authenticate, authorize('HOST'), roomController.listMyRooms);
router.patch('/:id', authenticate, authorize('HOST'), roomController.updateRoom);
router.delete('/:id', authenticate, authorize('HOST'), roomController.deleteRoom);

module.exports = router;
