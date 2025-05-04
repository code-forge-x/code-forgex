// client/src/components/chat/EnhancedChatInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * EnhancedChatInput Component
 * Improved chat input with template support as specified in the implementation guide
 * Connects to the prompt management system for template retrieval
 * Supports both global templates and project-specific overrides
 */

const EnhancedChatInput = ({ onSendMessage, projectId, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const templateMenuRef = useRef(null);

  // Fetch templates on component mount if project ID is provided
  useEffect(() => {
    if (projectId) {
      fetchTemplates();
    }
  }, [projectId]);

  // Handle clicks outside the template menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(event.target)) {
        setShowTemplates(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter templates based on search
  useEffect(() => {
    if (templateSearch) {
      const filtered = templates.filter(template => 
        template.name.toLowerCase().includes(templateSearch.toLowerCase())
      );
      setFilteredTemplates(filtered);
    } else {
      setFilteredTemplates(templates);
    }
  }, [templateSearch, templates]);

  // Fetch templates from API
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // Try to get project-specific templates first - aligning with the ProjectPrompt model
      let response = await axios.get(`//prompts/project/${projectId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // If no project templates, get global templates - aligning with the Prompt model
      if (response.data.length === 0) {
        response = await axios.get('//prompts', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
      }
      
      // Filter only active templates as specified in the Prompt model's 'active' field
      const activeTemplates = response.data.filter(template => template.active);
      
      setTemplates(activeTemplates);
      setFilteredTemplates(activeTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle message input change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  // Open templates menu
  const handleOpenTemplates = () => {
    setShowTemplates(true);
    setTemplateSearch('');
  };

  // Handle template search
  const handleTemplateSearch = (e) => {
    setTemplateSearch(e.target.value);
  };

  // Insert a template into the message
  const insertTemplate = (template) => {
    setMessage(template.content);
    setShowTemplates(false);
    // Focus the input after inserting template
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="enhanced-chat-input-container">
      <form onSubmit={handleSendMessage} className="chat-form">
        <div className="input-container">
          <textarea
            ref={inputRef}
            className="message-input"
            value={message}
            onChange={handleMessageChange}
            placeholder="Type your message here..."
            disabled={disabled}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          
          <div className="input-buttons">
            <button
              type="button"
              className="template-button"
              onClick={handleOpenTemplates}
              disabled={disabled || loading}
            >
              Templates
            </button>
            
            <button
              type="submit"
              className="send-button"
              disabled={!message.trim() || disabled}
            >
              Send
            </button>
          </div>
        </div>
      </form>
      
      {/* Template selection menu */}
      {showTemplates && (
        <div className="template-menu" ref={templateMenuRef}>
          <div className="template-search">
            <input
              type="text"
              placeholder="Search templates..."
              value={templateSearch}
              onChange={handleTemplateSearch}
              autoFocus
            />
          </div>
          
          <div className="template-list">
            {loading ? (
              <div className="template-loading">Loading templates...</div>
            ) : filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <div
                  key={`${template.name}-${template.version}`}
                  className="template-item"
                  onClick={() => insertTemplate(template)}
                >
                  <div className="template-name">{template.name}</div>
                  <div className="template-category">{template.category}</div>
                </div>
              ))
            ) : (
              <div className="no-templates">No templates found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatInput;