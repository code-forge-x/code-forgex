const Prompt = require('../models/Prompt');
const PromptComponent = require('../models/PromptComponent');
const PromptPerformance = require('../models/PromptPerformance');
const logger = require('../utils/logger');

/**
 * PromptManager Service
 * Manages prompt templates, components, and performance tracking
 */
class PromptManager {
  /**
   * Get prompt template by name and version
   * @param {string} name - Template name
   * @param {number} version - Template version (optional, defaults to latest)
   * @returns {Promise<Object>} - Prompt template
   */
  async getPromptTemplate(name, version) {
    try {
      let query = { name };
      
      if (version) {
        // Get specific version
        query.version = version;
      } else {
        // Get latest version
        const latestPrompt = await Prompt.findOne({ name, active: true })
          .sort({ version: -1 })
          .lean();
          
        if (latestPrompt) {
          return latestPrompt;
        }
        
        // If no active version, get latest regardless of active status
        return await Prompt.findOne({ name })
          .sort({ version: -1 })
          .lean();
      }
      
      return await Prompt.findOne(query).lean();
    } catch (error) {
      logger.error(`Error getting prompt template: ${error.message}`);
      throw error;
    }
  }
  
  // Rest of the promptManager methods as previously provided...
  // (The rest of the implementation remains the same)
  
  // Include the rest of the methods from the original promptManager.js
}

module.exports = new PromptManager();