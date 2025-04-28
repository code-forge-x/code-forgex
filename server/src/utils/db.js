/**
 * Database utility functions for common operations
 */
const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Generate a MongoDB ObjectId
 * @returns {ObjectId} New MongoDB ObjectId
 */
const generateObjectId = () => {
  return new mongoose.Types.ObjectId();
};

/**
 * Check if string is valid MongoDB ObjectId
 * @param {string} id - String to validate as ObjectId
 * @returns {boolean} True if valid ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Convert string ID to MongoDB ObjectId
 * @param {string} id - String ID to convert
 * @returns {ObjectId|null} MongoDB ObjectId or null if invalid
 */
const toObjectId = (id) => {
  try {
    if (!id || !isValidObjectId(id)) return null;
    return new mongoose.Types.ObjectId(id);
  } catch (error) {
    logger.error('Error converting to ObjectId:', error);
    return null;
  }
};

/**
 * Handle database operation with error catching
 * @param {Function} operation - Async database operation function
 * @param {string} errorMessage - Custom error message prefix
 * @returns {Promise<*>} Result of the operation or throws error
 */
const handleDbOperation = async (operation, errorMessage = 'Database operation failed') => {
  try {
    return await operation();
  } catch (error) {
    logger.error(`${errorMessage}:`, error);
    throw error;
  }
};

module.exports = {
  generateObjectId,
  isValidObjectId,
  toObjectId,
  handleDbOperation
};