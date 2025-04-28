// // server/src/models/index.js
// const Prompt = require('../models/Prompt');
// const PromptComponent = require('../models/PromptComponent');
// const PromptPerformance = require('../models/PromptPerformance');
// const ProjectPrompt = require('../models/ProjectPrompt');
// const SupportConversation = require('../models/SupportConversation');

// module.exports = {
//   Prompt,
//   PromptComponent,
//   PromptPerformance,
//   ProjectPrompt,
//   SupportConversation
// };

// server/src/services/index.js
/**
 * Services Index
 * Exports all core services for the CodeForegX Financial Technology System
 */
const promptManager = require('./prompt/promptManager');
const supportConversationService = require('./support/supportConversationService');
const basicExtractionService = require('./extraction/basicExtractionService');
const simpleBlueprintService = require('./blueprint/simpleBlueprintService');
const simpleComponentService = require('./component/simpleComponentService');
const chatService = require('./chat/chatService'); // Added the chat service

module.exports = {
  promptManager,
  supportConversationService,
  basicExtractionService,
  simpleBlueprintService,
  simpleComponentService,
  chatService // Export the chat service
};