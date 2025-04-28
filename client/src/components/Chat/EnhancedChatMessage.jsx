// client/src/components/chat/EnhancedChatMessage.jsx
import React, { useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';

/**
 * EnhancedChatMessage Component
 * Financial code highlighting as specified in the implementation guide
 * Supports displaying messages from the support conversation system
 * Includes special highlighting for financial and coding terminology
 */

// Add financial code highlighting support
import 'prismjs/components/prism-markdown';

// Function to highlight financial terms in text
const highlightFinancialTerms = (text) => {
  // Example financial terms to highlight
  const financialTerms = [
    'API',
    'REST',
    'GraphQL',
    'database',
    'schema',
    'model',
    'transaction',
    'authentication',
    'authorization',
    'middleware',
    'endpoint',
    'token',
    'prompt',
    'template',
    'performance',
    'component',
    'blueprint',
    'extraction',
    'generation',
    'workflow'
  ];
  
  // Create a regex pattern for all financial terms
  const termPattern = new RegExp(`\\b(${financialTerms.join('|')})\\b`, 'gi');
  
  // Replace matched terms with highlighted spans
  return text.replace(termPattern, '<span class="financial-term">$1</span>');
};

const EnhancedChatMessage = ({ message }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Process message content to highlight code blocks and financial terms
  const processContent = (content) => {
    if (!content) return '';
    
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      // Check if this part is a code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.slice(3, -3); // Remove the backticks
        
        // Extract language if specified
        let language = 'javascript'; // Default language
        const firstLineEnd = codeContent.indexOf('\n');
        
        if (firstLineEnd !== -1) {
          const firstLine = codeContent.substring(0, firstLineEnd).trim();
          if (firstLine && !firstLine.includes(' ')) {
            language = firstLine;
            const processedCode = codeContent.substring(firstLineEnd + 1);
            
            try {
              // Highlight the code using Prism
              const highlighted = Prism.highlight(
                processedCode,
                Prism.languages[language] || Prism.languages.javascript,
                language
              );
              
              return (
                <pre key={index} className={`language-${language}`}>
                  <code dangerouslySetInnerHTML={{ __html: highlighted }} />
                </pre>
              );
            } catch (error) {
              // Fallback if highlighting fails
              return (
                <pre key={index}>
                  <code>{processedCode}</code>
                </pre>
              );
            }
          }
        }
        
        // No language specified or couldn't parse
        return (
          <pre key={index}>
            <code>{codeContent}</code>
          </pre>
        );
      } else {
        // Process regular text for financial terms
        const highlightedText = highlightFinancialTerms(part);
        
        return (
          <span 
            key={index}
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
        );
      }
    });
  };
  
  // Toggle expanded state for long messages
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Check if message is long and needs expansion control
  const isLongMessage = message.content && message.content.length > 500;
  
  return (
    <div className={`enhanced-chat-message ${message.sender}`}>
      <div className="message-sender">
        {message.sender === 'user' ? 'You' : message.sender === 'ai' ? 'Assistant' : 'System'}
      </div>
      
      <div className={`message-content ${isLongMessage && !expanded ? 'truncated' : ''}`}>
        {isLongMessage && !expanded ? (
          <>
            {processContent(message.content.substring(0, 500) + '...')}
            <div className="expand-control" onClick={toggleExpanded}>
              Show more
            </div>
          </>
        ) : isLongMessage && expanded ? (
          <>
            {processContent(message.content)}
            <div className="expand-control" onClick={toggleExpanded}>
              Show less
            </div>
          </>
        ) : (
          processContent(message.content)
        )}
      </div>
      
      {message.metadata && message.metadata.tokenUsage && (
        <div className="message-metadata">
          <span className="token-usage">
            Tokens: {message.metadata.tokenUsage.total || 0}
          </span>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatMessage;