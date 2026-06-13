/**
 * Table: system_logs (Nhật Ký Hệ Thống / Audit Logs)
 * Append-only security/operations audit stream.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('system_logs', (table) => {
    table.uuid('log_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.string('action', 255).notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('system_logs');
};
