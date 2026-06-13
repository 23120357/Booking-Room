/**
 * Table: transactions (Giao Dịch Thanh Toán)
 * Financial ledger entries mapping to deposit actions.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('transaction_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('deposit_id')
      .notNullable()
      .references('deposit_id')
      .inTable('deposits')
      .onDelete('CASCADE');
    table.decimal('amount', 15, 2).notNullable();
    table
      .enu('payment_method', ['VNPAY', 'MOMO', 'BANK_TRANSFER'], {
        useNative: true,
        enumName: 'transaction_payment_method',
      })
      .notNullable();
    table
      .enu('status', ['PENDING', 'SUCCESS', 'FAILED'], {
        useNative: true,
        enumName: 'transaction_status',
      })
      .notNullable()
      .defaultTo('PENDING');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.check('amount > 0', [], 'transactions_amount_positive');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('transactions');
  await knex.raw('DROP TYPE IF EXISTS transaction_payment_method');
  await knex.raw('DROP TYPE IF EXISTS transaction_status');
};
