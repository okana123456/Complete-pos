const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Token is not valid, user not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Middleware to check if user is admin or accessing own data
const adminOrSelf = (req, res, next) => {
  const targetUserId = parseInt(req.params.id || req.params.userId);
  
  if (req.userRole === 'admin' || req.userId === targetUserId) {
    return next();
  }
  
  res.status(403).json({ error: 'Access denied' });
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = {
  auth,
  adminOnly,
  adminOrSelf,
  generateToken
};
