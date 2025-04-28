// client/src/components/admin/PromptManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * PromptManagementUI Component
 * Admin interface for templates as specified in the implementation guide
 * Handles creation, updating, and version control for prompt templates
 * Aligns with the backend promptManager service and Prompt model
 */

const PromptManagement = () => {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [newPrompt, setNewPrompt] = useState({
    name: '',
    content: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch prompts on component mount
  useEffect(() => {
    fetchPrompts();
  }, []);

  // Fetch all prompts from API
  const fetchPrompts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/prompts', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      setPrompts(response.data);
    } catch (err) {
      setError('Error fetching prompts: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes for new prompt
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPrompt(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form input changes for selected prompt
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedPrompt(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create a new prompt
  const createPrompt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await axios.post('/api/prompts', newPrompt, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Clear form and refresh prompts
      setNewPrompt({
        name: '',
        content: '',
        category: 'general'
      });
      
      setSuccessMessage('Prompt created successfully!');
      fetchPrompts();
    } catch (err) {
      setError('Error creating prompt: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Update an existing prompt
  const updatePrompt = async (e) => {
    e.preventDefault();
    if (!selectedPrompt) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.put(`/api/prompts/${selectedPrompt.name}/${selectedPrompt.version}`, {
        content: selectedPrompt.content,
        category: selectedPrompt.category,
        active: selectedPrompt.active
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      setSuccessMessage('Prompt updated successfully!');
      fetchPrompts();
    } catch (err) {
      setError('Error updating prompt: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Select a prompt for editing
  const selectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    // Clear any previous messages
    setSuccessMessage('');
    setError(null);
  };

  // Create a new version of a prompt
  const createNewVersion = async () => {
    if (!selectedPrompt) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.post('/api/prompts', {
        name: selectedPrompt.name,
        content: selectedPrompt.content,
        category: selectedPrompt.category
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      setSuccessMessage('New version created successfully!');
      fetchPrompts();
    } catch (err) {
      setError('Error creating new version: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prompt-management-container">
      <h1>Prompt Management</h1>
      
      {/* Error and success messages */}
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="prompt-management-layout">
        {/* Prompt list section */}
        <div className="prompt-list-section">
          <h2>Prompt Templates</h2>
          {loading && <p>Loading prompts...</p>}
          
          <ul className="prompt-list">
            {prompts.map((prompt) => (
              <li 
                key={`${prompt.name}-${prompt.version}`}
                className={selectedPrompt && selectedPrompt._id === prompt._id ? 'selected' : ''}
                onClick={() => selectPrompt(prompt)}
              >
                <div className="prompt-list-item">
                  <span className="prompt-name">{prompt.name}</span>
                  <span className="prompt-version">v{prompt.version}</span>
                  <span className={`prompt-status ${prompt.active ? 'active' : 'inactive'}`}>
                    {prompt.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Edit selected prompt section */}
        <div className="edit-prompt-section">
          {selectedPrompt ? (
            <>
              <h2>Edit Prompt Template</h2>
              <form onSubmit={updatePrompt}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={selectedPrompt.name}
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label>Version</label>
                  <input
                    type="text"
                    value={selectedPrompt.version}
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={selectedPrompt.category}
                    onChange={handleEditChange}
                  >
                    <option value="general">General</option>
                    <option value="financial">Financial</option>
                    <option value="support">Support</option>
                    <option value="development">Development</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="active"
                    value={selectedPrompt.active}
                    onChange={handleEditChange}
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    name="content"
                    value={selectedPrompt.content}
                    onChange={handleEditChange}
                    rows={10}
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" disabled={loading}>
                    Update Prompt
                  </button>
                  <button
                    type="button"
                    onClick={createNewVersion}
                    disabled={loading}
                  >
                    Create New Version
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-selection-message">
              <p>Select a prompt template from the list to edit it.</p>
            </div>
          )}
        </div>
        
        {/* Create new prompt section */}
        <div className="create-prompt-section">
          <h2>Create New Prompt Template</h2>
          <form onSubmit={createPrompt}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={newPrompt.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={newPrompt.category}
                onChange={handleInputChange}
              >
                <option value="general">General</option>
                <option value="financial">Financial</option>
                <option value="support">Support</option>
                <option value="development">Development</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Content</label>
              <textarea
                name="content"
                value={newPrompt.content}
                onChange={handleInputChange}
                rows={10}
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              Create Prompt
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromptManagement;