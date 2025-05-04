import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export const ParameterEditor = ({ parameters = [], onChange }) => {
  const handleAddParameter = () => {
    const newParameters = [
      ...parameters,
      {
        name: '',
        type: 'string',
        description: '',
        required: true,
        default: ''
      }
    ];
    onChange(newParameters);
  };

  const handleRemoveParameter = (index) => {
    const newParameters = parameters.filter((_, i) => i !== index);
    onChange(newParameters);
  };

  const handleParameterChange = (index, field, value) => {
    const newParameters = parameters.map((param, i) => {
      if (i === index) {
        return { ...param, [field]: value };
      }
      return param;
    });
    onChange(newParameters);
  };

  return (
    <Box>
      {parameters.map((param, index) => (
        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Name"
                value={param.name}
                onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={param.type}
                  onChange={(e) => handleParameterChange(index, 'type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="string">String</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="boolean">Boolean</MenuItem>
                  <MenuItem value="array">Array</MenuItem>
                  <MenuItem value="object">Object</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Description"
                value={param.description}
                onChange={(e) => handleParameterChange(index, 'description', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <FormControl fullWidth size="small">
                <InputLabel>Required</InputLabel>
                <Select
                  value={param.required}
                  onChange={(e) => handleParameterChange(index, 'required', e.target.value)}
                  label="Required"
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={1}>
              <IconButton
                color="error"
                onClick={() => handleRemoveParameter(index)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
            {param.type !== 'boolean' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Default Value"
                  value={param.default}
                  onChange={(e) => handleParameterChange(index, 'default', e.target.value)}
                  size="small"
                />
              </Grid>
            )}
          </Grid>
        </Box>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={handleAddParameter}
        variant="outlined"
        sx={{ mt: 1 }}
      >
        Add Parameter
      </Button>
    </Box>
  );
}; 