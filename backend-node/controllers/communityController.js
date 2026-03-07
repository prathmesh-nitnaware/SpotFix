const LostFound = require('../models/LostFound');

/**
 * Lists a new item in the community feed.
 */
exports.postItem = async (req, res) => {
  const { title, type, location, imageUrl } = req.body;

  try {
    const newItem = new LostFound({
      title,
      type, // 'Lost' or 'Found'
      location,
      imageUrl,
      reporter: req.user.id
    });

    await newItem.save();
    await newItem.populate('reporter', 'name department');

    // Live Notification for everyone on the Campus Pulse
    req.app.get('socketio').emit('new-community-post', {
      message: `New ${type} item listed: ${title}`,
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
    const items = await LostFound.find()
      .populate('reporter', 'name department')
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};