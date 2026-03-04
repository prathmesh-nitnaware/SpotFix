const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Used for Automated Emailing
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['Student', 'Admin', 'SuperAdmin'], 
    default: 'Student' 
  }, // Role Based Access
  department: { 
    type: String, 
    required: true 
  }, // For Basic Analytics Dashboard
  
  // GAMIFICATION FIELDS
  impactPoints: { 
    type: Number, 
    default: 0 
  },
  level: { 
    type: Number, 
    default: 1 
  },
  achievements: [{
    title: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Logic to calculate level based on Impact Points
UserSchema.pre('save', function(next) {
  if (this.isModified('impactPoints')) {
    this.level = Math.floor(this.impactPoints / 100) + 1;
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);