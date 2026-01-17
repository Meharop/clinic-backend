// Middleware to check if user is logged in
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check if user has valid token
const checkAuth = async (req, res, next) => {
  try {
    // Get token from request header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Please login first' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request
    req.user = user;
    next(); // Continue to next function
  } catch (error) {
    res.status(401).json({ message: 'Invalid token, please login again' });
  }
};

// Check if user has specific role
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this' });
    }
    next();
  };
};

module.exports = { checkAuth, checkRole };