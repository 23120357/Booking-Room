const violationReportRepository = require('../../repositories/guest/violationReportRepository');
const AppError = require('../../utils/AppError');
const db = require('../../config/db');

/**
 * Helper to ensure the user is a tenant.
 */
async function getTenantId(userId) {
  const tenant = await db('tenants').where({ tenant_id: userId }).first();
  if (!tenant) {
    throw new AppError('FORBIDDEN', 'Chỉ Khách thuê (Tenant) mới được gửi báo cáo vi phạm.', 403);
  }
  return tenant.tenant_id;
}

/**
 * Submit a new violation report.
 */
async function submitReport(userId, body) {
  const tenantId = await getTenantId(userId);

  const { room_id, landlord_id, reason, evidence_image_url } = body;

  if (!reason || reason.trim() === '') {
    throw new AppError('BAD_REQUEST', 'Vui lòng cung cấp lý do báo cáo (reason).', 400);
  }

  if (!room_id && !landlord_id) {
    throw new AppError('BAD_REQUEST', 'Vui lòng cung cấp đối tượng báo cáo (room_id hoặc landlord_id).', 400);
  }

  // Validate existence
  if (room_id) {
    const roomExists = await violationReportRepository.checkRoomExists(room_id);
    if (!roomExists) throw new AppError('BAD_REQUEST', 'Phòng trọ không tồn tại.', 400);
  }

  if (landlord_id) {
    const landlordExists = await violationReportRepository.checkLandlordExists(landlord_id);
    if (!landlordExists) throw new AppError('BAD_REQUEST', 'Chủ nhà không tồn tại.', 400);
  }

  const report = await violationReportRepository.createReport({
    tenant_id: tenantId,
    room_id: room_id || null,
    landlord_id: landlord_id || null,
    reason: reason.trim(),
    evidence_image_url: evidence_image_url || null,
    resolution_status: 'PENDING'
  });

  // Tự động gửi notification cho Tenant báo rằng hệ thống đã tiếp nhận
  const notificationService = require('./notificationService');
  await notificationService.createNotification(
    userId,
    'Đã nhận báo cáo vi phạm',
    `Hệ thống đã tiếp nhận báo cáo của bạn (Mã: ${report.report_id.split('-')[0]}). Chúng tôi sẽ xác minh và xử lý nghiêm khắc.`,
    'SYSTEM'
  );

  return report;
}

/**
 * Get a paginated list of reports submitted by the logged-in tenant.
 */
async function getReports(userId, { page = 1, limit = 20 }) {
  const tenantId = await getTenantId(userId);

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (p - 1) * l;

  const { items, total } = await violationReportRepository.findReportsByTenant(tenantId, { limit: l, offset });
  return { items, total, page: p, limit: l };
}

/**
 * Get details of a specific report.
 */
async function getReportDetail(reportId, userId) {
  const tenantId = await getTenantId(userId);

  const report = await violationReportRepository.findReportById(reportId, tenantId);
  if (!report) {
    throw new AppError('NOT_FOUND', 'Không tìm thấy báo cáo hoặc bạn không có quyền xem.', 404);
  }
  return report;
}

module.exports = {
  submitReport,
  getReports,
  getReportDetail
};
