const roomService = require('../../services/roomService');
const { sendSuccess } = require('../../utils/responseHelper');

async function approveRoom(req, res, next) {
  try {
    await roomService.updateRoomStatus(req.params.roomId, 'APPROVED');
    return sendSuccess(res, {status: 200, message: 'Admin đã duyệt phòng thành công' });
  } catch (err) { next(err); }
}

async function rejectRoom(req, res, next) {
  try {
    await roomService.updateRoomStatus(req.params.roomId, 'REJECTED');
    return sendSuccess(res, {status: 200, message: 'Admin đã từ chối phòng' });
  } catch (err) { next(err); }
}

async function listPendingRooms(req, res, next) {
  try {
    // Tạm thời trả về stub message để test API chạy được trước đã
    return sendSuccess(res, {status: 200, message: 'Stub: Danh sách phòng chờ duyệt' });
  } catch (err) { next(err); }
}

module.exports = { 
  approveRoom, 
  rejectRoom, 
  listPendingRooms // Phải thêm dòng này vào đây!
};

