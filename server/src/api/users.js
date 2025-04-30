const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');
const User = require('../models/User');
const logger = require('../utils/logger');

// @route    GET /api/users
// @desc     Get all users
// @access   Admin only
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    logger.error(`Error fetching users: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route    GET /api/users/:id
// @desc     Get user by ID
// @access   Admin only
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    logger.error(`Error fetching user: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// @route    PUT /api/users/:id
// @desc     Update user
// @access   Admin only
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    logger.error(`Error updating user: ${err.message}`);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// @route    DELETE /api/users/:id
// @desc     Delete user
// @access   Admin only
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    logger.error(`Error deleting user: ${err.message}`);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// @route    PUT /api/users/:id/status
// @desc     Update user status
// @access   Admin only
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    logger.error(`Error updating user status: ${err.message}`);
    res.status(500).json({ message: 'Server error updating user status' });
  }
});

module.exports = router; 