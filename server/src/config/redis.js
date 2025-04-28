const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  keyPrefix: process.env.NODE_ENV === 'production' ? 'codeforegx:prod:' : 'codeforegx:dev:'
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis connected');
});

module.exports = redisClient;