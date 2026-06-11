const roomService = require('../../services/guest/roomService');
const { success } = require('../../utils/responseHelper');

async function listRooms(req, res, next) {
  try {
    const result = await roomService.listRooms(req.query);
    return success(res, result, 'Rooms fetched successfully');
  } catch (err) {
    next(err);
  }
}

async function getRoomById(req, res, next) {
  try {
    const room = await roomService.getRoomById(req.params.id, req.user || null);
    return success(res, { room }, 'Room fetched successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listRooms,
  getRoomById,
};
