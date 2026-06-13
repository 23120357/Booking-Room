/**
 * Required database fixes from the docs/schema review.
 *
 * This migration is additive because earlier migrations may already be applied
 * on Neon. It adds missing business tables, lifecycle fields, audit metadata,
 * and integrity/index constraints without rewriting existing migrations.
 */
exports.config = { transaction: false };

exports.up = async function (knex) {
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deposit_status') THEN
        CREATE TYPE deposit_status AS ENUM ('PROCESSING', 'CONFIRMED', 'EXPIRED', 'CANCELLED');
      END IF;
    END
    $$;
  `);

  await knex.raw(`ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'LOCKED'`);
  await knex.raw(`ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'CANCELLED'`);
  await knex.raw(`ALTER TYPE support_ticket_status ADD VALUE IF NOT EXISTS 'RESOLVED'`);

  await knex.schema.alterTable('deposits', (table) => {
    table.decimal('deposit_amount', 15, 2).nullable();
    table.timestamp('appointment_time').nullable();
    table.specificType('status', 'deposit_status').notNullable().defaultTo('PROCESSING');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('expired_at').nullable();
    table.timestamp('confirmed_at').nullable();
    table.timestamp('cancelled_at').nullable();
    table.text('cancellation_reason').nullable();
  });

  await knex.raw(`
    UPDATE deposits AS d
    SET
      deposit_amount = COALESCE(d.deposit_amount, r.deposit_amount),
      expired_at = COALESCE(d.expired_at, d.created_at + INTERVAL '15 minutes'),
      status = CASE
        WHEN EXISTS (
          SELECT 1
          FROM transactions AS t
          WHERE t.deposit_id = d.deposit_id
            AND t.status = 'SUCCESS'
        )
        THEN 'CONFIRMED'::deposit_status
        ELSE d.status
      END,
      confirmed_at = CASE
        WHEN d.confirmed_at IS NULL
          AND EXISTS (
            SELECT 1
            FROM transactions AS t
            WHERE t.deposit_id = d.deposit_id
              AND t.status = 'SUCCESS'
          )
        THEN d.created_at
        ELSE d.confirmed_at
      END
    FROM rooms AS r
    WHERE r.room_id = d.room_id
  `);

  await knex.raw(`
    ALTER TABLE deposits
      ALTER COLUMN deposit_amount SET NOT NULL,
      ALTER COLUMN expired_at SET NOT NULL
  `);

  await knex.raw(`
    ALTER TABLE deposits
      ADD CONSTRAINT deposits_deposit_amount_non_negative CHECK (deposit_amount >= 0),
      ADD CONSTRAINT deposits_expiry_after_created CHECK (expired_at > created_at),
      ADD CONSTRAINT deposits_confirmed_at_required CHECK (
        status <> 'CONFIRMED' OR confirmed_at IS NOT NULL
      ),
      ADD CONSTRAINT deposits_cancelled_at_required CHECK (
        status <> 'CANCELLED' OR cancelled_at IS NOT NULL
      )
  `);

  await knex.schema.createTable('reviews', (table) => {
    table.uuid('review_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('deposit_id')
      .notNullable()
      .unique()
      .references('deposit_id')
      .inTable('deposits')
      .onDelete('RESTRICT');
    table.uuid('room_id').notNullable().references('room_id').inTable('rooms').onDelete('CASCADE');
    table
      .uuid('tenant_id')
      .notNullable()
      .references('tenant_id')
      .inTable('tenants')
      .onDelete('CASCADE');
    table.integer('rating').notNullable();
    table.text('comment').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.check('rating >= 1 AND rating <= 5', [], 'reviews_rating_range');
  });

  await knex.schema.createTable('otp_verifications', (table) => {
    table.uuid('otp_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.string('email', 255).nullable();
    table.string('phone_number', 20).nullable();
    table
      .enu('purpose', ['REGISTRATION', 'PASSWORD_RESET', 'PHONE_CHANGE', 'EMAIL_CHANGE'], {
        useNative: true,
        enumName: 'otp_purpose',
      })
      .notNullable();
    table.string('otp_hash', 255).notNullable();
    table.integer('attempt_count').notNullable().defaultTo(0);
    table.timestamp('expires_at').notNullable();
    table.timestamp('consumed_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.check('attempt_count >= 0 AND attempt_count <= 3', [], 'otp_verifications_attempt_range');
    table.check(
      '(user_id IS NOT NULL OR email IS NOT NULL OR phone_number IS NOT NULL)',
      [],
      'otp_verifications_has_subject',
    );
  });

  await knex.schema.createTable('account_security', (table) => {
    table
      .uuid('user_id')
      .notNullable()
      .primary()
      .references('user_id')
      .inTable('users')
      .onDelete('CASCADE');
    table.integer('failed_login_attempts').notNullable().defaultTo(0);
    table.timestamp('locked_until').nullable();
    table.timestamp('last_login_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.check('failed_login_attempts >= 0', [], 'account_security_failed_login_attempts_non_negative');
  });

  await knex.schema.createTable('login_audit_logs', (table) => {
    table.uuid('login_audit_id').notNullable().primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('user_id').inTable('users').onDelete('SET NULL');
    table.string('login_identifier', 255).notNullable();
    table.boolean('success').notNullable();
    table.string('failure_reason', 255).nullable();
    table.specificType('ip_address', 'inet').nullable();
    table.string('user_agent', 512).nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.alterTable('system_logs', (table) => {
    table.specificType('ip_address', 'inet').nullable();
    table.string('user_agent', 512).nullable();
  });

  await knex.schema.alterTable('support_tickets', (table) => {
    table.uuid('room_id').nullable().references('room_id').inTable('rooms').onDelete('SET NULL');
  });

  await knex.raw(`CREATE UNIQUE INDEX IF NOT EXISTS room_images_one_cover_per_room ON room_images (room_id) WHERE is_cover = true`);
  await knex.raw(`CREATE UNIQUE INDEX IF NOT EXISTS conversations_unique_tenant_landlord ON conversations (tenant_id, landlord_id)`);
  await knex.raw(`CREATE UNIQUE INDEX IF NOT EXISTS deposits_one_processing_per_room ON deposits (room_id) WHERE status = 'PROCESSING'`);

  await knex.raw(`CREATE INDEX IF NOT EXISTS rooms_landlord_id_idx ON rooms (landlord_id)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS rooms_status_idx ON rooms (status)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS rooms_monthly_rent_idx ON rooms (monthly_rent)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS rooms_created_at_idx ON rooms (created_at)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS room_approvals_room_status_idx ON room_approvals (room_id, approval_status)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS deposits_room_status_idx ON deposits (room_id, status)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS deposits_tenant_status_idx ON deposits (tenant_id, status)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS transactions_deposit_id_idx ON transactions (deposit_id)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS transactions_status_created_at_idx ON transactions (status, created_at)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS messages_conversation_sent_at_idx ON messages (conversation_id, sent_at)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS notifications_user_status_idx ON notifications (user_id, status)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS support_tickets_user_status_idx ON support_tickets (user_id, status)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS violation_reports_resolution_status_idx ON violation_reports (resolution_status)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS system_logs_user_created_at_idx ON system_logs (user_id, created_at)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS login_audit_logs_identifier_created_at_idx ON login_audit_logs (login_identifier, created_at)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS login_audit_logs_user_created_at_idx ON login_audit_logs (user_id, created_at)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS otp_verifications_subject_idx ON otp_verifications (user_id, email, phone_number, purpose)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS otp_verifications_expires_at_idx ON otp_verifications (expires_at)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS reviews_room_created_at_idx ON reviews (room_id, created_at)`);
};

exports.down = async function (knex) {
  await knex.raw(`DROP INDEX IF EXISTS reviews_room_created_at_idx`);
  await knex.raw(`DROP INDEX IF EXISTS otp_verifications_expires_at_idx`);
  await knex.raw(`DROP INDEX IF EXISTS otp_verifications_subject_idx`);
  await knex.raw(`DROP INDEX IF EXISTS login_audit_logs_user_created_at_idx`);
  await knex.raw(`DROP INDEX IF EXISTS login_audit_logs_identifier_created_at_idx`);
  await knex.raw(`DROP INDEX IF EXISTS system_logs_user_created_at_idx`);
  await knex.raw(`DROP INDEX IF EXISTS violation_reports_resolution_status_idx`);
  await knex.raw(`DROP INDEX IF EXISTS support_tickets_user_status_idx`);
  await knex.raw(`DROP INDEX IF EXISTS notifications_user_status_idx`);
  await knex.raw(`DROP INDEX IF EXISTS messages_conversation_sent_at_idx`);
  await knex.raw(`DROP INDEX IF EXISTS transactions_status_created_at_idx`);
  await knex.raw(`DROP INDEX IF EXISTS transactions_deposit_id_idx`);
  await knex.raw(`DROP INDEX IF EXISTS deposits_tenant_status_idx`);
  await knex.raw(`DROP INDEX IF EXISTS deposits_room_status_idx`);
  await knex.raw(`DROP INDEX IF EXISTS room_approvals_room_status_idx`);
  await knex.raw(`DROP INDEX IF EXISTS rooms_created_at_idx`);
  await knex.raw(`DROP INDEX IF EXISTS rooms_monthly_rent_idx`);
  await knex.raw(`DROP INDEX IF EXISTS rooms_status_idx`);
  await knex.raw(`DROP INDEX IF EXISTS rooms_landlord_id_idx`);
  await knex.raw(`DROP INDEX IF EXISTS deposits_one_processing_per_room`);
  await knex.raw(`DROP INDEX IF EXISTS conversations_unique_tenant_landlord`);
  await knex.raw(`DROP INDEX IF EXISTS room_images_one_cover_per_room`);

  await knex.schema.alterTable('system_logs', (table) => {
    table.dropColumn('ip_address');
    table.dropColumn('user_agent');
  });

  await knex.schema.alterTable('support_tickets', (table) => {
    table.dropColumn('room_id');
  });

  await knex.schema.dropTableIfExists('login_audit_logs');
  await knex.schema.dropTableIfExists('account_security');
  await knex.schema.dropTableIfExists('otp_verifications');
  await knex.schema.dropTableIfExists('reviews');

  await knex.raw(`
    ALTER TABLE deposits
      DROP CONSTRAINT IF EXISTS deposits_cancelled_at_required,
      DROP CONSTRAINT IF EXISTS deposits_confirmed_at_required,
      DROP CONSTRAINT IF EXISTS deposits_expiry_after_created,
      DROP CONSTRAINT IF EXISTS deposits_deposit_amount_non_negative
  `);

  await knex.schema.alterTable('deposits', (table) => {
    table.dropColumn('cancellation_reason');
    table.dropColumn('cancelled_at');
    table.dropColumn('confirmed_at');
    table.dropColumn('expired_at');
    table.dropColumn('created_at');
    table.dropColumn('status');
    table.dropColumn('appointment_time');
    table.dropColumn('deposit_amount');
  });

  await knex.raw(`DROP TYPE IF EXISTS otp_purpose`);
  await knex.raw(`DROP TYPE IF EXISTS deposit_status`);
};
