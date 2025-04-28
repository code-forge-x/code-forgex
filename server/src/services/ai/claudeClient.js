// server/src/services/ai/claudeClient.js

const axios = require('axios');
const logger = require('../../utils/logger');

class ClaudeClient {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.apiBaseUrl = 'https://api.anthropic.com';
    this.apiVersion = '2023-06-01';
    this.defaultModel = 'claude-3-7-sonnet-20250219'; // Using the latest Claude model
    this.maxRetries = 3;
    this.retryDelay = 1000; // ms
  }
  
  /**
   * Generate a completion from Claude
   */
  async generateCompletion(prompt, options = {}) {
    const {
      model = this.defaultModel,
      maxTokens = 4000,
      temperature = 0.5,
      topP = 0.95,
      topK = 40,
      systemPrompt = null,
      stream = false
    } = options;
    
    const messages = [];
    
    // Add system message if provided
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    // Add user message
    messages.push({
      role: 'user',
      content: prompt
    });
    
    const requestData = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      top_k: topK
    };
    
    if (stream) {
      requestData.stream = true;
    }
    
    let retries = 0;
    const startTime = Date.now();
    
    while (retries <= this.maxRetries) {
      try {
        const response = await axios.post(
          `${this.apiBaseUrl}/v1/messages`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.apiKey,
              'anthropic-version': this.apiVersion
            }
          }
        );
        
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        // Log token usage
        const tokenUsage = {
          inputTokens: response.data.usage?.input_tokens || 0,
          outputTokens: response.data.usage?.output_tokens || 0
        };
        
        logger.info('Claude API call completed', {
          model,
          inputTokens: tokenUsage.inputTokens,
          outputTokens: tokenUsage.outputTokens,
          latency
        });
        
        return {
          content: response.data.content[0].text,
          usage: tokenUsage,
          latency,
          model: response.data.model,
          metadata: this._extractMetadata(response.data.content[0].text),
          stop_reason: response.data.stop_reason,
          id: response.data.id
        };
      } catch (error) {
        // Handle rate limiting
        if (error.response && error.response.status === 429) {
          retries++;
          if (retries <= this.maxRetries) {
            const delay = this.retryDelay * Math.pow(2, retries - 1); // Exponential backoff
            logger.warn(`Rate limited by Claude API, retrying in ${delay}ms (${retries}/${this.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // Log detailed error
        logger.error('Claude API error', {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
          retries
        });
        
        throw error;
      }
    }
  }
  
  /**
   * Generate embeddings from Claude
   */
  async generateEmbedding(text, model = 'claude-3-7-sonnet-20250219') {
    try {
      // Ensure text is not empty
      if (!text || typeof text !== 'string' || text.trim() === '') {
        throw new Error('Invalid input: text must be a non-empty string');
      }
      
      const response = await axios.post(
        `${this.apiBaseUrl}/v1/embeddings`,
        {
          model,
          input: text,
          type: "text"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion
          }
        }
      );
      
      // Check if embedding exists in response
      if (!response.data.embedding) {
        throw new Error('No embedding found in API response');
      }
      
      return {
        embedding: response.data.embedding,
        model: response.data.model,
        object: response.data.object
      };
    } catch (error) {
      logger.error('Claude embedding API error', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      throw error;
    }
  }
  
  /**
   * Stream a completion from Claude
   */
  async streamCompletion(prompt, callback, options = {}) {
    const {
      model = this.defaultModel,
      maxTokens = 4000,
      temperature = 0.5,
      topP = 0.95,
      topK = 40,
      systemPrompt = null
    } = options;
    
    const messages = [];
    
    // Add system message if provided
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    // Add user message
    messages.push({
      role: 'user',
      content: prompt
    });
    
    const requestData = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      top_k: topK,
      stream: true
    };
    
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/v1/messages`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion,
            'Accept': 'text/event-stream'
          },
          responseType: 'stream'
        }
      );
      
      let buffer = '';
      response.data.on('data', (chunk) => {
        const chunkStr = chunk.toString();
        buffer += chunkStr;
        
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              callback({ done: true });
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                callback({
                  content: parsed.delta.text,
                  done: false
                });
              }
            } catch (parseError) {
              logger.error('Error parsing SSE message', { error: parseError.message, data });
            }
          }
        }
      });
      
      response.data.on('end', () => {
        callback({ done: true });
      });
      
      response.data.on('error', (error) => {
        logger.error('Stream error', { error: error.message });
        callback({ error: error.message, done: true });
      });
      
      // Return a function to abort the request if needed
      return {
        abort: () => {
          if (response.data) {
            response.data.destroy();
          }
        }
      };
    } catch (error) {
      logger.error('Claude streaming API error', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      callback({ error: error.message, done: true });
      throw error;
    }
  }
  
  /**
   * Extract metadata from the response (tags, etc.)
   */
  _extractMetadata(content) {
    const metadata = {};
    
    // Extract XML tags if present
    const xmlTagRegex = /<([a-zA-Z0-9_]+)>([\s\S]*?)<\/\1>/g;
    let match;
    
    while ((match = xmlTagRegex.exec(content)) !== null) {
      const [fullMatch, tagName, tagContent] = match;
      metadata[tagName] = tagContent.trim();
    }
    
    return Object.keys(metadata).length > 0 ? metadata : null;
  }
  
  /**
   * Create a conversational message from a chat history
   */
  async createConversation(messages, options = {}) {
    const {
      model = this.defaultModel,
      maxTokens = 4000,
      temperature = 0.7,
      systemPrompt = null
    } = options;
    
    const formattedMessages = [];
    
    // Add system message if provided
    if (systemPrompt) {
      formattedMessages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    // Format conversation messages
    for (const message of messages) {
      formattedMessages.push({
        role: message.role === 'user' ? 'user' : 'assistant',
        content: message.content
      });
    }
    
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/v1/messages`,
        {
          model,
          messages: formattedMessages,
          max_tokens: maxTokens,
          temperature
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion
          }
        }
      );
      
      // Log token usage
      const tokenUsage = {
        inputTokens: response.data.usage?.input_tokens || 0,
        outputTokens: response.data.usage?.output_tokens || 0
      };
      
      return {
        content: response.data.content[0].text,
        usage: tokenUsage,
        model: response.data.model,
        id: response.data.id
      };
    } catch (error) {
      logger.error('Claude conversation API error', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      throw error;
    }
  }
}

module.exports = new ClaudeClient();