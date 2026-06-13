/**
 * Table: tenants (Khách Thuê)
 * 1:1 specialization of users (shared primary key).
 */
exports.up = async function (knex) {
  await knex.schema.createTable('tenants', (table) => {
    table
      .uuid('tenant_id')
      .notNullable()
      .primary()
      .references('user_id')
      .inTable('users')
      .onDelete('CASCADE');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('tenants');
};
