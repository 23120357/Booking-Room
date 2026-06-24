const knex = require('knex')(require('./knexfile'));

async function fixMigrations() {
  try {
    const deleted = await knex('knex_migrations').whereIn('name', [
      '030_add_hidden_room_status.js',
      '031_create_review_replies.js',
      '032_add_parent_reply_id_to_review_replies.js',
      '030_add_conversation_cleared_timestamps.js'
    ]).del();
    console.log(`Deleted ${deleted} corrupted migration records.`);
  } catch (error) {
    console.error('Error fixing migrations:', error);
  } finally {
    await knex.destroy();
  }
}

fixMigrations();
