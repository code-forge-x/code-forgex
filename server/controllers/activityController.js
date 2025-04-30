const Activity = require('../models/Activity');
const logger = require('../utils/logger');

/**
 * Get user's recent activities
 * @route GET /api/activity
 */
exports.getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(10);
    
    res.json(activities);
  } catch (err) {
    logger.error(`Error fetching user activities: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new activity
 * @route POST /api/activity
 */
exports.createActivity = async (req, res) => {
  try {
    const { type, action, description, metadata } = req.body;

    const activity = new Activity({
      userId: req.user.id,
      type,
      action,
      description,
      metadata
    });

    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    logger.error(`Error creating activity: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
}; 