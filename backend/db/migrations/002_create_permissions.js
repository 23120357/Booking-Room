/**
 * Table: permissions (Quyền Hạn Chi Tiết)
 * Defines atomic system capabilities or actions.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('permissions', (table) => {
    table.uuid('permission_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('permission_name', 100).notNullable().unique();
    table.string('description', 255).nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('permissions');
};
