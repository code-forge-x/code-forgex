const { Pool } = require('pg');
const config = require('./default');
const logger = require('../utils/logger');

const pool = new Pool({
  host: config.timescale.host,
  port: config.timescale.port,
  database: config.timescale.database,
  user: config.timescale.user,
  password: config.timescale.password
});

const initializeTimescaleDB = async () => {
  try {
    // Test the connection
    await pool.query('SELECT NOW()');
    logger.info('TimescaleDB connected successfully');

    // Create necessary tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        time TIMESTAMPTZ NOT NULL,
        metric_name TEXT NOT NULL,
        value DOUBLE PRECISION NOT NULL,
        tags JSONB
      );
      
      SELECT create_hypertable('performance_metrics', 'time', if_not_exists => TRUE);
    `);
    
    logger.info('TimescaleDB tables initialized');
  } catch (error) {
    logger.error(`Error initializing TimescaleDB: ${error.message}`);
    throw error;
  }
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Query execution failed:', { text, error: error.message });
    throw error;
  }
};

const close = async () => {
  try {
    await pool.end();
    logger.info('TimescaleDB connection pool closed');
  } catch (error) {
    logger.error('Failed to close TimescaleDB connection pool:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initializeTimescaleDB,
  query,
  close
};