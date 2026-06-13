/**
 * Table: roles (Vai Trò Hệ Thống)
 * Defines core user access levels within the application.
 */
exports.up = async function (knex) {
  // gen_random_uuid() lives in pgcrypto on older PostgreSQL versions.
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.schema.createTable('roles', (table) => {
    table.uuid('role_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('role_name', 50).notNullable().unique();
    table.string('description', 255).nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('roles');
};
