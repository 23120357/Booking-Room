const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/responseHelper');
const roomService = require('../../services/roomService');

async function listRooms(req, res, next) {
  try {
    // Tạm thời comment dòng này lại vì chưa làm Service thật
    // await roomService.listRooms(req.query); 
    
    // Trả về thẳng kết quả Stub luôn để Postman nhận được dữ liệu công khai
    return sendSuccess(res, { 
      status: 200, // Đổi sang 200 cho Postman hiện màu xanh Success đẹp đẽ
      message: 'Stub: Danh sách phòng công khai (Guest)' 
    });
  } catch (err) {
    return next(err instanceof AppError ? err : new AppError('UNEXPECTED', 'Đã xảy ra lỗi.', 500));
  }
}

async function getRoomById(req, res, next) {
  try {
    const { roomId } = req.params;
    // Tạm thời comment dòng này lại
    // await roomService.getRoomById(roomId);
    
    return sendSuccess(res, { 
      status: 200, 
      message: `Stub: Chi tiết phòng ID ${roomId}` 
    });
  } catch (err) {
    return next(err instanceof AppError ? err : new AppError('UNEXPECTED', 'Đã xảy ra lỗi.', 500));
  }
}

module.exports = {
  listRooms,
  getRoomById,
};
