const Template = require('../models/Template');
const logger = require('../utils/logger');

class DependencyService {
  async resolveDependencies(templateId, version) {
    try {
      const template = await Template.findOne({ _id: templateId, version });
      if (!template) {
        throw new Error('Template not found');
      }

      const resolvedDependencies = await this.resolveDependencyTree(template.dependencies);
      return resolvedDependencies;
    } catch (error) {
      logger.error('Failed to resolve dependencies:', error);
      throw error;
    }
  }

  async resolveDependencyTree(dependencies) {
    const resolved = new Map();
    const unresolved = new Set();

    for (const dep of dependencies) {
      await this.resolveDependency(dep, resolved, unresolved);
    }

    return Array.from(resolved.values());
  }

  async resolveDependency(dependency, resolved, unresolved) {
    const key = `${dependency.name}@${dependency.version}`;
    
    if (resolved.has(key)) {
      return resolved.get(key);
    }

    if (unresolved.has(key)) {
      throw new Error(`Circular dependency detected: ${key}`);
    }

    unresolved.add(key);

    try {
      const template = await Template.findOne({
        name: dependency.name,
        version: dependency.version,
        status: 'published'
      });

      if (!template) {
        throw new Error(`Dependency not found: ${key}`);
      }

      // Validate dependency type
      if (template.category !== dependency.type) {
        throw new Error(`Invalid dependency type for ${key}: expected ${dependency.type}, got ${template.category}`);
      }

      // Resolve nested dependencies
      const nestedDependencies = await this.resolveDependencyTree(template.dependencies);

      const resolvedDependency = {
        name: template.name,
        version: template.version,
        type: template.category,
        content: template.content,
        parameters: template.parameters,
        dependencies: nestedDependencies
      };

      resolved.set(key, resolvedDependency);
      unresolved.delete(key);

      return resolvedDependency;
    } catch (error) {
      logger.error(`Failed to resolve dependency ${key}:`, error);
      throw error;
    }
  }

  async validateDependencies(template) {
    try {
      const dependencies = template.dependencies || [];
      const errors = [];

      for (const dep of dependencies) {
        // Check if dependency exists
        const exists = await Template.exists({
          name: dep.name,
          version: dep.version,
          status: 'published'
        });

        if (!exists) {
          errors.push(`Dependency not found: ${dep.name}@${dep.version}`);
          continue;
        }

        // Check for circular dependencies
        try {
          await this.resolveDependencies(template._id, template.version);
        } catch (error) {
          if (error.message.includes('Circular dependency')) {
            errors.push(error.message);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      logger.error('Failed to validate dependencies:', error);
      throw error;
    }
  }

  async getDependencyGraph(templateId, version) {
    try {
      const template = await Template.findOne({ _id: templateId, version });
      if (!template) {
        throw new Error('Template not found');
      }

      const graph = {
        nodes: new Set(),
        edges: new Set()
      };

      await this.buildDependencyGraph(template, graph);

      return {
        nodes: Array.from(graph.nodes),
        edges: Array.from(graph.edges)
      };
    } catch (error) {
      logger.error('Failed to build dependency graph:', error);
      throw error;
    }
  }

  async buildDependencyGraph(template, graph) {
    const nodeId = `${template.name}@${template.version}`;
    graph.nodes.add({
      id: nodeId,
      name: template.name,
      version: template.version,
      type: template.category
    });

    for (const dep of template.dependencies) {
      const depNodeId = `${dep.name}@${dep.version}`;
      graph.edges.add({
        from: nodeId,
        to: depNodeId
      });

      const depTemplate = await Template.findOne({
        name: dep.name,
        version: dep.version
      });

      if (depTemplate) {
        await this.buildDependencyGraph(depTemplate, graph);
      }
    }
  }
}

module.exports = new DependencyService();