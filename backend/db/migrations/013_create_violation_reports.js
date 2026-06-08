/**
 * Table: violation_reports (Báo Cáo Vi Phạm)
 * Moderation tickets to flag bad actors or fake listings.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('violation_reports', (table) => {
    table.uuid('report_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('room_id').nullable().references('room_id').inTable('rooms').onDelete('SET NULL');
    table
      .uuid('landlord_id')
      .nullable()
      .references('landlord_id')
      .inTable('landlords')
      .onDelete('SET NULL');
    table
      .uuid('tenant_id')
      .notNullable()
      .references('tenant_id')
      .inTable('tenants')
      .onDelete('CASCADE');
    table.text('reason').notNullable();
    table
      .enu('resolution_status', ['PENDING', 'PROCESSING', 'RESOLVED', 'DISMISSED'], {
        useNative: true,
        enumName: 'violation_resolution_status',
      })
      .notNullable()
      .defaultTo('PENDING');
    table.string('evidence_image_url', 2048).nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('violation_reports');
  await knex.raw('DROP TYPE IF EXISTS violation_resolution_status');
};
