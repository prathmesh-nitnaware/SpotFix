const Activity = require('../models/Activity');
const User = require('../models/user'); // For updating Impact Points
const axios = require('axios');
const { sendResolutionEmail } = require('../services/emailService'); // Automated Emailing

// 1. Report Issue with AI Triage & Duplicate Check
exports.reportIssue = async (req, res) => {
  const { title, description, category, location, reporterId, imageUrl } = req.body;
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

    console.log("does work1")

    // Call Python AI for Priority (Multi-modal ML Classifier)
    const aiRes = await axios.post('http://127.0.0.1:8000/analyze-priority', {
      text: description,
      image_url: imageUrl // Inclusion of image evidence for AI
    });
    console.log("Does work2");


    const newIssue = new Activity({
      title, description, category, location, imageUrl,
      reporter: reporterId,
      priority: aiRes.data.priority || 'Low'
    });

    await newIssue.save();

    // Real-Time Update for Admin Dashboard
    req.app.get('socketio').emit('new-issue', newIssue);

    res.status(201).json({ duplicate: false, issue: newIssue });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};

// 2. Resolve Issue (Triggers Gamification & Emailing)
exports.resolveIssue = async (req, res) => {
  const { issueId } = req.params;
  try {
    const issue = await Activity.findByIdAndUpdate(
      issueId,
      { status: 'Completed', resolvedAt: Date.now() },
      { new: true }
    ).populate('reporter');

    // GAMIFICATION: Award Impact Points to Reporter
    const pointsToAward = issue.priority === 'High' ? 50 : 20;
    await User.findByIdAndUpdate(issue.reporter._id, {
      $inc: { impactPoints: pointsToAward }
    });

    // AUTOMATED EMAILING: Send Digital Receipt
    await sendResolutionEmail(issue.reporter.email, {
      title: issue.title,
      receiptId: issue._id,
      points: pointsToAward
    });

    // Real-Time Notification for User Dashboard
    req.app.get('socketio').emit(`update-${issue.reporter._id}`, {
      message: `Issue Resolved! You earned ${pointsToAward} points.`,
      type: 'impact'
    });

    res.status(200).json({ success: true, issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Upvote Logic (Community Escalation)
exports.upvoteIssue = async (req, res) => {
  const { issueId, userId } = req.body;
  try {
    const issue = await Activity.findById(issueId);
    if (!issue.upvotes.includes(userId)) {
      issue.upvotes.push(userId);
      // Auto-escalate to "Highest Priority" if crowd-verified
      if (issue.upvotes.length > 5) issue.priority = 'High';
      await issue.save();
    }
    res.status(200).json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Get User's Issues (For Dashboard)
exports.getUserIssues = async (req, res) => {
  const { userId } = req.params;
  try {
    const issues = await Activity.find({ reporter: userId }).sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};