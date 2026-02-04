const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, AuditLog } = require('../models');
const { generateToken, auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'seller']).withMessage('Invalid role')
];

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create audit log
    await AuditLog.create({
      userId: user.id,
      action: 'login',
      entity: 'user',
      entityId: user.id,
      details: `User ${user.username} logged in`,
      ipAddress: req.ip
    });

    // Generate token
    const token = generateToken(user.id);

    logger.info(`User logged in: ${user.username}`);

    res.json({
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   POST /api/auth/register
// @desc    Register new user (admin only in production)
// @access  Private/Admin
router.post('/register', auth, registerValidation, async (req, res) => {
  try {
    // In production, only admins can register new users
    if (process.env.NODE_ENV === 'production' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create new users' });
    }

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, username, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      username,
      password,
      role: role || 'seller',
      status: 'active'
    });

    // Create audit log
    await AuditLog.create({
      userId: req.userId,
      action: 'create',
      entity: 'user',
      entityId: newUser.id,
      details: `Created new user: ${newUser.username} (${newUser.role})`,
      ipAddress: req.ip
    });

    logger.info(`New user created: ${newUser.username} by ${req.user.username}`);

    res.status(201).json({
      user: newUser.toSafeObject(),
      message: 'User created successfully'
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user.toSafeObject() });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client should delete token)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Create audit log
    await AuditLog.create({
      userId: req.userId,
      action: 'logout',
      entity: 'user',
      entityId: req.userId,
      details: `User ${req.user.username} logged out`,
      ipAddress: req.ip
    });

    logger.info(`User logged out: ${req.user.username}`);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    // Create audit log
    await AuditLog.create({
      userId: req.userId,
      action: 'update',
      entity: 'user',
      entityId: req.userId,
      details: 'Password changed',
      ipAddress: req.ip
    });

    logger.info(`Password changed for user: ${req.user.username}`);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ error: 'Server error during password change' });
  }
});

module.exports = router;
