// scripts/init-prompts.js
require('dotenv').config();
const mongoose = require('mongoose');
const PromptTemplate = require('../src/models/Prompt');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Create the required prompt templates
    const templates = [
      {
        name: 'general_query',
        description: 'Handles general user queries about projects',
        category: 'general',
        content: `You are an AI assistant helping with a financial coding project. 
        PROJECT NAME: {{projectName}}
        PROJECT DESCRIPTION: {{projectDescription}}
        PROJECT REQUIREMENTS: {{projectRequirements}}
        TECH STACK: {{projectTechStack}}
        CURRENT STATUS: {{projectStatus}}
        
        The user has asked the following question: "{{message}}"
        
        Please provide a helpful and informative response that relates to their financial coding project. If their question is about trading strategies, financial algorithms, or coding techniques relevant to their project, provide detailed information. If you don't know something specific, acknowledge that but provide general guidance when possible.`,
        active: true,
        createdBy: 'system'
      },
      {
        name: 'determine_intent',
        description: 'Determines the intent of a user message',
        category: 'general',
        content: `Analyze the following message from a user and determine their intent. Respond with only ONE of these words:
        - "query" if they're asking a question or seeking information.
        - "generate" if they're asking to create or generate something.
        - "modify" if they're asking to change or update something.
        - "approve" if they're indicating approval or confirmation.
        - "reject" if they're indicating disapproval or rejection.
        
        USER MESSAGE: "{{message}}"
        
        Intent:`,
        active: true,
        createdBy: 'system'
      },
      {
        name: 'extract_requirements',
        description: 'Extracts project requirements from user messages',
        category: 'requirements',
        content: `Extract project requirements from the following user message. The project is related to financial trading or technology.
        
        USER MESSAGE: "{{message}}"
        
        Extract any information about:
        - Project name
        - Project description
        - Specific requirements
        - Technology stack (programming languages, frameworks, tools)
        - Financial domain (forex, stocks, crypto, etc.)
        - Trading venue (if mentioned)
        
        Format your response as a valid JSON object with these possible fields:
        {
          "name": "extracted project name or null if not mentioned",
          "description": "extracted project description or null if not mentioned",
          "requirements": "extracted requirements or null if not mentioned",
          "techStack": ["array of technologies mentioned or null if none"],
          "financialDomain": "extracted financial domain or null if not mentioned",
          "tradingVenue": "extracted trading venue or null if not mentioned"
        }
        
        Return ONLY the JSON with no additional text.`,
        active: true,
        createdBy: 'system'
      },
      {
        name: 'blueprint_query',
        description: 'Handles queries about the blueprint',
        category: 'blueprint',
        content: `You are helping with a financial trading project. The user has a question about the project's architecture blueprint.
        
        PROJECT REQUIREMENTS: {{requirements}}
        
        BLUEPRINT: {{blueprint}}
        
        USER QUESTION: "{{message}}"
        
        Provide a detailed and helpful response about the blueprint. Be specific about how the architecture supports financial trading functionality.`,
        active: true,
        createdBy: 'system'
      },
      {
        name: 'blueprint_modify',
        description: 'Handles requests to modify the blueprint',
        category: 'blueprint',
        content: `The user wants to modify the architecture blueprint for their financial trading project.
        
        CURRENT REQUIREMENTS: {{requirements}}
        
        CURRENT BLUEPRINT: {{blueprint}}
        
        MODIFICATION REQUEST: "{{message}}"
        
        Suggest how the blueprint could be modified to accommodate this request. Consider best practices for financial trading systems.`,
        active: true,
        createdBy: 'system'
      },
      {
        name: 'component_query',
        description: 'Handles queries about components',
        category: 'component',
        content: `You are helping with a financial trading project. The user has a question about one or more components.
        
        BLUEPRINT: {{blueprint}}
        
        COMPONENTS: {{components}}
        
        USER QUESTION: "{{message}}"
        
        Provide a detailed and helpful response about the components. Focus on how they function in the context of financial trading.`,
        active: true,
        createdBy: 'system'
      }
    ];
    
    // Insert or update templates
    for (const template of templates) {
      await PromptTemplate.findOneAndUpdate(
        { name: template.name },
        { $set: template },
        { upsert: true, new: true }
      );
      console.log(`Prompt template '${template.name}' created/updated`);
    }
    
    console.log('All prompt templates initialized successfully!');
  } catch (error) {
    console.error('Error initializing prompts:', error);
  } finally {
    mongoose.connection.close();
  }
});