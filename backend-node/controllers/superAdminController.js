const User = require('../models/user');
const Activity = require('../models/Activity');

// 1. Access everything: Get all User Records (Students & Admins)
exports.getAllRecords = async (req, res) => {
    try {
        // Find all users except other SuperAdmins
        const users = await User.find({ role: { $ne: 'SuperAdmin' } })
            .select('-password')
            .sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch all records: " + err.message });
    }
};

// 2. Assign Department & Role (For new joins or department changes)
exports.manageUserPosition = async (req, res) => {
    const { userId, department, role } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { department, role },
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ 
            message: "User position and department updated successfully", 
            user: updatedUser 
        });
    } catch (err) {
        res.status(500).json({ error: "Update failed: " + err.message });
    }
};

// 3. School-Wide Analytics (Principal Overview)
exports.getGlobalAnalytics = async (req, res) => {
    try {
        const stats = await Activity.aggregate([
            {
                $group: {
                    _id: null,
                    totalIssues: { $sum: 1 },
                    completedIssues: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                    },
                    highPriority: {
                        $sum: { $cond: [{ $eq: ["$priority", "High"] }, 1, 0] }
                    }
                }
            }
        ]);

        // Break down issues by department for the Principal's view
        const departmentStats = await Activity.aggregate([
            { $group: { _id: "$location.building", count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            summary: stats[0] || { totalIssues: 0, completedIssues: 0, highPriority: 0 },
            departmentBreakdown: departmentStats
        });
    } catch (err) {
        res.status(500).json({ error: "Analytics generation failed: " + err.message });
    }
};