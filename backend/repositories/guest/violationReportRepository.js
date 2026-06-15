const db = require('../../config/db');

/**
 * Insert a new violation report into the database.
 */
async function createReport(data) {
  const [report] = await db('violation_reports').insert(data).returning('*');
  return report;
}

/**
 * Retrieve paginated violation reports for a specific tenant.
 */
async function findReportsByTenant(tenantId, { limit, offset }) {
  const [{ count }] = await db('violation_reports')
    .where({ tenant_id: tenantId })
    .count('report_id as count');

  const items = await db('violation_reports')
    .where({ tenant_id: tenantId })
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return { items, total: Number(count) };
}

/**
 * Retrieve details of a specific report, ensuring it belongs to the tenant.
 */
async function findReportById(reportId, tenantId) {
  return await db('violation_reports')
    .where({ report_id: reportId, tenant_id: tenantId })
    .first();
}

/**
 * Check if a room exists.
 */
async function checkRoomExists(roomId) {
  return await db('rooms').where({ room_id: roomId }).first();
}

/**
 * Check if a landlord exists.
 */
async function checkLandlordExists(landlordId) {
  return await db('landlords').where({ landlord_id: landlordId }).first();
}

module.exports = {
  createReport,
  findReportsByTenant,
  findReportById,
  checkRoomExists,
  checkLandlordExists
};
