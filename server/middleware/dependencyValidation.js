const { validateDependencies } = require('../utils/dependencyResolution');

const dependencyValidation = async (req, res, next) => {
  const { dependencies } = req.body;
  
  if (!dependencies) {
    return next();
  }

  try {
    await validateDependencies(req.params.id || req.body._id, dependencies);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid dependencies',
      error: error.message
    });
  }
};

module.exports = dependencyValidation;