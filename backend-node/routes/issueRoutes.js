const express = require('express');
const router = express.Router();
const { reportIssue, upvoteIssue, getUserIssues } = require('../controllers/issueController');

// POST: /api/issues/report
router.post('/report', reportIssue);

// POST: /api/issues/upvote
router.post('/upvote', upvoteIssue);

// GET: /api/issues/user/:userId
router.get('/user/:userId', getUserIssues);

module.exports = router;