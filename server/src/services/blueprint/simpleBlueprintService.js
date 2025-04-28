// server/src/services/blueprint/simpleBlueprintService.js
const fs = require('fs').promises;
const path = require('path');
const basicExtractionService = require('../extraction/basicExtractionService');

/**
 * Simple Blueprint Service
 * Generates system architecture blueprints based on extracted code
 * Part of the self-building system MVP
 */

class SimpleBlueprintService {
  /**
   * Generate a system blueprint from extracted code
   * @param {string} projectId - The project ID
   * @param {Array} extractedFiles - Array of extracted file data
   * @returns {Promise<Object>} - Generated blueprint
   */
  async generateBlueprint(projectId, extractedFiles) {
    try {
      // Identify components
      const components = this.identifyComponents(extractedFiles);
      
      // Identify services
      const services = this.identifyServices(extractedFiles);
      
      // Identify data models
      const models = this.identifyModels(extractedFiles);
      
      // Identify APIs
      const apis = this.identifyAPIs(extractedFiles);
      
      // Create relationships between different parts
      const relationships = this.createRelationships(components, services, models, apis);
      
      // Create the blueprint
      const blueprint = {
        projectId,
        components,
        services,
        models,
        apis,
        relationships,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Usually, this would be saved to a database
      // For the MVP, we're just returning the blueprint
      return blueprint;
    } catch (error) {
      console.error('Error generating blueprint:', error);
      throw error;
    }
  }
  
  /**
   * Generate a blueprint from a directory
   * @param {string} projectId - The project ID
   * @param {string} directoryPath - Path to the project directory
   * @returns {Promise<Object>} - Generated blueprint
   */
  async generateBlueprintFromDirectory(projectId, directoryPath) {
    try {
      // Extract code from directory
      const extractedFiles = await basicExtractionService.extractFromDirectory(directoryPath, {
        recursive: true,
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.py'],
        excludeDirs: ['node_modules', '.git', 'dist', 'build']
      });
      
      // Generate blueprint from extracted files
      return await this.generateBlueprint(projectId, extractedFiles);
    } catch (error) {
      console.error('Error generating blueprint from directory:', error);
      throw error;
    }
  }
  
  /**
   * Identify UI components from extracted files
   * @param {Array} extractedFiles - Array of extracted file data
   * @returns {Array} - Identified components
   */
  identifyComponents(extractedFiles) {
    const components = [];
    
    try {
      for (const file of extractedFiles) {
        if (file.components && file.components.length > 0) {
          // Look for React components
          const isReactFile = file.dependencies.some(dep => 
            dep === 'react' || dep.includes('react/')
          );
          
          if (isReactFile) {
            for (const comp of file.components) {
              components.push({
                name: comp,
                file: file.fileName,
                type: 'ui',
                language: file.language
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error identifying components:', error);
    }
    
    return components;
  }
  
  /**
   * Identify services from extracted files
   * @param {Array} extractedFiles - Array of extracted file data
   * @returns {Array} - Identified services
   */
  identifyServices(extractedFiles) {
    const services = [];
    
    try {
      for (const file of extractedFiles) {
        // Check if file name contains "service" or "manager"
        if (file.fileName.toLowerCase().includes('service') || 
            file.fileName.toLowerCase().includes('manager')) {
          
          // Identify service methods
          const methods = file.functions || [];
          
          services.push({
            name: path.basename(file.fileName, path.extname(file.fileName)),
            file: file.fileName,
            type: 'service',
            methods,
            language: file.language
          });
        }
      }
    } catch (error) {
      console.error('Error identifying services:', error);
    }
    
    return services;
  }
  
  /**
   * Identify data models from extracted files
   * @param {Array} extractedFiles - Array of extracted file data
   * @returns {Array} - Identified models
   */
  identifyModels(extractedFiles) {
    const models = [];
    
    try {
      for (const file of extractedFiles) {
        // Check if file name contains "model" or "schema"
        if (file.fileName.toLowerCase().includes('model') || 
            file.fileName.toLowerCase().includes('schema')) {
          
          // For JavaScript/TypeScript, look for mongoose schemas or class definitions
          if (file.language === 'javascript' || file.language === 'typescript') {
            const isMongooseModel = file.rawContent.includes('mongoose.Schema') || 
                                  file.rawContent.includes('new Schema');
            
            if (isMongooseModel) {
              // Extract schema fields using regex
              const fields = this.extractMongooseFields(file.rawContent);
              
              models.push({
                name: path.basename(file.fileName, path.extname(file.fileName)),
                file: file.fileName,
                type: 'mongoose',
                fields,
                language: file.language
              });
            } else {
              // Might be a class-based model
              models.push({
                name: path.basename(file.fileName, path.extname(file.fileName)),
                file: file.fileName,
                type: 'class',
                fields: [],
                language: file.language
              });
            }
          } else if (file.language === 'python') {
            // Check for SQLAlchemy models
            const isSQLAlchemyModel = file.rawContent.includes('db.Model') || 
                                    file.rawContent.includes('Base.Model');
            
            if (isSQLAlchemyModel) {
              models.push({
                name: path.basename(file.fileName, path.extname(file.fileName)),
                file: file.fileName,
                type: 'sqlalchemy',
                fields: [],
                language: file.language
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error identifying models:', error);
    }
    
    return models;
  }
  
  /**
   * Extract Mongoose schema fields
   * @param {string} content - File content
   * @returns {Array} - Extracted fields
   */
  extractMongooseFields(content) {
    const fields = [];
    
    try {
      // This is a simple regex approach - in a real implementation,
      // you would want to use a proper parser
      const schemaRegex = /(?:new\s+(?:mongoose\.)?Schema\s*\()({[^}]+})/;
      const match = schemaRegex.exec(content);
      
      if (match && match[1]) {
        const schemaContent = match[1];
        
        // Extract field names
        const fieldRegex = /(\w+)\s*:\s*{[^}]*}/g;
        let fieldMatch;
        
        while ((fieldMatch = fieldRegex.exec(schemaContent)) !== null) {
          fields.push(fieldMatch[1]);
        }
      }
    } catch (error) {
      console.error('Error extracting Mongoose fields:', error);
    }
    
    return fields;
  }
  
  /**
   * Identify APIs from extracted files
   * @param {Array} extractedFiles - Array of extracted file data
   * @returns {Array} - Identified APIs
   */
  identifyAPIs(extractedFiles) {
    const apis = [];
    
    try {
      for (const file of extractedFiles) {
        // Check if file name contains "route", "controller", or "api"
        if (file.fileName.toLowerCase().includes('route') || 
            file.fileName.toLowerCase().includes('controller') || 
            file.fileName.toLowerCase().includes('api')) {
          
          // Look for Express.js routes
          if (file.language === 'javascript' || file.language === 'typescript') {
            const isExpressAPI = file.rawContent.includes('express.Router') || 
                               file.rawContent.includes('app.get') || 
                               file.rawContent.includes('app.post') || 
                               file.rawContent.includes('router.get') || 
                               file.rawContent.includes('router.post');
            
            if (isExpressAPI) {
              // Extract routes
              const routes = this.extractExpressRoutes(file.rawContent);
              
              apis.push({
                name: path.basename(file.fileName, path.extname(file.fileName)),
                file: file.fileName,
                type: 'express',
                endpoints: routes,
                language: file.language
              });
            }
          } else if (file.language === 'python') {
            // Check for Flask or FastAPI
            const isFlaskAPI = file.rawContent.includes('@app.route') || 
                             file.rawContent.includes('from flask import');
            
            const isFastAPI = file.rawContent.includes('from fastapi import') || 
                            file.rawContent.includes('@app.get') || 
                            file.rawContent.includes('@app.post');
            
            if (isFlaskAPI) {
              apis.push({
                name: path.basename(file.fileName, path.extname(file.fileName)),
                file: file.fileName,
                type: 'flask',
                endpoints: [],
                language: file.language
              });
            } else if (isFastAPI) {
              apis.push({
                name: path.basename(file.fileName, path.extname(file.fileName)),
                file: file.fileName,
                type: 'fastapi',
                endpoints: [],
                language: file.language
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error identifying APIs:', error);
    }
    
    return apis;
  }
  
  /**
   * Extract Express.js routes
   * @param {string} content - File content
   * @returns {Array} - Extracted routes
   */
  extractExpressRoutes(content) {
    const routes = [];
    
    try {
      // Match route definitions
      const routeRegex = /(?:app|router)\.(?:get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = routeRegex.exec(content)) !== null) {
        routes.push(match[1]);
      }
    } catch (error) {
      console.error('Error extracting Express routes:', error);
    }
    
    return routes;
  }
  
  /**
   * Create relationships between components
   * @param {Array} components - UI components
   * @param {Array} services - Services
   * @param {Array} models - Data models
   * @param {Array} apis - API endpoints
   * @returns {Array} - Component relationships
   */
  createRelationships(components, services, models, apis) {
    const relationships = [];
    
    try {
      // Map file names to component names for easier lookup
      const componentMap = {};
      for (const comp of components) {
        componentMap[comp.name] = comp;
      }
      
      // Check for component-to-component relationships
      for (const file of Object.values(componentMap)) {
        for (const otherComp of components) {
          if (file.name !== otherComp.name) {
            // Check if one component imports or uses another
            const filename = path.basename(file.file, path.extname(file.file));
            if (file.file.includes(otherComp.name) || filename.includes(otherComp.name)) {
              relationships.push({
                from: file.name,
                to: otherComp.name,
                type: 'imports'
              });
            }
          }
        }
      }
      
      // Check for component-to-service relationships
      for (const comp of components) {
        for (const service of services) {
          // Check if component imports service
          if (comp.file.includes(service.name)) {
            relationships.push({
              from: comp.name,
              to: service.name,
              type: 'uses'
            });
          }
        }
      }
      
      // Check for service-to-model relationships
      for (const service of services) {
        for (const model of models) {
          // Check if service imports model
          if (service.file.includes(model.name)) {
            relationships.push({
              from: service.name,
              to: model.name,
              type: 'uses'
            });
          }
        }
      }
      
      // Check for API-to-service relationships
      for (const api of apis) {
        for (const service of services) {
          // Check if API imports service
          if (api.file.includes(service.name)) {
            relationships.push({
              from: api.name,
              to: service.name,
              type: 'calls'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error creating relationships:', error);
    }
    
    return relationships;
  }
}

module.exports = new SimpleBlueprintService();