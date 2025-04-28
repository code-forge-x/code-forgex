const Project = require('../../models/Project');
const promptManager = require('../prompt/promptManager');
const blueprintService = require('../blueprint/blueprintService');
const componentService = require('../component/componentService');
const techSupportService = require('../techsupport/techSupportService');
const logger = require('../../utils/logger');
const claudeClient = require('../../services/ai/claudeClient');

class ChatService {
  async processMessage(projectId, message, userId) {
    try {
      // Find the project
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      
      // Determine the current phase based on project status
      const phase = this.determinePhase(project);
      
      logger.info(`Processing message for project ${projectId} in phase: ${phase}`);
      
      // Process message according to the current phase
      switch (phase) {
        case 'requirements':
          return await this.processRequirements(projectId, message, userId);
        case 'blueprint':
          return await this.processBlueprint(projectId, message, userId);
        case 'component':
          return await this.processComponent(projectId, message, userId);
        case 'support':
          return await this.processSupport(projectId, message, userId);
        default:
          // Default to general response
          return await this.processGeneralQuery(projectId, message, userId);
      }
    } catch (error) {
      logger.error(`Error processing message: ${error.message}`, error);
      return {
        message: `I encountered an error processing your message. Please try again or contact support. Error: ${error.message}`,
        metadata: { type: 'error', error: error.message }
      };
    }
  }

  determinePhase(project) {
    if (!project.status || project.status === 'created') {
      return 'requirements';
    } else if (project.status === 'requirements_completed' || project.status.includes('blueprint')) {
      return 'blueprint';
    } else if (project.status.includes('component')) {
      return 'component';
    } else if (project.status === 'completed') {
      return 'support';
    }
    // Fallback to requirements if unknown status
    return 'requirements';
  }

  async processRequirements(projectId, message, userId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');

      // First, determine if the message is a direct question or instruction
      const intent = await this.determineIntent(message);
      
      // If it's not meant to update requirements, process it as a query
      if (intent === 'query') {
        return await this.processGeneralQuery(projectId, message, userId, project);
      }

      // Use NLP to extract requirements from natural language
      const extractedData = await this.extractRequirementsFromMessage(message);
      
      // Log the extracted data for debugging
      logger.info(`Extracted requirements from message: ${JSON.stringify(extractedData)}`);
      
      // Update project with non-null values
      let wasUpdated = false;
      if (extractedData.name) {
        project.name = extractedData.name;
        wasUpdated = true;
      }
      if (extractedData.description) {
        project.description = extractedData.description;
        wasUpdated = true;
      }
      if (extractedData.requirements) {
        project.requirements = extractedData.requirements;
        wasUpdated = true;
      }
      if (extractedData.techStack && extractedData.techStack.length > 0) {
        project.techStack = extractedData.techStack;
        wasUpdated = true;
      }
      if (extractedData.financialDomain) {
        project.financialDomain = extractedData.financialDomain;
        wasUpdated = true;
      }
      if (extractedData.tradingVenue) {
        project.tradingVenue = extractedData.tradingVenue;
        wasUpdated = true;
      }

      // Only save if something was updated
      if (wasUpdated) {
        project.updatedAt = Date.now();
        await project.save();
      }

      // Determine if we have enough info to proceed
      const isComplete = this.areRequirementsComplete(project);
      if (isComplete && project.status !== 'requirements_completed') {
        project.status = 'requirements_completed';
        await project.save();
        wasUpdated = true;
      }
      
      return {
        message: this.generateRequirementsResponse(project, isComplete, message),
        metadata: { 
          type: 'requirements_update',
          requirementsComplete: isComplete
        },
        updateProject: wasUpdated,
        projectData: wasUpdated ? project : null,
        nextPhase: isComplete ? 'blueprint' : null
      };
    } catch (error) {
      console.error("❌ Error in processRequirements:", error);
      logger.error('Error processing requirements:', error);
      throw error;
    }
  }

  async processBlueprint(projectId, message, userId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');

      // Check if this is a request to generate or modify blueprint
      const intent = await this.determineIntent(message);
      logger.info(`Blueprint intent for message: ${intent}`);
      
      if (intent === 'generate' && !project.blueprint) {
        // Generate blueprint
        const blueprint = await blueprintService.generateBlueprint(
          projectId,
          project.requirements,
          project.techStack
        );
        
        project.blueprint = blueprint;
        project.status = 'blueprint_generated';
        await project.save();

        return {
          message: `I've generated the architecture blueprint for your ${project.financialDomain || 'trading'} application. Here's what I've designed based on your requirements. Let me know if you'd like any changes to this architecture.`,
          metadata: { 
            type: 'blueprint_generated',
            blueprint: blueprint
          },
          updateProject: true,
          projectData: project
        };
      } else if (intent === 'approve' || message.toLowerCase().includes('yes')) {
        // Handle approval of blueprint
        project.status = 'blueprint_approved';
        await project.save();

        return {
          message: 'Great! The blueprint is approved. I\'ll now proceed with component generation. Which component would you like me to work on first?',
          metadata: { type: 'phase_transition' },
          updateProject: true,
          projectData: project,
          nextPhase: 'component'
        };
      } else if (intent === 'modify') {
        // Handle modification request
        const response = await this.handleBlueprintModification(project, message);
        return response;
      } else if (intent === 'query') {
        // Handle questions about the blueprint
        return await this.handleBlueprintQuery(project, message);
      } else {
        // Fallback to general message processing
        return await this.processGeneralQuery(projectId, message, userId, project);
      }
    } catch (error) {
      logger.error('Error processing blueprint:', error);
      throw error;
    }
  }

  async processComponent(projectId, message, userId) {
    try {
      const project = await Project.findById(projectId).populate('components');
      if (!project) throw new Error('Project not found');

      const intent = await this.determineIntent(message);
      logger.info(`Component intent for message: ${intent}`);
      
      if (intent === 'generate') {
        // Determine which component to generate next
        const nextComponent = this.getNextComponent(project);
        if (!nextComponent) {
          return {
            message: 'All components have been generated! Your trading application is ready. Is there anything specific you\'d like to know about the components?',
            metadata: { type: 'generation_complete' },
            nextPhase: 'support'
          };
        }

        // Generate component - Uncomment when componentService is ready
        try {
          const result = await componentService.generateComponent(projectId, nextComponent._id);
          
          return {
            message: `I've generated the ${nextComponent.name} component. Here's what was created:`,
            metadata: { 
              type: 'component_generated',
              component: result.component,
              files: result.files
            },
            updateProject: true,
            projectData: project
          };
        } catch (error) {
          logger.error('Component generation error:', error);
          // Fallback message if component generation fails
          return {
            message: `I tried to generate the ${nextComponent.name} component, but encountered an issue. Would you like me to try a different component?`,
            metadata: {
              type: 'component_error',
              componentName: nextComponent.name,
              error: error.message
            }
          };
        }
      } else if (intent === 'query') {
        // Handle specific component questions
        return await this.handleComponentQuery(project, message);
      } else {
        // Fallback to general message processing
        return await this.processGeneralQuery(projectId, message, userId, project);
      }
    } catch (error) {
      logger.error('Error processing component:', error);
      throw error;
    }
  }

  async processSupport(projectId, message, userId) {
    try {
      // Use the general query handler for support questions
      return await this.processGeneralQuery(projectId, message, userId);
    } catch (error) {
      logger.error('Error processing support:', error);
      throw error;
    }
  }

  async processGeneralQuery(projectId, message, userId, project = null) {
    try {
      if (!project) {
        project = await Project.findById(projectId);
        if (!project) throw new Error('Project not found');
      }
      
      // Use prompt management for general queries
      const startTime = Date.now();
      const { prompt, performanceId } = await promptManager.getPrompt('general_query', {
        message,
        projectName: project.name || 'your project',
        projectDescription: project.description || '',
        projectRequirements: project.requirements || '',
        projectTechStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : '',
        projectStatus: project.status || 'in progress'
      });
      
      // Call the AI service
      const response = await claudeClient.generateCompletion(prompt);
      
      // Track performance metrics
      await promptManager.trackPerformance(performanceId, {
        success: true,
        tokenUsage: response.usage,
        latency: Date.now() - startTime
      });
      
      return {
        message: response.content.trim(),
        metadata: { type: 'general_response' }
      };
    } catch (error) {
      logger.error('Error processing general query:', error);
      return {
        message: "I'm sorry, I couldn't process your question. Could you try rephrasing it?",
        metadata: { type: 'error', error: error.message }
      };
    }
  }

  async handleBlueprintQuery(project, message) {
    const startTime = Date.now();
    const { prompt, performanceId } = await promptManager.getPrompt('blueprint_query', {
      message,
      requirements: project.requirements || '',
      blueprint: JSON.stringify(project.blueprint || {})
    });
    
    // Call the AI service
    const response = await claudeClient.generateCompletion(prompt);
    
    // Track performance metrics
    await promptManager.trackPerformance(performanceId, {
      success: true,
      tokenUsage: response.usage,
      latency: Date.now() - startTime
    });
    
    return {
      message: response.content.trim(),
      metadata: { type: 'blueprint_query_response' }
    };
  }
  
  async handleBlueprintModification(project, message) {
    const startTime = Date.now();
    const { prompt, performanceId } = await promptManager.getPrompt('blueprint_modify', {
      message,
      requirements: project.requirements || '',
      blueprint: JSON.stringify(project.blueprint || {})
    });
    
    // Call the AI service
    const response = await claudeClient.generateCompletion(prompt);
    
    // Track performance metrics
    await promptManager.trackPerformance(performanceId, {
      success: true,
      tokenUsage: response.usage,
      latency: Date.now() - startTime
    });
    
    // This is just a suggestion response - actual modification would go through blueprintService
    return {
      message: response.content.trim(),
      metadata: { type: 'blueprint_modification_suggestion' }
    };
  }

  async handleComponentQuery(project, message) {
    const startTime = Date.now();
    const { prompt, performanceId } = await promptManager.getPrompt('component_query', {
      message,
      blueprint: JSON.stringify(project.blueprint || {}),
      components: JSON.stringify(project.components || [])
    });
    
    // Call the AI service
    const response = await claudeClient.generateCompletion(prompt);
    
    // Track performance metrics
    await promptManager.trackPerformance(performanceId, {
      success: true,
      tokenUsage: response.usage,
      latency: Date.now() - startTime
    });
    
    return {
      message: response.content.trim(),
      metadata: { type: 'component_query_response' }
    };
  }

  // Helper methods
  async extractRequirementsFromMessage(message) {
    const startTime = Date.now();
    const { prompt, performanceId } = await promptManager.getPrompt('extract_requirements', { message });
  
    // Call the AI service
    const response = await claudeClient.generateCompletion(prompt);
  
    // Track performance metrics
    await promptManager.trackPerformance(performanceId, {
      success: true,
      tokenUsage: response.usage,
      latency: Date.now() - startTime
    });
  
    try {
      let content = response.content.trim();
      logger.info("📦 Raw Claude Response:", content);
  
      // Remove Markdown code blocks if present
      if (content.startsWith("```json")) {
        content = content.replace(/^```json\s*/, "").replace(/```$/, "").trim();
      } else if (content.startsWith("```")) {
        content = content.replace(/^```\s*/, "").replace(/```$/, "").trim();
      }
  
      logger.info("🧹 Cleaned Claude JSON:", content);
  
      const parsed = JSON.parse(content);
  
      // Ensure structure even if Claude returns incomplete/null data
      const safeDefaults = {
        name: null,
        description: null,
        requirements: null,
        techStack: null,
        financialDomain: null,
        tradingVenue: null
      };
  
      const result = {
        ...safeDefaults,
        ...parsed
      };
  
      // Ensure arrays are actually arrays
      if (result.techStack && !Array.isArray(result.techStack)) {
        result.techStack = [result.techStack];
      }
  
      return result;
    } catch (error) {
      logger.error('❌ Failed to parse Claude response as JSON:', error, response.content);
      console.log('⚠️ Using fallback empty structure.');
  
      // Return fallback with empty/default values
      return {
        name: null,
        description: null,
        requirements: null,
        techStack: null,
        financialDomain: null,
        tradingVenue: null
      };
    }
  }
  
  areRequirementsComplete(project) {
    return !!(
      project.name && 
      project.description && 
      project.requirements && 
      project.techStack?.length > 0
    );
  }

  generateRequirementsResponse(project, isComplete, originalMessage) {
    if (isComplete) {
      return 'Great! I have all the information needed for your project. Shall I proceed with generating the architecture blueprint?';
    }
    
    // Create a list of missing items
    const missing = [];
    if (!project.name) missing.push('project name');
    if (!project.description) missing.push('description');
    if (!project.requirements) missing.push('detailed requirements');
    if (!project.techStack?.length) missing.push('technology stack');
    
    // Create a specific response based on the original message and missing items
    if (missing.length > 2) {
      return `Thanks for the information. I still need several details to get started: ${missing.join(', ')}. Could you tell me more about your project?`;
    } else if (missing.length > 0) {
      return `I need a bit more information before we can proceed. Could you provide the ${missing.join(' and ')}?`;
    } else {
      // This shouldn't happen but just in case
      return "I've updated your project information. Is there anything specific you'd like to know?";
    }
  }

  async determineIntent(message) {
    try {
      // Use the prompt management system
      const startTime = Date.now();
      const { prompt, performanceId } = await promptManager.getPrompt('determine_intent', {
        message
      });
      
      // Call the AI service
      const response = await claudeClient.generateCompletion(prompt);
      
      // Track performance metrics
      await promptManager.trackPerformance(performanceId, {
        success: true,
        tokenUsage: response.usage,
        latency: Date.now() - startTime
      });
      
      const intent = response.content.trim().toLowerCase();
      logger.info(`Determined intent: ${intent} for message: ${message}`);
      return intent;
    } catch (error) {
      logger.error(`Error determining intent: ${error.message}`, error);
      // Default to query if we can't determine intent
      return 'query';
    }
  }

  getNextComponent(project) {
    if (!project.components || project.components.length === 0) {
      return null;
    }
    
    // Find next component to generate based on dependencies
    return project.components.find(c => 
      c.status === 'pending' && 
      (!c.dependencies || c.dependencies.length === 0 || 
        c.dependencies.every(dep => {
          const depComponent = project.components.find(comp => 
            comp._id.toString() === dep.toString()
          );
          return depComponent && depComponent.status === 'completed';
        })
      )
    );
  }
}

module.exports = new ChatService();