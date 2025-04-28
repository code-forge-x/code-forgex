import React from 'react';

// Sample files - in a real app, these would come from the API
const SAMPLE_FILES = [
  { id: 1, name: 'main.js', type: 'javascript' },
  { id: 2, name: 'strategy.js', type: 'javascript' },
  { id: 3, name: 'riskManager.js', type: 'javascript' },
  { id: 4, name: 'backtest.js', type: 'javascript' },
  { id: 5, name: 'config.js', type: 'javascript' }
];

const FileExplorer = ({ onFileSelect, currentFile }) => {
  return (
    <div className="h-full bg-white border-r border-gray-200">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Project Files</h3>
      </div>
      <div className="py-1">
        {SAMPLE_FILES.map((file) => (
          <div
            key={file.id}
            className={`px-3 py-2 flex items-center cursor-pointer ${
              currentFile?.id === file.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
            }`}
            onClick={() => onFileSelect(file)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;