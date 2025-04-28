const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    // const token = req.header('x-auth-token');
    // console.log('🔐 Token received:', token);
    // // Check if no token
    // if (!token) {
    //   return res.status(401).json({ message: 'No token, authorization denied' });
    // }

    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization deniedsss' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user
    const user = await User.findById(decoded.userId);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};