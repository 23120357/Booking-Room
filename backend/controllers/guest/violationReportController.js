const violationReportService = require('../../services/guest/violationReportService');
const { sendSuccess } = require('../../utils/responseHelper');

/**
 * Controller for Violation Reports.
 */

/**
 * POST /api/violation-reports
 * Create a new report.
 */
exports.create = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const report = await violationReportService.submitReport(userId, req.body);

    return sendSuccess(res, {
      message: 'Gửi báo cáo vi phạm thành công.',
      data: report
    }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/violation-reports
 * List all reports for the logged-in tenant.
 */
exports.list = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { page, limit } = req.query;

    const result = await violationReportService.getReports(userId, { page, limit });

    return sendSuccess(res, {
      message: 'Lấy danh sách báo cáo vi phạm thành công.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/violation-reports/:id
 * Get details of a specific report.
 */
exports.detail = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const reportId = req.params.id;

    const report = await violationReportService.getReportDetail(reportId, userId);

    return sendSuccess(res, {
      message: 'Lấy chi tiết báo cáo vi phạm thành công.',
      data: report
    });
  } catch (err) {
    next(err);
  }
};
