const knex = require('knex');
const env = require('./env');

const db = knex({
  client: 'pg',
  connection: env.databaseUrl,
  pool: {
    min: 0,
    max: Number(process.env.DB_POOL_MAX || 10),
  },
});

module.exports = db;
