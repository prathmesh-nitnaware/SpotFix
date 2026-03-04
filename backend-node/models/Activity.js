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
    floor: { type: String, required: true },
    room: { type: String, required: true }
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
    enum: ['Pending', 'Processing', 'Working', 'Completed'], 
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