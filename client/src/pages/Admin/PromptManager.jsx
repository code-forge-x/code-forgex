import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Tabs, 
  Tab, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import PromptTemplateEditor from '../../components/Admin/PromptTemplateEditor';
import PromptComponentEditor from '../../components/Admin/PromptComponentEditor';
import PromptPerformanceChart from '../../components/Admin/PromptPerformanceChart';
import api from '../../services/api';

const PromptManager = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [components, setComponents] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const templatesRes = await api.get('/api/prompt-admin/templates');
      const componentsRes = await api.get('/api/prompt-admin/components');
      
      setTemplates(templatesRes.data);
      setComponents(componentsRes.data);
    } catch (error) {
      console.error('Error fetching prompt data:', error);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedItem(null);
    setIsEditing(false);
    setIsAdding(false);
  };
  
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setIsEditing(false);
    setIsAdding(false);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    setIsAdding(false);
  };
  
  const handleAdd = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setIsAdding(true);
  };
  
  const handleSave = async (data) => {
    try {
      if (isAdding) {
        if (activeTab === 0) {
          await api.post('/api/prompt-admin/templates', data);
        } else {
          await api.post('/api/prompt-admin/components', data);
        }
      } else {
        if (activeTab === 0) {
          await api.put(`/api/prompt-admin/templates/${selectedItem._id}`, data);
        } else {
          await api.put(`/api/prompt-admin/components/${selectedItem._id}`, data);
        }
      }
      
      fetchData();
      setIsEditing(false);
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Prompt Management System
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Templates" />
          <Tab label="Components" />
          <Tab label="Performance" />
        </Tabs>
      </Paper>
      
      <Grid container spacing={3}>
        {activeTab < 2 && (
          <>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Typography variant="h6">
                    {activeTab === 0 ? 'Prompt Templates' : 'Prompt Components'}
                  </Typography>
                  <div>
                    <IconButton onClick={handleAdd} color="primary">
                      <Add />
                    </IconButton>
                    <IconButton onClick={fetchData}>
                      <Refresh />
                    </IconButton>
                  </div>
                </div>
                
                <List>
                  {(activeTab === 0 ? templates : components).map((item) => (
                    <ListItem 
                      key={item._id}
                      button
                      selected={selectedItem && selectedItem._id === item._id}
                      onClick={() => handleItemSelect(item)}
                    >
                      <ListItemText 
                        primary={item.name} 
                        secondary={`${item.category} • v${item.version}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
                {activeTab === 0 ? (
                  <PromptTemplateEditor
                    template={isAdding ? null : selectedItem}
                    isEditing={isEditing || isAdding}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                ) : (
                  <PromptComponentEditor
                    component={isAdding ? null : selectedItem}
                    isEditing={isEditing || isAdding}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                )}
              </Paper>
            </Grid>
          </>
        )}
        
        {activeTab === 2 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, height: '70vh' }}>
              <PromptPerformanceChart />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default PromptManager;