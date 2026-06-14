const favoriteService = require('../../services/guest/favoriteService');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/responseHelper');
const db = require('../../config/db');

/**
 * Resolve tenants.tenant_id from users.user_id stored in JWT.
 * Throws 403 if the caller is not a registered tenant.
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
 * GET /api/favorites
 * Retrieve the list of favorite rooms for the logged-in user.
 */
exports.listFavorites = async (req, res, next) => {
  try {
    const tenantId = await resolveTenantId(req.user.userId);
    const { page, limit } = req.query;

    const result = await favoriteService.listFavorites(tenantId, { page, limit });

    return sendSuccess(res, {
      message: 'Lấy danh sách yêu thích thành công.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/favorites/toggle
 * Body: { room_id }
 * Add or remove a room from the favorites list (toggle like).
 */
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { room_id } = req.body;

    if (!room_id) {
      throw new AppError('MISSING_FIELD', 'room_id là bắt buộc.', 400);
    }

    const tenantId = await resolveTenantId(req.user.userId);

    const result = await favoriteService.toggleFavorite(tenantId, room_id);

    return sendSuccess(res, {
      status: result.action === 'ADDED' ? 201 : 200,
      message: result.action === 'ADDED' ? 'Đã thêm vào danh sách yêu thích.' : 'Đã gỡ khỏi danh sách yêu thích.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
