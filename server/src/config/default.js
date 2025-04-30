module.exports = {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/codeforegx',
    jwtSecret: process.env.JWT_SECRET || 'codeforegx_development_secret_key_2024',
    jwtExpiration: process.env.JWT_EXPIRES_IN || 86400, // 24 hours in seconds
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    loggingLevel: process.env.LOGGING_LEVEL || 'info',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    },
    ai: {
        apiKey: process.env.AI_API_KEY
    }
};