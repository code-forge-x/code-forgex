// server/src/services/prompt/promptManager.js
const { Prompt, ProjectPrompt, PromptComponent, PromptPerformance } = require('../../models');

/**
 * Prompt Manager Service
 * Handles template versioning, project-specific overrides, and performance tracking
 */
class PromptManager {
  /**
   * Get a prompt template by name
   * @param {string} name - The name of the prompt template
   * @param {number} version - Optional version number, defaults to the latest
   * @returns {Promise<Object>} - The prompt template
   */
  async getPromptTemplate(name, version = null) {
    try {
      let query = { name, active: true };
      
      if (version) {
        query.version = version;
      } else {
        // Get the latest version if version is not specified
        const latest = await Prompt.findOne({ name })
          .sort({ version: -1 })
          .limit(1);
          
        if (!latest) {
          return null;
        }
        
        query.version = latest.version;
      }
      
      return await Prompt.findOne(query);
    } catch (error) {
      console.error('Error getting prompt template:', error);
      throw error;
    }
  }
  
  /**
   * Get a project-specific prompt template
   * @param {string} projectId - The project ID
   * @param {string} name - The name of the prompt template
   * @param {number} version - Optional version number, defaults to the latest
   * @returns {Promise<Object>} - The project prompt template or the global template if not found
   */
  async getProjectPrompt(projectId, name, version = null) {
    try {
      let query = { projectId, name, active: true };
      
      if (version) {
        query.version = version;
      } else {
        // Get the latest version if version is not specified
        const latest = await ProjectPrompt.findOne({ projectId, name })
          .sort({ version: -1 })
          .limit(1);
          
        if (!latest) {
          // Fall back to global template
          return await this.getPromptTemplate(name, version);
        }
        
        query.version = latest.version;
      }
      
      const projectPrompt = await ProjectPrompt.findOne(query);
      
      if (!projectPrompt) {
        // Fall back to global template
        return await this.getPromptTemplate(name, version);
      }
      
      return projectPrompt;
    } catch (error) {
      console.error('Error getting project prompt:', error);
      throw error;
    }
  }
  
  /**
   * Create a new prompt template
   * @param {Object} promptData - The prompt data
   * @returns {Promise<Object>} - The created prompt template
   */
  async createPromptTemplate(promptData) {
    try {
      // Check if there's an existing prompt with the same name
      const existingPrompt = await Prompt.findOne({ name: promptData.name })
        .sort({ version: -1 })
        .limit(1);
      
      let version = 1;
      
      if (existingPrompt) {
        // Increment version number
        version = existingPrompt.version + 1;
      }
      
      const newPrompt = new Prompt({
        ...promptData,
        version
      });
      
      return await newPrompt.save();
    } catch (error) {
      console.error('Error creating prompt template:', error);
      throw error;
    }
  }
  
  /**
   * Update a prompt template
   * @param {string} name - The name of the prompt template
   * @param {number} version - The version number
   * @param {Object} promptData - The updated prompt data
   * @returns {Promise<Object>} - The updated prompt template
   */
  async updatePromptTemplate(name, version, promptData) {
    try {
      // Don't allow updating name or version
      delete promptData.name;
      delete promptData.version;
      
      const updatedPrompt = await Prompt.findOneAndUpdate(
        { name, version },
        { $set: promptData },
        { new: true }
      );
      
      return updatedPrompt;
    } catch (error) {
      console.error('Error updating prompt template:', error);
      throw error;
    }
  }
  
  /**
   * Create a project-specific prompt template
   * @param {string} projectId - The project ID
   * @param {Object} promptData - The prompt data
   * @returns {Promise<Object>} - The created project prompt template
   */
  async createProjectPrompt(projectId, promptData) {
    try {
      // Check if there's an existing prompt with the same name for this project
      const existingPrompt = await ProjectPrompt.findOne({ 
        projectId, 
        name: promptData.name 
      })
        .sort({ version: -1 })
        .limit(1);
      
      let version = 1;
      
      if (existingPrompt) {
        // Increment version number
        version = existingPrompt.version + 1;
      }
      
      // If basedOn is not provided, try to find the global template
      if (!promptData.basedOn) {
        const globalTemplate = await Prompt.findOne({ name: promptData.name })
          .sort({ version: -1 })
          .limit(1);
          
        if (globalTemplate) {
          promptData.basedOn = globalTemplate._id;
        }
      }
      
      const newPrompt = new ProjectPrompt({
        ...promptData,
        projectId,
        version
      });
      
      return await newPrompt.save();
    } catch (error) {
      console.error('Error creating project prompt:', error);
      throw error;
    }
  }
  
  /**
   * Track prompt performance
   * @param {string} templateId - The template ID
   * @param {string} supportId - The support conversation ID
   * @param {Object} usage - Token usage data
   * @param {number} latency - Response time in milliseconds
   * @param {boolean} success - Whether the prompt was successful
   * @param {string} errorDetails - Error details if any
   * @returns {Promise<Object>} - The created performance record
   */
  async trackPerformance(templateId, supportId, usage, latency = 0, success = true, errorDetails = null) {
    try {
      // Make sure templateId and supportId are provided
      if (!templateId || !supportId) {
        console.warn('Missing templateId or supportId for tracking performance');
        return null;
      }
      
      // Validate token usage format
      if (!usage || typeof usage !== 'object') {
        usage = { input: 0, output: 0, total: 0 };
      }
      
      const performanceData = new PromptPerformance({
        templateId,
        supportId,
        tokenUsage: {
          input: usage.input || 0,
          output: usage.output || 0,
          total: usage.total || (usage.input || 0) + (usage.output || 0) || 0
        },
        latency,
        success,
        errorDetails
      });
      
      return await performanceData.save();
    } catch (error) {
      console.error('Error tracking prompt performance:', error);
      // Don't throw the error, just log it to avoid disrupting the main workflow
      return null;
    }
  }
  
  /**
   * Get prompt components by category
   * @param {string} category - The category to filter by (optional)
   * @returns {Promise<Array>} - Array of prompt components
   */
  async getPromptComponents(category = null) {
    try {
      const query = category ? { category } : {};
      return await PromptComponent.find(query).lean();
    } catch (error) {
      console.error('Error getting prompt components:', error);
      throw error;
    }
  }
  
  /**
   * Get prompt performance statistics
   * @param {string} templateId - The template ID (optional)
   * @param {Object} options - Query options (timeRange, limit, etc.)
   * @returns {Promise<Object>} - Performance statistics
   */
  async getPerformanceStats(templateId = null, options = {}) {
    try {
      const query = templateId ? { templateId } : {};
      
      // Add time range if provided
      if (options.startDate && options.endDate) {
        query.createdAt = { 
          $gte: new Date(options.startDate), 
          $lte: new Date(options.endDate) 
        };
      }
      
      // Get performance records
      const limit = options.limit || 100;
      const records = await PromptPerformance.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);
      
      // Calculate statistics
      let totalLatency = 0;
      let totalInput = 0;
      let totalOutput = 0;
      let successCount = 0;
      
      records.forEach(record => {
        totalLatency += record.latency || 0;
        totalInput += record.tokenUsage.input || 0;
        totalOutput += record.tokenUsage.output || 0;
        
        if (record.success) {
          successCount++;
        }
      });
      
      const recordCount = records.length;
      
      return {
        recordCount,
        averageLatency: recordCount > 0 ? totalLatency / recordCount : 0,
        averageInputTokens: recordCount > 0 ? totalInput / recordCount : 0,
        averageOutputTokens: recordCount > 0 ? totalOutput / recordCount : 0,
        successRate: recordCount > 0 ? (successCount / recordCount) * 100 : 0,
        records
      };
    } catch (error) {
      console.error('Error getting performance statistics:', error);
      throw error;
    }
  }
  
  /**
   * Create a new prompt component
   * @param {Object} componentData - The component data
   * @returns {Promise<Object>} - The created component
   */
  async createPromptComponent(componentData) {
    try {
      const newComponent = new PromptComponent(componentData);
      return await newComponent.save();
    } catch (error) {
      console.error('Error creating prompt component:', error);
      throw error;
    }
  }
}

module.exports = new PromptManager();