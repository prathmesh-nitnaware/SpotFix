// services/gamificationService.js
const User = require('../models/user');

const awardPoints = async (userId, actionType, priority) => {
  let pointsToAdd = 0;

  // Logic: Higher priority issues or specific actions earn more XP
  if (actionType === 'Issue') {
    pointsToAdd = priority === 'High' ? 50 : 20;
  } else if (actionType === 'LostFound') {
    pointsToAdd = 40; // High reward for community honesty
  } else if (actionType === 'Upvote') {
    pointsToAdd = 5;
  }

  const user = await User.findById(userId);
  user.xp += pointsToAdd;
  user.impactPoints += pointsToAdd;

  // Level Up Logic
  if (user.xp > 500) user.level = 'Silver';
  if (user.xp > 1500) user.level = 'Gold';
  if (user.xp > 3000) user.level = 'Platinum';

  await user.save();
  return user;
};