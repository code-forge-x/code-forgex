// client/src/components/Admin/Prompts/PromptEditor.jsx
import React, { useState, useEffect } from 'react';

/**
 * PromptEditor Component
 * Rich text editor for creating and editing prompt templates
 */
const PromptEditor = ({ prompt, components = [], loading, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'general',
    version: 1,
    active: true
  });
  const [showComponentList, setShowComponentList] = useState(false);
  const [componentSearch, setComponentSearch] = useState('');
  
  // Initialize form data when prompt changes
  useEffect(() => {
    if (prompt) {
      setFormData({
        id: prompt.id,
        name: prompt.name || '',
        content: prompt.content || '',
        category: prompt.category || 'general',
        version: prompt.version || 1,
        active: prompt.active !== undefined ? prompt.active : true
      });
    }
  }, [prompt]);
  
  // Filter components based on search
  const filteredComponents = componentSearch 
    ? components.filter(c => 
        c.name.toLowerCase().includes(componentSearch.toLowerCase()) ||
        c.category.toLowerCase().includes(componentSearch.toLowerCase())
      )
    : components;
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  // Insert a variable placeholder
  const insertVariable = () => {
    setFormData({
      ...formData,
      content: formData.content + '{{variable}}'
    });
  };
  
  // Insert a component
  const insertComponent = (component) => {
    setFormData({
      ...formData,
      content: formData.content + '\n\n' + component.content
    });
    setShowComponentList(false);
  };
  
  // Format content with variable highlighting
  const highlightVariables = (content) => {
    if (!content) return '';
    return content.replace(
      /\{\{([^}]+)\}\}/g,
      '<span class="variable-highlight">{{$1}}</span>'
    );
  };
  
  return (
    <div className="prompt-editor">
      <h2>{prompt?.id ? 'Edit Prompt Template' : 'Create New Prompt Template'}</h2>
      
      <form onSubmit={handleSubmit} className="prompt-form">
        <div className="form-group">
          <label htmlFor="name">Template Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={prompt?.id}
            className="input-field"
          />
          {prompt?.id && <small>Template name cannot be changed</small>}
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="select-field"
          >
            <option value="general">General</option>
            <option value="requirements">Requirements</option>
            <option value="blueprint">Blueprint</option>
            <option value="component">Component</option>
            <option value="support">Support</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="version">Version:</label>
          <input
            type="number"
            id="version"
            name="version"
            value={formData.version}
            onChange={handleChange}
            required
            min="1"
            step="1"
            disabled={prompt?.id}
            className="input-field"
          />
          {prompt?.id && <small>Version number cannot be changed</small>}
        </div>
        
        <div className="form-group checkbox-group">
          <label htmlFor="active">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
            />
            Active
          </label>
          <small>Only active templates can be used in the system</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Template Content:</label>
          <div className="editor-toolbar">
            <button 
              type="button" 
              onClick={insertVariable}
              className="toolbar-button"
            >
              Insert Variable
            </button>
            
            <div className="component-dropdown">
              <button 
                type="button" 
                onClick={() => setShowComponentList(!showComponentList)}
                className="toolbar-button"
              >
                Insert Component
              </button>
              
              {showComponentList && (
                <div className="component-list-dropdown">
                  <input
                    type="text"
                    placeholder="Search components..."
                    value={componentSearch}
                    onChange={(e) => setComponentSearch(e.target.value)}
                    className="component-search"
                  />
                  
                  <div className="component-items">
                    {filteredComponents.length === 0 ? (
                      <div className="no-components">No components found</div>
                    ) : (
                      filteredComponents.map(component => (
                        <div 
                          key={component.id} 
                          className="component-item"
                          onClick={() => insertComponent(component)}
                        >
                          <span className="component-name">{component.name}</span>
                          <span className="component-category">{component.category}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="15"
            className="content-editor"
            placeholder="Enter prompt template content here..."
          />
        </div>
        
        <div className="form-group">
          <label>Preview with Variable Highlighting:</label>
          <div 
            className="content-preview"
            dangerouslySetInnerHTML={{ __html: highlightVariables(formData.content) }}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="save-button"
            disabled={loading || !formData.name || !formData.content}
          >
            {loading ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromptEditor;