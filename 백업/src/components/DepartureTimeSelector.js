import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel,
  MenuItem,
  Select,
  Typography 
} from '@mui/material';

const DepartureTimeSelector = ({ departureHour, departureMinute, onDepartureHourChange, onDepartureMinuteChange }) => {
  return (
    <Box sx={{ minWidth: 200, maxWidth: 250, flex: '1 1 200px' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
        출발 시간 (마지막날)
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <FormControl sx={{ minWidth: 80 }}>
          <InputLabel>시간</InputLabel>
          <Select
            value={departureHour}
            label="시간"
            onChange={(e) => onDepartureHourChange(e.target.value)}
          >
            {Array.from({ length: 24 }, (_, i) => i + 1).map(hour => (
              <MenuItem key={hour} value={hour}>
                {hour}시
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 80 }}>
          <InputLabel>분</InputLabel>
          <Select
            value={departureMinute}
            label="분"
            onChange={(e) => onDepartureMinuteChange(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
              <MenuItem key={minute} value={minute}>
                {String(minute).padStart(2, '0')}분
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Typography variant="caption" color="text.secondary">
        마지막날 일정은 출발 2시간 전까지 진행됩니다
      </Typography>
    </Box>
  );
};

export default DepartureTimeSelector;
