const express = require('express');
const router = express.Router();
const violationReportController = require('../../controllers/guest/violationReportController');
const { requireAuth } = require('../../middlewares/authMiddleware');

/**
 * Violation Report routes.
 * Mounted at: /api/violation-reports
 */

// All routes require authentication
router.use(requireAuth);

// POST /api/violation-reports — Create a new report
router.post('/', violationReportController.create);

// GET /api/violation-reports — List reports
router.get('/', violationReportController.list);

// GET /api/violation-reports/:id — View report details
router.get('/:id', violationReportController.detail);

module.exports = router;
