const Message = require('../models/Message');
const logger = require('../utils/logger');

/**
 * Get user's messages
 * @route GET /api/messages
 */
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .populate('projectId', 'name');
    
    res.json(messages);
  } catch (err) {
    logger.error(`Error fetching messages: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new message
 * @route POST /api/messages
 */
exports.createMessage = async (req, res) => {
  try {
    const { recipient, subject, content, projectId } = req.body;

    // Create a preview of the message
    const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;

    const message = new Message({
      sender: req.user.id,
      recipient,
      subject,
      content,
      preview,
      projectId
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    logger.error(`Error creating message: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Mark message as read
 * @route PUT /api/messages/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.isRead = true;
    await message.save();

    res.json(message);
  } catch (err) {
    logger.error(`Error marking message as read: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
}; 