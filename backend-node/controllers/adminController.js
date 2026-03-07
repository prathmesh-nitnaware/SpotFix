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
        if (status === 'Resolved') {
            updateData.resolvedAt = Date.now();
        }

        // Update the issue
        const issue = await Activity.findByIdAndUpdate(
            issueId,
            updateData,
            { new: true }
        ).populate('reporter');

        // Handle gamification and notification if formally resolved
        if (status === 'Resolved' && issue.reporter) {
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

exports.assignTask = async (req, res) => {
    const { issueId, staffId } = req.body;
    try {
        const issue = await Activity.findByIdAndUpdate(
            issueId,
            { assignedTo: staffId, status: 'In Progress', escalationFlag: false, escalationNote: null },
            { new: true }
        ).populate('reporter');

        if (req.app.get('socketio')) {
            req.app.get('socketio').emit('issue-status-updated', issue);
        }

        res.status(200).json(issue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStaffWorkloadAdmin = async (req, res) => {
    try {
        const staffUsers = await User.find({ role: 'Staff' }).select('-password');
        const activities = await Activity.find({ status: { $in: ['In Progress', 'Processing', 'Working'] } });

        const staffPayload = staffUsers.map(staff => {
            const activeTickets = activities.filter(a => String(a.assignedTo) === String(staff._id)).length;
            return {
                _id: staff._id,
                name: staff.name,
                department: staff.department || 'General',
                activeTickets
            };
        });

        res.status(200).json(staffPayload);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.autoAssignTask = async (req, res) => {
    const { issueId } = req.body;
    try {
        const issue = await Activity.findById(issueId);
        if (!issue) return res.status(404).json({ error: "Issue not found" });

        let eligibleStaff = await User.find({ role: 'Staff' });
        if (eligibleStaff.length === 0) return res.status(404).json({ error: "No staff available in system" });

        // Filter staff based on matching category if possible
        const specialistStaff = eligibleStaff.filter(s => s.staffCategory === issue.category);
        if (specialistStaff.length > 0) {
            eligibleStaff = specialistStaff;
        }

        const activities = await Activity.find({ status: { $in: ['In Progress', 'Processing', 'Working'] } });

        // Calculate workload per eligible staff member
        const workloads = eligibleStaff.map(staff => {
            const load = activities.filter(a => String(a.assignedTo) === String(staff._id)).length;
            return { _id: staff._id, load };
        });

        // Find the staff with the lowest load
        workloads.sort((a, b) => a.load - b.load);
        const bestTech = workloads[0]._id;

        const updatedIssue = await Activity.findByIdAndUpdate(
            issueId,
            { assignedTo: bestTech, status: 'In Progress', escalationFlag: false, escalationNote: null },
            { new: true }
        ).populate('reporter');

        if (req.app.get('socketio')) {
            req.app.get('socketio').emit('issue-status-updated', updatedIssue);
        }

        res.status(200).json(updatedIssue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
