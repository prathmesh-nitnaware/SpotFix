const User = require('../models/User');

/**
 * Fetches all users with their current Impact Ranks.
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password')
      .sort({ impactPoints: -1 }); // Sorted for Leaderboard oversight
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Updates a user's role (SuperAdmin only).
 */
exports.updateUserRole = async (req, res) => {
  const { userId, newRole } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    ).select('-password');
    
    res.status(200).json({ message: "Role updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Manual Impact Point adjustment for special rewards.
 */
exports.adjustImpactPoints = async (req, res) => {
  const { userId, pointsChange, reason } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { impactPoints: pointsChange } },
      { new: true }
    ).select('-password');

    // Notify user of manual point adjustment
    req.app.get('socketio').emit(`notification-${userId}`, {
      message: `Admin adjusted your points: ${pointsChange > 0 ? '+' : ''}${pointsChange}. Reason: ${reason}`,
      type: 'impact'
    });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};