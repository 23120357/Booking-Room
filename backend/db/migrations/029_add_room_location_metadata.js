exports.up = async function (knex) {
  await knex.schema.alterTable('rooms', (table) => {
    table.string('province_name', 120).nullable();
    table.string('district_name', 120).nullable();
    table.string('ward_name', 120).nullable();
    table.string('formatted_address', 700).nullable();
    table.string('place_id', 255).nullable();
  });

  await knex.schema.alterTable('rooms', (table) => {
    table.index(['province_name'], 'rooms_province_name_idx');
    table.index(['district_name'], 'rooms_district_name_idx');
    table.index(['place_id'], 'rooms_place_id_idx');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('rooms', (table) => {
    table.dropIndex(['place_id'], 'rooms_place_id_idx');
    table.dropIndex(['district_name'], 'rooms_district_name_idx');
    table.dropIndex(['province_name'], 'rooms_province_name_idx');
    table.dropColumn('place_id');
    table.dropColumn('formatted_address');
    table.dropColumn('ward_name');
    table.dropColumn('district_name');
    table.dropColumn('province_name');
  });
};
