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
   * Get all prompt templates with optional filtering
   */
  async getAllPromptTemplates(filter = {}) {
    try {
      return await Prompt.find(filter)
        .sort({ name: 1, version: -1 })
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .lean();
    } catch (error) {
      logger.error(`Error getting all prompt templates: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get prompt template by name and version
   */
  async getPromptTemplate(name, version = null) {
    try {
      let query = { name };
      
      if (version) {
        query.version = version;
      } else {
        // Get latest version
        const latestPrompt = await Prompt.findOne({ name, active: true })
          .sort({ version: -1 })
          .populate('createdBy', 'name email')
          .populate('updatedBy', 'name email')
          .lean();
          
        if (latestPrompt) {
          return latestPrompt;
        }
        
        return await Prompt.findOne({ name })
          .sort({ version: -1 })
          .populate('createdBy', 'name email')
          .populate('updatedBy', 'name email')
          .lean();
      }
      
      return await Prompt.findOne(query)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .lean();
    } catch (error) {
      logger.error(`Error getting prompt template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create new prompt template
   */
  async createPromptTemplate(templateData, userId) {
    try {
      // Check if template with this name already exists
      const existingTemplate = await Prompt.findOne({ name: templateData.name })
        .sort({ version: -1 });
      
      // If exists, increment version
      if (existingTemplate) {
        templateData.version = existingTemplate.version + 1;
      }
      
      const newTemplate = new Prompt({
        ...templateData,
        createdBy: userId,
        updatedBy: userId
      });
      
      await newTemplate.save();
      return newTemplate;
    } catch (error) {
      logger.error(`Error creating prompt template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update prompt template
   */
  async updatePromptTemplate(name, version, updateData, userId) {
    try {
      const template = await Prompt.findOne({ name, version });
      
      if (!template) {
        throw new Error('Prompt template not found');
      }
      
      // Create new version
      const newVersion = new Prompt({
        ...template.toObject(),
        ...updateData,
        version: template.version + 1,
        updatedBy: userId,
        _id: undefined // Remove the old _id
      });
      
      await newVersion.save();
      return newVersion;
    } catch (error) {
      logger.error(`Error updating prompt template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete prompt template
   */
  async deletePromptTemplate(name, version) {
    try {
      const result = await Prompt.deleteOne({ name, version });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(`Error deleting prompt template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get versions of a prompt template
   */
  async getPromptVersions(name) {
    try {
      return await Prompt.find({ name })
        .sort({ version: -1 })
        .select('version createdAt updatedAt active')
        .lean();
    } catch (error) {
      logger.error(`Error getting prompt versions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test prompt template with variables
   */
  async testPrompt(name, variables) {
    try {
      const template = await this.getPromptTemplate(name);
      
      if (!template) {
        throw new Error('Prompt template not found');
      }
      
      // Replace variables in the template
      let processedContent = template.content;
      for (const [key, value] of Object.entries(variables)) {
        processedContent = processedContent.replace(
          new RegExp(`{{${key}}}`, 'g'),
          value
        );
      }
      
      return {
        original: template.content,
        processed: processedContent,
        variables: template.variables
      };
    } catch (error) {
      logger.error(`Error testing prompt: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get prompt performance metrics
   */
  async getPerformanceMetrics(filter = {}) {
    try {
      const metrics = await Prompt.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$name',
            totalUsage: { $sum: '$metadata.usageCount' },
            avgResponseTime: { $avg: '$metadata.averageResponseTime' },
            successRate: { $avg: '$metadata.successRate' },
            lastUsed: { $max: '$metadata.lastUsed' }
          }
        }
      ]);
      
      return metrics;
    } catch (error) {
      logger.error(`Error getting performance metrics: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new PromptManager();