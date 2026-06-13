/**
 * Table: sessions (Phiên Làm Việc Kết Nối Chat)
 * Transient socket/session persistence data for chat.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('sessions', (table) => {
    table.uuid('session_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('conversation_id')
      .notNullable()
      .references('conversation_id')
      .inTable('conversations')
      .onDelete('CASCADE');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('expires_at').notNullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('sessions');
};
