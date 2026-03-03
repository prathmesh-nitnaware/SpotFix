const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  location: {
    building: String,
    floor: String,
    room: String
  },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'Processing', 'Working', 'Completed'], default: 'Pending' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);