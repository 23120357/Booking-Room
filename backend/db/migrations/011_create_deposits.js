/**
 * Table: deposits (Đơn Đặt Cọc)
 * Binding down-payment agreements holding a listing.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('deposits', (table) => {
    table.uuid('deposit_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('room_id').notNullable().references('room_id').inTable('rooms').onDelete('RESTRICT');
    table
      .uuid('tenant_id')
      .notNullable()
      .references('tenant_id')
      .inTable('tenants')
      .onDelete('RESTRICT');
    table
      .uuid('landlord_id')
      .notNullable()
      .references('landlord_id')
      .inTable('landlords')
      .onDelete('RESTRICT');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('deposits');
};
