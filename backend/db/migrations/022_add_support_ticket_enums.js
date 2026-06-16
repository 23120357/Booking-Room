exports.up = async function (knex) {
    // Thêm giá trị 'OTHER' vào Enum 'support_ticket_category'
    await knex.raw("ALTER TYPE support_ticket_category ADD VALUE IF NOT EXISTS 'OTHER'");
};

exports.down = async function (knex) {
    console.log('Cannot safely remove ENUM values in down migration.');
};