const notificationService = require('../../services/guest/notificationService');
const { sendSuccess } = require('../../utils/responseHelper');

/**
 * Controller for Notifications.
 */

/**
 * GET /api/notifications
 * Get paginated list of notifications for the logged-in user.
 */
exports.listNotifications = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { page, limit } = req.query;

    const result = await notificationService.getNotifications(userId, { page, limit });

    return sendSuccess(res, {
      message: 'Lấy danh sách thông báo thành công.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the logged-in user.
 */
exports.markAllRead = async (req, res, next) => {
  try {
    const { userId } = req.user;

    await notificationService.readAllNotifications(userId);

    return sendSuccess(res, {
      message: 'Đã đánh dấu đọc tất cả thông báo.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
exports.markRead = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const notificationId = req.params.id;

    const updated = await notificationService.readNotification(notificationId, userId);

    return sendSuccess(res, {
      message: 'Đã đánh dấu đọc thông báo.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};
