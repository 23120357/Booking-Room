const db = require('../config/db');

async function findById(roomId) {
  const row = await db('rooms as r')
    .select('r.*', 'ra.approval_status')
    .leftJoin('room_approvals as ra', 'r.room_id', 'ra.room_id')
    .where('r.room_id', roomId)
    .first();
  return row || null;
}

async function find({ onlyApproved = false, landlordId, limit = 20, offset = 0, filters = {} } = {}) {
  const q = db('rooms as r').select('r.*');

  if (onlyApproved) {
    q.join('room_approvals as ra', 'r.room_id', 'ra.room_id').where('ra.approval_status', 'APPROVED');
  }

  if (landlordId) q.where('r.landlord_id', landlordId);

  if (filters.title) q.whereILike('r.title', `%${filters.title}%`);
  if (filters.room_type) q.where('r.room_type', filters.room_type);
  if (filters.min_price) q.where('r.monthly_rent', '>=', filters.min_price);
  if (filters.max_price) q.where('r.monthly_rent', '<=', filters.max_price);

  const results = await q.limit(limit).offset(offset);
  return results;
}

async function create(room, images = [], trx) {
  const conn = trx || db;
  const [created] = await conn('rooms').insert(room).returning('*');

  if (images && images.length) {
    const rows = images.map((img, idx) => ({
      room_id: created.room_id,
      sequence_number: idx + 1,
      image_url: img,
      is_cover: idx === 0,
    }));
    await conn('room_images').insert(rows);
  }

  return created;
}

async function update(roomId, patch) {
  const [updated] = await db('rooms').where('room_id', roomId).update(patch).returning('*');
  return updated || null;
}

async function remove(roomId) {
  // Soft-delete is not defined in schema; perform hard delete for now
  await db('rooms').where('room_id', roomId).del();
  return true;
}

module.exports = {
  findById,
  find,
  create,
  update,
  remove,
};
