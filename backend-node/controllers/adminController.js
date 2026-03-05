const Activity = require('../models/Activity');
const User = require('../models/user');
const { sendResolutionEmail } = require('../services/emailService');

exports.getAllIssues = async (req, res) => {
    try {
        const issues = await Activity.find().populate('reporter', 'name email').sort({ createdAt: -1 });
        res.status(200).json(issues);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateIssueStatus = async (req, res) => {
    const { issueId, status } = req.body;
    try {
        const updateData = { status };
        if (status === 'Completed') {
            updateData.resolvedAt = Date.now();
        }

        // Update the issue
        const issue = await Activity.findByIdAndUpdate(
            issueId,
            updateData,
            { new: true }
        ).populate('reporter');

        // Handle gamification and notification if completed
        if (status === 'Completed' && issue.reporter) {
            const pointsToAward = issue.priority === 'High' ? 50 : 20;

            // Update user points
            await User.findByIdAndUpdate(issue.reporter._id, {
                $inc: { impactPoints: pointsToAward }
            });

            // Try to send email
            try {
                if (issue.reporter.email) {
                    await sendResolutionEmail(issue.reporter.email, {
                        title: issue.title,
                        receiptId: issue._id,
                        points: pointsToAward
                    });
                }
            } catch (emailErr) {
                console.error("Email sending failed during status update:", emailErr);
            }

            // Notify user
            if (req.app.get('socketio')) {
                req.app.get('socketio').emit(`update-${issue.reporter._id}`, {
                    message: `Issue Resolved! You earned ${pointsToAward} points.`,
                    type: 'impact'
                });
            }
        }

        // Broadcast status update for admin board
        if (req.app.get('socketio')) {
            req.app.get('socketio').emit('issue-status-updated', issue);
        }

        res.status(200).json(issue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
