const db = require('../../config/db');

/**
 * Data-access layer cho bảng transactions.
 */

// ---------------------------------------------------------------------------
// Transaction queries
// ---------------------------------------------------------------------------

/**
 * Tạo 1 transaction mới với trạng thái PENDING.
 *
 * @param {object} payload
 * @param {string} payload.depositId
 * @param {number} payload.amount
 * @param {'VNPAY'|'MOMO'|'BANK_TRANSFER'} payload.paymentMethod
 * @param {string} payload.paymentUrl
 * @returns {Promise<object>} transaction vừa tạo
 */
async function createTransaction({ transactionId, depositId, amount, paymentMethod, paymentUrl }) {
  const insertData = {
    deposit_id: depositId,
    amount,
    payment_method: paymentMethod,
    status: 'PENDING',
    payment_url: paymentUrl,
    created_at: db.fn.now(),
  };

  if (transactionId) {
    insertData.transaction_id = transactionId;
  }

  const [transaction] = await db('transactions')
    .insert(insertData)
    .returning('*');
  return transaction;
}

/**
 * Lấy chi tiết 1 transaction theo ID, kèm thông tin deposit và room.
 *
 * @param {string} transactionId
 * @returns {Promise<object|undefined>}
 */
function findTransactionById(transactionId) {
  return db('transactions')
    .join('deposits', 'transactions.deposit_id', 'deposits.deposit_id')
    .join('rooms', 'deposits.room_id', 'rooms.room_id')
    .where('transactions.transaction_id', transactionId)
    .select(
      'transactions.*',
      'deposits.tenant_id',
      'deposits.landlord_id',
      'deposits.room_id',
      'deposits.status as deposit_status',
      'rooms.title as room_title',
    )
    .first();
}

/**
 * Kiểm tra đã có transaction PENDING cho deposit này chưa (tránh duplicate).
 *
 * @param {string} depositId
 * @returns {Promise<object|undefined>}
 */
function findPendingTransactionByDeposit(depositId) {
  return db('transactions')
    .where({ deposit_id: depositId, status: 'PENDING' })
    .first();
}

/**
 * Cập nhật trạng thái transaction sau khi nhận webhook.
 * Đồng thời cập nhật deposit và room status trong cùng 1 DB transaction.
 *
 * @param {string} transactionId
 * @param {'SUCCESS'|'FAILED'} newStatus
 * @param {object} depositInfo  - { deposit_id, room_id }
 * @returns {Promise<object>} transaction sau khi update
 */
async function processWebhookUpdate(transactionId, newStatus, depositInfo) {
  return db.transaction(async (trx) => {
    // 1. Cập nhật transaction
    const [transaction] = await trx('transactions')
      .where({ transaction_id: transactionId })
      .update({ status: newStatus })
      .returning('*');

    // 2. Cập nhật deposit và room theo kết quả webhook
    if (newStatus === 'SUCCESS') {
      await trx('deposits')
        .where({ deposit_id: depositInfo.deposit_id })
        .update({ status: 'CONFIRMED', confirmed_at: trx.fn.now() });

      await trx('rooms')
        .where({ room_id: depositInfo.room_id })
        .update({ status: 'LOCKED', updated_at: trx.fn.now() });

      // Create income records for Admin (100%) and Host (0%)
      await trx('admin_incomes').insert({
        transaction_id: transactionId,
        income: transaction.amount,
        status: 'PENDING_DISBURSEMENT',
        created_at: trx.fn.now(),
        updated_at: trx.fn.now()
      });

      if (depositInfo.landlord_id) {
        await trx('host_incomes').insert({
          host_id: depositInfo.landlord_id,
          transaction_id: transactionId,
          income: 0,
          status: 'PENDING',
          created_at: trx.fn.now(),
          updated_at: trx.fn.now()
        });
      }
    } else {
      // FAILED → cancel deposit, release phòng
      await trx('deposits')
        .where({ deposit_id: depositInfo.deposit_id })
        .update({
          status: 'CANCELLED',
          cancelled_at: trx.fn.now(),
          cancellation_reason: 'Thanh toan that bai.',
        });

      await trx('rooms')
        .where({ room_id: depositInfo.room_id })
        .update({ status: 'AVAILABLE', updated_at: trx.fn.now() });
    }

    return transaction;
  });
}

/**
 * Lấy lịch sử giao dịch của 1 tenant.
 *
 * @param {string} tenantId
 * @param {object} filters
 * @param {string} [filters.status]
 * @param {number} [filters.page=1]
 * @param {number} [filters.limit=20]
 * @returns {Promise<{ items: object[], total: number }>}
 */
async function findTransactionsByTenant(tenantId, { status, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const query = db('transactions')
    .join('deposits', 'transactions.deposit_id', 'deposits.deposit_id')
    .join('rooms', 'deposits.room_id', 'rooms.room_id')
    .where('deposits.tenant_id', tenantId);

  if (status) query.where('transactions.status', status.toUpperCase());

  const [{ count }] = await query.clone().count('transactions.transaction_id as count');

  const items = await query
    .orderBy('transactions.created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .select(
      'transactions.*',
      'rooms.title as room_title',
      'deposits.deposit_id',
      'deposits.status as deposit_status',
    );

  return { items, total: Number(count) };
}

/**
 * Admin: lấy toàn bộ giao dịch (read-only), có lọc và phân trang.
 *
 * @param {object} filters
 * @param {string} [filters.status]
 * @param {string} [filters.paymentMethod]
 * @param {number} [filters.page=1]
 * @param {number} [filters.limit=20]
 * @returns {Promise<{ items: object[], total: number }>}
 */
async function findAllTransactions({ status, paymentMethod, keyword, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const query = db('transactions')
    .join('deposits', 'transactions.deposit_id', 'deposits.deposit_id')
    .join('rooms', 'deposits.room_id', 'rooms.room_id')
    .join('tenants', 'deposits.tenant_id', 'tenants.tenant_id')
    .join('users', 'tenants.tenant_id', 'users.user_id')
    .leftJoin('room_images', function() {
      this.on('rooms.room_id', 'room_images.room_id').andOnVal('room_images.is_cover', '=', true);
    });

  if (status) query.where('transactions.status', status.toUpperCase());
  if (paymentMethod) query.where('transactions.payment_method', paymentMethod.toUpperCase());
  if (keyword) {
    const kw = `%${keyword}%`;
    query.where((builder) => {
      builder
        .whereILike('users.full_name', kw)
        .orWhereILike('users.email', kw)
        .orWhereRaw('CAST(transactions.transaction_id AS TEXT) ILIKE ?', [kw]);
    });
  }

  const [{ count }] = await query.clone().count('transactions.transaction_id as count');

  const items = await query
    .orderBy('transactions.created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .select(
      'transactions.*',
      'rooms.title as room_title',
      'room_images.image_url as room_cover_image_url',
      'deposits.status as deposit_status',
      'users.full_name as tenant_name',
      'users.email as tenant_email',
    );

  return { items, total: Number(count) };
}

/**
 * Xử lý giải ngân cho chủ phòng. Thực hiện cập nhật incomes và giao dịch trong cùng 1 DB transaction.
 */
async function processDisbursement(transactionId, adminId, commissionRate) {
  return db.transaction(async (trx) => {
    // 1. Kiểm tra log chống duplicate
    const existingLog = await trx('disbursement_logs')
      .where({ transaction_id: transactionId })
      .first();
    if (existingLog) {
      const AppError = require('../../utils/AppError');
      throw new AppError('ALREADY_DISBURSED', 'Transaction already disbursed', 400);
    }

    // 2. Lấy transaction và deposit
    const transaction = await trx('transactions')
      .where({ transaction_id: transactionId })
      .first();

    if (!transaction || transaction.status !== 'SUCCESS') {
      const AppError = require('../../utils/AppError');
      throw new AppError('INVALID_TRANSACTION', 'Giao dịch không tồn tại hoặc chưa thành công', 400);
    }

    if (transaction.is_disbursed) {
      const AppError = require('../../utils/AppError');
      throw new AppError('ALREADY_DISBURSED', 'Transaction already disbursed', 400);
    }

    const deposit = await trx('deposits')
      .where({ deposit_id: transaction.deposit_id })
      .first();
      
    if (!deposit) {
      const AppError = require('../../utils/AppError');
      throw new AppError('DEPOSIT_NOT_FOUND', 'Không tìm thấy đơn cọc liên kết', 404);
    }

    const hostId = deposit.landlord_id;
    const totalAmount = parseFloat(transaction.amount);
    const adminAmount = totalAmount * (commissionRate / 100);
    const hostAmount = totalAmount - adminAmount;

    // 3. Cập nhật admin_incomes
    await trx('admin_incomes')
      .where({ transaction_id: transactionId })
      .update({
        income: adminAmount,
        status: 'DISBURSED',
        updated_at: trx.fn.now()
      });

    // 4. Cập nhật host_incomes
    await trx('host_incomes')
      .where({ transaction_id: transactionId })
      .update({
        income: hostAmount,
        status: 'RECEIVED',
        updated_at: trx.fn.now()
      });

    // 5. Cập nhật transaction
    await trx('transactions')
      .where({ transaction_id: transactionId })
      .update({
        is_disbursed: true,
        disbursed_at: trx.fn.now()
      });

    // 6. Insert log
    await trx('disbursement_logs').insert({
      admin_id: adminId,
      host_id: hostId,
      transaction_id: transactionId,
      total_amount: totalAmount,
      host_amount: hostAmount,
      admin_amount: adminAmount,
      commission_rate: commissionRate,
      disbursed_at: trx.fn.now(),
      created_at: trx.fn.now()
    });

    return { totalAmount, hostAmount, adminAmount };
  });
}

/**
 * Lấy lịch sử thu nhập của Admin (bảng admin_incomes).
 */
async function findAdminIncomes({ status, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const baseQuery = db('admin_incomes')
    .join('transactions', 'admin_incomes.transaction_id', 'transactions.transaction_id')
    .join('deposits', 'transactions.deposit_id', 'deposits.deposit_id')
    .join('rooms', 'deposits.room_id', 'rooms.room_id')
    .leftJoin('room_images', function() {
      this.on('rooms.room_id', 'room_images.room_id').andOnVal('room_images.is_cover', '=', true);
    });

  // Tính tổng trên toàn bộ dữ liệu (không bị ảnh hưởng bởi filter status của bảng)
  const sums = await baseQuery.clone()
    .select(
      db.raw('COALESCE(SUM(transactions.amount), 0) as total_received'),
      db.raw("COALESCE(SUM(CASE WHEN admin_incomes.status = 'DISBURSED' THEN admin_incomes.income ELSE 0 END), 0) as total_admin_income")
    )
    .first();

  const query = baseQuery.clone();
  if (status) {
    query.where('admin_incomes.status', status.toUpperCase());
  }

  const [{ count }] = await query.clone().count('admin_incomes.admin_income_id as count');

  const items = await query
    .orderBy('admin_incomes.created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .select(
      'admin_incomes.*',
      'transactions.amount as transaction_amount',
      'transactions.payment_method',
      'rooms.room_id',
      'rooms.title as room_title',
      'room_images.image_url as room_cover_image_url'
    );

  return { 
    items, 
    total: Number(count),
    totalReceived: Number(sums?.total_received || 0),
    totalAdminIncome: Number(sums?.total_admin_income || 0)
  };
}

module.exports = {
  createTransaction,
  findTransactionById,
  findPendingTransactionByDeposit,
  processWebhookUpdate,
  findTransactionsByTenant,
  findAllTransactions,
  processDisbursement,
  findAdminIncomes,
};
