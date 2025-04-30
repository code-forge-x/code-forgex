const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const User = require('../models/User');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// @route    POST /api/auth/register
// @desc     Register a user
// @access   Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'client' } = req.body;
    
    logger.debug(`Registration attempt for email: ${email}`);
    
    // Validate input
    if (!name || !email || !password) {
      logger.warn('Registration attempt with missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      logger.warn(`Registration attempt for existing email: ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      password,
      role: role.toLowerCase() === 'admin' ? 'client' : role.toLowerCase()
    });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();
    logger.info(`New user registered: ${email}`);
    
    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    // Generate token
    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration },
      (err, token) => {
        if (err) {
          logger.error(`Token generation error for new user ${email}: ${err.message}`);
          return res.status(500).json({ message: 'Error generating token' });
        }
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    logger.error(`Registration error: ${err.message}\nStack: ${err.stack}`);
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

// @route    POST /api/auth/login
// @desc     Login a user & get token
// @access   Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Debug log
    logger.debug(`Login attempt for email: ${email}`);
    
    // Validate input
    if (!email || !password) {
      logger.warn('Login attempt with missing email or password');
      return res.status(400).json({ message: 'Missing email or password' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      logger.warn(`Login attempt for non-existent user: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      logger.warn(`Invalid password for user: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Update last active
    user.lastActive = Date.now();
    await user.save();
    
    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    // Debug log JWT secret
    logger.debug(`Using JWT secret: ${config.jwtSecret.substring(0, 4)}...`);
    
    // Generate token
    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration },
      (err, token) => {
        if (err) {
          logger.error(`Token generation error for user ${email}: ${err.message}`);
          return res.status(500).json({ message: 'Error generating token' });
        }
        logger.info(`Successful login for user: ${email}`);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    logger.error(`Login error: ${err.message}\nStack: ${err.stack}`);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// @route    GET /api/auth/verify
// @desc     Verify token & get user
// @access   Private
router.get('/verify', auth, async (req, res) => {
  try {
    logger.debug(`Token verification attempt for user ID: ${req.user.id}`);
    
    // User is already loaded in req by auth middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      logger.warn(`Token verification failed - user not found: ${req.user.id}`);
      return res.status(401).json({ valid: false, message: 'User not found' });
    }
    
    // Update last active
    user.lastActive = Date.now();
    await user.save();
    
    logger.info(`Successful token verification for user: ${user.email}`);
    res.json({ 
      valid: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    logger.error(`Token verification error: ${err.message}\nStack: ${err.stack}`);
    res.status(500).json({ valid: false, message: 'Server error during verification', error: err.message });
  }
});

module.exports = router;