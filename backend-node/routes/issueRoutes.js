const express = require('express');
const router = express.Router();
const { reportIssue, upvoteIssue, getUserIssues } = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Post creation limiter: 5 posts per hour per IP
const reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { error: 'You have reached the limit of 5 reports per hour. Please try again later.' }
});

// POST: /api/issues/report
router.post('/report', protect, reportLimiter, reportIssue);

// POST: /api/issues/upvote
router.post('/upvote', upvoteIssue);

// GET: /api/issues/user/:userId
router.get('/user/:userId', getUserIssues);

module.exports = router;