const express = require('express');
const router = express.Router();
const { getMyWorkload, updateIssueProgress } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all issues assigned to the logged-in staff member
router.get(
    '/my-workload',
    protect,
    authorize('Staff'),
    getMyWorkload
);

// Update status, add note, or upload proof for an assigned issue
router.put(
    '/update-progress',
    protect,
    authorize('Staff'),
    updateIssueProgress
);

module.exports = router;
