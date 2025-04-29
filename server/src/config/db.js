const mongoose = require('mongoose');
const config = require('./default');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info('MongoDB Connected...');
  } catch (err) {
    logger.error(`MongoDB Connection Error: ${err.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;