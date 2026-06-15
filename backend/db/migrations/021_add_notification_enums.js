exports.up = async function (knex) {
  // Add new values to the existing ENUM type 'notification_type'
  // Note: PostgreSQL requires ALTER TYPE ... ADD VALUE to be executed outside of a transaction block
  // or committed individually in some older versions, but knex handles raw queries.
  // We use IF NOT EXISTS to prevent errors if the values were already added.
  
  await knex.raw("ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'SUPPORT'");
  await knex.raw("ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'VIOLATION'");
  await knex.raw("ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'ROOM_APPROVAL'");
  await knex.raw("ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'REVIEW'");
};

exports.down = async function (knex) {
  // PostgreSQL does not support dropping ENUM values directly via ALTER TYPE.
  // A full drop and recreate is required to remove values, which is risky for existing data.
  // Therefore, the down migration is left empty or logs a message.
  console.log('Cannot safely remove ENUM values in down migration.');
};
