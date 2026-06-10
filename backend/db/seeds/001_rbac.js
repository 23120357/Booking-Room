/**
 * Seed: roles, permissions, role_permissions (RBAC).
 * This is the first seed file: it wipes every table (CASCADE) so the whole
 * seed set is idempotent and can be re-run with `knex seed:run`.
 */
exports.seed = async function (knex) {
  await knex.raw(`
    TRUNCATE TABLE
      roles, permissions, role_permissions,
      users, landlords, tenants,
      rooms, room_images, favorites, room_approvals,
      deposits, transactions, violation_reports, support_tickets,
      conversations, messages, sessions, notifications, system_logs,
      reviews, otp_verifications, account_security, login_audit_logs
    RESTART IDENTITY CASCADE
  `);

  await knex('roles').insert([
    { role_id: 'a0000000-0000-0000-0000-000000000001', role_name: 'ADMIN', description: 'System administrator' },
    { role_id: 'a0000000-0000-0000-0000-000000000002', role_name: 'LANDLORD', description: 'Property owner' },
    { role_id: 'a0000000-0000-0000-0000-000000000003', role_name: 'TENANT', description: 'Renter / customer' },
  ]);

  await knex('permissions').insert([
    { permission_id: 'b0000000-0000-0000-0000-000000000001', permission_name: 'ROOM_CREATE', description: 'Create a room listing' },
    { permission_id: 'b0000000-0000-0000-0000-000000000002', permission_name: 'ROOM_APPROVE', description: 'Approve or reject a listing' },
    { permission_id: 'b0000000-0000-0000-0000-000000000003', permission_name: 'USER_BAN', description: 'Ban a user account' },
  ]);

  await knex('role_permissions').insert([
    // ADMIN: all permissions
    { role_id: 'a0000000-0000-0000-0000-000000000001', permission_id: 'b0000000-0000-0000-0000-000000000001' },
    { role_id: 'a0000000-0000-0000-0000-000000000001', permission_id: 'b0000000-0000-0000-0000-000000000002' },
    { role_id: 'a0000000-0000-0000-0000-000000000001', permission_id: 'b0000000-0000-0000-0000-000000000003' },
    // LANDLORD: can create listings
    { role_id: 'a0000000-0000-0000-0000-000000000002', permission_id: 'b0000000-0000-0000-0000-000000000001' },
  ]);
};
