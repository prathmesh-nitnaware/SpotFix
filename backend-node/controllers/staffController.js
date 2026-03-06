const Activity = require('../models/Activity');
const User = require('../models/user');

exports.getMyWorkload = async (req, res) => {
    try {
        const staffId = req.user.id;
        const issues = await Activity.find({
            assignedTo: staffId,
            status: { $nin: ['Completed', 'Resolved', 'Rejected'] }
        })
            .populate('reporter', 'name email department')
            .sort({ priority: 1, createdAt: 1 }); // Urgent first, then oldest
        res.status(200).json(issues);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateIssueProgress = async (req, res) => {
    const { issueId, status, proofImage, staffNote, escalationFlag, escalationNote } = req.body;
    try {
        const staffId = req.user.id;

        // Verify the issue belongs to this staff member
        const issue = await Activity.findOne({ _id: issueId, assignedTo: staffId });
        if (!issue) {
            return res.status(404).json({ message: "Issue not found or not assigned to you." });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (proofImage) updateData.proofImage = proofImage;
        if (staffNote) updateData.staffNote = staffNote;

        if (escalationFlag !== undefined) {
            updateData.escalationFlag = escalationFlag;
            updateData.escalationNote = escalationNote;
            if (escalationFlag) {
                // If escalated, push it back to admin pending queue essentially
                updateData.status = 'Pending';
                updateData.assignedTo = null; // Unassign from staff
            }
        }

        const updatedIssue = await Activity.findByIdAndUpdate(
            issueId,
            updateData,
            { new: true }
        ).populate('reporter');

        // Broadcast to admins that a staff member updated a ticket
        if (req.app.get('socketio')) {
            req.app.get('socketio').emit('issue-status-updated', updatedIssue);
            // If completed, notify admin specifically if needed
            if (status === 'Completed') {
                req.app.get('socketio').emit('staff-completed-task', updatedIssue);
            }
        }

        res.status(200).json(updatedIssue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
