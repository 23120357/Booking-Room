const profileService = require('../../services/profileService');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/responseHelper');

async function submitHostVerification(req, res, next) {
  try {
    const idCardFront = req.files?.id_card_front?.[0];
    const idCardBack = req.files?.id_card_back?.[0];
    if (!idCardFront || !idCardBack) {
      throw new AppError('ID_CARD_REQUIRED', 'Vui lòng tải lên ảnh mặt trước và mặt sau CCCD.', 400);
    }

    const verification = await profileService.submitHostVerification(req.user.userId, {
      idCardFront,
      idCardBack,
    });

    return sendSuccess(res, {
      status: 200,
      message: 'host verification submitted',
      data: { verification },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  submitHostVerification,
};
