const authRepository = require('../repositories/auth/auth.repository');
const AppError = require('../utils/AppError');
const { ROLES } = require('../config/authConstants');
const idCardStorage = require('./storage/idCardStorage');

async function submitHostVerification(userId, { idCardFront, idCardBack }) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'Tài khoản không tồn tại.', 404);
  }
  if (user.role_name !== ROLES.LANDLORD) {
    throw new AppError('NOT_LANDLORD', 'Chỉ tài khoản chủ nhà mới được nộp ảnh CCCD.', 403);
  }
  if (user.approval_status === 'APPROVED') {
    throw new AppError('ALREADY_APPROVED', 'Hồ sơ chủ nhà đã được duyệt, không cần nộp lại CCCD.', 409);
  }

  const { frontKey, backKey } = await idCardStorage.save({
    landlordId: userId,
    frontFile: idCardFront,
    backFile: idCardBack,
  });

  const resetToPending = user.approval_status === 'REJECTED';
  const updated = await authRepository.updateLandlordIdCards(userId, {
    frontKey,
    backKey,
    resetToPending,
  });

  if (!updated) {
    throw new AppError('LANDLORD_NOT_FOUND', 'Không tìm thấy hồ sơ chủ nhà.', 404);
  }

  return {
    approvalStatus: resetToPending ? 'PENDING' : user.approval_status,
    idCardSubmitted: true,
    idCardFrontUrl: frontKey,
    idCardBackUrl: backKey,
  };
}

module.exports = {
  submitHostVerification,
};
