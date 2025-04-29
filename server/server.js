const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config/default');
const logger = require('./utils/logger');
const routes = require('./routes');
const errorMiddleware = require('./middleware/error');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// API Routes
app.use(routes);

// Error handling middleware
app.use(errorMiddleware);

// Define port
const PORT = config.port;

// Start server
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${config.environment}`);
});