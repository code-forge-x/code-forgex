module.exports = {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/codeforegx',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_for_development',
    jwtExpiration: 86400, // 24 hours in seconds
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    loggingLevel: process.env.LOGGING_LEVEL || 'info'
  };