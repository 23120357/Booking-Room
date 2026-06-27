const notificationRepository = require('../../repositories/guest/notificationRepository');
const AppError = require('../../utils/AppError');
const { getIO } = require('../../config/socket');

/**
 * Get paginated list of notifications.
 */
async function getNotifications(userId, { page = 1, limit = 20 }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (p - 1) * l;

  const { items, total } = await notificationRepository.findNotificationsByUser(userId, { limit: l, offset });
  return { items, total, page: p, limit: l };
}

/**
 * Mark a specific notification as read.
 */
async function readNotification(notificationId, userId) {
  const updated = await notificationRepository.markAsRead(notificationId, userId);
  if (!updated) {
    throw new AppError('NOT_FOUND', 'Không tìm thấy thông báo hoặc bạn không có quyền thao tác.', 404);
  }
  return updated;
}

/**
 * Mark all notifications as read for a user.
 */
async function readAllNotifications(userId) {
  await notificationRepository.markAllAsRead(userId);
}

/**
 * INTERNAL USE ONLY: Create a new notification.
 * This is meant to be called by other internal services (e.g., when a new message is sent).
 */
async function createNotification(userId, title, content, type) {
  const notification = await notificationRepository.insertNotification({
    user_id: userId,
    title,
    content,
    notification_type: type
  });

  const io = getIO();
  if (io) {
    io.to(String(userId)).emit('notification:new', notification);
  }

  return notification;
}

module.exports = {
  getNotifications,
  readNotification,
  readAllNotifications,
  createNotification
};
