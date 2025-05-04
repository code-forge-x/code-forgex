const Prompt = require('../models/Prompt');

const resolveDependencies = async (promptId) => {
  const prompt = await Prompt.findById(promptId);
  if (!prompt) {
    throw new Error('Prompt not found');
  }

  const resolvedDependencies = [];
  const unresolvedDependencies = new Set(prompt.dependencies || []);
  const visited = new Set([promptId]);

  while (unresolvedDependencies.size > 0) {
    const currentId = unresolvedDependencies.values().next().value;
    unresolvedDependencies.delete(currentId);

    if (visited.has(currentId)) {
      continue;
    }

    const dependency = await Prompt.findById(currentId);
    if (!dependency) {
      throw new Error(`Dependency ${currentId} not found`);
    }

    resolvedDependencies.push({
      id: dependency._id,
      name: dependency.name,
      version: dependency.version,
      content: dependency.content
    });

    visited.add(currentId);

    // Add new dependencies to the unresolved set
    (dependency.dependencies || []).forEach(depId => {
      if (!visited.has(depId)) {
        unresolvedDependencies.add(depId);
      }
    });
  }

  return resolvedDependencies;
};

const validateDependencies = async (promptId, dependencies) => {
  const prompt = await Prompt.findById(promptId);
  if (!prompt) {
    throw new Error('Prompt not found');
  }

  const visited = new Set([promptId]);
  const queue = [...dependencies];

  while (queue.length > 0) {
    const currentId = queue.shift();
    
    if (visited.has(currentId)) {
      throw new Error(`Circular dependency detected: ${currentId}`);
    }

    const dependency = await Prompt.findById(currentId);
    if (!dependency) {
      throw new Error(`Dependency ${currentId} not found`);
    }

    visited.add(currentId);

    // Add new dependencies to the queue
    (dependency.dependencies || []).forEach(depId => {
      queue.push(depId);
    });
  }

  return true;
};

module.exports = {
  resolveDependencies,
  validateDependencies
};