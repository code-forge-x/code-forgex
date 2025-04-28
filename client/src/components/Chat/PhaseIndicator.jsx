import React from 'react';

const PhaseIndicator = ({ currentPhase }) => {
  const phases = [
    { id: 'requirements', label: 'Requirements' },
    { id: 'blueprint', label: 'Blueprint' },
    { id: 'component', label: 'Components' },
    { id: 'support', label: 'Support' }
  ];
  
  const currentIndex = phases.findIndex(p => p.id === currentPhase);
  
  return (
    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="hidden sm:block text-gray-500 mr-2">Progress:</div>
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
          {phases.map((phase, index) => (
            <div 
              key={phase.id} 
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${
                index === currentIndex 
                  ? 'bg-blue-600 text-white' 
                  : index < currentIndex
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {phase.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhaseIndicator;