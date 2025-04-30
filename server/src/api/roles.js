const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');
const User = require('../models/User');
const logger = require('../utils/logger');

// @route    GET /api/roles
// @desc     Get all roles
// @access   Admin only
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    let roles = await User.distinct('role');
    // Always include default roles
    const defaultRoles = ['admin', 'developer', 'client'];
    roles = Array.from(new Set([...roles, ...defaultRoles]));
    res.json(roles);
  } catch (err) {
    logger.error(`Error fetching roles: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching roles' });
  }
});

// @route    GET /api/roles/users
// @desc     Get users by role
// @access   Admin only
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.query;
    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (err) {
    logger.error(`Error fetching users by role: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route    PUT /api/roles/:userId
// @desc     Update user role
// @access   Admin only
router.put('/:userId', auth, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['admin', 'developer', 'client'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    logger.error(`Error updating user role: ${err.message}`);
    res.status(500).json({ message: 'Server error updating role' });
  }
});

module.exports = router; 