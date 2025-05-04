const mongoose = require('mongoose');
const { Pool } = require('pg');
const { MilvusClient } = require('@zilliz/milvus2-sdk-node');
const testConfig = require('../../config/test');
const logger = require('../../utils/logger');

class TestHelper {
  static async setupTestEnvironment() {
    try {
      // Connect to MongoDB
      await this.connectMongoDB();
      
      // Connect to TimescaleDB
      await this.connectTimescaleDB();
      
      // Connect to Milvus
      await this.connectMilvus();
      
      logger.info('Test environment setup completed');
    } catch (error) {
      logger.error('Failed to setup test environment:', error);
      throw error;
    }
  }

  static async teardownTestEnvironment() {
    try {
      // Clear MongoDB collections
      await this.clearMongoDB();
      
      // Clear TimescaleDB tables
      await this.clearTimescaleDB();
      
      // Clear Milvus collections
      await this.clearMilvus();
      
      // Close connections
      await this.closeConnections();
      
      logger.info('Test environment teardown completed');
    } catch (error) {
      logger.error('Failed to teardown test environment:', error);
      throw error;
    }
  }

  static async connectMongoDB() {
    try {
      await mongoose.connect(testConfig.mongodb.uri, testConfig.mongodb.options);
      logger.info('Connected to MongoDB test database');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  static async connectTimescaleDB() {
    try {
      this.timescalePool = new Pool({
        host: testConfig.timescale.host,
        port: testConfig.timescale.port,
        database: testConfig.timescale.database,
        user: testConfig.timescale.user,
        password: testConfig.timescale.password
      });
      await this.timescalePool.query('SELECT 1');
      logger.info('Connected to TimescaleDB test database');
    } catch (error) {
      logger.error('Failed to connect to TimescaleDB:', error);
      throw error;
    }
  }

  static async connectMilvus() {
    try {
      this.milvusClient = new MilvusClient({
        address: testConfig.milvus.address,
        username: testConfig.milvus.username,
        password: testConfig.milvus.password,
        ssl: testConfig.milvus.ssl
      });
      await this.milvusClient.hasCollection({ collection_name: 'embeddings' });
      logger.info('Connected to Milvus test database');
    } catch (error) {
      logger.error('Failed to connect to Milvus:', error);
      throw error;
    }
  }

  static async clearMongoDB() {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
      logger.info('MongoDB collections cleared');
    } catch (error) {
      logger.error('Failed to clear MongoDB:', error);
      throw error;
    }
  }

  static async clearTimescaleDB() {
    try {
      await this.timescalePool.query(`
        DROP TABLE IF EXISTS performance_metrics CASCADE;
        DROP TABLE IF EXISTS template_metrics CASCADE;
        DROP TABLE IF EXISTS user_activity CASCADE;
      `);
      logger.info('TimescaleDB tables cleared');
    } catch (error) {
      logger.error('Failed to clear TimescaleDB:', error);
      throw error;
    }
  }

  static async clearMilvus() {
    try {
      const collections = await this.milvusClient.showCollections();
      for (const collection of collections) {
        await this.milvusClient.dropCollection({
          collection_name: collection
        });
      }
      logger.info('Milvus collections cleared');
    } catch (error) {
      logger.error('Failed to clear Milvus:', error);
      throw error;
    }
  }

  static async closeConnections() {
    try {
      await mongoose.connection.close();
      await this.timescalePool.end();
      await this.milvusClient.closeConnection();
      logger.info('All database connections closed');
    } catch (error) {
      logger.error('Failed to close connections:', error);
      throw error;
    }
  }

  static generateTestUser() {
    return {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'user'
    };
  }

  static generateTestProject() {
    return {
      name: `Test Project ${Date.now()}`,
      description: 'Test project description',
      type: 'web',
      environment: 'development'
    };
  }

  static generateTestRequirements() {
    return {
      components: [
        {
          name: 'Test Component 1',
          type: 'api',
          description: 'Test component description',
          requirements: {
            endpoints: ['GET /api/test', 'POST /api/test']
          }
        },
        {
          name: 'Test Component 2',
          type: 'database',
          description: 'Test database component',
          requirements: {
            tables: ['users', 'products']
          }
        }
      ]
    };
  }
}

module.exports = TestHelper;