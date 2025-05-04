import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import RequirementsForm from './RequirementsForm';
import RequirementsList from './RequirementsList';

const RequirementsDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="View Requirements" />
          <Tab label="Add New Requirements" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 ? (
          <RequirementsList />
        ) : (
          <RequirementsForm />
        )}
      </Box>
    </Box>
  );
};

export default RequirementsDashboard;
