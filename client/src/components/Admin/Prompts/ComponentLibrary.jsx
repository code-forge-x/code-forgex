// client/src/components/Admin/Prompts/ComponentLibrary.jsx
import React, { useState } from 'react';

/**
 * ComponentLibrary Component
 * Manages reusable prompt components
 */
const ComponentLibrary = ({ components, loading, onSave, onRefresh }) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: '',
    description: ''
  });
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter components based on search
  const filteredComponents = filter
    ? components.filter(comp => 
        comp.name.toLowerCase().includes(filter.toLowerCase()) ||
        comp.category.toLowerCase().includes(filter.toLowerCase()) ||
        (comp.description && comp.description.toLowerCase().includes(filter.toLowerCase()))
      )
    : components;
  
  // Start creating a new component
  const handleCreateNew = () => {
    setSelectedComponent(null);
    setFormData({
      name: '',
      content: '',
      category: '',
      description: ''
    });
    setEditMode(true);
    setError('');
    setSuccess('');
  };
  
  // Edit an existing component
  const handleEdit = (component) => {
    setSelectedComponent(component);
    setFormData({
      id: component._id,
      name: component.name,
      content: component.content,
      category: component.category,
      description: component.description || ''
    });
    setEditMode(true);
    setError('');
    setSuccess('');
  };
  
  // Cancel editing
  const handleCancel = () => {
    setEditMode(false);
    setSelectedComponent(null);
    setError('');
    setSuccess('');
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Save component
  const handleSave = async () => {
    if (!formData.name || !formData.content || !formData.category) {
      setError('Name, content, and category are required');
      return;
    }
    
    try {
      await onSave(formData);
      setSuccess(selectedComponent ? 'Component updated successfully' : 'Component created successfully');
      
      // Exit edit mode after a delay
      setTimeout(() => {
        setEditMode(false);
        setSelectedComponent(null);
        setSuccess('');
        if (onRefresh) onRefresh();
      }, 1500);
    } catch (err) {
      setError('Failed to save component');
    }
  };
  
  // Copy component to clipboard
  const handleCopy = (component) => {
    navigator.clipboard.writeText(component.content)
      .then(() => {
        setSuccess(`"${component.name}" copied to clipboard`);
        
        // Clear success message after a delay
        setTimeout(() => {
          setSuccess('');
        }, 2000);
      })
      .catch(() => {
        setError('Failed to copy to clipboard');
      });
  };
  
  return (
    <div className="component-library">
      <div className="library-header">
        <h2>Prompt Component Library</h2>
        {!editMode && (
          <button 
            onClick={handleCreateNew}
            className="create-button"
            disabled={loading}
          >
            Create New Component
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {editMode ? (
        <div className="component-editor">
          <h3>{selectedComponent ? 'Edit Component' : 'Create New Component'}</h3>
          
          <div className="form-group">
            <label htmlFor="name">Component Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter component name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="E.g., header, footer, instructions, etc."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Brief description of the component's purpose"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Content:</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="10"
              className="content-editor"
              placeholder="Enter component content here..."
            />
          </div>
          
          <div className="form-actions">
            <button 
              onClick={handleCancel}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="save-button"
              disabled={loading || !formData.name || !formData.category || !formData.content}
            >
              {loading ? 'Saving...' : 'Save Component'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="component-search">
            <input
              type="text"
              placeholder="Search components..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-input"
            />
          </div>
          
          {loading ? (
            <div className="loading-indicator">Loading components...</div>
          ) : filteredComponents.length === 0 ? (
            <div className="empty-state">
              <p>No components found</p>
              <button 
                onClick={handleCreateNew}
                className="create-button"
              >
                Create Your First Component
              </button>
            </div>
          ) : (
            <div className="component-grid">
              {filteredComponents.map(component => (
                <div key={component._id} className="component-card">
                  <div className="component-header">
                    <h3>{component.name}</h3>
                    <span className="component-category">{component.category}</span>
                  </div>
                  
                  {component.description && (
                    <div className="component-description">
                      {component.description}
                    </div>
                  )}
                  
                  <div className="component-content">
                    <pre>{component.content}</pre>
                  </div>
                  
                  <div className="component-actions">
                    <button
                      onClick={() => handleEdit(component)}
                      className="edit-button"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCopy(component)}
                      className="copy-button"
                      disabled={loading}
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComponentLibrary;