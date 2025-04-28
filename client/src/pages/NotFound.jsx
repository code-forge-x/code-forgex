import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '80vh' 
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 2,
            maxWidth: 500
          }}
        >
          <Typography 
            variant="h1" 
            color="primary" 
            sx={{ 
              fontWeight: 'bold', 
              fontSize: '5rem', 
              mb: 2 
            }}
          >
            404
          </Typography>
          
          <Typography variant="h4" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{ mb: 4 }}
          >
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          
          <Button 
            variant="contained" 
            component={Link} 
            to="/" 
            startIcon={<HomeIcon />}
            sx={{ borderRadius: 2 }}
          >
            Back to Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;