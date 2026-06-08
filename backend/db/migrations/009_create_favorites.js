/**
 * Table: favorites (Danh Sách Yêu Thích)
 * Bridge entity for tenant bookmarks (N:N between tenants and rooms).
 */
exports.up = async function (knex) {
  await knex.schema.createTable('favorites', (table) => {
    table
      .uuid('tenant_id')
      .notNullable()
      .references('tenant_id')
      .inTable('tenants')
      .onDelete('CASCADE');
    table.uuid('room_id').notNullable().references('room_id').inTable('rooms').onDelete('CASCADE');
    table.boolean('status').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.primary(['tenant_id', 'room_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('favorites');
};
