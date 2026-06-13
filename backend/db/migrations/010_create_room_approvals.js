/**
 * Table: room_approvals (Lịch Sử Duyệt Bài)
 * Audit log of listing verification states.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('room_approvals', (table) => {
    table.uuid('approval_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('room_id').notNullable().references('room_id').inTable('rooms').onDelete('CASCADE');
    table
      .enu('approval_status', ['PENDING', 'APPROVED', 'REJECTED'], {
        useNative: true,
        enumName: 'room_approval_status',
      })
      .notNullable()
      .defaultTo('PENDING');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('room_approvals');
  await knex.raw('DROP TYPE IF EXISTS room_approval_status');
};
