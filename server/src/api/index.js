// server/src/api/index.js
/**
 * API Routes Index
 * Centralizes all API routes for the CodeForegX Financial Technology System
 */
const promptsRoutes = require('../api/prompts');
const supportRoutes = require('../api/support');
const blueprintRoutes = require('../api/blueprint');
const componentsRoutes = require('../api/components');
const chatRoutes = require('./chat'); // Added chat routes
const authRoutes = require('./auth');
const projectsRoutes = require('./projects');
const rolesRoutes = require('./roles'); // Added roles routes
const usersRoutes = require('./users'); // Added users routes
/**
 * Register API routes with Express app
 * @param {Object} app - Express app
 */
function registerRoutes(app) {
  // Register all API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/roles', rolesRoutes);
  app.use('/api/users', usersRoutes); // Register users routes
  app.use('/api/prompts', promptsRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/projects/:projectId/blueprint', blueprintRoutes);
  app.use('/api/projects/:projectId/components', componentsRoutes);
  app.use('/api/chat', chatRoutes); // Register chat routes
  app.use('/api/projects', projectsRoutes);
  // Fallback 404 for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
  });
}

module.exports = {
  registerRoutes,
  routes: {
    promptsRoutes,
    supportRoutes,
    blueprintRoutes,
    componentsRoutes,
    chatRoutes,// Export chat routes
    authRoutes,
    rolesRoutes, // Export roles routes
    usersRoutes // Export users routes
  }
};


