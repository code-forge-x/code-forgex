import React, { useState, useRef } from 'react';
import ChatWindow from './Chat/ChatWindow';
import CodeEditor from './Editor/CodeEditor';
import FileExplorer from './Editor/FileExplorer';
import BlueprintView from './Blueprint/BlueprintView';

const ProjectWorkspace = () => {
  const [currentFile, setCurrentFile] = useState(null);
  const [activeView, setActiveView] = useState('code'); // code, blueprint
  const [panelSizes, setPanelSizes] = useState({ left: 40, right: 60 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [project, setProject] = useState({
    _id: '680b6096cade5185d11ac3d4',
    name: 'Forex Trading Bot',
    description: 'A trading bot using moving average crossover strategy',
    status: 'requirements_gathering',
    components: [],
    blueprint: null
  });
  
  // Start resize
  const startResize = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);
  };
  
  // Handle mouse move while resizing
  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    
    const container = resizeRef.current.parentElement;
    const containerWidth = container.clientWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    
    // Limit the minimum size
    if (newLeftWidth < 30 || newLeftWidth > 70) return;
    
    setPanelSizes({
      left: newLeftWidth,
      right: 100 - newLeftWidth
    });
    
    setIsResizing(true);
  };
  
  // Stop resize
  const stopResize = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResize);
    setIsResizing(false);
  };
  
  // Handle project update from chat
  const handleProjectUpdate = (updatedProject) => {
    setProject(prev => ({
      ...prev,
      ...updatedProject
    }));
    
    // Switch view based on project phase
    if (updatedProject.status === 'blueprint_generation' || 
        updatedProject.status === 'blueprint_generated') {
      setActiveView('blueprint');
    } else if (updatedProject.status === 'component_generation' || 
               updatedProject.status === 'components_generated') {
      setActiveView('code');
    }
  };
  
  // Handle file selection
  const handleFileSelect = (file) => {
    setCurrentFile({
      ...file,
      content: `// Sample ${file.name} content\n\n// This is a placeholder for demonstration purposes.\n// In a real application, this would load actual file content from the server.\n\nclass ${file.name.split('.')[0].charAt(0).toUpperCase() + file.name.split('.')[0].slice(1)} {\n  constructor() {\n    // Initialize\n  }\n\n  run() {\n    console.log('Running ${file.name}...');\n    return true;\n  }\n}\n\nmodule.exports = ${file.name.split('.')[0].charAt(0).toUpperCase() + file.name.split('.')[0].slice(1)};`
    });
    setActiveView('code');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">CodeForegX</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">{project.name}</span>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Chat (resizable) */}
        <div 
          className={`border-r border-gray-200 ${isResizing ? 'select-none' : ''}`}
          style={{ width: `${panelSizes.left}%` }}
        >
          <ChatWindow 
            projectId={project._id} 
            onProjectUpdate={handleProjectUpdate}
          />
        </div>
        
        {/* Resize handle */}
        <div 
          ref={resizeRef}
          className="w-1 cursor-col-resize bg-gray-200 hover:bg-blue-500 active:bg-blue-600 transition-colors"
          onMouseDown={startResize}
        ></div>
        
        {/* Right Panel */}
        <div 
          className="flex flex-col"
          style={{ width: `${panelSizes.right}%` }}
        >
          {/* Tab controls */}
          <div className="flex items-center bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex space-x-2">
              <button 
                onClick={() => setActiveView('code')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  activeView === 'code' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Code Editor
              </button>
              <button 
                onClick={() => setActiveView('blueprint')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  activeView === 'blueprint' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Blueprint
              </button>
            </div>
          </div>
          
          {/* Content area */}
          <div className="flex-1 flex overflow-hidden">
            {activeView === 'code' ? (
              <>
                {/* File Explorer */}
                <div className="w-1/4 border-r border-gray-200">
                  <FileExplorer 
                    onFileSelect={handleFileSelect}
                    currentFile={currentFile}
                  />
                </div>
                
                {/* Code Editor */}
                <div className="w-3/4">
                  <CodeEditor file={currentFile} />
                </div>
              </>
            ) : (
              <div className="w-full">
                <BlueprintView blueprint={project?.blueprint} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkspace;