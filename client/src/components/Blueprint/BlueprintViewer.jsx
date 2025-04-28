// client/src/components/blueprint/BlueprintViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as d3 from 'd3';

/**
 * BlueprintViewer Component
 * View and modify blueprints as specified in the implementation guide
 * Part of the self-building system MVP
 * Provides visualization and management of system architecture
 * Integrates with the simpleBlueprintService and basicExtractionService backends
 */

const BlueprintViewer = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [view, setView] = useState('graph'); // 'graph', 'components', 'services', 'models', 'apis'
  const [generating, setGenerating] = useState(false);
  
  const svgRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Fetch blueprint on component mount
  useEffect(() => {
    fetchBlueprint();
  }, [projectId]);
  
  // Render graph when blueprint changes
  useEffect(() => {
    if (blueprint && view === 'graph') {
      renderGraph();
    }
  }, [blueprint, view]);
  
  // Fetch blueprint from API
  const fetchBlueprint = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/projects/${projectId}/blueprint`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      setBlueprint(response.data);
    } catch (err) {
      setError('Error fetching blueprint: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file upload for blueprint generation
  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    const files = fileInputRef.current.files;
    
    if (!files || files.length === 0) {
      setError('Please select files to upload');
      return;
    }
    
    setGenerating(true);
    setUploadProgress(0);
    setError(null);
    
    const formData = new FormData();
    
    // Add all files to the form data
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    try {
      const response = await axios.post(
        `/api/projects/${projectId}/blueprint/generate`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );
      
      setBlueprint(response.data);
      
      // Reset file input
      fileInputRef.current.value = '';
    } catch (err) {
      setError('Error generating blueprint: ' + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };
  
  // Generate components from blueprint
  const generateComponents = async () => {
    if (!blueprint || !blueprint.components || blueprint.components.length === 0) {
      setError('No components found in blueprint');
      return;
    }
    
    try {
      // Convert blueprint components to format expected by the simpleComponentService
      // This aligns with the component generation part of the self-building system
      const componentRequests = blueprint.components.map(comp => ({
        name: comp.name,
        type: comp.type || 'ui',
        framework: 'react', // Default to React for MVP
        description: `Generated from blueprint: ${comp.file}`
      }));
      
      const response = await axios.post(
        `/api/projects/${projectId}/components/generate-multiple`,
        {
          components: componentRequests,
          fromBlueprint: true // This flag triggers the approval workflow as required in the implementation guide
        },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      // Navigate to component viewer with the generated components
      navigate(`/project/${projectId}/components`, {
        state: { components: response.data }
      });
    } catch (err) {
      setError('Error generating components: ' + (err.response?.data?.message || err.message));
    }
  };
  
  // Render the D3 graph visualization
  const renderGraph = () => {
    if (!blueprint) return;
    
    // Clear previous graph
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Set up graph dimensions
    const width = 800;
    const height = 600;
    
    // Create nodes from components, services, models, and APIs
    const nodes = [
      ...(blueprint.components || []).map(c => ({
        id: c.name,
        type: 'component',
        file: c.file
      })),
      ...(blueprint.services || []).map(s => ({
        id: s.name,
        type: 'service',
        file: s.file
      })),
      ...(blueprint.models || []).map(m => ({
        id: m.name,
        type: 'model',
        file: m.file
      })),
      ...(blueprint.apis || []).map(a => ({
        id: a.name,
        type: 'api',
        file: a.file
      }))
    ];
    
    // Create links from relationships
    const links = (blueprint.relationships || []).map(r => ({
      source: r.from,
      target: r.to,
      type: r.type
    }));
    
    // Set up the force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));
    
    // Create the SVG container
    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%');
    
    // Define arrow marker for links
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');
    
    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');
    
    // Create nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));
    
    // Add circles to nodes
    node.append('circle')
      .attr('r', 10)
      .attr('fill', d => {
        switch (d.type) {
          case 'component': return '#ff7f0e';
          case 'service': return '#1f77b4';
          case 'model': return '#2ca02c';
          case 'api': return '#d62728';
          default: return '#7f7f7f';
        }
      });
    
    // Add labels to nodes
    node.append('text')
      .attr('dx', 12)
      .attr('dy', '.35em')
      .text(d => d.id);
    
    // Add titles for tooltips
    node.append('title')
      .text(d => `${d.id} (${d.type}): ${d.file}`);
    
    // Update simulation on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => {
          // Set end point before the arrow
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const l = Math.sqrt(dx * dx + dy * dy);
          return d.source.x + (dx * (l - 15)) / l;
        })
        .attr('y2', d => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const l = Math.sqrt(dx * dx + dy * dy);
          return d.source.y + (dy * (l - 15)) / l;
        });
      
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };
  
  // Render a list view of items
  const renderListView = (items, type) => {
    if (!items || items.length === 0) {
      return <div className="no-items">No {type} found</div>;
    }
    
    return (
      <div className="blueprint-list">
        {items.map((item, index) => (
          <div key={index} className={`blueprint-item ${type}-item`}>
            <div className="item-name">{item.name}</div>
            <div className="item-file">{item.file}</div>
            {type === 'component' && (
              <button
                className="generate-button"
                onClick={() => generateComponents([item])}
              >
                Generate
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="blueprint-viewer-container">
      <h1>Project Blueprint</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="blueprint-actions">
        <form onSubmit={handleFileUpload} className="upload-form">
          <div className="file-input-container">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              disabled={generating}
            />
            <button
              type="submit"
              disabled={generating}
              className="generate-blueprint-button"
            >
              Generate Blueprint
            </button>
          </div>
          
          {generating && (
            <div className="upload-progress">
              <div
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <div className="progress-text">{uploadProgress}%</div>
            </div>
          )}
        </form>
        
        {blueprint && (
          <button
            onClick={generateComponents}
            className="generate-components-button"
            disabled={!blueprint?.components?.length}
          >
            Generate All Components
          </button>
        )}
      </div>
      
      {loading && !blueprint ? (
        <div className="loading">Loading blueprint...</div>
      ) : blueprint ? (
        <div className="blueprint-content">
          <div className="blueprint-tabs">
            <button
              className={`tab ${view === 'graph' ? 'active' : ''}`}
              onClick={() => setView('graph')}
            >
              Graph View
            </button>
            <button
              className={`tab ${view === 'components' ? 'active' : ''}`}
              onClick={() => setView('components')}
            >
              Components ({blueprint.components?.length || 0})
            </button>
            <button
              className={`tab ${view === 'services' ? 'active' : ''}`}
              onClick={() => setView('services')}
            >
              Services ({blueprint.services?.length || 0})
            </button>
            <button
              className={`tab ${view === 'models' ? 'active' : ''}`}
              onClick={() => setView('models')}
            >
              Models ({blueprint.models?.length || 0})
            </button>
            <button
              className={`tab ${view === 'apis' ? 'active' : ''}`}
              onClick={() => setView('apis')}
            >
              APIs ({blueprint.apis?.length || 0})
            </button>
          </div>
          
          <div className="blueprint-view">
            {view === 'graph' ? (
              <div className="graph-container">
                <svg ref={svgRef}></svg>
              </div>
            ) : view === 'components' ? (
              renderListView(blueprint.components, 'component')
            ) : view === 'services' ? (
              renderListView(blueprint.services, 'service')
            ) : view === 'models' ? (
              renderListView(blueprint.models, 'model')
            ) : view === 'apis' ? (
              renderListView(blueprint.apis, 'api')
            ) : null}
          </div>
        </div>
      ) : (
        <div className="no-blueprint">
          <p>No blueprint found. Upload code files to generate a blueprint.</p>
        </div>
      )}
    </div>
  );
};

export default BlueprintViewer;