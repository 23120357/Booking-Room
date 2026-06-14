const conversationService = require('../../services/guest/conversationService');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/responseHelper');

/**
 * Controller for Conversations and Messages.
 */

/**
 * POST /api/conversations
 * Initialize or retrieve an existing conversation with another user.
 * Body: { peer_user_id }
 */
exports.initConversation = async (req, res, next) => {
  try {
    const { peer_user_id } = req.body;
    const { userId, role } = req.user; // role could be 'TENANT' or 'LANDLORD'

    if (!peer_user_id) {
      throw new AppError('MISSING_FIELD', 'peer_user_id là bắt buộc.', 400);
    }

    const conversation = await conversationService.getOrCreateConversation(userId, role, peer_user_id);

    return sendSuccess(res, {
      message: 'Lấy/Tạo cuộc hội thoại thành công.',
      data: conversation
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/conversations
 * Get all conversations for the logged-in user.
 */
exports.listConversations = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    const conversations = await conversationService.listConversations(userId, role);

    return sendSuccess(res, {
      message: 'Lấy danh sách hội thoại thành công.',
      data: conversations
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/conversations/:id/messages
 * Get paginated messages for a conversation.
 */
exports.getMessages = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const { userId } = req.user;
    const { page, limit } = req.query;

    const result = await conversationService.getMessages(conversationId, userId, { page, limit });

    return sendSuccess(res, {
      message: 'Lấy tin nhắn thành công.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/conversations/:id/messages
 * Send a new message.
 * Body: { content }
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const { userId } = req.user;
    const { content } = req.body;

    const message = await conversationService.sendMessage(conversationId, userId, content);

    return sendSuccess(res, {
      status: 201,
      message: 'Gửi tin nhắn thành công.',
      data: message
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/conversations/:id/read
 * Mark all unread messages in a conversation as read.
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const { userId } = req.user;

    await conversationService.markAsRead(conversationId, userId);

    return sendSuccess(res, {
      message: 'Đã đánh dấu đọc tin nhắn.'
    });
  } catch (err) {
    next(err);
  }
};
