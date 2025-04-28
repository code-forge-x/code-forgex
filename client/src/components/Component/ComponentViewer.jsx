// client/src/components/component/ComponentViewer.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';

/**
 * ComponentViewer Component
 * View and modify components as specified in the implementation guide
 * Part of the self-building system MVP
 * Handles component generation and the simple approval workflow
 * Integrates with the simpleComponentService backend
 */

const ComponentViewer = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get components from location state if coming from blueprint
  const initialComponents = location.state?.components || [];
  
  const [components, setComponents] = useState(initialComponents);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [editedCode, setEditedCode] = useState('');
  const [newComponent, setNewComponent] = useState({
    name: '',
    type: 'ui',
    framework: 'react',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showNew, setShowNew] = useState(false);
  
  // Select first component by default if available
  useEffect(() => {
    if (components.length > 0 && !selectedComponent) {
      selectComponent(components[0]);
    }
  }, [components]);
  
  // Apply syntax highlighting when component changes
  useEffect(() => {
    if (selectedComponent) {
      Prism.highlightAll();
    }
  }, [selectedComponent]);
  
  // Generate a component
  const generateComponent = async () => {
    if (!newComponent.name) {
      setError('Component name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `/api/projects/${projectId}/components/generate`,
        newComponent,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      // Add to components list and select it
      setComponents([...components, response.data]);
      selectComponent(response.data);
      setSuccessMessage('Component generated successfully!');
      setShowNew(false);
      
      // Reset new component form
      setNewComponent({
        name: '',
        type: 'ui',
        framework: 'react',
        description: ''
      });
    } catch (err) {
      setError('Error generating component: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Select a component for viewing/editing
  const selectComponent = (component) => {
    setSelectedComponent(component);
    setEditedCode(component.code || '');
    setError(null);
    setSuccessMessage('');
  };
  
  // Update component code
  const updateComponentCode = () => {
    if (!selectedComponent) return;
    
    const updatedComponents = components.map(comp => {
      if (comp === selectedComponent) {
        return { ...comp, code: editedCode };
      }
      return comp;
    });
    
    setComponents(updatedComponents);
    setSelectedComponent({ ...selectedComponent, code: editedCode });
    setSuccessMessage('Component updated!');
  };
  
  // Handle save components to files
  const saveComponents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, you'd provide a way to specify the output directory
      // For MVP, we'll use a fixed path
      const outputDir = `/projects/${projectId}/components`;
      
      const response = await axios.post(
        `/api/projects/${projectId}/components/save`,
        {
          components,
          outputDir
        },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      setSuccessMessage(`Components saved to ${outputDir}`);
    } catch (err) {
      setError('Error saving components: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle approval workflow
  const approveComponents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // This connects directly to the approval workflow in the simpleComponentService
      // Part of the self-building system MVP as specified in the implementation guide
      const response = await axios.post(
        `/api/projects/${projectId}/components/approval`,
        {
          components
        },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      setSuccessMessage('Components approved and ready for integration');
    } catch (err) {
      setError('Error approving components: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file upload for a component
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Add component metadata
    const fileName = file.name;
    const baseName = fileName.split('.')[0];
    
    formData.append('componentName', baseName);
    formData.append('componentType', 'ui');
    formData.append('framework', 'react');
    
    try {
      const response = await axios.post(
        `/api/projects/${projectId}/components/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      // Add to components list and select it
      setComponents([...components, response.data]);
      selectComponent(response.data);
      setSuccessMessage('Component uploaded successfully!');
      
      // Reset file input
      e.target.value = '';
    } catch (err) {
      setError('Error uploading component: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Determine language for syntax highlighting
  const getLanguage = (component) => {
    if (!component) return 'jsx';
    
    const { framework } = component;
    
    if (framework === 'react') {
      return 'jsx';
    }
    
    if (framework === 'vue') {
      return 'html'; // Vue files are rendered as HTML + JS
    }
    
    if (framework === 'typescript') {
      return component.type === 'ui' ? 'tsx' : 'typescript';
    }
    
    return 'javascript';
  };
  
  // Handle new component form input change
  const handleNewComponentChange = (e) => {
    const { name, value } = e.target;
    setNewComponent(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="component-viewer-container">
      <h1>Component Manager</h1>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="component-actions">
        <button
          onClick={() => setShowNew(!showNew)}
          className="new-component-button"
        >
          {showNew ? 'Cancel' : 'New Component'}
        </button>
        
        <label className="upload-button">
          Upload Component
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".js,.jsx,.ts,.tsx,.vue"
            style={{ display: 'none' }}
          />
        </label>
        
        {components.length > 0 && (
          <>
            <button
              onClick={saveComponents}
              className="save-components-button"
              disabled={loading}
            >
              Save All Components
            </button>
            <button
              onClick={approveComponents}
              className="approve-components-button"
              disabled={loading}
            >
              Approve Components
            </button>
          </>
        )}
      </div>
      
      {showNew && (
        <div className="new-component-form">
          <h2>Generate New Component</h2>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={newComponent.name}
              onChange={handleNewComponentChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Type</label>
            <select
              name="type"
              value={newComponent.type}
              onChange={handleNewComponentChange}
            >
              <option value="ui">UI Component</option>
              <option value="container">Container Component</option>
              <option value="hook">Hook</option>
              <option value="util">Utility</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Framework</label>
            <select
              name="framework"
              value={newComponent.framework}
              onChange={handleNewComponentChange}
            >
              <option value="react">React</option>
              <option value="vue">Vue</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={newComponent.description}
              onChange={handleNewComponentChange}
              rows={3}
            />
          </div>
          
          <button
            onClick={generateComponent}
            disabled={loading || !newComponent.name}
            className="generate-button"
          >
            Generate Component
          </button>
        </div>
      )}
      
      <div className="component-layout">
        <div className="component-list">
          <h2>Components ({components.length})</h2>
          {components.length === 0 ? (
            <div className="no-components">
              No components yet. Generate or upload components to get started.
            </div>
          ) : (
            <ul>
              {components.map((component, index) => (
                <li 
                  key={index}
                  className={selectedComponent === component ? 'selected' : ''}
                  onClick={() => selectComponent(component)}
                >
                  <div className="component-list-item">
                    <span className="component-name">{component.name}</span>
                    <span className="component-type">{component.type}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="component-detail">
          {selectedComponent ? (
            <>
              <div className="component-header">
                <h2>{selectedComponent.name}</h2>
                <div className="component-meta">
                  <span className="component-framework">{selectedComponent.framework}</span>
                  <span className="component-type">{selectedComponent.type}</span>
                </div>
              </div>
              
              {selectedComponent.description && (
                <div className="component-description">
                  {selectedComponent.description}
                </div>
              )}
              
              <div className="code-editor">
                <textarea
                  value={editedCode}
                  onChange={(e) => setEditedCode(e.target.value)}
                  rows={20}
                />
                
                <button
                  onClick={updateComponentCode}
                  className="update-code-button"
                  disabled={!editedCode || editedCode === selectedComponent.code}
                >
                  Update Code
                </button>
              </div>
              
              <div className="code-preview">
                <h3>Preview</h3>
                <pre>
                  <code className={`language-${getLanguage(selectedComponent)}`}>
                    {selectedComponent.code}
                  </code>
                </pre>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a component from the list to view or edit it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentViewer;