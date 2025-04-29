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
  
  /**
   * Get all prompt templates
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Array>} - Array of prompt templates
   */
  async getAllPromptTemplates(filter = {}) {
    try {
      return await Prompt.find(filter).sort({ name: 1, version: -1 }).lean();
    } catch (error) {
      logger.error(`Error getting all prompt templates: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Create new prompt template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} - Created prompt template
   */
  async createPromptTemplate(templateData) {
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
        updated: Date.now(),
        created: Date.now()
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
   * @param {string} name - Template name
   * @param {number} version - Template version
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated prompt template
   */
  async updatePromptTemplate(name, version, data) {
    try {
      const template = await Prompt.findOne({ name, version });
      
      if (!template) {
        throw new Error(`Template not found: ${name} v${version}`);
      }
      
      // Update fields
      Object.keys(data).forEach(key => {
        if (key !== 'name' && key !== 'version') {
          template[key] = data[key];
        }
      });
      
      template.updated = Date.now();
      await template.save();
      
      return template;
    } catch (error) {
      logger.error(`Error updating prompt template: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get prompt template versions
   * @param {string} name - Template name
   * @returns {Promise<Array>} - Array of versions
   */
  async getPromptVersions(name) {
    try {
      const versions = await Prompt.find({ name })
        .sort({ version: -1 })
        .select('version active updated')
        .lean();
      
      return { versions };
    } catch (error) {
      logger.error(`Error getting prompt versions: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Compare two versions of a prompt template
   * @param {string} name - Template name
   * @param {number} oldVersion - Old version
   * @param {number} newVersion - New version
   * @returns {Promise<Object>} - Comparison data
   */
  async compareVersions(name, oldVersion, newVersion) {
    try {
      const oldPrompt = await Prompt.findOne({ name, version: oldVersion }).lean();
      const newPrompt = await Prompt.findOne({ name, version: newVersion }).lean();
      
      if (!oldPrompt || !newPrompt) {
        throw new Error('One or both versions not found');
      }
      
      // Simple diff implementation
      // In a real app, you'd want to use a proper diff library
      const diff = this._generateSimpleDiff(oldPrompt.content, newPrompt.content);
      
      return {
        oldVersion,
        newVersion,
        oldDate: oldPrompt.updated,
        newDate: newPrompt.updated,
        diff
      };
    } catch (error) {
      logger.error(`Error comparing versions: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Test prompt with variables
   * @param {string} promptId - Prompt ID
   * @param {Object} variables - Variables to substitute
   * @returns {Promise<Object>} - Processed prompt
   */
  async testPrompt(promptId, variables) {
    try {
      const prompt = await Prompt.findById(promptId);
      
      if (!prompt) {
        throw new Error('Prompt not found');
      }
      
      // Process variables
      let processedPrompt = prompt.content;
      
      // Replace all variables in the format {{variableName}}
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedPrompt = processedPrompt.replace(regex, variables[key]);
      });
      
      return {
        promptId: prompt._id,
        promptName: prompt.name,
        promptVersion: prompt.version,
        originalPrompt: prompt.content,
        processedPrompt,
        variables
      };
    } catch (error) {
      logger.error(`Error testing prompt: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get prompt performance metrics
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Object>} - Performance metrics
   */
  async getPerformanceMetrics(filter = {}) {
    try {
      // Build query based on filter
      const query = {};
      
      if (filter.promptId) {
        query.templateId = filter.promptId;
      }
      
      if (filter.timeRange) {
        const now = new Date();
        let startDate;
        
        switch (filter.timeRange) {
          case 'day':
            startDate = new Date(now.setDate(now.getDate() - 1));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            // No date filter
        }
        
        if (startDate) {
          query.created = { $gte: startDate };
        }
      }
      
      // Get performance records
      const records = await PromptPerformance.find(query).populate('templateId');
      
      // Calculate metrics
      const totalTokens = records.reduce(
        (sum, record) => sum + (record.tokenUsage.total || 0), 
        0
      );
      
      const avgLatency = records.length 
        ? records.reduce((sum, record) => sum + record.latency, 0) / records.length 
        : 0;
      
      const successCount = records.filter(r => r.success).length;
      const successRate = records.length ? successCount / records.length : 0;
      
      // Get top prompts
      const promptUsage = {};
      
      records.forEach(record => {
        if (record.templateId) {
          const id = record.templateId._id.toString();
          const name = record.templateId.name;
          const version = record.templateId.version;
          
          if (!promptUsage[id]) {
            promptUsage[id] = {
              id,
              name,
              version,
              tokenUsage: 0,
              requestCount: 0,
              successCount: 0,
              latencySum: 0
            };
          }
          
          promptUsage[id].tokenUsage += record.tokenUsage.total || 0;
          promptUsage[id].requestCount++;
          
          if (record.success) {
            promptUsage[id].successCount++;
          }
          
          promptUsage[id].latencySum += record.latency;
        }
      });
      
      // Convert to array and sort by usage
      const topPrompts = Object.values(promptUsage)
        .map(p => ({
          id: p.id,
          name: p.name,
          version: p.version,
          tokenUsage: p.tokenUsage,
          latency: p.requestCount ? p.latencySum / p.requestCount : 0,
          successRate: p.requestCount ? p.successCount / p.requestCount : 0
        }))
        .sort((a, b) => b.tokenUsage - a.tokenUsage)
        .slice(0, 5);
      
      return {
        totalTokens,
        avgLatency,
        successRate,
        requestCount: records.length,
        topPrompts
      };
    } catch (error) {
      logger.error(`Error getting performance metrics: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Track prompt usage
   * @param {string} templateId - Template ID
   * @param {string} supportId - Support conversation ID
   * @param {Object} metrics - Usage metrics
   * @returns {Promise<Object>} - Performance record
   */
  async trackPerformance(templateId, supportId, metrics) {
    try {
      const performance = new PromptPerformance({
        templateId,
        supportId,
        tokenUsage: {
          input: metrics.input || 0,
          output: metrics.output || 0,
          total: (metrics.input || 0) + (metrics.output || 0)
        },
        latency: metrics.latency || 0,
        success: metrics.success !== undefined ? metrics.success : true,
        errorDetails: metrics.error || null
      });
      
      await performance.save();
      return performance;
    } catch (error) {
      logger.error(`Error tracking performance: ${error.message}`);
      // Don't throw here - performance tracking should not break main functionality
      return null;
    }
  }
  
  /**
   * Get all prompt components
   * @param {string} category - Filter by category (optional)
   * @returns {Promise<Array>} - Array of components
   */
  async getPromptComponents(category) {
    try {
      const query = category ? { category } : {};
      return await PromptComponent.find(query).sort({ name: 1 }).lean();
    } catch (error) {
      logger.error(`Error getting prompt components: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Create prompt component
   * @param {Object} componentData - Component data
   * @returns {Promise<Object>} - Created component
   */
  async createPromptComponent(componentData) {
    try {
      const newComponent = new PromptComponent({
        ...componentData,
        updated: Date.now(),
        created: Date.now()
      });
      
      await newComponent.save();
      return newComponent;
    } catch (error) {
      logger.error(`Error creating prompt component: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Update prompt component
   * @param {string} id - Component ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated component
   */
  async updatePromptComponent(id, data) {
    try {
      const component = await PromptComponent.findById(id);
      
      if (!component) {
        throw new Error(`Component not found: ${id}`);
      }
      
      // Update fields
      Object.keys(data).forEach(key => {
        if (key !== '_id' && key !== 'id') {
          component[key] = data[key];
        }
      });
      
      component.updated = Date.now();
      await component.save();
      
      return component;
    } catch (error) {
      logger.error(`Error updating prompt component: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Delete prompt component
   * @param {string} id - Component ID
   * @returns {Promise<boolean>} - Success status
   */
  async deletePromptComponent(id) {
    try {
      const result = await PromptComponent.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(`Error deleting prompt component: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate a simple diff between two strings
   * @param {string} oldStr - Old string
   * @param {string} newStr - New string
   * @returns {string} - HTML diff
   * @private
   */
  _generateSimpleDiff(oldStr, newStr) {
    // This is a very simple diff implementation
    // In a real application, you'd want to use a proper diff library
    
    if (oldStr === newStr) {
      return newStr;
    }
    
    // Split into lines for line-by-line comparison
    const oldLines = oldStr.split('\n');
    const newLines = newStr.split('\n');
    
    let diffHtml = '';
    
    // Find max length
    const maxLen = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLen; i++) {
      const oldLine = i < oldLines.length ? oldLines[i] : '';
      const newLine = i < newLines.length ? newLines[i] : '';
      
      if (oldLine === newLine) {
        // Line is unchanged
        diffHtml += `${oldLine}\n`;
      } else if (oldLine === '') {
        // Line is added in new version
        diffHtml += `<ins>${newLine}</ins>\n`;
      } else if (newLine === '') {
        // Line is removed in new version
        diffHtml += `<del>${oldLine}</del>\n`;
      } else {
        // Line is changed
        diffHtml += `<del>${oldLine}</del>\n<ins>${newLine}</ins>\n`;
      }
    }
    
    return diffHtml;
  }
}

module.exports = new PromptManager();