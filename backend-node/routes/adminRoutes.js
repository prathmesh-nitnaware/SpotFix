const express = require('express');
const router = express.Router();

const { updateIssueStatus, getAllIssues, assignTask, getStaffWorkloadAdmin, autoAssignTask } = require('../controllers/adminController');
const { getAllUsers } = require('../controllers/adminUserController');
const { aiPrioritize, summarizeToday, detectPatterns } = require('../controllers/aicontroller');

const { protect, authorize } = require('../middleware/authMiddleware');


// ==============================
// ISSUE MANAGEMENT ROUTES
// ==============================

// Get all issues for the Admin Feed
// Allowed for Admin, SuperAdmin, and Student (Campus Pulse view)
router.get(
  '/all-issues',
  protect,
  authorize('Admin', 'SuperAdmin', 'Student'),
  getAllIssues
);

// Update status of a report (Processing, Completed, etc.)
router.put(
  '/update-status',
  protect,
  authorize('Admin', 'SuperAdmin'),
  updateIssueStatus
);

// Assign a task to a staff member
router.put(
  '/assign',
  protect,
  authorize('Admin', 'SuperAdmin'),
  assignTask
);

// Get staff workload overview for allocation
router.get(
  '/staff-workload',
  protect,
  authorize('Admin', 'SuperAdmin'),
  getStaffWorkloadAdmin
);

// Auto-assign issue to best tech
router.put(
  '/auto-assign',
  protect,
  authorize('Admin', 'SuperAdmin'),
  autoAssignTask
);

// ==============================
// USER MANAGEMENT ROUTES
// ==============================

// View user rankings and impact points
router.get(
  '/users',
  protect,
  authorize('Admin', 'SuperAdmin', 'Student'),
  getAllUsers
);


// ==============================
// AI ANALYTICS ROUTES
// ==============================

// AI: Prioritize issues using ML model
router.get(
  '/ai-prioritize',
  protect,
  authorize('Admin', 'SuperAdmin'),
  aiPrioritize
);

// AI: Generate today's summary of issues
router.get(
  '/summarize-today',
  protect,
  authorize('Admin', 'SuperAdmin'),
  summarizeToday
);

// AI: Detect recurring patterns in campus issues
router.get(
  '/detect-patterns',
  protect,
  authorize('Admin', 'SuperAdmin'),
  detectPatterns
);


module.exports = router;