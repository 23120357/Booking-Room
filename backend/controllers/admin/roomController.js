const roomService = require('../../services/admin/roomService');
const { success } = require('../../utils/responseHelper');

async function listPendingRooms(req, res, next) {
  try {
    const rooms = await roomService.listPendingRooms();
    return success(res, { rooms }, 'Pending rooms fetched successfully');
  } catch (err) {
    next(err);
  }
}

async function approveRoom(req, res, next) {
  try {
    const room = await roomService.approveRoom(req.params.id);
    return success(res, { room }, 'Room approved successfully');
  } catch (err) {
    next(err);
  }
}

async function rejectRoom(req, res, next) {
  try {
    const room = await roomService.rejectRoom(req.params.id);
    return success(res, { room }, 'Room rejected successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPendingRooms,
  approveRoom,
  rejectRoom,
};
