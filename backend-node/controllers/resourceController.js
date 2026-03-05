const Activity = require('../models/Activity'); // Reusing Activity model with 'Resource' type
const User = require('../models/user');

/**
 * Handles "Need" reporting instead of fault reporting.
 */
exports.requestResource = async (req, res) => {
  const { resourceType, quantity, location, notes } = req.body;
  
  try {
    const newRequest = new Activity({
      title: `Resource Needed: ${resourceType}`,
      description: `Request for ${quantity} units. Note: ${notes}`,
      category: 'Resource', // Specific category for filtering
      location,
      reporter: req.user.id, // Securely pulled from Auth Middleware
      status: 'Pending',
      priority: 'Low' // Resource requests default to low unless escalated
    });

    await newRequest.save();

    // Notify Admin of new logistic request
    req.app.get('socketio').emit('new-resource-request', newRequest);

    res.status(201).json({ success: true, message: "Request logged for The Architects." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Fulfilment logic for resources
 */
exports.fulfillResource = async (req, res) => {
  const { id } = req.params;
  try {
    const request = await Activity.findByIdAndUpdate(
      id, 
      { status: 'Completed', resolvedAt: Date.now() }, 
      { new: true }
    );

    // Reward points for successful logistics
    await User.findByIdAndUpdate(request.reporter, {
      $inc: { impactPoints: 10 } 
    });

    res.status(200).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};