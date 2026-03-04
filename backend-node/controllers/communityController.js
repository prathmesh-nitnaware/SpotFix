const Activity = require('../models/Activity'); // Shared model for campus actions

/**
 * Lists a new item in the community feed.
 */
exports.postItem = async (req, res) => {
  const { title, description, location, type, imageUrl } = req.body;
  
  try {
    const newItem = new Activity({
      title,
      description,
      category: 'Community', // Used to filter Lost & Found from Repairs
      location,
      imageUrl, // Visual evidence for the community
      type, // 'Lost' or 'Found'
      reporter: req.user.id,
      status: 'Pending'
    });

    await newItem.save();

    // Live Notification for everyone on the Campus Pulse
    req.app.get('socketio').emit('new-community-post', {
      message: `New ${type} item: ${title} at ${location.building}`,
      item: newItem
    });

    res.status(201).json({ success: true, item: newItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieves all active community items.
 */
exports.getCommunityFeed = async (req, res) => {
  try {
    // Fetch items that aren't resolved yet
    const items = await Activity.find({ 
      category: 'Community', 
      status: { $ne: 'Completed' } 
    }).sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};