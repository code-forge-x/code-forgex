// server/src/api/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      password,
      isAdmin: false
    });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Save user
    await user.save();
    
    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
        projects: user.projects || []
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'developmentsecret',
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            projects: user.projects || []
          }
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login a user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  console.log('🚀 Login route HIT');
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
        projects: user.projects || []
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'developmentsecret',
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            projects: user.projects || []
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify token & get user
 * @access  Private
 */
router.get('/verify', auth.authenticate, async (req, res) => {
  try {
    // Find user by ID and exclude password
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        projects: user.projects || []
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/auth/user
 * @desc    Get current user
 * @access  Private
 */
router.get('/user', auth.authenticate, async (req, res) => {
  try {
    // Find user by ID and exclude password
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;