const reviewRepository = require('../../repositories/guest/reviewRepository');
const AppError = require('../../utils/AppError');

/**
 * Business logic layer for reviews.
 * Enforces: only confirmed-deposit tenants can review; one review per deposit.
 */

/**
 * List public reviews for a room, paginated.
 *
 * @param {string} roomId
 * @param {object} opts
 * @param {number} [opts.page=1]
 * @param {number} [opts.limit=10]
 * @returns {Promise<{ items, total, page, limit }>}
 */
async function listRoomReviews(roomId, { page = 1, limit = 10 } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  const { items, total } = await reviewRepository.findByRoomId(roomId, { page: p, limit: l });
  return { items, total, page: p, limit: l };
}

/**
 * Create a review for a room.
 *
 * Business rules enforced:
 *  - The calling tenant must own a CONFIRMED deposit for this depositId.
 *  - Each deposit may only receive one review (unique constraint in DB).
 *
 * @param {object} params
 * @param {string} params.tenantId  UUID of the tenant from req.user
 * @param {string} params.depositId UUID of the confirmed deposit
 * @param {number} params.rating    1–5
 * @param {string} [params.comment]
 * @returns {Promise<object>} created review
 */
async function createReview({ tenantId, depositId, rating, comment }) {
  // Validate rating range
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError('INVALID_RATING', 'Rating phải là số nguyên từ 1 đến 5.', 400);
  }

  // Check deposit exists, belongs to tenant, and is CONFIRMED
  const deposit = await reviewRepository.findConfirmedDeposit(depositId, tenantId);
  if (!deposit) {
    throw new AppError(
      'DEPOSIT_NOT_ELIGIBLE',
      'Bạn chỉ có thể review khi đã thanh toán cọc thành công.',
      403,
    );
  }

  // Check duplicate review for this deposit
  const existing = await reviewRepository.findByDepositId(depositId);
  if (existing) {
    throw new AppError('REVIEW_EXISTS', 'Bạn đã review phòng này rồi.', 409);
  }

  const review = await reviewRepository.create({
    deposit_id: depositId,
    room_id: deposit.room_id,
    tenant_id: tenantId,
    rating,
    comment,
  });

  // Recalculate average rating for the room
  await reviewRepository.recalcAverageRating(deposit.room_id);

  // Gửi thông báo cho Chủ Nhà
  const notificationService = require('./notificationService');
  await notificationService.createNotification(
    deposit.landlord_user_id,
    'Phòng của bạn vừa có đánh giá mới',
    `Một khách thuê vừa để lại đánh giá ${rating} sao cho phòng "${deposit.room_title || 'của bạn'}".`,
    'REVIEW'
  );

  return review;
}

module.exports = {
  listRoomReviews,
  createReview,
};
