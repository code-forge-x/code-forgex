const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.test') });

module.exports = {
  // Test database configuration
  mongodb: {
    uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/template-management-test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // Test TimescaleDB configuration
  timescale: {
    host: process.env.TIMESCALE_TEST_HOST || 'localhost',
    port: process.env.TIMESCALE_TEST_PORT || 5432,
    database: process.env.TIMESCALE_TEST_DB || 'template_management_test',
    user: process.env.TIMESCALE_TEST_USER || 'postgres',
    password: process.env.TIMESCALE_TEST_PASSWORD || 'postgres'
  },

  // Test Milvus configuration
  milvus: {
    address: process.env.MILVUS_TEST_ADDRESS || 'localhost:19530',
    username: process.env.MILVUS_TEST_USERNAME || 'root',
    password: process.env.MILVUS_TEST_PASSWORD || 'Milvus',
    ssl: process.env.MILVUS_TEST_SSL === 'true'
  },

  // Test API configuration
  api: {
    port: process.env.TEST_PORT || 3001,
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3001',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Test security configuration
  security: {
    jwtSecret: process.env.JWT_TEST_SECRET || 'test-secret-key',
    jwtExpiration: '1h',
    bcryptSaltRounds: 4 // Reduced for faster tests
  },

  // Test logging configuration
  logging: {
    level: 'error', // Only log errors during tests
    filename: 'test.log'
  }
};