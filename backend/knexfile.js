// Load environment variables from backend/.env (no-op if dotenv isn't installed).
try {
  require('dotenv').config();
} catch (_) {
  /* dotenv is optional */
}

/**
 * Knex configuration for the Accommodation Management & Booking System.
 * Target database: PostgreSQL. Connection is provided as a single string via
 * the DATABASE_URL environment variable.
 */

const base = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  migrations: {
    directory: './db/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './db/seeds',
  },
};

module.exports = {
  development: base,

  // Uses DATABASE_URL_TEST if set, otherwise falls back to DATABASE_URL.
  test: {
    ...base,
    connection: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
  },

  // Production providers usually require SSL.
  production: {
    ...base,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
  },
};
