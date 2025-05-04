const PerformanceMetrics = require('../models/PerformanceMetrics');

const performanceTracking = async (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function (body) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Create performance metrics
    const metrics = new PerformanceMetrics({
      prompt_id: req.params.id || req.body.prompt_id,
      timestamp: new Date(),
      success_rate: res.statusCode < 400 ? 1 : 0,
      token_usage: req.body.token_usage || 0,
      response_time: responseTime,
      error_count: res.statusCode >= 400 ? 1 : 0,
      user_id: req.user ? req.user._id : null,
      environment: process.env.NODE_ENV || 'development',
      metadata: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode
      }
    });

    // Save metrics asynchronously
    metrics.save().catch(err => {
      console.error('Error saving performance metrics:', err);
    });

    return originalSend.call(this, body);
  };

  next();
};

module.exports = performanceTracking;