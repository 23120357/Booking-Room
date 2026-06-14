const db = require('../../config/db');

/**
 * Data-access layer for Conversations and Messages.
 */

/**
 * Retrieve a conversation by its exact tenant and landlord pairing.
 *
 * @param {string} tenantId
 * @param {string} landlordId
 */
function findConversationByParticipants(tenantId, landlordId) {
  return db('conversations')
    .where({ tenant_id: tenantId, landlord_id: landlordId })
    .first();
}

/**
 * Insert a new conversation.
 */
async function createConversation(tenantId, landlordId) {
  const [conv] = await db('conversations')
    .insert({ tenant_id: tenantId, landlord_id: landlordId })
    .returning('*');
  return conv;
}

/**
 * Find a conversation by ID.
 *
 * @param {string} conversationId
 */
function findConversationById(conversationId) {
  return db('conversations').where({ conversation_id: conversationId }).first();
}

/**
 * Retrieve all conversations for a user (can be a Tenant or a Landlord).
 * Includes the other participant's profile and the latest message.
 *
 * @param {string} role - 'TENANT' or 'LANDLORD'
 * @param {string} specificId - tenant_id or landlord_id
 */
async function findConversationsByUser(role, specificId) {
  // Determine join keys based on role
  const isTenant = role === 'TENANT';
  const filterKey = isTenant ? 'conversations.tenant_id' : 'conversations.landlord_id';
  const peerKey = isTenant ? 'conversations.landlord_id' : 'conversations.tenant_id';
  const peerTable = isTenant ? 'landlords' : 'tenants';
  const peerIdField = isTenant ? 'landlords.landlord_id' : 'tenants.tenant_id';

  // We need to fetch the conversations, join with the peer's user profile,
  // and get the last message snippet + unread count.
  const query = db('conversations')
    .join(peerTable, peerKey, peerIdField)
    .join('users', peerIdField, 'users.user_id')
    .where(filterKey, specificId)
    .select(
      'conversations.conversation_id',
      'conversations.created_at',
      'users.user_id as peer_user_id',
      'users.full_name as peer_name',
      'users.avatar_url as peer_avatar',
      // Subquery for latest message
      db.raw(`(
        SELECT content 
        FROM messages 
        WHERE messages.conversation_id = conversations.conversation_id 
        ORDER BY sent_at DESC LIMIT 1
      ) as last_message`),
      // Subquery for latest message sent_at
      db.raw(`(
        SELECT sent_at 
        FROM messages 
        WHERE messages.conversation_id = conversations.conversation_id 
        ORDER BY sent_at DESC LIMIT 1
      ) as last_message_at`),
      // Subquery for unread count (messages sent BY peer, status != 'READ')
      db.raw(`(
        SELECT COUNT(*)::int 
        FROM messages 
        WHERE messages.conversation_id = conversations.conversation_id 
          AND messages.sender_id = users.user_id 
          AND messages.status != 'READ'
      ) as unread_count`)
    )
    .orderByRaw('last_message_at DESC NULLS LAST');

  return query;
}

/**
 * Retrieve paginated messages for a conversation.
 */
async function findMessages(conversationId, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  const [{ count }] = await db('messages')
    .where({ conversation_id: conversationId })
    .count('message_id as count');

  const items = await db('messages')
    .where({ conversation_id: conversationId })
    // Newest first for fetching
    .orderBy('sent_at', 'desc')
    .limit(limit)
    .offset(offset)
    .select(
      'message_id',
      'content',
      'sender_id',
      'sent_at',
      'status',
      'read_at'
    );

  return { items, total: Number(count) };
}

/**
 * Insert a new message into a conversation.
 */
async function insertMessage({ conversation_id, sender_id, content }) {
  const [msg] = await db('messages')
    .insert({
      conversation_id,
      sender_id,
      content,
      status: 'SENT'
    })
    .returning('*');
  return msg;
}

/**
 * Mark messages in a conversation as READ for a specific recipient.
 * Only updates messages sent by the OTHER person.
 *
 * @param {string} conversationId
 * @param {string} recipientUserId
 */
async function markMessagesAsRead(conversationId, recipientUserId) {
  await db('messages')
    .where({ conversation_id: conversationId })
    .andWhere('sender_id', '!=', recipientUserId)
    .andWhere('status', '!=', 'READ')
    .update({
      status: 'READ',
      read_at: db.fn.now()
    });
}

/**
 * Mark messages as DELIVERED when the recipient fetches them.
 */
async function markDeliveredForConversations(conversationIds, recipientUserId) {
  if (!conversationIds || conversationIds.length === 0) return;
  await db('messages')
    .whereIn('conversation_id', conversationIds)
    .andWhere('sender_id', '!=', recipientUserId)
    .andWhere('status', 'SENT')
    .update({ status: 'DELIVERED' });
}

module.exports = {
  findConversationByParticipants,
  createConversation,
  findConversationById,
  findConversationsByUser,
  findMessages,
  insertMessage,
  markMessagesAsRead,
  markDeliveredForConversations
};
