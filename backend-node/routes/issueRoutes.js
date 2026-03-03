const express = require('express');
const router = express.Router();
const { reportIssue, upvoteIssue } = require('../controllers/issueController');

// POST: /api/issues/report
router.post('/report', reportIssue);

// POST: /api/issues/upvote
router.post('/upvote', upvoteIssue);

module.exports = router;