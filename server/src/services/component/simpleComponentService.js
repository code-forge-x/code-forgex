// server/src/services/component/simpleComponentService.js
const fs = require('fs').promises;
const path = require('path');
const promptManager = require('../prompt/promptManager');

/**
 * Simple Component Service
 * Generates code components based on templates and blueprint information
 * Part of the self-building system MVP
 */

class SimpleComponentService {
  /**
   * Generate a code component
   * @param {string} projectId - The project ID
   * @param {Object} componentData - Component data (type, name, description, etc.)
   * @returns {Promise<Object>} - Generated component
   */
  async generateComponent(projectId, componentData) {
    try {
      const { type, name, description, framework } = componentData;
      
      // Get appropriate template based on component type and framework
      const templateName = `component_${type}_${framework}`;
      const template = await promptManager.getProjectPrompt(projectId, templateName);
      
      let code = '';
      
      if (template) {
        // Use template to generate component
        code = this.fillTemplate(template.content, {
          name,
          description: description || '',
          ...componentData
        });
        
        // Track template usage
        await promptManager.trackPerformance(
          template._id,
          `COMP-${name}`,
          { input: 100, output: code.length / 2, total: 100 + code.length / 2 },
          500, // Mock latency
          true
        );
      } else {
        // Fall back to basic component generation
        code = this.generateBasicComponent(type, name, framework);
      }
      
      // Add metadata and return
      return {
        name,
        type,
        framework,
        description: description || '',
        code,
        createdAt: new Date(),
        generatedBy: 'simple-component-service'
      };
    } catch (error) {
      console.error('Error generating component:', error);
      throw error;
    }
  }
  
  /**
   * Generate multiple related components
   * @param {string} projectId - The project ID
   * @param {Array} components - Array of component data
   * @returns {Promise<Array>} - Generated components
   */
  async generateRelatedComponents(projectId, components) {
    try {
      const results = [];
      
      for (const componentData of components) {
        const component = await this.generateComponent(projectId, componentData);
        results.push(component);
      }
      
      return results;
    } catch (error) {
      console.error('Error generating related components:', error);
      throw error;
    }
  }
  
  /**
   * Fill template with component data
   * @param {string} template - Template string
   * @param {Object} data - Component data
   * @returns {string} - Filled template
   */
  fillTemplate(template, data) {
    let result = template;
    
    // Replace all {{key}} with corresponding values
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }
  
  /**
   * Generate a basic component without templates
   * @param {string} type - Component type
   * @param {string} name - Component name
   * @param {string} framework - Framework (react, vue, etc.)
   * @returns {string} - Generated component code
   */
  generateBasicComponent(type, name, framework) {
    if (framework === 'react') {
      if (type === 'ui') {
        return this.generateReactUIComponent(name);
      } else if (type === 'container') {
        return this.generateReactContainerComponent(name);
      } else if (type === 'hook') {
        return this.generateReactHook(name);
      }
    } else if (framework === 'vue') {
      return this.generateVueComponent(name, type);
    }
    
    // Default to React UI component
    return this.generateReactUIComponent(name);
  }
  
  /**
   * Generate a basic React UI component
   * @param {string} name - Component name
   * @returns {string} - Generated component code
   */
  generateReactUIComponent(name) {
    return `import React from 'react';

/**
 * ${name} - UI Component
 */
const ${name} = ({ children, ...props }) => {
  return (
    <div className="${name.toLowerCase()}" {...props}>
      {children}
    </div>
  );
};

export default ${name};
`;
  }
  
  /**
   * Generate a React container component
   * @param {string} name - Component name
   * @returns {string} - Generated component code
   */
  generateReactContainerComponent(name) {
    return `import React, { useState, useEffect } from 'react';

/**
 * ${name} - Container Component
 */
const ${name} = ({ children, ...props }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data here
        setData({});
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="${name.toLowerCase()}-container" {...props}>
      {children}
    </div>
  );
};

export default ${name};
`;
  }
  
  /**
   * Generate a React hook
   * @param {string} name - Hook name
   * @returns {string} - Generated hook code
   */
  generateReactHook(name) {
    // Ensure hook name starts with "use"
    const hookName = name.startsWith('use') ? name : `use${name}`;
    
    return `import { useState, useEffect } from 'react';

/**
 * ${hookName} - Custom React Hook
 */
const ${hookName} = (initialValue) => {
  const [value, setValue] = useState(initialValue);

  // Add your hook logic here

  return { value, setValue };
};

export default ${hookName};
`;
  }
  
  /**
   * Generate a Vue component
   * @param {string} name - Component name
   * @param {string} type - Component type
   * @returns {string} - Generated component code
   */
  generateVueComponent(name, type) {
    return `<template>
  <div class="${name.toLowerCase()}">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: '${name}',
  props: {
    // Define props here
  },
  data() {
    return {
      // Component data
    };
  },
  methods: {
    // Component methods
  }
};
</script>

<style scoped>
.${name.toLowerCase()} {
  /* Component styles */
}
</style>
`;
  }
  
  /**
   * Save a generated component to a file
   * @param {string} outputDir - Output directory
   * @param {Object} component - Component data
   * @returns {Promise<string>} - Path to saved file
   */
  async saveComponent(outputDir, component) {
    try {
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });
      
      // Determine file extension based on framework
      let extension = '.js';
      if (component.framework === 'react' && component.type === 'ui') {
        extension = '.jsx';
      } else if (component.framework === 'vue') {
        extension = '.vue';
      } else if (component.framework === 'typescript') {
        extension = component.type === 'ui' ? '.tsx' : '.ts';
      }
      
      // Create file path
      const filePath = path.join(outputDir, `${component.name}${extension}`);
      
      // Write component code to file
      await fs.writeFile(filePath, component.code, 'utf8');
      
      return filePath;
    } catch (error) {
      console.error('Error saving component:', error);
      throw error;
    }
  }
  
  /**
   * Implement simple approval workflow for generated components
   * @param {string} projectId - The project ID
   * @param {Array} components - Array of generated components
   * @returns {Promise<Object>} - Workflow result
   */
  async implementApprovalWorkflow(projectId, components) {
    try {
      // In a real implementation, this would create approval requests
      // For MVP, we'll just mark all components as approved
      
      const result = {
        projectId,
        totalComponents: components.length,
        approvedComponents: components.length,
        pendingComponents: 0,
        status: 'completed',
        createdAt: new Date()
      };
      
      return result;
    } catch (error) {
      console.error('Error implementing approval workflow:', error);
      throw error;
    }
  }
}

module.exports = new SimpleComponentService();