const Activity = require('../models/Activity');
const User = require('../models/user');

/**
 * Aggregates data for the Basic Analytics Dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total Resolution Count
    const totalResolved = await Activity.countDocuments({ status: 'Completed' });

    // 2. Average Resolution Time Logic
    const resolutionData = await Activity.aggregate([
      { $match: { status: 'Completed', resolvedAt: { $exists: true } } },
      {
        $group: {
          _id: null,
          avgTime: { $avg: { $subtract: ["$resolvedAt", "$createdAt"] } }
        }
      }
    ]);

    // Convert milliseconds to hours
    const avgHours = resolutionData.length > 0 
      ? (resolutionData[0].avgTime / (1000 * 60 * 60)).toFixed(1) 
      : 0;

    // 3. Issue Trends by Category
    const categoryTrends = await Activity.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Building-wise Hotspots
    const buildingHotspots = await Activity.aggregate([
      { $group: { _id: "$location.building", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      totalResolved,
      avgResolutionTime: `${avgHours}h`,
      categoryTrends,
      buildingHotspots,
      growthRate: "+12%" // Example static calculation for growth
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};