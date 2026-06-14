const aiService = require('../../services/guest/aiService');
const { sendSuccess } = require('../../utils/responseHelper');

/**
 * Controller for AI Room Recommendations.
 */

/**
 * POST /api/ai/room-recommendations
 * Process user's chat message and return AI recommendation.
 */
exports.ask = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    const result = await aiService.getRecommendations(message, history);

    return sendSuccess(res, {
      message: 'AI đã phản hồi thành công.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};
