const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'client' } = req.body;
    
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
      role: role === 'admin' ? 'client' : role // Prevent creating admin through API
    });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();
    
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
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    logger.error(`Registration error: ${err.message}`);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Login a user
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
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
    
    // Generate token
    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Verify token and get user
 * @route GET /api/auth/verify
 */
exports.verify = async (req, res) => {
  try {
    // User is already loaded in req by auth middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ valid: false });
    }
    
    // Update last active
    user.lastActive = Date.now();
    await user.save();
    
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
    logger.error(`Token verification error: ${err.message}`);
    res.status(500).json({ valid: false, message: 'Server error during verification' });
  }
};