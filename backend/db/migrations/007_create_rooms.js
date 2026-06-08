/**
 * Table: rooms (Phòng Trọ / Căn Hộ)
 * Core listing entity owned by a landlord (1:N with landlords).
 */
exports.up = async function (knex) {
  await knex.schema.createTable('rooms', (table) => {
    table.uuid('room_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('landlord_id')
      .notNullable()
      .references('landlord_id')
      .inTable('landlords')
      .onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.string('room_type', 100).notNullable();
    table.string('detailed_address', 500).notNullable();
    table.integer('max_capacity').notNullable();
    table.decimal('monthly_rent', 15, 2).notNullable();
    table.decimal('deposit_amount', 15, 2).notNullable();
    table.decimal('electricity_cost', 15, 2).notNullable();
    table.decimal('water_cost', 15, 2).notNullable();
    table.decimal('internet_cost', 15, 2).notNullable().defaultTo(0);
    table.decimal('service_fee', 15, 2).notNullable().defaultTo(0);
    table
      .enu('status', ['AVAILABLE', 'RENTED'], { useNative: true, enumName: 'room_status' })
      .notNullable()
      .defaultTo('AVAILABLE');
    table.decimal('average_rating', 3, 2).notNullable().defaultTo(0);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.text('room_description').nullable();
    table.specificType('longitude', 'double precision').nullable();
    table.specificType('latitude', 'double precision').nullable();

    table.check('max_capacity > 0', [], 'rooms_max_capacity_positive');
    table.check('monthly_rent >= 0', [], 'rooms_monthly_rent_non_negative');
    table.check('deposit_amount >= 0', [], 'rooms_deposit_amount_non_negative');
    table.check('electricity_cost >= 0', [], 'rooms_electricity_cost_non_negative');
    table.check('water_cost >= 0', [], 'rooms_water_cost_non_negative');
    table.check('internet_cost >= 0', [], 'rooms_internet_cost_non_negative');
    table.check('service_fee >= 0', [], 'rooms_service_fee_non_negative');
    table.check('average_rating >= 0 AND average_rating <= 5', [], 'rooms_average_rating_range');
    table.check('longitude >= -180 AND longitude <= 180', [], 'rooms_longitude_range');
    table.check('latitude >= -90 AND latitude <= 90', [], 'rooms_latitude_range');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('rooms');
  await knex.raw('DROP TYPE IF EXISTS room_status');
};
