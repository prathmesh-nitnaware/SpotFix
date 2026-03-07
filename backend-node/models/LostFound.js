const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['Lost', 'Found'], required: true },
    location: { type: String }, // e.g., 'Library 2nd Floor' for Found items
    imageUrl: { type: String, required: true }, // Base64 string from frontend
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

// TTL Index: Delete documents 15 days after creation
// 15 days * 24 hours * 60 minutes * 60 seconds = 1296000 seconds
lostFoundSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1296000 });

module.exports = mongoose.model('LostFound', lostFoundSchema);
