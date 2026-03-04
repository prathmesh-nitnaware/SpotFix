const express = require('express');
const router = express.Router();
const { updateIssueStatus, getAllIssues } = require('../controllers/adminController');
const { getAllUsers } = require('../controllers/adminUserController');

// In a real app, you'd add Admin Middleware here to protect these routes
router.get('/all-issues', getAllIssues);
router.put('/update-status', updateIssueStatus);
router.get('/users', getAllUsers);

module.exports = router;