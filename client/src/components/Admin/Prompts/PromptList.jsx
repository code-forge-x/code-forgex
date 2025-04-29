// client/src/components/Admin/Prompts/PromptList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * PromptList Component
 * Displays all prompt templates with filtering and sorting
 */
const PromptList = ({ prompts, loading, onSelectPrompt, onCreatePrompt, onRefresh }) => {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Filter and sort prompts
  const filteredPrompts = prompts
    .filter(prompt => 
      prompt.name.toLowerCase().includes(filter.toLowerCase()) ||
      prompt.category.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'category') {
        return sortOrder === 'asc' 
          ? a.category.localeCompare(b.category) 
          : b.category.localeCompare(a.category);
      } else if (sortBy === 'version') {
        return sortOrder === 'asc' 
          ? a.version - b.version 
          : b.version - a.version;
      } else if (sortBy === 'updated') {
        return sortOrder === 'asc' 
          ? new Date(a.updated) - new Date(b.updated) 
          : new Date(b.updated) - new Date(a.updated);
      }
      return 0;
    });
  
  // Handle sort changes
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Handle toggle active status
  const handleToggleActive = async (prompt) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/prompts/${prompt.name}/${prompt.version}`, 
        { ...prompt, active: !prompt.active },
        { headers: { 'x-auth-token': token } }
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };
  
  return (
    <div className="prompt-list">
      <div className="prompt-list-header">
        <h2>Prompt Templates</h2>
        <button 
          className="create-button"
          onClick={onCreatePrompt}
        >
          Create New Template
        </button>
      </div>
      
      <div className="prompt-list-filters">
        <input
          type="text"
          placeholder="Filter templates..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />
      </div>
      
      {loading ? (
        <div className="loading-indicator">Loading templates...</div>
      ) : (
        <table className="prompt-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('category')}>
                Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('version')}>
                Version {sortBy === 'version' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('updated')}>
                Last Updated {sortBy === 'updated' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrompts.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No templates found</td>
              </tr>
            ) : (
              filteredPrompts.map(prompt => (
                <tr key={`${prompt.name}-${prompt.version}`}>
                  <td>{prompt.name}</td>
                  <td>{prompt.category}</td>
                  <td>{prompt.version}</td>
                  <td>{new Date(prompt.updated).toLocaleDateString()}</td>
                  <td>
                    <span 
                      className={`status-badge ${prompt.active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(prompt)}
                      title={prompt.active ? 'Click to deactivate' : 'Click to activate'}
                    >
                      {prompt.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-button"
                      onClick={() => onSelectPrompt(prompt)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PromptList;