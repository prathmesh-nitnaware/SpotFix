const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. SIGNUP LOGIC
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Email validation to ensure VIT credentials
    if (!email.endsWith('@vit.edu.in')) {
      return res.status(400).json({ message: "Please use your official VIT email" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Student', // Role-Based Access
      department
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Include Gamification fields for the frontend Passport
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role, 
        impactPoints: user.impactPoints,
        level: user.level 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. LOGIN LOGIC
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Return full profile to populate the User Dashboard
    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role,
        department: user.department,
        impactPoints: user.impactPoints,
        level: user.level
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};