const Prompt = require('../models/Prompt');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Get all prompts with pagination, sorting, and search
exports.getAllPrompts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search = '',
      category,
      status
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    // Get total count
    const total = await Prompt.countDocuments(query);

    // Get paginated results
    const prompts = await Prompt.find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      data: prompts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Error fetching prompts: ${error.message}`);
    res.status(500).json({ message: 'Error fetching prompts', error: error.message });
  }
};

// Get a specific prompt by ID
exports.getPromptById = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('dependencies');

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    res.json(prompt);
  } catch (error) {
    logger.error(`Error fetching prompt: ${error.message}`);
    res.status(500).json({ message: 'Error fetching prompt', error: error.message });
  }
};

// Create a new prompt
exports.createPrompt = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      category,
      parameters,
      dependencies,
      tags
    } = req.body;

    // Check if prompt with same title exists
    const existingPrompt = await Prompt.findOne({ title });
    if (existingPrompt) {
      return res.status(400).json({ message: 'A prompt with this title already exists' });
    }

    const prompt = new Prompt({
      title,
      content,
      category,
      parameters,
      dependencies,
      tags,
      version: 1,
      status: 'active',
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await prompt.save();
    res.status(201).json(prompt);
  } catch (error) {
    logger.error(`Error creating prompt: ${error.message}`);
    res.status(500).json({ message: 'Error creating prompt', error: error.message });
  }
};

// Update a prompt
exports.updatePrompt = async (req, res) => {
  try {
    const {
      content,
      description,
      category,
      parameters,
      dependencies,
      tags,
      status
    } = req.body;

    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    // Create new version if content or parameters changed
    if (content !== prompt.content || JSON.stringify(parameters) !== JSON.stringify(prompt.parameters)) {
      const newVersion = new Prompt({
        ...prompt.toObject(),
        _id: undefined,
        version: prompt.version + 1,
        content,
        parameters,
        updatedBy: req.user.id,
        createdAt: new Date()
      });

      await newVersion.save();
      res.json(newVersion);
    } else {
      // Update existing version
      prompt.description = description || prompt.description;
      prompt.category = category || prompt.category;
      prompt.dependencies = dependencies || prompt.dependencies;
      prompt.tags = tags || prompt.tags;
      prompt.status = status || prompt.status;
      prompt.updatedBy = req.user.id;

      await prompt.save();
      res.json(prompt);
    }
  } catch (error) {
    logger.error(`Error updating prompt: ${error.message}`);
    res.status(500).json({ message: 'Error updating prompt', error: error.message });
  }
};

// Delete a prompt
exports.deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    // Soft delete
    prompt.isActive = false;
    prompt.updatedBy = req.user.id;
    await prompt.save();

    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting prompt: ${error.message}`);
    res.status(500).json({ message: 'Error deleting prompt', error: error.message });
  }
};

// Get all versions of a prompt
exports.getPromptVersions = async (req, res) => {
  try {
    const versions = await Prompt.find({
      name: req.params.name
    })
      .sort({ version: -1 })
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');

    if (!versions.length) {
      return res.status(404).json({ message: 'No versions found for this prompt' });
    }

    res.json(versions);
  } catch (error) {
    logger.error(`Error fetching prompt versions: ${error.message}`);
    res.status(500).json({ message: 'Error fetching prompt versions', error: error.message });
  }
};

// Get prompt metrics
exports.getPromptMetrics = async (req, res) => {
  try {
    const metrics = await Prompt.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$name',
          totalVersions: { $sum: 1 },
          latestVersion: { $max: '$version' },
          totalUses: { $sum: { $ifNull: ['$metadata.usageCount', 0] } },
          averageResponseTime: { $avg: { $ifNull: ['$metadata.averageResponseTime', 0] } },
          successRate: { $avg: { $ifNull: ['$metadata.successRate', 0] } }
        }
      },
      { $sort: { totalUses: -1 } }
    ]);

    res.json(metrics);
  } catch (error) {
    logger.error(`Error fetching prompt metrics: ${error.message}`);
    res.status(500).json({ message: 'Error fetching prompt metrics', error: error.message });
  }
};