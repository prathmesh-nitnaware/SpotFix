const Activity = require('../models/Activity');
const User = require('../models/User');

// Update Issue Status (The Kanban Move)
exports.updateIssueStatus = async (req, res) => {
  const { issueId, newStatus } = req.body;

  try {
    const issue = await Activity.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.status = newStatus;
    await issue.save();

    // GAMIFICATION TRIGGER: Award points if status is 'Completed'
    if (newStatus === 'Completed') {
      const user = await User.findById(issue.reporter);
      
      // Points based on priority: High = 50, Med = 20, Low = 10
      const points = issue.priority === 'High' ? 50 : (issue.priority === 'Medium' ? 20 : 10);
      
      user.xp += points;
      user.impactPoints += points;
      
      // Simple Level Up logic
      if (user.xp > 500) user.level = 'Silver';
      if (user.xp > 1500) user.level = 'Gold';

      await user.save();

      // Notify the student via Socket.io
      req.app.get('socketio').emit('notification', {
        userId: user._id,
        message: `Congrats! Your report in ${issue.location.room} was resolved. You earned ${points} XP!`
      });
    }

    res.status(200).json({ message: `Status updated to ${newStatus}`, issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all issues for Admin Dashboard (with sorting)
exports.getAllIssues = async (req, res) => {
  try {
    const issues = await Activity.find().populate('reporter', 'name email').sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};