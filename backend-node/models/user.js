const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Admin', 'SuperAdmin'], default: 'Student' },
  xp: { type: Number, default: 0 },
  level: { type: String, default: 'Bronze' },
  badges: [String]
});

module.exports = mongoose.model('User', UserSchema);