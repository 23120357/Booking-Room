/**
 * Table: support_tickets (Yêu Cầu Hỗ Trợ)
 * Help desk tickets referencing the submitting user directly.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('support_tickets', (table) => {
    table.uuid('ticket_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table
      .enu('category', ['APP_FAULT', 'ACCOUNT', 'PAYMENT'], {
        useNative: true,
        enumName: 'support_ticket_category',
      })
      .notNullable();
    table.string('title', 255).notNullable();
    table.text('detailed_description').notNullable();
    table.string('evidence_image_url', 2048).nullable();
    table
      .enu('status', ['OPEN', 'IN_PROGRESS', 'CLOSED'], {
        useNative: true,
        enumName: 'support_ticket_status',
      })
      .notNullable()
      .defaultTo('OPEN');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('support_tickets');
  await knex.raw('DROP TYPE IF EXISTS support_ticket_category');
  await knex.raw('DROP TYPE IF EXISTS support_ticket_status');
};
