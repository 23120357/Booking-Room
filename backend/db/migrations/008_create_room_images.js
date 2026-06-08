/**
 * Table: room_images (Hình Ảnh Phòng Trọ)
 * Listing photo attachments. Weak entity tied to rooms.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('room_images', (table) => {
    table.uuid('room_id').notNullable().references('room_id').inTable('rooms').onDelete('CASCADE');
    table.integer('sequence_number').notNullable();
    table.string('image_url', 2048).notNullable();
    table.boolean('is_cover').notNullable().defaultTo(false);
    table.primary(['room_id', 'sequence_number']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('room_images');
};
