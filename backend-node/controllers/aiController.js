const axios = require("axios");
const Activity = require("../models/Activity");

const PYTHON_AI_URL = "http://localhost:8000";

/**
 * Send all issues to Python AI for prioritization
 */
exports.aiPrioritize = async (req, res) => {
  try {
    const issues = await Activity.find({ status: { $ne: "Completed" } });

    const response = await axios.post(`${PYTHON_AI_URL}/ai-prioritize`, {
      issues
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error("AI prioritize error:", err.message);
    res.status(500).json({ error: "AI prioritization failed" });
  }
};


/**
 * Generate daily issue summary
 */
exports.summarizeToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const issues = await Activity.find({
      createdAt: { $gte: today }
    });

    const response = await axios.post(`${PYTHON_AI_URL}/summarize-today`, {
      issues
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error("Summary error:", err.message);
    res.status(500).json({ error: "Summary generation failed" });
  }
};


/**
 * Detect recurring issue patterns
 */
exports.detectPatterns = async (req, res) => {
  try {
    const issues = await Activity.find({});

    const response = await axios.post(`${PYTHON_AI_URL}/detect-patterns`, {
      issues
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error("Pattern detection error:", err.message);
    res.status(500).json({ error: "Pattern detection failed" });
  }
};