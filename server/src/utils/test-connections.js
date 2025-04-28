require('dotenv').config();
const mongoose = require('mongoose');
const { Pool } = require('pg');
const Redis = require('ioredis');
const { MilvusClient } = require('@zilliz/milvus2-sdk-node');
const logger = require('./logger');

async function testConnections() {
  try {
    // Test MongoDB
    console.log('Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful');
    
    // Test TimescaleDB
    console.log('\nTesting TimescaleDB connection...');
    const pgPool = new Pool({
      host: process.env.TIMESCALE_HOST,
      port: process.env.TIMESCALE_PORT,
      database: process.env.TIMESCALE_DB,
      user: process.env.TIMESCALE_USER,
      password: process.env.TIMESCALE_PASSWORD
    });
    
    const pgResult = await pgPool.query('SELECT version()');
    console.log(`✅ TimescaleDB connection successful: ${pgResult.rows[0].version}`);
    await pgPool.end();
    
    // Test Redis
    console.log('\nTesting Redis connection...');
    const redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    });
    
    const redisPing = await redisClient.ping();
    console.log(`✅ Redis connection successful: ${redisPing}`);
    await redisClient.quit();
    
    // Test Milvus
    console.log('\nTesting Milvus Vector DB connection...');
    const milvusClient = new MilvusClient(process.env.VECTOR_DB_URI);
    const health = await milvusClient.checkHealth();
    console.log(`✅ Milvus connection successful: ${JSON.stringify(health)}`);
    
    console.log('\n🎉 All database connections tested successfully');
  } catch (error) {
    console.error('❌ Error testing database connections:', error);
  } finally {
    process.exit(0);
  }
}

testConnections();