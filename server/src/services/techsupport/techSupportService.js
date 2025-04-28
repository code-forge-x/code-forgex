const TechSupportSession = require('../../models/TechSupportSession');
const Project = require('../../models/Project');
const claudeClient = require('../ai/claudeClient');
const promptManager = require('../prompt/promptManager');
const logger = require('../../utils/logger');

class TechSupportService {
  async createSession(userId, projectId) {
    try {
      // Verify project exists and belongs to user
      const project = await Project.findOne({
        _id: projectId,
        owner: userId
      });
      
      if (!project) {
        throw new Error('Project not found or not authorized');
      }
      
      // Check if there's already an active session
      const existingSession = await TechSupportSession.findOne({
        userId,
        projectId,
        status: 'active'
      });
      
      if (existingSession) {
        return existingSession;
      }
      
      // Create new session
      const session = new TechSupportSession({
        userId,
        projectId,
        context: {
          projectName: project.name,
          financialDomain: project.financialDomain,
          techStack: project.techStack
        },
        messages: [
          {
            role: 'system',
            content: 'Session started. How can I help you with your trading system project?'
          }
        ]
      });
      
      await session.save();
      return session;
    } catch (error) {
      logger.error('Error creating tech support session:', error);
      throw error;
    }
  }
  
  async getUserSessions(userId) {
    try {
      const sessions = await TechSupportSession.find({
        userId,
        status: { $in: ['active', 'closed'] }
      })
      .sort({ updatedAt: -1 })
      .limit(10);
      
      return sessions;
    } catch (error) {
      logger.error('Error getting user sessions:', error);
      throw error;
    }
  }
  
  async getSession(sessionId, userId) {
    try {
      const session = await TechSupportSession.findOne({
        _id: sessionId,
        userId
      });
      
      if (!session) {
        throw new Error('Session not found or not authorized');
      }
      
      return session;
    } catch (error) {
      logger.error('Error getting tech support session:', error);
      throw error;
    }
  }
  
  async sendMessage(sessionId, userId, message) {
    try {
      // Get session and verify ownership
      const session = await this.getSession(sessionId, userId);
      
      // Add user message to session
      session.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      
      session.updatedAt = new Date();
      await session.save();
      
      // Generate AI response
      const project = await Project.findById(session.projectId);
      
      // System prompt for tech support
      const systemPrompt = "You are an expert financial trading systems developer providing technical support. Focus on giving practical solutions to coding and architecture problems.";
      
      // Call Claude API directly (in production, use promptManager)
      const response = await claudeClient.generateCompletion(
        message, 
        4000,
        systemPrompt
      );
      
      // Add assistant response to session
      session.messages.push({
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      });
      
      session.updatedAt = new Date();
      await session.save();
      
      return {
        sessionId: session._id,
        message: response.content
      };
    } catch (error) {
      logger.error('Error sending message in tech support:', error);
      throw error;
    }
  }
  
  async closeSession(sessionId, userId) {
    try {
      const session = await this.getSession(sessionId, userId);
      
      session.status = 'closed';
      session.closedAt = new Date();
      await session.save();
      
      return { success: true };
    } catch (error) {
      logger.error('Error closing tech support session:', error);
      throw error;
    }
  }
}

module.exports = new TechSupportService();