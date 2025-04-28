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
/**
 * Register API routes with Express app
 * @param {Object} app - Express app
 */
function registerRoutes(app) {
  // Register all API routes
  app.use('/api/prompts', promptsRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/projects/:projectId/blueprint', blueprintRoutes);
  app.use('/api/projects/:projectId/components', componentsRoutes);
  app.use('/api/chat', chatRoutes); // Register chat routes
  app.use('/api/auth', authRoutes); 
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
    authRoutes
  }
};


