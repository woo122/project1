import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel,
  MenuItem,
  Select,
  Typography 
} from '@mui/material';

const ArrivalTimeSelector = ({ arrivalHour, arrivalMinute, onArrivalHourChange, onArrivalMinuteChange }) => {
  return (
    <Box sx={{ minWidth: 200, maxWidth: 250, flex: '1 1 200px' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
        도착 시간 (첫날)
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <FormControl sx={{ minWidth: 80 }}>
          <InputLabel>시간</InputLabel>
          <Select
            value={arrivalHour}
            label="시간"
            onChange={(e) => onArrivalHourChange(e.target.value)}
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
            value={arrivalMinute}
            label="분"
            onChange={(e) => onArrivalMinuteChange(e.target.value)}
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
        첫날 일정은 도착 30분 후부터 시작됩니다
      </Typography>
    </Box>
  );
};

export default ArrivalTimeSelector;
