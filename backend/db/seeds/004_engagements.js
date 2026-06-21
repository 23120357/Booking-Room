/**
 * Seed: favorites, room approvals, deposits, transactions.
 */

const roomId = (n) => `d0000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const approvalId = (n) => `e1000000-0000-0000-0000-${String(n).padStart(12, '0')}`;

exports.seed = async function (knex) {
  await knex('favorites').insert([
    { tenant_id: 'c0000000-0000-0000-0000-000000000004', room_id: roomId(1), status: true },
    { tenant_id: 'c0000000-0000-0000-0000-000000000004', room_id: roomId(7), status: true },
    { tenant_id: 'c0000000-0000-0000-0000-000000000005', room_id: roomId(10), status: true },
    { tenant_id: 'c0000000-0000-0000-0000-000000000005', room_id: roomId(13), status: true },
  ]);

  await knex('room_approvals').insert(
    Array.from({ length: 20 }, (_, index) => ({
      approval_id: approvalId(index + 1),
      room_id: roomId(index + 1),
      approval_status: 'APPROVED',
    })),
  );

  await knex('deposits').insert([
    {
      deposit_id: 'e2000000-0000-0000-0000-000000000001',
      room_id: roomId(3),
      tenant_id: 'c0000000-0000-0000-0000-000000000005',
      landlord_id: 'c0000000-0000-0000-0000-000000000002',
      deposit_amount: 8600000,
      status: 'CONFIRMED',
      expired_at: knex.raw("CURRENT_TIMESTAMP + INTERVAL '15 minutes'"),
      confirmed_at: knex.fn.now(),
    },
    {
      deposit_id: 'e2000000-0000-0000-0000-000000000002',
      room_id: roomId(7),
      tenant_id: 'c0000000-0000-0000-0000-000000000004',
      landlord_id: 'c0000000-0000-0000-0000-000000000002',
      deposit_amount: 9800000,
      status: 'PROCESSING',
      expired_at: knex.raw("CURRENT_TIMESTAMP + INTERVAL '15 minutes'"),
    },
  ]);

  await knex('transactions').insert([
    {
      transaction_id: 'e3000000-0000-0000-0000-000000000001',
      deposit_id: 'e2000000-0000-0000-0000-000000000001',
      amount: 8600000,
      payment_method: 'VNPAY',
      status: 'SUCCESS',
    },
    {
      transaction_id: 'e3000000-0000-0000-0000-000000000002',
      deposit_id: 'e2000000-0000-0000-0000-000000000002',
      amount: 9800000,
      payment_method: 'MOMO',
      status: 'PENDING',
    },
  ]);
};
