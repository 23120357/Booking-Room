const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/guest/notificationController');
const { requireAuth } = require('../../middlewares/authMiddleware');

/**
 * Notification routes.
 * Mounted at: /api/notifications
 */

// GET /api/notifications — List notifications
router.get('/', requireAuth, notificationController.listNotifications);

// PATCH /api/notifications/read-all — Mark all as read
router.patch('/read-all', requireAuth, notificationController.markAllRead);

// PATCH /api/notifications/:id/read — Mark single as read
router.patch('/:id/read', requireAuth, notificationController.markRead);

module.exports = router;
