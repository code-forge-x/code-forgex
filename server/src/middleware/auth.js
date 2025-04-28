// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 */
const auth = {
  /**
   * Authenticate a user based on JWT token
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next function
   */
  authenticate(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'developmentsecret');
      
      // Add user from payload
      req.user = decoded.user;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  },
  
  /**
   * Check if user is an admin
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next function
   */
  adminOnly(req, res, next) {
    auth.authenticate(req, res, () => {
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      next();
    });
  },
  
  /**
   * Check if user has access to a project
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next function
   */
  projectAccess(req, res, next) {
    auth.authenticate(req, res, async () => {
      try {
        const projectId = req.params.projectId;
        
        // Admin has access to all projects
        if (req.user.isAdmin) {
          return next();
        }
        
        // For MVP, we'll just check if projectId is in user's projects array
        if (!req.user.projects || !req.user.projects.includes(projectId)) {
          return res.status(403).json({ message: 'Project access denied' });
        }
        
        next();
      } catch (err) {
        console.error('Project access check error:', err);
        res.status(500).json({ message: 'Server error' });
      }
    });
  }
};

module.exports = auth;