const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }, // Input for ML Priority Classifier
  category: {
    type: String,
    required: true
  }, // For Issue Reporting Module

  // Strict location hierarchy for accuracy
  location: {
    building: { type: String, required: true },
    floor: { type: String, default: 'General' },
    room: { type: String, default: 'General' }
  },

  // Evidence-based reporting
  imageUrl: {
    type: String,
    default: null
  },

  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }, // Linked to User Authentication

  // Real-Time Status & Priority
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Working', 'Completed', 'Resolved'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  }, // Set by ML Priority Classifier

  // Community & Gamification
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  impactPointsAwarded: {
    type: Number,
    default: 0
  }, // For Leaderboard tracking

  // Staff assignment and proof
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  proofImage: {
    type: String,
    default: null
  },
  staffNote: {
    type: String,
    default: null
  },
  escalationFlag: {
    type: Boolean,
    default: false
  },
  escalationNote: {
    type: String,
    default: null
  },

  // Analytics Fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  } // For calculating Resolution Time
});

// Indexing for faster Analytics queries
ActivitySchema.index({ status: 1, priority: 1 });
ActivitySchema.index({ 'location.building': 1 });

module.exports = mongoose.model('Activity', ActivitySchema);