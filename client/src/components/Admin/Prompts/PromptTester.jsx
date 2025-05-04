// client/src/components/Admin/Prompts/PromptTester.jsx
import React, { useState } from 'react';
import axios from 'axios';

/**
 * PromptTester Component
 * Allows testing prompt templates with variables
 */
const PromptTester = ({ prompts, loading }) => {
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [variables, setVariables] = useState({});
  const [variableFields, setVariableFields] = useState([]);
  const [testLoading, setTestLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  
  // Active templates only
  const activePrompts = prompts.filter(p => p.active);
  
  // Handle prompt selection
  const handlePromptSelect = async (e) => {
    const promptId = e.target.value;
    setSelectedPrompt(promptId);
    setVariables({});
    setVariableFields([]);
    setResult('');
    setError('');
    
    if (!promptId) return;
    
    try {
      // Find the selected prompt
      const prompt = prompts.find(p => p._id === promptId);
      if (!prompt) return;
      
      // Extract variables from the template using regex
      const variableRegex = /\{\{([^}]+)\}\}/g;
      const matches = [...prompt.content.matchAll(variableRegex)];
      
      // Get unique variable names
      const uniqueVariables = [...new Set(matches.map(match => match[1]))];
      
      // Set the variable fields
      setVariableFields(uniqueVariables);
      
      // Initialize variables object
      const initialVars = {};
      uniqueVariables.forEach(variable => {
        initialVars[variable] = '';
      });
      setVariables(initialVars);
    } catch (err) {
      console.error('Error processing template:', err);
      setError('Failed to process template variables');
    }
  };
  
  // Handle variable value changes
  const handleVariableChange = (variable, value) => {
    setVariables({
      ...variables,
      [variable]: value
    });
  };
  
  // Test the prompt with variables
  const handleTest = async () => {
    setTestLoading(true);
    setError('');
    setResult('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('//prompts/test', {
        promptId: selectedPrompt,
        variables
      }, {
        headers: {
          'x-auth-token': token
        }
      });
      
      setResult(response.data.processedPrompt || 'No result returned');
    } catch (err) {
      console.error('Error testing prompt:', err);
      setError('Failed to test prompt template. Please try again.');
    } finally {
      setTestLoading(false);
    }
  };
  
  return (
    <div className="prompt-tester">
      <h2>Prompt Template Tester</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="tester-container">
        <div className="form-group">
          <label htmlFor="prompt-select">Select Prompt Template:</label>
          <select
            id="prompt-select"
            value={selectedPrompt}
            onChange={handlePromptSelect}
            disabled={loading || testLoading}
            className="select-field"
          >
            <option value="">-- Select a template --</option>
            {activePrompts.map(prompt => (
              <option key={`${prompt._id}`} value={prompt._id}>
                {prompt.name} (v{prompt.version}) - {prompt.category}
              </option>
            ))}
          </select>
        </div>
        
        {variableFields.length > 0 && (
          <>
            <h3>Variables</h3>
            
            {variableFields.map(variable => (
              <div className="form-group" key={variable}>
                <label htmlFor={`var-${variable}`}>{variable}:</label>
                <input
                  type="text"
                  id={`var-${variable}`}
                  value={variables[variable] || ''}
                  onChange={(e) => handleVariableChange(variable, e.target.value)}
                  className="input-field"
                  placeholder={`Enter value for ${variable}`}
                />
              </div>
            ))}
            
            <button 
              onClick={handleTest}
              disabled={loading || testLoading || !selectedPrompt}
              className="test-button"
            >
              {testLoading ? 'Processing...' : 'Test Prompt'}
            </button>
          </>
        )}
        
        {result && (
          <div className="result-container">
            <h3>Processed Prompt:</h3>
            <div className="result-content">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptTester;