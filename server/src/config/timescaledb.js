const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.TIMESCALE_HOST,
  port: process.env.TIMESCALE_PORT,
  database: process.env.TIMESCALE_DB,
  user: process.env.TIMESCALE_USER,
  password: process.env.TIMESCALE_PASSWORD
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle TimescaleDB client', err);
  process.exit(-1);
});

const connectTimescaleDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('TimescaleDB connected');
    client.release();
    return pool;
  } catch (error) {
    logger.error('TimescaleDB connection error:', error.message);
    throw error;
  }
};

module.exports = {
  connectTimescaleDB,
  query: (text, params) => pool.query(text, params)
};
