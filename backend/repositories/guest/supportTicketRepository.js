const db = require('../../config/db');

/**
 * Insert a new support ticket into the database.
 */
async function createTicket(data) {
  const [ticket] = await db('support_tickets').insert(data).returning('*');
  return ticket;
}

/**
 * Retrieve paginated support tickets for a specific user.
 */
async function findTicketsByUser(userId, { limit, offset }) {
  const [{ count }] = await db('support_tickets')
    .where({ user_id: userId })
    .count('ticket_id as count');

  const items = await db('support_tickets')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return { items, total: Number(count) };
}

/**
 * Retrieve details of a specific ticket, ensuring it belongs to the user.
 */
async function findTicketById(ticketId, userId) {
  return await db('support_tickets')
    .where({ ticket_id: ticketId, user_id: userId })
    .first();
}

/**
 * Update the status of a specific ticket to 'CLOSED'.
 */
async function cancelTicket(ticketId, userId) {
  const [updated] = await db('support_tickets')
    .where({ ticket_id: ticketId, user_id: userId })
    .whereIn('status', ['OPEN', 'IN_PROGRESS'])
    .update({ 
      status: 'CLOSED',
      updated_at: db.fn.now()
    })
    .returning('*');
  return updated;
}

module.exports = {
  createTicket,
  findTicketsByUser,
  findTicketById,
  cancelTicket
};
