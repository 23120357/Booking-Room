const express = require('express');
const router = express.Router();
const transactionController = require('../../controllers/payment/transactionController');
const depositController = require('../../controllers/booking/depositController');
const { requireAuth } = require('../../middlewares/authMiddleware');
const { authorizeRoles } = require('../../middlewares/roleMiddleware');

/**
 * Admin routes — Booking & Payment management.
 *
 * Mounted in app.js:
 *   app.use('/api/admin/bookings', bookingRoutes)  → expire-deposits
 *   app.use('/api/admin', bookingRoutes)            → /transactions
 */

// GET /api/admin/transactions — Admin xem toàn bộ giao dịch (read-only)
router.get(
  '/transactions',
  requireAuth,
  authorizeRoles('ADMIN'),
  transactionController.listAllTransactions,
);

// GET /api/admin/incomes — Admin xem ví thu nhập
router.get(
  '/incomes',
  requireAuth,
  authorizeRoles('ADMIN'),
  transactionController.listAdminIncomes,
);

// POST /api/admin/transactions/:id/disburse — Admin giải ngân giao dịch
router.post(
  '/transactions/:id/disburse',
  requireAuth,
  authorizeRoles('ADMIN'),
  transactionController.disburseTransaction,
);

// POST /api/admin/bookings/expire-deposits — Admin trigger expire thủ công
router.post(
  '/expire-deposits',
  requireAuth,
  authorizeRoles('ADMIN'),
  depositController.expireDeposits,
);

module.exports = router;
