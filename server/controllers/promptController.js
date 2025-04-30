const Prompt = require('../models/Prompt');
const logger = require('../utils/logger');

/**
 * Get all prompts
 * @route GET /api/prompts
 */
exports.getPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ createdAt: -1 });
    res.json(prompts);
  } catch (err) {
    logger.error(`Error fetching prompts: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new prompt
 * @route POST /api/prompts
 */
exports.createPrompt = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    // Validate input
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const prompt = new Prompt({
      title,
      content,
      category: category || 'General',
      createdBy: req.user.id
    });

    await prompt.save();
    res.status(201).json(prompt);
  } catch (err) {
    logger.error(`Error creating prompt: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a prompt
 * @route PUT /api/prompts/:id
 */
exports.updatePrompt = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const prompt = await Prompt.findById(req.params.id);

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    // Update fields
    prompt.title = title || prompt.title;
    prompt.content = content || prompt.content;
    prompt.category = category || prompt.category;

    await prompt.save();
    res.json(prompt);
  } catch (err) {
    logger.error(`Error updating prompt: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a prompt
 * @route DELETE /api/prompts/:id
 */
exports.deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    await prompt.remove();
    res.json({ message: 'Prompt deleted' });
  } catch (err) {
    logger.error(`Error deleting prompt: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
}; 