/**
 * Table: messages (Tin Nhắn Chi Tiết)
 * Atomic text records inside a conversation.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('messages', (table) => {
    table.uuid('message_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('conversation_id')
      .notNullable()
      .references('conversation_id')
      .inTable('conversations')
      .onDelete('CASCADE');
    table.text('content').notNullable();
    table
      .uuid('sender_id')
      .notNullable()
      .references('user_id')
      .inTable('users')
      .onDelete('CASCADE');
    table.timestamp('sent_at').notNullable().defaultTo(knex.fn.now());
    table
      .enu('status', ['SENT', 'DELIVERED', 'READ'], {
        useNative: true,
        enumName: 'message_status',
      })
      .notNullable()
      .defaultTo('SENT');
    table.date('sent_date').notNullable().defaultTo(knex.raw('CURRENT_DATE'));
    table.timestamp('read_at').nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('messages');
  await knex.raw('DROP TYPE IF EXISTS message_status');
};
