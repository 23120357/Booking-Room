/**
 * Table: landlords (Chủ Phòng)
 * 1:1 specialization of users (shared primary key).
 */
exports.up = async function (knex) {
  await knex.schema.createTable('landlords', (table) => {
    table
      .uuid('landlord_id')
      .notNullable()
      .primary()
      .references('user_id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('id_card_front_url', 2048).notNullable();
    table.string('id_card_back_url', 2048).notNullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('landlords');
};
