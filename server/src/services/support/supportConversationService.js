// server/src/services/support/supportConversationService.js
const { SupportConversation } = require('../../models');
const promptManager = require('../prompt/promptManager');
const { v4: uuidv4 } = require('uuid');

/**
 * Support Conversation Service
 * Handles persistent conversation tracking with support IDs
 * Implements specialized workflows for bug fixes, library upgrades, and code reviews
 */

class SupportConversationService {
  /**
   * Create a new support conversation
   * @param {string} projectId - The project ID
   * @param {string} userId - The user ID
   * @param {string} title - The conversation title
   * @param {string} category - The conversation category
   * @returns {Promise<Object>} - The created conversation
   */
  async createConversation(projectId, userId, title, category = 'general') {
    try {
      const supportId = `SUP-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      const conversation = new SupportConversation({
        supportId,
        projectId,
        userId,
        title,
        category,
        status: 'open',
        messages: []
      });
      
      await conversation.save();
      
      // Add initial system message based on category
      await this.addSystemMessage(supportId, category);
      
      return conversation;
    } catch (error) {
      console.error('Error creating support conversation:', error);
      throw error;
    }
  }
  
  /**
   * Get a support conversation by ID
   * @param {string} supportId - The support conversation ID
   * @returns {Promise<Object>} - The support conversation
   */
  async getConversation(supportId) {
    try {
      const conversation = await SupportConversation.findOne({ supportId });
      
      if (!conversation) {
        throw new Error(`Support conversation with ID ${supportId} not found`);
      }
      
      return conversation;
    } catch (error) {
      console.error('Error getting support conversation:', error);
      throw error;
    }
  }
  
  /**
   * Get all support conversations for a project
   * @param {string} projectId - The project ID
   * @param {Object} options - Filter options (status, category, etc.)
   * @returns {Promise<Array>} - Array of support conversations
   */
  async getProjectConversations(projectId, options = {}) {
    try {
      const query = { projectId, ...options };
      
      return await SupportConversation.find(query)
        .sort({ updatedAt: -1 });
    } catch (error) {
      console.error('Error getting project support conversations:', error);
      throw error;
    }
  }
  
  /**
   * Add a user message to a support conversation
   * @param {string} supportId - The support conversation ID
   * @param {string} content - The message content
   * @returns {Promise<Object>} - The updated conversation
   */
  async addUserMessage(supportId, content) {
    try {
      const conversation = await this.getConversation(supportId);
      
      await conversation.addMessage('user', content);
      
      return conversation;
    } catch (error) {
      console.error('Error adding user message:', error);
      throw error;
    }
  }
  
  /**
   * Add a system message to a support conversation
   * @param {string} supportId - The support conversation ID
   * @param {string} category - The conversation category for template selection
   * @returns {Promise<Object>} - The updated conversation
   */
  async addSystemMessage(supportId, category) {
    try {
      const conversation = await this.getConversation(supportId);
      
      // Get appropriate template based on category
      const templateName = `support_${category}_intro`;
      const template = await promptManager.getPromptTemplate(templateName);
      
      let content = "How can I help you with your project today?";
      
      if (template) {
        content = template.content;
      }
      
      await conversation.addMessage('system', content, {
        templateId: template ? template._id : null
      });
      
      return conversation;
    } catch (error) {
      console.error('Error adding system message:', error);
      throw error;
    }
  }
  
  /**
   * Add an AI message to a support conversation
   * @param {string} supportId - The support conversation ID
   * @param {string} content - The message content
   * @param {Object} metadata - Message metadata (template, token usage, etc.)
   * @returns {Promise<Object>} - The updated conversation
   */
  async addAIMessage(supportId, content, metadata = {}) {
    try {
      const conversation = await this.getConversation(supportId);
      
      await conversation.addMessage('ai', content, metadata);
      
      return conversation;
    } catch (error) {
      console.error('Error adding AI message:', error);
      throw error;
    }
  }
  
  /**
   * Update the status of a support conversation
   * @param {string} supportId - The support conversation ID
   * @param {string} status - The new status
   * @returns {Promise<Object>} - The updated conversation
   */
  async updateStatus(supportId, status) {
    try {
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }
      
      const conversation = await SupportConversation.findOneAndUpdate(
        { supportId },
        { 
          $set: { 
            status,
            resolvedAt: ['resolved', 'closed'].includes(status) ? new Date() : null
          } 
        },
        { new: true }
      );
      
      if (!conversation) {
        throw new Error(`Support conversation with ID ${supportId} not found`);
      }
      
      return conversation;
    } catch (error) {
      console.error('Error updating support conversation status:', error);
      throw error;
    }
  }
  
  /**
   * Generate a response using an AI model
   * @param {string} supportId - The support conversation ID
   * @param {Object} options - AI generation options
   * @returns {Promise<Object>} - The response data
   */
  async generateAIResponse(supportId, options = {}) {
    try {
      const conversation = await this.getConversation(supportId);
      
      // Get the appropriate template based on conversation category
      const templateName = `support_${conversation.category}`;
      const projectId = conversation.projectId;
      
      const template = await promptManager.getProjectPrompt(projectId, templateName);
      
      // Build conversation history for context
      const messages = conversation.messages.slice(-10); // Last 10 messages for context
      const messageHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : msg.sender === 'ai' ? 'assistant' : 'system',
        content: msg.content
      }));
      
      // TODO: Integrate with your preferred AI model API
      // For now, we'll use a placeholder response
      let aiContent = "This is a placeholder AI response. In the real implementation, this would come from an AI model.";
      let tokenUsage = { input: 100, output: 50, total: 150 };
      let success = true;
      let latency = 500; // Mock latency in ms
      let errorDetails = null;
      
      // If you have a real AI integration, uncomment and modify this code:
      /*
      try {
        const startTime = Date.now();
        
        // Replace with your actual AI API call
        const aiResult = await yourAIService.generateResponse({
          messages: messageHistory,
          template: template ? template.content : null,
          options: options
        });
        
        aiContent = aiResult.content;
        tokenUsage = aiResult.tokenUsage;
        latency = Date.now() - startTime;
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        success = false;
        errorDetails = aiError.message;
        aiContent = "I'm sorry, I encountered an error processing your request. Please try again later.";
      }
      */
      
      const aiResponse = {
        content: aiContent,
        metadata: {
          templateId: template ? template._id : null,
          tokenUsage
        }
      };
      
      // Track prompt performance
      if (template) {
        await promptManager.trackPerformance(
          template._id,
          supportId,
          tokenUsage,
          latency,
          success,
          errorDetails
        );
      }
      
      // Add the AI message to the conversation
      await this.addAIMessage(supportId, aiResponse.content, aiResponse.metadata);
      
      // If this is a bug fix or code review, check if we need a special workflow
      if (conversation.category === 'bug_fix' || conversation.category === 'code_review') {
        await this.processSpecializedWorkflow(supportId, conversation.category);
      }
      
      return aiResponse;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }
  
  /**
   * Process specialized workflows for specific support categories
   * @param {string} supportId - The support conversation ID
   * @param {string} category - The conversation category
   * @returns {Promise<void>}
   */
  async processSpecializedWorkflow(supportId, category) {
    try {
      // Placeholder for specialized workflow logic
      // In a real implementation, this would contain specific logic for each category
      
      if (category === 'bug_fix') {
        // Add a system message with bug fix checklist
        await this.addSystemMessage(supportId, 'bug_fix_checklist');
      } else if (category === 'code_review') {
        // Add a system message with code review guidelines
        await this.addSystemMessage(supportId, 'code_review_guidelines');
      } else if (category === 'library_upgrade') {
        // Add a system message with library upgrade best practices
        await this.addSystemMessage(supportId, 'library_upgrade_best_practices');
      }
    } catch (error) {
      console.error('Error processing specialized workflow:', error);
      // Don't throw the error to avoid disrupting the main conversation flow
    }
  }
}

module.exports = new SupportConversationService();