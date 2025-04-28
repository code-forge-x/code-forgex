import React from 'react';

const CodeEditor = ({ file }) => {
  return (
    <div className="h-full bg-gray-900 text-gray-200 font-mono text-sm p-4 overflow-auto">
      {file ? (
        <pre>{file.content}</pre>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Select a file or generate code to view</p>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;