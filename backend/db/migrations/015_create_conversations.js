/**
 * Table: conversations (Hội Thoại)
 * Chat channels between a tenant and a landlord.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('conversations', (table) => {
    table.uuid('conversation_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('tenant_id')
      .notNullable()
      .references('tenant_id')
      .inTable('tenants')
      .onDelete('CASCADE');
    table
      .uuid('landlord_id')
      .notNullable()
      .references('landlord_id')
      .inTable('landlords')
      .onDelete('CASCADE');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('conversations');
};
