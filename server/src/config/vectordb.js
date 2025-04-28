const { MilvusClient } = require('@zilliz/milvus2-sdk-node');
const logger = require('../utils/logger');

let milvusClient = null;

const connectVectorDB = async () => {
  try {
    const address = process.env.VECTOR_DB_URI || 'http://localhost:19530';
    const client = new MilvusClient(address);
    
    // Try to ping the server to check connection
    await client.checkHealth();
    
    // Check if collection exists, if not create it
    const collectionName = process.env.VECTOR_DB_COLLECTION || 'codeforegx_vectors';
    const hasCollection = await client.hasCollection({
      collection_name: collectionName
    });
    
    if (!hasCollection.value) {
      // Create collection for code embeddings
      await client.createCollection({
        collection_name: collectionName,
        fields: [
          {
            name: 'id',
            description: 'ID field',
            data_type: 5, // DataType.VarChar
            is_primary_key: true,
            max_length: 36
          },
          {
            name: 'vector',
            description: 'Code embedding vector',
            data_type: 101, // DataType.FloatVector
            dim: 1536 // Claude embedding dimension
          },
          {
            name: 'code',
            description: 'Code content',
            data_type: 5, // DataType.VarChar
            max_length: 65535
          },
          {
            name: 'language',
            description: 'Programming language',
            data_type: 5, // DataType.VarChar
            max_length: 32
          },
          {
            name: 'componentType',
            description: 'Component type',
            data_type: 5, // DataType.VarChar
            max_length: 32
          }
        ]
      });
      
      // Create index for vector field
      await client.createIndex({
        collection_name: collectionName,
        field_name: 'vector',
        index_type: 'HNSW',
        metric_type: 'COSINE', // For embeddings, COSINE similarity is often best
        params: { M: 8, efConstruction: 64 }
      });
      
      logger.info(`Vector collection '${collectionName}' created and indexed`);
    }
    
    // Load collection into memory for search
    await client.loadCollection({
      collection_name: collectionName
    });
    
    logger.info('Milvus Vector DB connected');
    milvusClient = client;
    return client;
  } catch (error) {
    logger.error('Milvus Vector DB connection error:', error.message);
    throw error;
  }
};

const getVectorDBClient = () => {
  if (!milvusClient) {
    throw new Error('Vector DB client not initialized');
  }
  return milvusClient;
};

module.exports = {
  connectVectorDB,
  getVectorDBClient
};
