exports.up = async function(knex) {
  // Alter transactions
  await knex.schema.alterTable('transactions', (table) => {
    table.boolean('is_disbursed').notNullable().defaultTo(false);
    table.timestamp('disbursed_at').nullable();
  });

  // admin_incomes
  await knex.schema.createTable('admin_incomes', (table) => {
    table.uuid('admin_income_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('user_id').inTable('users').onDelete('SET NULL');
    table.uuid('transaction_id').notNullable().references('transaction_id').inTable('transactions').onDelete('CASCADE');
    table.decimal('income', 15, 2).notNullable().defaultTo(0);
    table.enu('status', ['PENDING_DISBURSEMENT', 'DISBURSED'], { useNative: true, enumName: 'admin_income_status' }).notNullable().defaultTo('PENDING_DISBURSEMENT');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // host_incomes
  await knex.schema.createTable('host_incomes', (table) => {
    table.uuid('host_income_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('host_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.uuid('transaction_id').notNullable().references('transaction_id').inTable('transactions').onDelete('CASCADE');
    table.decimal('income', 15, 2).notNullable().defaultTo(0);
    table.enu('status', ['PENDING', 'RECEIVED'], { useNative: true, enumName: 'host_income_status' }).notNullable().defaultTo('PENDING');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // disbursement_logs
  await knex.schema.createTable('disbursement_logs', (table) => {
    table.uuid('log_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('admin_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.uuid('host_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.uuid('transaction_id').notNullable().references('transaction_id').inTable('transactions').onDelete('CASCADE');
    table.decimal('total_amount', 15, 2).notNullable();
    table.decimal('host_amount', 15, 2).notNullable();
    table.decimal('admin_amount', 15, 2).notNullable();
    table.decimal('commission_rate', 5, 2).notNullable(); // e.g., 10.00
    table.timestamp('disbursed_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('disbursement_logs');
  await knex.schema.dropTableIfExists('host_incomes');
  await knex.schema.dropTableIfExists('admin_incomes');
  
  await knex.raw('DROP TYPE IF EXISTS admin_income_status');
  await knex.raw('DROP TYPE IF EXISTS host_income_status');

  await knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('disbursed_at');
    table.dropColumn('is_disbursed');
  });
};
