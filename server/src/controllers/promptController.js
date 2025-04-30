const Prompt = require('../models/Prompt');
const { validationResult } = require('express-validator');

// Get all prompts
exports.getAllPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find({ isActive: true })
      .sort({ name: 1, version: -1 })
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');
    
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompts', error: error.message });
  }
};

// Get a specific prompt by name
exports.getPromptByName = async (req, res) => {
  try {
    const prompt = await Prompt.findOne({
      name: req.params.name,
      isActive: true
    }).populate('createdBy', 'username')
      .populate('updatedBy', 'username');

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    res.json(prompt);
  } catch (error) {
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

    const { name, content, description, variables, category, tags } = req.body;
    
    // Check if prompt with same name exists
    const existingPrompt = await Prompt.findOne({ name });
    if (existingPrompt) {
      return res.status(400).json({ message: 'A prompt with this name already exists' });
    }

    const prompt = new Prompt({
      name,
      content,
      description,
      variables,
      category,
      tags,
      createdBy: req.user.id
    });

    await prompt.save();
    res.status(201).json(prompt);
  } catch (error) {
    res.status(500).json({ message: 'Error creating prompt', error: error.message });
  }
};

// Update a prompt
exports.updatePrompt = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, description, variables, category, tags } = req.body;
    
    // Get the current version
    const currentPrompt = await Prompt.findOne({
      name: req.params.name,
      isActive: true
    });

    if (!currentPrompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    // Create new version
    const newVersion = await Prompt.getNextVersion(req.params.name);
    const prompt = new Prompt({
      name: req.params.name,
      version: newVersion,
      content,
      description,
      variables,
      category,
      tags,
      createdBy: currentPrompt.createdBy,
      updatedBy: req.user.id
    });

    await prompt.save();
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ message: 'Error updating prompt', error: error.message });
  }
};

// Delete a prompt
exports.deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findOneAndUpdate(
      { name: req.params.name, isActive: true },
      { isActive: false, updatedBy: req.user.id },
      { new: true }
    );

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prompt', error: error.message });
  }
};

// Get all versions of a prompt
exports.getPromptVersions = async (req, res) => {
  try {
    const versions = await Prompt.find({
      name: req.params.name
    }).sort({ version: -1 })
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');

    if (!versions.length) {
      return res.status(404).json({ message: 'No versions found for this prompt' });
    }

    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompt versions', error: error.message });
  }
};

// Test a prompt with variables
exports.testPrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findOne({
      name: req.params.name,
      isActive: true
    });

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    const { variables } = req.body;
    const processedContent = prompt.replaceVariables(variables);

    res.json({
      originalContent: prompt.content,
      processedContent,
      variables
    });
  } catch (error) {
    res.status(400).json({ message: 'Error testing prompt', error: error.message });
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
    res.status(500).json({ message: 'Error fetching prompt metrics', error: error.message });
  }
}; 