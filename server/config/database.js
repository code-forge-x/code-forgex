const mongoose = require('mongoose');
const { Pool } = require('pg');
const logger = require('../utils/logger');

// MongoDB connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// TimescaleDB connection
const timescalePool = new Pool({
  user: process.env.TIMESCALE_USER,
  host: process.env.TIMESCALE_HOST,
  database: process.env.TIMESCALE_DB,
  password: process.env.TIMESCALE_PASSWORD,
  port: process.env.TIMESCALE_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize TimescaleDB tables
const initTimescaleDB = async () => {
  try {
    await timescalePool.query(`
      CREATE TABLE IF NOT EXISTS template_metrics (
        time TIMESTAMPTZ NOT NULL,
        template_id TEXT NOT NULL,
        success_rate DOUBLE PRECISION,
        token_efficiency DOUBLE PRECISION,
        avg_response_time DOUBLE PRECISION,
        user_satisfaction DOUBLE PRECISION,
        PRIMARY KEY (time, template_id)
      );
      
      SELECT create_hypertable('template_metrics', 'time', if_not_exists => TRUE);
    `);
    logger.info('TimescaleDB tables initialized successfully');
  } catch (error) {
    logger.error('TimescaleDB initialization error:', error);
    process.exit(1);
  }
};

module.exports = {
  connectMongoDB,
  timescalePool,
  initTimescaleDB
}; 