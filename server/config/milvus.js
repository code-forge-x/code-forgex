const { MilvusClient } = require('@zilliz/milvus2-sdk-node');
const config = require('./default');
const logger = require('../utils/logger');

// Use environment variables with fallbacks for local development
const MILVUS_HOST = process.env.MILVUS_HOST || 'localhost';
const MILVUS_PORT = process.env.MILVUS_PORT || '19530';
const MILVUS_ADDRESS = `${MILVUS_HOST}:${MILVUS_PORT}`;

// Configure Milvus client
let client;
try {
  client = new MilvusClient({
    address: MILVUS_ADDRESS,
    token: process.env.MILVUS_TOKEN
  });
  logger.info(`Milvus client configured with address: ${MILVUS_ADDRESS}`);
} catch (error) {
  logger.error(`Failed to initialize Milvus client: ${error.message}`);
  // Create a mock client for development if Milvus is not available
  client = {
    hasCollection: async () => true,
    createCollection: async () => logger.info('[MOCK] Milvus collection created'),
    createIndex: async () => logger.info('[MOCK] Milvus index created'),
    insert: async () => ({ id: Math.floor(Math.random() * 1000) }),
    search: async () => ([]),
    query: async () => ([]),
    close: async () => logger.info('[MOCK] Milvus connection closed')
  };
  logger.info('Using mock Milvus client for development');
}

const initializeMilvus = async () => {
  try {
    // Test the connection
    await client.hasCollection({ collection_name: 'test' });
    logger.info('Milvus connected successfully');

    // Create collection for embeddings if it doesn't exist
    const collectionName = 'embeddings';
    const hasCollection = await client.hasCollection({ collection_name: collectionName });
    
    if (!hasCollection) {
      await client.createCollection({
        collection_name: collectionName,
        fields: [
          {
            name: 'id',
            data_type: 'Int64',
            is_primary_key: true,
            autoID: true
          },
          {
            name: 'vector',
            data_type: 'FloatVector',
            dim: 1536 // OpenAI embedding dimension
          },
          {
            name: 'text',
            data_type: 'VarChar',
            max_length: 65535
          },
          {
            name: 'metadata',
            data_type: 'JSON'
          }
        ]
      });

      // Create index for vector field
      await client.createIndex({
        collection_name: collectionName,
        field_name: 'vector',
        index_type: 'IVF_FLAT',
        metric_type: 'COSINE',
        params: { nlist: 1024 }
      });

      logger.info('Milvus collection and index created');
    }
  } catch (error) {
    logger.error(`Error initializing Milvus: ${error.message}`);
    logger.info('Continuing without Milvus - vector search features will be limited');
  }
};

const insertEmbedding = async (embedding, promptId, version, metadata = {}) => {
  try {
    const result = await client.insert({
      collection_name: 'embeddings',
      data: [
        {
          embedding,
          prompt_id: promptId,
          version,
          metadata,
          created_at: Date.now(),
        },
      ],
    });

    return result;
  } catch (error) {
    logger.error('Failed to insert embedding:', error);
    return { id: -1, error: error.message };
  }
};

const searchSimilar = async (embedding, limit = 10) => {
  try {
    const result = await client.search({
      collection_name: 'embeddings',
      vector: embedding,
      limit,
      output_fields: ['prompt_id', 'version', 'metadata'],
    });

    return result;
  } catch (error) {
    logger.error('Failed to search similar embeddings:', error);
    return [];
  }
};

const getEmbedding = async (promptId, version) => {
  try {
    const result = await client.query({
      collection_name: 'embeddings',
      expr: `prompt_id == "${promptId}" && version == ${version}`,
      output_fields: ['embedding', 'metadata'],
    });

    return result;
  } catch (error) {
    logger.error('Failed to get embedding:', error);
    return null;
  }
};

const close = async () => {
  try {
    await client.close();
    logger.info('Milvus connection closed');
  } catch (error) {
    logger.error('Failed to close Milvus connection:', error);
  }
};

module.exports = {
  client,
  initializeMilvus,
  insertEmbedding,
  searchSimilar,
  getEmbedding,
  close,
};