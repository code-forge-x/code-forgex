const { MilvusClient } = require('@zilliz/milvus2-sdk-node');
const logger = require('../utils/logger');

class EmbeddingsService {
  constructor() {
    try {
      // Use environment variables with fallbacks
      const MILVUS_HOST = process.env.MILVUS_HOST || 'localhost';
      const MILVUS_PORT = process.env.MILVUS_PORT || '19530';
      const MILVUS_ADDRESS = `${MILVUS_HOST}:${MILVUS_PORT}`;
      
      this.client = new MilvusClient({
        address: MILVUS_ADDRESS,
        token: process.env.MILVUS_TOKEN
      });
      
      logger.info(`Milvus client initialized with address: ${MILVUS_ADDRESS}`);
      this.collectionName = 'template_embeddings';
      this.dimension = 1536; // OpenAI embedding dimension
      this.isAvailable = true;
      this.init();
    } catch (error) {
      logger.error('Failed to initialize Milvus client:', error);
      this.isAvailable = false;
      
      // Create mock methods for development without Milvus
      this.mockInit();
    }
  }
  
  mockInit() {
    logger.info('Using mock Milvus client for development - vector search features will be limited');
    this.storeEmbedding = async () => ({ success: true, mock: true });
    this.searchSimilarTemplates = async () => ([]);
    this.deleteEmbedding = async () => ({ success: true, mock: true });
  }

  async init() {
    try {
      if (!this.isAvailable) return;
      
      // Check if collection exists
      const collections = await this.client.listCollections();
      if (!collections.includes(this.collectionName)) {
        // Create collection
        await this.client.createCollection({
          collection_name: this.collectionName,
          fields: [
            {
              name: 'id',
              data_type: 'Int64',
              is_primary_key: true,
              autoID: true
            },
            {
              name: 'template_id',
              data_type: 'VarChar',
              max_length: 100
            },
            {
              name: 'embedding',
              data_type: 'FloatVector',
              dim: this.dimension
            }
          ]
        });

        // Create index
        await this.client.createIndex({
          collection_name: this.collectionName,
          field_name: 'embedding',
          index_type: 'IVF_FLAT',
          metric_type: 'L2',
          params: {
            nlist: 1024
          }
        });

        logger.info('Milvus collection and index created successfully');
      }
    } catch (error) {
      logger.error('Error initializing Milvus:', error);
      this.isAvailable = false;
      this.mockInit();
    }
  }

  // Store template embedding
  async storeEmbedding(templateId, embedding) {
    try {
      if (!this.isAvailable) return { success: true, mock: true };
      
      await this.client.insert({
        collection_name: this.collectionName,
        data: [
          {
            template_id: templateId,
            embedding: embedding
          }
        ]
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Error storing embedding:', error);
      return { success: false, error: error.message };
    }
  }

  // Search similar templates
  async searchSimilarTemplates(embedding, limit = 5) {
    try {
      if (!this.isAvailable) return [];
      
      const results = await this.client.search({
        collection_name: this.collectionName,
        vector: embedding,
        output_fields: ['template_id'],
        limit: limit,
        metric_type: 'L2'
      });

      return results.map(result => ({
        templateId: result.template_id,
        distance: result.distance
      }));
    } catch (error) {
      logger.error('Error searching similar templates:', error);
      return [];
    }
  }

  // Delete template embedding
  async deleteEmbedding(templateId) {
    try {
      if (!this.isAvailable) return { success: true, mock: true };
      
      await this.client.deleteEntities({
        collection_name: this.collectionName,
        expr: `template_id == "${templateId}"`
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Error deleting embedding:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmbeddingsService(); 