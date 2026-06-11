const express = require('express');
const roomController = require('../../controllers/admin/roomController');
const { authenticate } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

const router = express.Router();

router.get('/pending', authenticate, authorize('ADMIN'), roomController.listPendingRooms);
router.patch('/:id/approve', authenticate, authorize('ADMIN'), roomController.approveRoom);
router.patch('/:id/reject', authenticate, authorize('ADMIN'), roomController.rejectRoom);

module.exports = router;
