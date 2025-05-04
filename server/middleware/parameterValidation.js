const { validateParameters } = require('../utils/parameterValidation');

const parameterValidation = (req, res, next) => {
  const { parameters } = req.body;
  
  if (!parameters) {
    return next();
  }

  try {
    validateParameters(parameters);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid parameters',
      error: error.message
    });
  }
};

module.exports = parameterValidation;