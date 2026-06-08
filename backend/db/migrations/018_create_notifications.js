/**
 * Table: notifications (Thông Báo Hệ Thống)
 * Notification payloads dispatched to individual users.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('notification_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table
      .enu('notification_type', ['SYSTEM', 'DEPOSIT', 'NEW_MESSAGE'], {
        useNative: true,
        enumName: 'notification_type',
      })
      .notNullable();
    table
      .enu('status', ['UNREAD', 'READ'], {
        useNative: true,
        enumName: 'notification_status',
      })
      .notNullable()
      .defaultTo('UNREAD');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('notifications');
  await knex.raw('DROP TYPE IF EXISTS notification_type');
  await knex.raw('DROP TYPE IF EXISTS notification_status');
};
