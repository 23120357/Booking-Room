const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware'); // Đảm bảo có middleware kiểm tra role
const roomController = require('../../controllers/admin/roomController'); // Cần tạo controller này

router.patch('/:roomId/approve', requireAuth, roomController.approveRoom);

// Và tương tự với các route khác:
router.patch('/:roomId/reject', requireAuth, roomController.rejectRoom);
router.get('/pending', requireAuth, roomController.listPendingRooms);

module.exports = router;