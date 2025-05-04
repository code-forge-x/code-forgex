const VectorEmbedding = require('../models/VectorEmbedding');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const csv = require('csv-writer').createObjectCsvWriter;
const embeddingsService = require('../services/embeddingsService');
const { asyncHandler } = require('../middleware/async');

/**
 * Get all embeddings
 * @route GET /api/embeddings
 */
exports.getAllEmbeddings = async (req, res) => {
  try {
    const embeddings = await VectorEmbedding.find()
      .sort({ created_at: -1 })
      .limit(100);
    res.json(embeddings);
  } catch (error) {
    logger.error(`Error fetching embeddings: ${error.message}`);
    res.status(500).json({ message: 'Error fetching embeddings', error: error.message });
  }
};

/**
 * Get all available model versions
 * @route GET /api/embeddings/models
 */
exports.getModels = async (req, res) => {
  try {
    const models = await VectorEmbedding.distinct('model_version');
    res.json(models);
  } catch (error) {
    logger.error(`Error fetching models: ${error.message}`);
    res.status(500).json({ message: 'Error fetching models', error: error.message });
  }
};

/**
 * Get embeddings for a specific model
 * @route GET /api/embeddings/model/:model
 */
exports.getModelEmbeddings = async (req, res) => {
  try {
    const embeddings = await VectorEmbedding.find({ model_version: req.params.model })
      .sort({ created_at: -1 })
      .limit(100);
    res.json(embeddings);
  } catch (error) {
    logger.error(`Error fetching model embeddings: ${error.message}`);
    res.status(500).json({ message: 'Error fetching model embeddings', error: error.message });
  }
};

/**
 * Get embedding for a specific prompt
 * @route GET /api/embeddings/prompt/:promptId
 */
exports.getPromptEmbedding = async (req, res) => {
  try {
    const embedding = await VectorEmbedding.findOne({ prompt_id: req.params.promptId })
      .sort({ created_at: -1 });

    if (!embedding) {
      return res.status(404).json({ message: 'Embedding not found' });
    }

    res.json(embedding);
  } catch (error) {
    logger.error(`Error fetching prompt embedding: ${error.message}`);
    res.status(500).json({ message: 'Error fetching prompt embedding', error: error.message });
  }
};

/**
 * Get version history for a prompt's embeddings
 * @route GET /api/embeddings/prompt/:promptId/versions
 */
exports.getPromptVersions = async (req, res) => {
  try {
    const versions = await VectorEmbedding.find({ prompt_id: req.params.promptId })
      .sort({ created_at: -1 })
      .select('version model_version created_at similarity');
    res.json(versions);
  } catch (error) {
    logger.error(`Error fetching prompt versions: ${error.message}`);
    res.status(500).json({ message: 'Error fetching prompt versions', error: error.message });
  }
};

/**
 * Create or update an embedding
 * @route POST /api/embeddings/prompt/:promptId
 */
exports.createOrUpdateEmbedding = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { embedding, model_version, metadata } = req.body;
    const promptId = req.params.promptId;

    // Calculate version number
    const latestVersion = await VectorEmbedding.findOne({ prompt_id: promptId })
      .sort({ version: -1 });
    const version = latestVersion ? latestVersion.version + 1 : 1;

    const vectorEmbedding = new VectorEmbedding({
      prompt_id: promptId,
      embedding,
      model_version,
      version,
      metadata
    });

    await vectorEmbedding.save();

    res.status(201).json(vectorEmbedding);
  } catch (error) {
    logger.error(`Error creating/updating embedding: ${error.message}`);
    res.status(500).json({ message: 'Error creating/updating embedding', error: error.message });
  }
};

/**
 * Find similar embeddings
 * @route POST /api/embeddings/similar
 */
exports.findSimilarEmbeddings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { embedding, threshold = 0.8, limit = 10 } = req.body;

    const similarEmbeddings = await VectorEmbedding.aggregate([
      {
        $addFields: {
          similarity: {
            $let: {
              vars: {
                dotProduct: {
                  $reduce: {
                    input: { $range: [0, { $size: '$embedding' }] },
                    initialValue: 0,
                    in: {
                      $add: [
                        '$$value',
                        {
                          $multiply: [
                            { $arrayElemAt: ['$embedding', '$$this'] },
                            { $arrayElemAt: [embedding, '$$this'] }
                          ]
                        }
                      ]
                    }
                  }
                },
                normA: {
                  $sqrt: {
                    $reduce: {
                      input: '$embedding',
                      initialValue: 0,
                      in: { $add: ['$$value', { $multiply: ['$$this', '$$this'] }] }
                    }
                  }
                },
                normB: {
                  $sqrt: {
                    $reduce: {
                      input: embedding,
                      initialValue: 0,
                      in: { $add: ['$$value', { $multiply: ['$$this', '$$this'] }] }
                    }
                  }
                }
              },
              in: {
                $divide: [
                  '$$dotProduct',
                  { $multiply: ['$$normA', '$$normB'] }
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          similarity: { $gte: threshold }
        }
      },
      {
        $sort: { similarity: -1 }
      },
      {
        $limit: limit
      }
    ]);

    res.json(similarEmbeddings);
  } catch (error) {
    logger.error(`Error finding similar embeddings: ${error.message}`);
    res.status(500).json({ message: 'Error finding similar embeddings', error: error.message });
  }
};

/**
 * Export embeddings to CSV
 * @route GET /api/embeddings/export
 */
exports.exportEmbeddings = async (req, res) => {
  try {
    const { model, format = 'csv' } = req.query;
    const query = model ? { model_version: model } : {};

    const embeddings = await VectorEmbedding.find(query)
      .select('prompt_id model_version version created_at metadata')
      .sort({ created_at: -1 });

    if (format === 'csv') {
      const csvWriter = csv.createObjectCsvWriter({
        path: 'embeddings.csv',
        header: [
          { id: 'prompt_id', title: 'Prompt ID' },
          { id: 'model_version', title: 'Model Version' },
          { id: 'version', title: 'Version' },
          { id: 'created_at', title: 'Created At' },
          { id: 'metadata', title: 'Metadata' }
        ]
      });

      await csvWriter.writeRecords(embeddings);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=embeddings-${model || 'all'}-${new Date().toISOString()}.csv`);
      res.download('embeddings.csv');
    } else {
      res.json(embeddings);
    }
  } catch (error) {
    logger.error(`Error exporting embeddings: ${error.message}`);
    res.status(500).json({ message: 'Error exporting embeddings', error: error.message });
  }
};

// @desc    Store template embedding
// @route   POST /api/embeddings/templates/:id
// @access  Private
exports.storeEmbedding = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { embedding } = req.body;

  await embeddingsService.storeEmbedding(id, embedding);

  logger.info(`Embedding stored for template ${id}`);

  res.status(201).json({
    success: true,
    message: 'Embedding stored successfully'
  });
});

// @desc    Search similar templates
// @route   POST /api/embeddings/search
// @access  Private
exports.searchSimilarTemplates = asyncHandler(async (req, res) => {
  const { embedding, limit = 5 } = req.body;

  const results = await embeddingsService.searchSimilarTemplates(embedding, limit);

  res.status(200).json({
    success: true,
    data: results
  });
});

// @desc    Delete template embedding
// @route   DELETE /api/embeddings/templates/:id
// @access  Private
exports.deleteEmbedding = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await embeddingsService.deleteEmbedding(id);

  logger.info(`Embedding deleted for template ${id}`);

  res.status(200).json({
    success: true,
    message: 'Embedding deleted successfully'
  });
});