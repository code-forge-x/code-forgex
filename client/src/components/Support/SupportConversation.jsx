// client/src/components/support/SupportConversation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EnhancedChatInput from '../Chat/EnhancedChatInput';
import EnhancedChatMessage from '../Chat/EnhancedChatMessage';

/**
 * SupportConversationUI Component
 * Support conversation interface as specified in the implementation guide
 * Implements persistent conversation tracking with support IDs
 * Handles specialized workflows for bug fixes, library upgrades, and code reviews
 * Integrates with the supportConversationService backend
 */

const SupportConversation = () => {
  const { projectId, supportId } = useParams();
  const navigate = useNavigate();
  
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  // For creating a new conversation
  const [showNewConversation, setShowNewConversation] = useState(!supportId);
  const [newConversationData, setNewConversationData] = useState({
    title: '',
    category: 'general'
  });
  
  // Fetch conversation if supportId is provided
  useEffect(() => {
    if (supportId) {
      fetchConversation();
    } else {
      setLoading(false);
    }
  }, [supportId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);
  
  // Fetch conversation from API
  const fetchConversation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/support/${supportId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      setConversation(response.data);
    } catch (err) {
      setError('Error fetching conversation: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new conversation
  const createConversation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Match the fields expected by the SupportConversation model and supportConversationService
      const response = await axios.post('/api/support', {
        projectId,
        title: newConversationData.title,
        category: newConversationData.category
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Navigate to the new conversation using the supportId from the response
      navigate(`/project/${projectId}/support/${response.data.supportId}`);
    } catch (err) {
      setError('Error creating conversation: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Send a message in conversation
  const sendMessage = async (content) => {
    if (!supportId || sending) return;
    
    setSending(true);
    
    try {
      const response = await axios.post(`/api/support/${supportId}/message`, {
        content
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      setConversation(response.data);
    } catch (err) {
      setError('Error sending message: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };
  
  // Update conversation status
  const updateStatus = async (status) => {
    if (!supportId) return;
    
    try {
      const response = await axios.patch(`/api/support/${supportId}/status`, {
        status
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      setConversation(response.data);
    } catch (err) {
      setError('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  };
  
  // Handle new conversation input change
  const handleNewConversationChange = (e) => {
    const { name, value } = e.target;
    setNewConversationData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Render new conversation form
  if (showNewConversation) {
    return (
      <div className="support-conversation-container">
        <h1>Start New Support Conversation</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={createConversation} className="new-conversation-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={newConversationData.title}
              onChange={handleNewConversationChange}
              required
              placeholder="Briefly describe your issue"
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={newConversationData.category}
              onChange={handleNewConversationChange}
            >
              <option value="general">General Question</option>
              <option value="bug_fix">Bug Fix</option>
              <option value="feature_request">Feature Request</option>
              <option value="code_review">Code Review</option>
              <option value="library_upgrade">Library Upgrade</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/project/${projectId}/support`)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              Start Conversation
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  // Render conversation view
  return (
    <div className="support-conversation-container">
      {loading && !conversation ? (
        <div className="loading">Loading conversation...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : conversation ? (
        <>
          <div className="conversation-header">
            <h1>{conversation.title}</h1>
            
            <div className="conversation-meta">
              <div className="conversation-id">ID: {conversation.supportId}</div>
              <div className={`conversation-status status-${conversation.status}`}>
                {conversation.status.replace('_', ' ')}
              </div>
              <div className="conversation-category">
                {conversation.category.replace('_', ' ')}
              </div>
            </div>
            
            <div className="conversation-actions">
              {conversation.status === 'open' && (
                <button
                  onClick={() => updateStatus('in_progress')}
                  className="status-button in-progress"
                >
                  Mark In Progress
                </button>
              )}
              {['open', 'in_progress'].includes(conversation.status) && (
                <button
                  onClick={() => updateStatus('resolved')}
                  className="status-button resolved"
                >
                  Mark Resolved
                </button>
              )}
              {conversation.status !== 'closed' && (
                <button
                  onClick={() => updateStatus('closed')}
                  className="status-button closed"
                >
                  Close Conversation
                </button>
              )}
            </div>
          </div>
          
          <div className="conversation-messages">
            {conversation.messages.map((message, index) => (
              <EnhancedChatMessage key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="conversation-input">
            <EnhancedChatInput
              onSendMessage={sendMessage}
              projectId={projectId}
              disabled={['resolved', 'closed'].includes(conversation.status) || sending}
            />
            
            {['resolved', 'closed'].includes(conversation.status) && (
              <div className="conversation-closed-message">
                This conversation is {conversation.status}. 
                {conversation.status === 'resolved' && (
                  <button
                    onClick={() => updateStatus('open')}
                    className="reopen-button"
                  >
                    Reopen
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="no-conversation">
          <p>No conversation found. Would you like to start a new one?</p>
          <button
            onClick={() => setShowNewConversation(true)}
            className="new-conversation-button"
          >
            Start New Conversation
          </button>
        </div>
      )}
    </div>
  );
};

export default SupportConversation;