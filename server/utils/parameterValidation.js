const validateParameters = (parameters) => {
  if (!Array.isArray(parameters)) {
    throw new Error('Parameters must be an array');
  }

  for (const param of parameters) {
    // Check required fields
    if (!param.name || typeof param.name !== 'string') {
      throw new Error('Parameter must have a valid name');
    }

    if (!param.type || !['string', 'number', 'boolean', 'array', 'object'].includes(param.type)) {
      throw new Error('Parameter must have a valid type');
    }

    // Validate description if provided
    if (param.description && typeof param.description !== 'string') {
      throw new Error('Parameter description must be a string');
    }

    // Validate default value if provided
    if (param.default !== undefined) {
      switch (param.type) {
        case 'string':
          if (typeof param.default !== 'string') {
            throw new Error(`Default value for ${param.name} must be a string`);
          }
          break;
        case 'number':
          if (typeof param.default !== 'number') {
            throw new Error(`Default value for ${param.name} must be a number`);
          }
          break;
        case 'boolean':
          if (typeof param.default !== 'boolean') {
            throw new Error(`Default value for ${param.name} must be a boolean`);
          }
          break;
        case 'array':
          if (!Array.isArray(param.default)) {
            throw new Error(`Default value for ${param.name} must be an array`);
          }
          break;
        case 'object':
          if (typeof param.default !== 'object' || Array.isArray(param.default)) {
            throw new Error(`Default value for ${param.name} must be an object`);
          }
          break;
      }
    }

    // Validate constraints if provided
    if (param.constraints) {
      if (typeof param.constraints !== 'object') {
        throw new Error('Parameter constraints must be an object');
      }

      if (param.constraints.min !== undefined && typeof param.constraints.min !== 'number') {
        throw new Error('Minimum constraint must be a number');
      }

      if (param.constraints.max !== undefined && typeof param.constraints.max !== 'number') {
        throw new Error('Maximum constraint must be a number');
      }

      if (param.constraints.pattern && !(param.constraints.pattern instanceof RegExp)) {
        throw new Error('Pattern constraint must be a regular expression');
      }

      if (param.constraints.enum && !Array.isArray(param.constraints.enum)) {
        throw new Error('Enum constraint must be an array');
      }
    }
  }
};

module.exports = {
  validateParameters
};