require('dotenv').config();
const mongoose = require('mongoose');
const PromptTemplate = require('../models/PromptTemplate');

const chatPrompts = [
  {
    name: 'extract_requirements',
    description: 'Extract structured requirements from natural language',
    category: 'chat',
    content: `
    You are analyzing a user's natural language description of a financial trading application.
    Extract the following information in JSON format:
    
    {
      "name": "project name",
      "description": "brief description",
      "requirements": "detailed requirements",
      "techStack": ["array of technologies mentioned"],
      "financialDomain": "trading|risk_management|market_data|etc",
      "tradingVenue": "forex|equities|futures|etc"
    }
    
    User message: {{message}}
    
    Extract whatever information is available. Return null for missing fields.
    `,
    active: true,
    createdBy: 'system'
  },
  {
    name: 'determine_intent',
    description: 'Determine user intent from chat message',
    category: 'chat',
    content: `
    Analyze the user's message and determine their intent.
    
    Possible intents:
    - generate: User wants to generate something (blueprint, component)
    - modify: User wants to modify existing content
    - query: User is asking a question
    - approve: User is approving current state
    - reject: User is rejecting/requesting changes
    
    User message: {{message}}
    
    Return only the intent keyword.
    `,
    active: true,
    createdBy: 'system'
  },
  {
    name: 'blueprint_query',
    description: 'Answer questions about architecture blueprint',
    category: 'chat',
    content: `
    You are an AI assistant specializing in financial trading application architecture.
    
    Project Requirements: {{requirements}}
    
    Current Blueprint: {{blueprint}}
    
    User Query: {{message}}
    
    Provide a helpful, informative response to the user's query about the blueprint.
    Explain technical decisions clearly and offer alternatives if appropriate.
    `,
    active: true,
    createdBy: 'system'
  },
  {
    name: 'component_query',
    description: 'Answer questions about specific components',
    category: 'chat',
    content: `
    You are an AI assistant specializing in financial trading application development.
    
    Project Blueprint: {{blueprint}}
    Component Status: {{components}}
    
    User Query: {{message}}
    
    Provide a helpful, informative response to the user's query about the components.
    Explain implementation details clearly and offer suggestions if appropriate.
    `,
    active: true,
    createdBy: 'system'
  }
];

async function seedPrompts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Insert prompt templates
    for (const prompt of chatPrompts) {
      // Check if already exists
      const existing = await PromptTemplate.findOne({ name: prompt.name });
      if (existing) {
        console.log(`Template ${prompt.name} already exists, skipping...`);
        continue;
      }
      
      await PromptTemplate.create(prompt);
      console.log(`Added template ${prompt.name}`);
    }
    
    console.log('Prompt seeding complete');
  } catch (error) {
    console.error('Error seeding prompts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

seedPrompts();