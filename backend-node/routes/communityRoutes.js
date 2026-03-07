const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Post creation limiter: 5 posts per hour per IP
const postLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { error: 'You have reached the limit of 5 posts per hour. Please try again later.' }
});

router.get('/lost-found', protect, communityController.getCommunityFeed);
router.post('/lost-found', protect, postLimiter, communityController.postItem);

module.exports = router;
