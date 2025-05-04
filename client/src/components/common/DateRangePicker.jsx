import React from 'react';
import { Box, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const DateRangePicker = ({ value, onChange }) => {
  const handleStartDateChange = (date) => {
    onChange({
      ...value,
      startDate: date
    });
  };

  const handleEndDateChange = (date) => {
    onChange({
      ...value,
      endDate: date
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <DatePicker
          label="Start Date"
          value={value.startDate}
          onChange={handleStartDateChange}
          renderInput={(params) => <TextField {...params} />}
          maxDate={value.endDate}
        />
        <DatePicker
          label="End Date"
          value={value.endDate}
          onChange={handleEndDateChange}
          renderInput={(params) => <TextField {...params} />}
          minDate={value.startDate}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
