import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services/chatService';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import PhaseIndicator from './PhaseIndicator';

const ChatWindow = ({ projectId, onProjectUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('requirements');
  const messagesEndRef = useRef(null);
  const shouldScrollToBottomRef = useRef(true);

  // Load chat history
  useEffect(() => {
    if (!projectId) return;
    
    const loadChatHistory = async () => {
      try {
        const history = await chatService.getChatHistory(projectId);
        setMessages(history.messages);
        setCurrentPhase(history.currentPhase);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    
    loadChatHistory();
  }, [projectId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (shouldScrollToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async (content) => {
    if (!content.trim() || !projectId) return;
    
    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // In this demo version, we add the message to the list directly
    // In the real implementation with React Query, you would use queryClient.setQueryData 
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    shouldScrollToBottomRef.current = true;
    
    try {
      // Send message to API
      const endpoint = `/api/chat/${currentPhase}`;
      const response = await chatService.sendMessage(endpoint, projectId, content);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          read: true
        }
      ]);
      // Add AI message to UI (in a real implementation, this would come from the backend)
      setIsTyping(false);
      
      // Handle phase transition
      if (response.nextPhase) {
        setCurrentPhase(response.nextPhase);
        
        // Notify parent component of project update
        if (onProjectUpdate && response.updateProject && response.projectData) {
          onProjectUpdate(response.projectData);
        }
      }
    } catch (error) {
        console.error('Error sending message:', error);
        setIsTyping(false);
      
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Sorry, there was an error processing your message. Please try again.',
          timestamp: new Date().toISOString(),
          read: true
        }]);
      }
  };

  return (
    <div className="flex flex-col h-full">
      <PhaseIndicator currentPhase={currentPhase} />
      
      <div 
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          shouldScrollToBottomRef.current = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
        }}
      >
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isUser={message.role === 'user'} 
          />
        ))}
        
        {/* AI typing indicator */}
        {isTyping && (
          <div className="flex mb-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isProcessing={isTyping}
        currentPhase={currentPhase}
      />
    </div>
  );
};

export default ChatWindow;