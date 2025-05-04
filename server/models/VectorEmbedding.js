const { 
  milvusClient,
  insertEmbeddings,
  searchSimilar,
  getPromptEmbeddings,
  deletePromptEmbeddings
} = require('../config/milvus');
const logger = require('../utils/logger');

class VectorEmbedding {
  /**
   * Create or update embeddings for a prompt
   * @param {string} promptId - The prompt ID
   * @param {Array} vector - The embedding vector
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} - The created embedding
   */
  static async createOrUpdate(promptId, vector, metadata = {}) {
    try {
      // Get current version
      const currentEmbeddings = await getPromptEmbeddings(promptId);
      const currentVersion = currentEmbeddings.length > 0 
        ? Math.max(...currentEmbeddings.map(e => e.version)) 
        : 0;

      const embedding = {
        id: `${promptId}_${currentVersion + 1}`,
        prompt_id: promptId,
        version: currentVersion + 1,
        vector,
        metadata: {
          ...metadata,
          created_at: new Date().toISOString()
        }
      };

      await insertEmbeddings([embedding]);
      return embedding;
    } catch (error) {
      logger.error(`Error creating/updating embedding: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find similar embeddings
   * @param {Array} vector - The query vector
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Similar embeddings
   */
  static async findSimilar(vector, options = {}) {
    try {
      const {
        limit = 10,
        minSimilarity = 0.7,
        excludePromptId = null
      } = options;

      let filter = '';
      if (excludePromptId) {
        filter = `prompt_id != "${excludePromptId}"`;
      }

      const results = await searchSimilar(vector, {
        limit,
        filter,
        output_fields: ['id', 'prompt_id', 'version', 'metadata']
      });

      // Filter by minimum similarity
      return results.filter(result => result.score >= minSimilarity);
    } catch (error) {
      logger.error(`Error finding similar embeddings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get embeddings for a prompt
   * @param {string} promptId - The prompt ID
   * @returns {Promise<Array>} - The prompt's embeddings
   */
  static async getByPromptId(promptId) {
    try {
      return await getPromptEmbeddings(promptId);
    } catch (error) {
      logger.error(`Error getting prompt embeddings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get version history for a prompt's embeddings
   * @param {string} promptId - The prompt ID
   * @returns {Promise<Array>} - Version history
   */
  static async getVersionHistory(promptId) {
    try {
      const embeddings = await getPromptEmbeddings(promptId);
      return embeddings.sort((a, b) => b.version - a.version);
    } catch (error) {
      logger.error(`Error getting version history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete embeddings for a prompt
   * @param {string} promptId - The prompt ID
   */
  static async deleteByPromptId(promptId) {
    try {
      await deletePromptEmbeddings(promptId);
    } catch (error) {
      logger.error(`Error deleting prompt embeddings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export embeddings to CSV format
   * @param {Object} options - Export options
   * @returns {Promise<string>} - CSV content
   */
  static async exportToCSV(options = {}) {
    try {
      const { limit = 1000 } = options;
      
      const results = await milvusClient.query({
        collection_name: 'vector_embeddings',
        limit,
        output_fields: ['id', 'prompt_id', 'version', 'metadata', 'created_at']
      });

      // Convert to CSV format
      const headers = ['id', 'prompt_id', 'version', 'metadata', 'created_at'];
      const rows = results.map(result => 
        headers.map(header => JSON.stringify(result[header])).join(',')
      );

      return [headers.join(','), ...rows].join('\n');
    } catch (error) {
      logger.error(`Error exporting embeddings: ${error.message}`);
      throw error;
    }
  }
}

module.exports = VectorEmbedding;