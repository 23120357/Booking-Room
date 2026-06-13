/**
 * Table: users (Người Dùng)
 * Root table for all authenticated actors.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('user_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('full_name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('phone_number', 20).nullable().unique();
    table
      .enu('gender', ['MALE', 'FEMALE', 'OTHER'], { useNative: true, enumName: 'user_gender' })
      .notNullable()
      .defaultTo('OTHER');
    table.date('date_of_birth').nullable();
    table.string('address', 500).nullable();
    table.string('avatar_url', 2048).nullable();
    table
      .enu('status', ['ACTIVE', 'INACTIVE', 'BANNED'], { useNative: true, enumName: 'user_status' })
      .notNullable()
      .defaultTo('ACTIVE');
    table.string('username', 50).notNullable().unique();
    table.string('password', 255).notNullable();
    table.uuid('role_id').notNullable().references('role_id').inTable('roles').onDelete('RESTRICT');

    table.check('date_of_birth <= CURRENT_DATE', [], 'users_date_of_birth_not_future');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('users');
  await knex.raw('DROP TYPE IF EXISTS user_gender');
  await knex.raw('DROP TYPE IF EXISTS user_status');
};
