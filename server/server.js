const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const config = require('./config/default');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/error');
const routes = require('./routes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Define port
const PORT = config.port;

// Initialize TimescaleDB and Milvus
const { initializeTimescaleDB } = require('./config/timescale');
const { initializeMilvus } = require('./config/milvus');

// Mount all routes with /api prefix
app.use('/api', routes);

// Error handling middleware (should be after routes)
app.use(errorHandler);

// Initialize databases
const initializeDatabases = async () => {
  try {
    await initializeTimescaleDB();
    await initializeMilvus();
    logger.info('All databases initialized successfully');
  } catch (error) {
    logger.error(`Error initializing databases: ${error.message}`);
    logger.error(error.stack);
    // Continue anyway to allow the server to start
  }
};

// Start server
const startServer = async () => {
  try {
    // Initialize databases but don't wait for them to complete
    initializeDatabases().catch(err => {
      logger.error('Database initialization failed but server will continue:', err);
    });
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Continue running
});

startServer();