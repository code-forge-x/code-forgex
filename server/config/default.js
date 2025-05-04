module.exports = {
  port: process.env.PORT || 5000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/codeforge'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
  },
  timescale: {
    host: process.env.TIMESCALE_HOST || 'localhost',
    port: process.env.TIMESCALE_PORT || 5432,
    database: process.env.TIMESCALE_DB || 'codeforge',
    user: process.env.TIMESCALE_USER || 'postgres',
    password: process.env.TIMESCALE_PASSWORD || 'postgres'
  },
  milvus: {
    host: process.env.MILVUS_HOST || 'localhost',
    port: process.env.MILVUS_PORT || 19530
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
}; 