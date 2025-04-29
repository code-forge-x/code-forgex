// client/src/components/Admin/PromptManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import useRoleAuth from '../../hooks/useRoleAuth';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';

// Import the sub-components
import PromptList from './Prompts/PromptList';
import PromptEditor from './Prompts/PromptEditor';
import PromptTester from './Prompts/PromptTester';
import VersionHistory from './Prompts/VersionHistory';
import PerformanceMetrics from './Prompts/PerformanceMetrics';
import ComponentLibrary from './Prompts/ComponentLibrary';

/**
 * PromptManagement Component - MVP Implementation
 * Centralized interface for managing prompt templates and components
 * Based on the promptManagementUIImplementation from the implementation guide
 */
const PromptManagement = () => {
  // State
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Hooks
  const { currentUser } = useAuth();
  const { isAdmin, hasPermission } = useRoleAuth();
  const navigate = useNavigate();
  
  // Check if user has admin permissions
  useEffect(() => {
    if (!isAdmin() && !hasPermission('manage_prompts')) {
      navigate('/dashboard');
    }
  }, [isAdmin, hasPermission, navigate]);
  
  // Fetch prompts when component mounts
  useEffect(() => {
    fetchPrompts();
  }, []);
  
  // Fetch components when component mounts
  useEffect(() => {
    if (activeTab === 'components') {
      fetchComponents();
    }
  }, [activeTab]);
  
  // Function to fetch prompts
  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/prompts', {
        headers: {
          'x-auth-token': token
        }
      });
      setPrompts(response.data);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError('Failed to load prompt templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch components
  const fetchComponents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/prompts/components', {
        headers: {
          'x-auth-token': token
        }
      });
      setComponents(response.data);
    } catch (err) {
      console.error('Error fetching components:', err);
      setError('Failed to load prompt components. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle prompt selection
  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
    setActiveTab('editor');
  };
  
  // Handle prompt creation
  const handleCreatePrompt = () => {
    setSelectedPrompt({
      id: null,
      name: '',
      content: '',
      category: 'general',
      version: 1,
      active: true
    });
    setActiveTab('editor');
  };
  
  // Handle tab changes
  const handleTabChange = (tab) => {
    // If we're leaving the editor tab, clear selection
    if (activeTab === 'editor' && tab !== 'editor') {
      setSelectedPrompt(null);
    }
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };
  
  // Handle saving a prompt
  const handleSavePrompt = async (promptData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      if (promptData.id) {
        // Update existing prompt
        await axios.put(`/api/prompts/${promptData.name}/${promptData.version}`, promptData, { headers });
        setSuccess('Prompt template updated successfully');
      } else {
        // Create new prompt
        await axios.post('/api/prompts', promptData, { headers });
        setSuccess('Prompt template created successfully');
      }
      
      // Refresh prompts list
      await fetchPrompts();
      
      // Show success message for a moment before changing tabs
      setTimeout(() => {
        setActiveTab('templates');
        setSelectedPrompt(null);
      }, 1500);
    } catch (err) {
      console.error('Error saving prompt:', err);
      setError(err.response?.data?.message || 'Failed to save prompt template');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle saving a component
  const handleSaveComponent = async (componentData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      if (componentData.id) {
        // Update existing component
        await axios.put(`/api/prompts/components/${componentData.id}`, componentData, { headers });
        setSuccess('Component updated successfully');
      } else {
        // Create new component
        await axios.post('/api/prompts/components', componentData, { headers });
        setSuccess('Component created successfully');
      }
      
      // Refresh components list
      await fetchComponents();
    } catch (err) {
      console.error('Error saving component:', err);
      setError(err.response?.data?.message || 'Failed to save component');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="prompt-management">
        <h1 className="page-title">Prompt Management</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => handleTabChange('templates')}
          >
            Templates
          </button>
          <button 
            className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => handleTabChange('editor')}
            disabled={!selectedPrompt && activeTab !== 'editor'}
          >
            Editor
          </button>
          <button 
            className={`tab-button ${activeTab === 'tester' ? 'active' : ''}`}
            onClick={() => handleTabChange('tester')}
          >
            Tester
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleTabChange('history')}
          >
            Version History
          </button>
          <button 
            className={`tab-button ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => handleTabChange('metrics')}
          >
            Performance Metrics
          </button>
          <button 
            className={`tab-button ${activeTab === 'components' ? 'active' : ''}`}
            onClick={() => handleTabChange('components')}
          >
            Component Library
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'templates' && (
            <PromptList 
              prompts={prompts}
              loading={loading}
              onSelectPrompt={handlePromptSelect}
              onCreatePrompt={handleCreatePrompt}
              onRefresh={fetchPrompts}
            />
          )}
          
          {activeTab === 'editor' && (
            <PromptEditor 
              prompt={selectedPrompt} 
              components={components}
              loading={loading}
              onSave={handleSavePrompt}
              onCancel={() => handleTabChange('templates')}
            />
          )}
          
          {activeTab === 'tester' && (
            <PromptTester 
              prompts={prompts}
              loading={loading} 
            />
          )}
          
          {activeTab === 'history' && (
            <VersionHistory 
              prompts={prompts}
              loading={loading} 
            />
          )}
          
          {activeTab === 'metrics' && (
            <PerformanceMetrics 
              prompts={prompts}
              loading={loading} 
            />
          )}
          
          {activeTab === 'components' && (
            <ComponentLibrary 
              components={components}
              loading={loading}
              onSave={handleSaveComponent}
              onRefresh={fetchComponents}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PromptManagement;