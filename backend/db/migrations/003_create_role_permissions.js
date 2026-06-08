/**
 * Table: role_permissions (Bảng Trung Gian Quyền - Vai Trò)
 * Resolves the many-to-many (N:N) relationship between roles and permissions.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('role_id').notNullable().references('role_id').inTable('roles').onDelete('CASCADE');
    table
      .uuid('permission_id')
      .notNullable()
      .references('permission_id')
      .inTable('permissions')
      .onDelete('CASCADE');
    table.primary(['role_id', 'permission_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('role_permissions');
};
