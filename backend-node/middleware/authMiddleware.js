const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Extracts the token from the 'Authorization' header and verifies it.
 */
const protect = (req, res, next) => {
  let token;

  // Standard practice: check for 'Bearer <token>' in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach decoded user info (id, role) to request object for downstream use
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * Role-Based Authorization Middleware
 * Higher-order function that checks if the user's role is in the allowed list.
 * @param {...string} roles - The roles permitted to access the route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role (attached by 'protect') matches any allowed roles
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { protect, authorize };