import api from './api';

// In development mode, use mock implementation
const USE_MOCK = false;

// Mock response delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sample chat data
const chatHistory = {
  messages: [
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your AI coding assistant. I'll help you build your trading bot. What specific requirements do you have in mind?",
      timestamp: new Date(Date.now() - 60000).toISOString(),
      read: true
    }
  ],
  currentPhase: 'requirements'
};

// Sample requirements responses
const requirementsResponses = [
  "Great! I'll help you build a forex trading bot with moving average crossover strategy. For this to work effectively, I'll need to understand a few more details:",
  "Thanks for sharing that information. A forex trading bot with 50 and 200 period moving averages for EUR/USD and GBP/USD pairs sounds like a solid approach. Would you like to include backtesting capabilities to evaluate performance?",
  "Perfect! I now have a good understanding of your requirements. Let me summarize what we're building:\n\n- Forex trading bot for EUR/USD and GBP/USD pairs\n- Moving average crossover strategy using 50 and 200 period MAs\n- Risk management with stop-loss and take-profit\n- Backtesting capability\n\nShall I proceed to creating the architecture blueprint for this system?"
];

// Sample blueprint responses
const blueprintResponses = [
  "I've generated an architecture blueprint for your forex trading bot. The system consists of the following components:\n\n1. **Data Provider**: Fetches real-time and historical forex data\n2. **Strategy Engine**: Implements the moving average crossover logic\n3. **Risk Manager**: Handles position sizing and stop-loss settings\n4. **Execution Engine**: Places and manages orders\n5. **Backtester**: Tests strategy against historical data\n\nWhat do you think of this architecture?",
  "Let me explain how the components interact. The Data Provider continuously streams price data to the Strategy Engine, which calculates the moving averages and generates signals when crossovers occur. These signals are passed to the Risk Manager which determines position size and risk parameters before the Execution Engine places the actual trades. Does this make sense?",
  "Great! I'll now proceed to generating the components based on this blueprint."
];

// Sample component responses
const componentResponses = [
  "I've generated the Strategy Engine component for your forex trading bot. Here's the implementation of the moving average crossover strategy. The code calculates both the 50 and 200 period moving averages and generates buy signals when the faster MA crosses above the slower MA, and sell signals when it crosses below.",
  "I've now implemented the Risk Manager component with the stop-loss functionality you requested. The system automatically calculates appropriate stop-loss levels based on recent volatility and your risk tolerance settings.",
  "All components have been successfully generated! Your forex trading bot is now complete with the moving average crossover strategy, risk management, and backtesting capabilities. Would you like to move to the technical support phase where I can help you with deployment?"
];

// Sample support responses  
const supportResponses = [
  "To deploy your forex trading bot, you'll need to follow these steps:\n\n1. Set up a VPS (Virtual Private Server) for 24/7 operation\n2. Install Node.js on your server\n3. Upload the codebase to your server\n4. Configure your broker API credentials in the config file\n5. Run `npm install` to install dependencies\n6. Start the bot with `node main.js`\n\nWould you like more detailed instructions for any of these steps?",
  "To connect to your broker's API, you'll need to obtain API credentials from your forex broker. Most brokers provide a Node.js SDK or REST API. Add your credentials to the config.js file and the bot will handle authentication automatically.",
  "For monitoring your bot's performance, I recommend setting up a dashboard using Grafana or a similar tool. This will allow you to track key metrics like win/loss ratio, profit factor, and drawdown in real-time."
];

// Mock chat service implementation
const mockChatService = {
  // Get chat history
  getChatHistory: async (projectId) => {
    await delay(500);
    return chatHistory;
  },
  
  // Send message
  sendMessage: async (endpoint, projectId, content) => {
    await delay(1500); // Simulate network delay
    
    let response = {};
    let nextPhase = null;
    let metadata = {};
    
    // Determine which phase we're in from the endpoint
    const phase = endpoint.split('/').pop();
    
    if (phase === 'requirements') {
      // Randomly select a requirements response
      const message = requirementsResponses[Math.floor(Math.random() * requirementsResponses.length)];
      
      // Check if the message indicates we should move to blueprint phase
      if (content.toLowerCase().includes('proceed') || 
          content.toLowerCase().includes('blueprint') || 
          content.toLowerCase().includes('architecture')) {
        nextPhase = 'blueprint';
        metadata = { type: 'phase_transition', nextPhase: 'blueprint' };
      } else {
        metadata = { type: 'requirements_update' };
      }
      
      response = { message, metadata, nextPhase };
    } 
    else if (phase === 'blueprint') {
      // Randomly select a blueprint response
      const message = blueprintResponses[Math.floor(Math.random() * blueprintResponses.length)];
      
      // Check if the message indicates we should move to component phase
      if (content.toLowerCase().includes('proceed') || 
          content.toLowerCase().includes('component') || 
          content.toLowerCase().includes('generate')) {
        nextPhase = 'component';
        metadata = { type: 'phase_transition', nextPhase: 'component' };
      } else if (content.toLowerCase().includes('explain')) {
        metadata = { type: 'blueprint_explanation' };
      } else {
        metadata = { type: 'blueprint_update' };
      }
      
      response = { message, metadata, nextPhase };
    }
    else if (phase === 'component') {
      // Randomly select a component response
      const message = componentResponses[Math.floor(Math.random() * componentResponses.length)];
      
      // Check if the message indicates we should move to support phase
      if (content.toLowerCase().includes('complete') || 
          content.toLowerCase().includes('support') || 
          content.toLowerCase().includes('done')) {
        nextPhase = 'support';
        metadata = { type: 'phase_transition', nextPhase: 'support' };
      } else if (content.toLowerCase().includes('generate') || content.toLowerCase().includes('strategy')) {
        metadata = { 
          type: 'component_generated', 
          code: `class MovingAverageCrossover {
  constructor(fastPeriod = 50, slowPeriod = 200) {
    this.fastPeriod = fastPeriod;
    this.slowPeriod = slowPeriod;
    this.prices = [];
    this.fastMA = [];
    this.slowMA = [];
  }

  update(price) {
    // Update moving averages
    this.prices.push(price);
    if (this.prices.length > this.slowPeriod) {
      this.prices.shift();
    }

    if (this.prices.length >= this.fastPeriod) {
      this.fastMA.push(this.calculateMA(this.fastPeriod));
    }

    if (this.prices.length >= this.slowPeriod) {
      this.slowMA.push(this.calculateMA(this.slowPeriod));
    }

    return this.generateSignal();
  }

  calculateMA(period) {
    const slice = this.prices.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
  }

  generateSignal() {
    // Not enough data
    if (this.fastMA.length < 2 || this.slowMA.length < 2) {
      return null;
    }

    // Current and previous values
    const fastCurrent = this.fastMA[this.fastMA.length - 1];
    const fastPrevious = this.fastMA[this.fastMA.length - 2];
    const slowCurrent = this.slowMA[this.slowMA.length - 1];
    const slowPrevious = this.slowMA[this.slowMA.length - 2];

    // Check for crossover
    const bullishCrossover = fastPrevious <= slowPrevious && fastCurrent > slowCurrent;
    const bearishCrossover = fastPrevious >= slowPrevious && fastCurrent < slowCurrent;

    if (bullishCrossover) return "buy";
    if (bearishCrossover) return "sell";
    return null;
  }
}`
        };
      } else {
        metadata = { type: 'component_update' };
      }
      
      response = { message, metadata, nextPhase };
    }
    else if (phase === 'support') {
      // Randomly select a support response
      const message = supportResponses[Math.floor(Math.random() * supportResponses.length)];
      metadata = { type: 'support_response' };
      
      response = { message, metadata };
    }
    
    // Add the response message to the chat history
    chatHistory.messages.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: response.message,
      metadata: response.metadata,
      timestamp: new Date().toISOString(),
      read: true
    });
    
    // Update the current phase if needed
    if (nextPhase) {
      chatHistory.currentPhase = nextPhase;
    }
    
    return response;
  }
};

// Real API implementation
const realChatService = {
  getChatHistory: async (projectId) => {
    const response = await api.get(`/chat/${projectId}/history`);
    return response.data;
  },
  
  sendMessage: async (endpoint, projectId, content) => {
    const response = await api.post(endpoint, {
      projectId,
      message: content
    });
    return response.data;
  }
};

// Export the appropriate implementation
export const chatService = USE_MOCK ? mockChatService : realChatService;

// Mock project service
export const projectService = {
  getProjectById: async (projectId) => {
    if (USE_MOCK) {
      await delay(500);
      return {
        _id: projectId || '1',
        name: 'Forex Trading Bot',
        description: 'A trading bot using moving average crossover strategy',
        status: 'requirements_gathering',
        components: [],
        blueprint: null
      };
    } else {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    }
  },
  
  updateProject: async (projectId, data) => {
    if (USE_MOCK) {
      await delay(300);
      return {
        _id: projectId,
        ...data
      };
    } else {
      const response = await api.put(`/projects/${projectId}`, data);
      return response.data;
    }
  }
};