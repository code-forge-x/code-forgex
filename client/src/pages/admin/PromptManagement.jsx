import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PromptList from '../../components/prompts/PromptList';

const PromptManagement = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Prompt Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/prompts/new')}
        >
          New Prompt
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <PromptList />
      </Paper>
    </Box>
  );
};

export default PromptManagement;
