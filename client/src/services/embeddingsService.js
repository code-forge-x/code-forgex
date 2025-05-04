import axios from 'axios';
import { getAuthHeader } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

class EmbeddingsService {
  /**
   * Create or update embeddings for a prompt
   * @param {string} promptId - The prompt ID
   * @param {Array} vector - The embedding vector
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} - The created embedding
   */
  static async createOrUpdate(promptId, vector, metadata = {}) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/embeddings/prompt/${promptId}`,
        { vector, metadata },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating/updating embedding:', error);
      throw error;
    }
  }

  /**
   * Search for similar embeddings
   * @param {Array} vector - The query vector
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Similar embeddings
   */
  static async searchSimilar(vector, options = {}) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/embeddings/search`,
        { vector, ...options },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching embeddings:', error);
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
      const response = await axios.get(
        `${API_BASE_URL}/embeddings/prompt/${promptId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting prompt embeddings:', error);
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
      const response = await axios.get(
        `${API_BASE_URL}/embeddings/prompt/${promptId}/versions`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting version history:', error);
      throw error;
    }
  }

  /**
   * Delete embeddings for a prompt
   * @param {string} promptId - The prompt ID
   */
  static async deleteByPromptId(promptId) {
    try {
      await axios.delete(
        `${API_BASE_URL}/embeddings/prompt/${promptId}`,
        { headers: getAuthHeader() }
      );
    } catch (error) {
      console.error('Error deleting embeddings:', error);
      throw error;
    }
  }

  /**
   * Export embeddings to CSV
   * @param {Object} options - Export options
   * @returns {Promise<Blob>} - CSV file blob
   */
  static async exportToCSV(options = {}) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/embeddings/export`,
        {
          params: options,
          headers: {
            ...getAuthHeader(),
            'Accept': 'text/csv'
          },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting embeddings:', error);
      throw error;
    }
  }
}

export default EmbeddingsService;