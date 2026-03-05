const express = require('express');
const router = express.Router();
const { updateIssueStatus, getAllIssues } = require('../controllers/adminController');
const { getAllUsers } = require('../controllers/adminUserController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all issues for the Admin Feed
// Allowed for both Admin (Department level) and SuperAdmin (Principal level)
router.get(
  '/all-issues', 
  protect, 
  authorize('Admin', 'SuperAdmin'), 
  getAllIssues
);

// Update status of a report (Processing, Completed, etc.)
router.put(
  '/update-status', 
  protect, 
  authorize('Admin', 'SuperAdmin'), 
  updateIssueStatus
);

// View user rankings and impact points
router.get(
  '/users', 
  protect, 
  authorize('Admin', 'SuperAdmin'), 
  getAllUsers
);

module.exports = router;