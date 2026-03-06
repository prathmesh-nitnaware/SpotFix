const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Principal Overview & User Records
// protect: verifies JWT | authorize: checks for 'SuperAdmin' role
router.get(
  '/all-records',
  protect,
  authorize('SuperAdmin'),
  superAdminController.getAllRecords
);

// Manage New Joins / Department Changes
router.put(
  '/assign-position',
  protect,
  authorize('SuperAdmin'),
  superAdminController.manageUserPosition
);

// Global School Analytics
router.get(
  '/global-stats',
  protect,
  authorize('SuperAdmin'),
  superAdminController.getGlobalAnalytics
);

// Advanced Charting Analytics Data
router.get(
  '/advanced-analytics',
  protect,
  authorize('SuperAdmin'),
  superAdminController.getAdvancedAnalytics
);

module.exports = router;