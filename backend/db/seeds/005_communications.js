/**
 * Seed: conversations, messages, sessions, notifications,
 *       support_tickets, violation_reports, system_logs.
 */
exports.seed = async function (knex) {
  await knex('conversations').insert([
    {
      conversation_id: 'f1000000-0000-0000-0000-000000000001',
      tenant_id: 'c0000000-0000-0000-0000-000000000005',
      landlord_id: 'c0000000-0000-0000-0000-000000000003',
    },
  ]);

  await knex('messages').insert([
    {
      message_id: 'f2000000-0000-0000-0000-000000000001',
      conversation_id: 'f1000000-0000-0000-0000-000000000001',
      content: 'Chào anh, phòng còn trống không ạ?',
      sender_id: 'c0000000-0000-0000-0000-000000000005',
      status: 'READ',
    },
    {
      message_id: 'f2000000-0000-0000-0000-000000000002',
      conversation_id: 'f1000000-0000-0000-0000-000000000001',
      content: 'Còn nhé, em qua xem phòng được luôn.',
      sender_id: 'c0000000-0000-0000-0000-000000000003',
      status: 'DELIVERED',
    },
  ]);

  await knex('sessions').insert([
    {
      session_id: 'f3000000-0000-0000-0000-000000000001',
      conversation_id: 'f1000000-0000-0000-0000-000000000001',
      expires_at: knex.raw("CURRENT_TIMESTAMP + INTERVAL '1 day'"),
    },
  ]);

  await knex('notifications').insert([
    {
      notification_id: 'f4000000-0000-0000-0000-000000000001',
      user_id: 'c0000000-0000-0000-0000-000000000005',
      title: 'Đặt cọc thành công',
      content: 'Bạn đã đặt cọc phòng "Căn hộ mini full nội thất".',
      notification_type: 'DEPOSIT',
      status: 'UNREAD',
    },
  ]);

  await knex('support_tickets').insert([
    {
      ticket_id: 'f5000000-0000-0000-0000-000000000001',
      user_id: 'c0000000-0000-0000-0000-000000000004',
      category: 'PAYMENT',
      title: 'Không thanh toán được bằng MoMo',
      detailed_description: 'Mình bấm thanh toán MoMo thì báo lỗi gateway.',
      status: 'OPEN',
    },
  ]);

  await knex('violation_reports').insert([
    {
      report_id: 'f6000000-0000-0000-0000-000000000001',
      room_id: 'd0000000-0000-0000-0000-000000000001',
      landlord_id: 'c0000000-0000-0000-0000-000000000002',
      tenant_id: 'c0000000-0000-0000-0000-000000000004',
      reason: 'Hình ảnh không đúng với phòng thực tế.',
      resolution_status: 'PENDING',
    },
  ]);

  await knex('system_logs').insert([
    { log_id: 'f7000000-0000-0000-0000-000000000001', user_id: 'c0000000-0000-0000-0000-000000000001', action: 'LOGIN' },
    { log_id: 'f7000000-0000-0000-0000-000000000002', user_id: 'c0000000-0000-0000-0000-000000000001', action: 'APPROVE_ROOM' },
  ]);
};
