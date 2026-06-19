const express = require('express');
const profileController = require('../../controllers/host/profileController');
const { requireAuth, authorize } = require('../../middlewares/authMiddleware');
const { uploadIdCards } = require('../../middlewares/uploadMiddleware');

const router = express.Router();

router.post(
    '/host-verification',
    requireAuth,
    authorize('LANDLORD'),
    uploadIdCards,
    profileController.submitHostVerification,
);

module.exports = router;
