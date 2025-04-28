import React, { useState, useEffect } from 'react';
import { Grid, Box } from '@mui/material';
import ChatWindow from '../components/Chat/ChatWindow';
import CodeEditor from '../components/Editor/CodeEditor';
import BlueprintView from '../components/Blueprint/BlueprintView';
import api from '../services/api';

const ProjectWorkspace = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [activeView, setActiveView] = useState('code'); // code, blueprint, docs

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const handleProjectUpdate = (updatedProject) => {
    setProject(updatedProject);
  };

  return (
    
    <Grid container sx={{ height: '100vh' }}>
      {/* Chat Panel */}
      <Grid item xs={12} md={4} sx={{ borderRight: 1, borderColor: 'divider' }}>
        <ChatWindow 
          projectId={projectId} 
          onProjectUpdate={handleProjectUpdate}
        />
      </Grid>
      
      {/* Code/Preview Panel */}
      <Grid item xs={12} md={8}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {activeView === 'code' && <CodeEditor project={project} />}
          {activeView === 'blueprint' && <BlueprintView blueprint={project?.blueprint} />}
          {/* Add other views as needed */}
        </Box>
      </Grid>
    </Grid>
  );
};

export default ProjectWorkspace;