/**
 * Seed: favorites, room_approvals, deposits, transactions.
 */
exports.seed = async function (knex) {
  await knex('favorites').insert([
    { tenant_id: 'c0000000-0000-0000-0000-000000000004', room_id: 'd0000000-0000-0000-0000-000000000001', status: true },
    { tenant_id: 'c0000000-0000-0000-0000-000000000005', room_id: 'd0000000-0000-0000-0000-000000000002', status: true },
  ]);

  await knex('room_approvals').insert([
    { approval_id: 'e1000000-0000-0000-0000-000000000001', room_id: 'd0000000-0000-0000-0000-000000000001', approval_status: 'APPROVED' },
    { approval_id: 'e1000000-0000-0000-0000-000000000002', room_id: 'd0000000-0000-0000-0000-000000000002', approval_status: 'PENDING' },
  ]);

  await knex('deposits').insert([
    {
      deposit_id: 'e2000000-0000-0000-0000-000000000001',
      room_id: 'd0000000-0000-0000-0000-000000000002',
      tenant_id: 'c0000000-0000-0000-0000-000000000005',
      landlord_id: 'c0000000-0000-0000-0000-000000000003',
      deposit_amount: 6500000,
      status: 'CONFIRMED',
      expired_at: knex.raw("CURRENT_TIMESTAMP + INTERVAL '15 minutes'"),
      confirmed_at: knex.fn.now(),
    },
  ]);

  await knex('transactions').insert([
    {
      transaction_id: 'e3000000-0000-0000-0000-000000000001',
      deposit_id: 'e2000000-0000-0000-0000-000000000001',
      amount: 6500000,
      payment_method: 'VNPAY',
      status: 'SUCCESS',
    },
  ]);
};
