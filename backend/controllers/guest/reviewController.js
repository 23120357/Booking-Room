const reviewService = require('../../services/guest/reviewService');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/responseHelper');
const db = require('../../config/db');

/**
 * Controller for review endpoints.
 * Parses HTTP inputs, delegates to reviewService, formats responses.
 */

/**
 * Resolve tenants.tenant_id from users.user_id stored in JWT.
 * Throws 403 if the caller is not a registered tenant.
 *
 * @param {string} userId from req.user.userId
 * @returns {Promise<string>} tenant_id UUID
 */
async function resolveTenantId(userId) {
  // Bảng tenants dùng tenant_id làm khóa chính kiêm FK trỏ tới users.user_id
  const tenant = await db('tenants').where({ tenant_id: userId }).first();
  if (!tenant) {
    throw new AppError('FORBIDDEN', 'Chỉ Tenant mới được thực hiện thao tác này.', 403);
  }
  return tenant.tenant_id;
}

/**
 * GET /api/rooms/:roomId/reviews
 * Public — list reviews for a room.
 */
exports.listRoomReviews = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { page, limit } = req.query;

    const result = await reviewService.listRoomReviews(roomId, { page, limit });

    return sendSuccess(res, {
      message: 'Lấy danh sách đánh giá thành công.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/reviews
 * Create a review. Requires TENANT login.
 * Body: { deposit_id, rating, comment? }
 */
exports.createReview = async (req, res, next) => {
  try {
    const { deposit_id, rating, comment } = req.body;

    if (!deposit_id) {
      throw new AppError('MISSING_FIELD', 'deposit_id là bắt buộc.', 400);
    }

    const tenantId = await resolveTenantId(req.user.userId);

    const review = await reviewService.createReview({
      tenantId,
      depositId: deposit_id,
      rating,
      comment,
    });

    return sendSuccess(res, {
      status: 201,
      message: 'Đánh giá phòng thành công.',
      data: { review },
    });
  } catch (err) {
    next(err);
  }
};
