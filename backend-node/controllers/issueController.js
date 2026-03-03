const Activity = require('../models/Activity');
const axios = require('axios');

// 1. Report Issue with AI Triage & Duplicate Check
exports.reportIssue = async (req, res) => {
  const { title, description, category, location, reporterId } = req.body;
  try {
    const existing = await Activity.findOne({
      category,
      'location.building': location.building,
      'location.floor': location.floor,
      'location.room': location.room,
      status: { $ne: 'Completed' }
    });

    if (existing) {
      return res.status(200).json({ duplicate: true, issueId: existing._id });
    }

    // Call Python AI for Priority
    const aiRes = await axios.post('http://localhost:8000/analyze-priority', { text: description });
    
    const newIssue = new Activity({
      title, description, category, location,
      reporter: reporterId,
      priority: aiRes.data.priority
    });

    await newIssue.save();
    req.app.get('socketio').emit('new-issue', newIssue);
    res.status(201).json({ duplicate: false, issue: newIssue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Upvote Logic
exports.upvoteIssue = async (req, res) => {
  const { issueId, userId } = req.body;
  try {
    const issue = await Activity.findById(issueId);
    if (!issue.upvotes.includes(userId)) {
      issue.upvotes.push(userId);
      // Auto-escalate if upvotes > 5
      if (issue.upvotes.length > 5) issue.priority = 'High';
      await issue.save();
    }
    res.status(200).json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};