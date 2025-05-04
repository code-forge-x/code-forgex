// client/src/components/Admin/Prompts/VersionHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * VersionHistory Component
 * Displays the version history of prompt templates
 */
const VersionHistory = ({ prompts, loading }) => {
  const [promptName, setPromptName] = useState('');
  const [versions, setVersions] = useState([]);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get unique prompt names
  const promptNames = [...new Set(prompts.map(p => p.name))];
  
  // Fetch versions for a prompt
  const fetchVersions = async (name) => {
    if (!name) {
      setVersions([]);
      setSelectedVersions([]);
      setComparison(null);
      return;
    }
    
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`//prompts/${name}/versions`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      setVersions(response.data.versions || []);
      setSelectedVersions([]);
      setComparison(null);
    } catch (err) {
      console.error('Error fetching versions:', err);
      setError('Failed to load version history');
    } finally {
      setHistoryLoading(false);
    }
  };
  
  // Handle prompt selection
  const handlePromptSelect = (e) => {
    const name = e.target.value;
    setPromptName(name);
    fetchVersions(name);
  };
  
  // Handle version selection for comparison
  const handleVersionSelect = (version) => {
    if (selectedVersions.includes(version)) {
      // Remove version if already selected
      setSelectedVersions(selectedVersions.filter(v => v !== version));
    } else if (selectedVersions.length < 2) {
      // Add version if less than 2 are selected
      setSelectedVersions([...selectedVersions, version]);
    }
  };
  
  // Compare selected versions
  const handleCompare = async () => {
    if (selectedVersions.length !== 2) return;
    
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Sort versions to ensure proper order (oldest first)
      const sortedVersions = [...selectedVersions].sort();
      
      // Get comparison between versions
      const response = await axios.get(
        `//prompts/${promptName}/compare/${sortedVersions[0]}/${sortedVersions[1]}`, 
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      
      setComparison(response.data);
    } catch (err) {
      console.error('Error comparing versions:', err);
      setError('Failed to compare versions');
    } finally {
      setHistoryLoading(false);
    }
  };
  
  return (
    <div className="version-history">
      <h2>Version History</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="prompt-name">Select Template:</label>
        <select
          id="prompt-name"
          value={promptName}
          onChange={handlePromptSelect}
          disabled={loading || historyLoading}
          className="select-field"
        >
          <option value="">-- Select a template --</option>
          {promptNames.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      
      {historyLoading ? (
        <div className="loading-indicator">Loading version history...</div>
      ) : promptName && versions.length === 0 ? (
        <div className="empty-state">No versions found for this template</div>
      ) : promptName && (
        <>
          <div className="version-selection">
            <p>Select up to 2 versions to compare:</p>
            <div className="version-list">
              {versions.map(version => (
                <div 
                  key={version.version}
                  className={`version-item ${selectedVersions.includes(version.version) ? 'selected' : ''}`}
                  onClick={() => handleVersionSelect(version.version)}
                >
                  <div className="version-header">
                    <span className="version-number">v{version.version}</span>
                    <span className="version-date">
                      {new Date(version.updated).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="version-status">
                    <span className={`status-badge ${version.active ? 'active' : 'inactive'}`}>
                      {version.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {versions.length > 1 && (
              <button
                onClick={handleCompare}
                disabled={selectedVersions.length !== 2 || historyLoading}
                className="compare-button"
              >
                Compare Versions
              </button>
            )}
          </div>
          
          {comparison && (
            <div className="comparison-result">
              <h3>Comparison</h3>
              
              <div className="comparison-header">
                <div className="version-column">
                  <h4>Version {comparison.oldVersion}</h4>
                  <p>{new Date(comparison.oldDate).toLocaleDateString()}</p>
                </div>
                <div className="version-column">
                  <h4>Version {comparison.newVersion}</h4>
                  <p>{new Date(comparison.newDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="comparison-content">
                <div
                  className="diff-view"
                  dangerouslySetInnerHTML={{ __html: comparison.diff }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VersionHistory;