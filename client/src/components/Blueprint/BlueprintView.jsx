import React from 'react';

const BlueprintView = ({ blueprint }) => {
  // Sample blueprint data for demonstration
  const sampleBlueprint = blueprint || {
    components: [
      { id: 1, name: 'Data Provider', description: 'Fetches real-time and historical forex data' },
      { id: 2, name: 'Strategy Engine', description: 'Implements the moving average crossover logic' },
      { id: 3, name: 'Risk Manager', description: 'Handles position sizing and stop-loss settings' },
      { id: 4, name: 'Execution Engine', description: 'Places and manages orders' },
      { id: 5, name: 'Backtester', description: 'Tests strategy against historical data' }
    ],
    relationships: [
      { from: 1, to: 2, type: 'data_flow' },
      { from: 2, to: 3, type: 'signal' },
      { from: 3, to: 4, type: 'order' },
      { from: 1, to: 5, type: 'historical_data' },
      { from: 2, to: 5, type: 'strategy_config' }
    ]
  };

  return (
    <div className="h-full bg-white p-6 overflow-auto">
      <h2 className="text-xl font-bold mb-6">Architecture Blueprint</h2>
      
      {/* Simple diagram */}
      <div className="mb-8 bg-blue-50 p-6 rounded-lg flex justify-center">
        <div className="relative w-full max-w-2xl h-64">
          {/* Components */}
          {sampleBlueprint.components.map((component, index) => {
            // Position components in a circle
            const angle = (index / sampleBlueprint.components.length) * 2 * Math.PI;
            const radius = 100;
            const x = 50 + 40 * Math.cos(angle);
            const y = 50 + 30 * Math.sin(angle);
            
            return (
              <div 
                key={component.id}
                className="absolute bg-white border border-blue-300 rounded-lg p-3 shadow-md text-center w-32"
                style={{ 
                  left: `${x}%`, 
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                <div className="font-medium text-sm">{component.name}</div>
              </div>
            );
          })}
          
          {/* Lines for relationships */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
            {sampleBlueprint.relationships.map((rel, index) => {
              const fromComp = sampleBlueprint.components.findIndex(c => c.id === rel.from);
              const toComp = sampleBlueprint.components.findIndex(c => c.id === rel.to);
              
              if (fromComp === -1 || toComp === -1) return null;
              
              const fromAngle = (fromComp / sampleBlueprint.components.length) * 2 * Math.PI;
              const toAngle = (toComp / sampleBlueprint.components.length) * 2 * Math.PI;
              
              const fromX = 50 + 40 * Math.cos(fromAngle);
              const fromY = 50 + 30 * Math.sin(fromAngle);
              const toX = 50 + 40 * Math.cos(toAngle);
              const toY = 50 + 30 * Math.sin(toAngle);
              
              return (
                <line 
                  key={index}
                  x1={`${fromX}%`} 
                  y1={`${fromY}%`} 
                  x2={`${toX}%`} 
                  y2={`${toY}%`}
                  stroke="#93c5fd"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            
            <defs>
              <marker 
                id="arrowhead" 
                markerWidth="10" 
                markerHeight="7" 
                refX="9" 
                refY="3.5" 
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#93c5fd" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
      
      {/* Component details */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Components</h3>
        <div className="space-y-4">
          {sampleBlueprint.components.map(component => (
            <div key={component.id} className="border rounded-md p-4">
              <h4 className="font-medium">{component.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{component.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlueprintView;