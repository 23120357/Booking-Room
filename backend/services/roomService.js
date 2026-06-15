const AppError = require('../utils/AppError');

// Placeholder service: Day 1 skeletons. Implement business logic in later tasks.
async function listRooms(query) {
  // TODO: implement filters, pagination
  throw new AppError('NOT_IMPLEMENTED', 'listRooms not implemented', 501);
}

async function getRoomById(roomId) {
  // TODO: fetch room by id
  throw new AppError('NOT_IMPLEMENTED', 'getRoomById not implemented', 501);
}

async function listMyRooms(userId, query) {
  // TODO: list rooms for host
  throw new AppError('NOT_IMPLEMENTED', 'listMyRooms not implemented', 501);
}

async function createRoom(userId, payload) {
  // TODO: create room with ownership
  throw new AppError('NOT_IMPLEMENTED', 'createRoom not implemented', 501);
}

async function updateRoom(userId, roomId, payload) {
  // TODO: update room, ownership guard
  throw new AppError('NOT_IMPLEMENTED', 'updateRoom not implemented', 501);
}

async function deleteRoom(userId, roomId) {
  // TODO: delete room, ownership guard
  throw new AppError('NOT_IMPLEMENTED', 'deleteRoom not implemented', 501);
}

async function updateRoomStatus(roomId, status) {
  if (!roomId || !status) {
    throw new AppError('BAD_REQUEST', 'roomId and status are required', 501);
  }

  // TODO: implement real DB update with repository / Knex.
  // This placeholder avoids the 501 response while admin approval flows work.
  return { roomId, status };
}

module.exports = {
  listRooms,
  getRoomById,
  listMyRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
};
