const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Student", "Admin", "SuperAdmin", "Staff"],
    default: "Student",
  },
  department: {
    type: String,
    enum: ["CMPN", "INFT", "EXCS", "EXTC", "BIOM"],
    required: false
  },
  staffCategory: {
    type: String,
    enum: ["Electrical", "Plumbing", "Furniture", "IT Support", "Cleaning", "Other"],
    required: false
  },
  impactPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  achievements: [
    {
      title: String,
      unlockedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre("save", function (next) {
  if (this.isModified("impactPoints")) {
    this.level = Math.floor(this.impactPoints / 100) + 1;
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
