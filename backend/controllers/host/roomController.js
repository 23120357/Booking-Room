const roomService = require('../../services/host/roomService');
const { success } = require('../../utils/responseHelper');

async function createRoom(req, res, next) {
  try {
    const room = await roomService.createRoom(req.user, req.body);
    return success(res, { room }, 'Room submitted for approval', 201);
  } catch (err) {
    next(err);
  }
}

async function listMyRooms(req, res, next) {
  try {
    const rooms = await roomService.listMyRooms(req.user);
    return success(res, { rooms }, 'Host rooms fetched successfully');
  } catch (err) {
    next(err);
  }
}

async function updateRoom(req, res, next) {
  try {
    const room = await roomService.updateRoom(req.user, req.params.id, req.body);
    return success(res, { room }, 'Room updated and submitted for approval');
  } catch (err) {
    next(err);
  }
}

async function deleteRoom(req, res, next) {
  try {
    await roomService.deleteRoom(req.user, req.params.id);
    return success(res, null, 'Room deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRoom,
  listMyRooms,
  updateRoom,
  deleteRoom,
};
