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
    const { userId, department, role, staffCategory } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { department, role, staffCategory },
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

// 4. Advanced Analytics Data Pipeline
exports.getAdvancedAnalytics = async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Fetch all activities in the last 6 months for deep analysis
        const activities = await Activity.find({ createdAt: { $gte: sixMonthsAgo } }).sort({ createdAt: 1 });

        // Chart 1 & 2: Monthly Trends & Categories
        const monthlyDataMap = {};

        // Chart 3: Resolution Time Trend
        const resolutionTimeMap = {};

        // Chart 4: SLA Compliance (Assume 48 hours is target)
        const slaDataMap = {};

        // Chart 5: Heatmap Calendar (Last 365 days)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const heatMapActivities = await Activity.find({ createdAt: { $gte: oneYearAgo } });
        const heatMapDataMap = {};

        // Process Heatmap Data (Yearly)
        heatMapActivities.forEach(act => {
            const dateStr = act.createdAt.toISOString().split('T')[0];
            heatMapDataMap[dateStr] = (heatMapDataMap[dateStr] || 0) + 1;
        });

        const heatmapData = Object.keys(heatMapDataMap).map(date => ({
            date,
            count: heatMapDataMap[date]
        }));

        // Process 6-Month Chart Data
        activities.forEach(act => {
            const monthObj = new Date(act.createdAt);
            const month = monthObj.toLocaleString('default', { month: 'short', year: 'numeric' });
            const dept = act.location.building || 'Unknown';
            const cat = act.category || 'Other';

            // --- 1. Monthly Department Trend ---
            if (!monthlyDataMap[month]) monthlyDataMap[month] = { name: month, total: 0 };
            monthlyDataMap[month][dept] = (monthlyDataMap[month][dept] || 0) + 1;
            monthlyDataMap[month].total += 1;

            // --- 2. Category Breakdown ---
            if (!monthlyDataMap[month][`${cat}_cat`]) monthlyDataMap[month][`${cat}_cat`] = 0;
            monthlyDataMap[month][`${cat}_cat`] += 1;

            // --- 3 & 4. Resolution Time & SLA ---
            if (!slaDataMap[dept]) slaDataMap[dept] = { total: 0, metSLA: 0 };
            slaDataMap[dept].total += 1;

            if (act.status === 'Resolved' && act.resolvedAt) {
                const resolutionHours = (new Date(act.resolvedAt) - new Date(act.createdAt)) / (1000 * 60 * 60);

                // Track avg time per month
                if (!resolutionTimeMap[month]) resolutionTimeMap[month] = { totalHours: 0, count: 0 };
                resolutionTimeMap[month].totalHours += resolutionHours;
                resolutionTimeMap[month].count += 1;

                // Check SLA (48 hrs)
                if (resolutionHours <= 48) {
                    slaDataMap[dept].metSLA += 1;
                }
            }
        });

        const monthlyTrends = Object.values(monthlyDataMap);

        const resolutionTrend = Object.keys(resolutionTimeMap).map(month => ({
            name: month,
            avgHours: Math.round(resolutionTimeMap[month].totalHours / resolutionTimeMap[month].count)
        }));

        const slaCompliance = Object.keys(slaDataMap).map(dept => ({
            department: dept,
            compliancePct: Math.round((slaDataMap[dept].metSLA / slaDataMap[dept].total) * 100) || 0
        }));

        res.status(200).json({
            monthlyTrends,
            resolutionTrend,
            slaCompliance,
            heatmapData
        });

    } catch (err) {
        res.status(500).json({ error: "Advanced analytics generation failed: " + err.message });
    }
};