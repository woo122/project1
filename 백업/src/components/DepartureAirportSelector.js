import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel,
  MenuItem,
  Select,
  Typography 
} from '@mui/material';

const DepartureAirportSelector = ({ 
  selectedAirport, 
  setAirport, 
  departureHour, 
  departureMinute, 
  onDepartureHourChange, 
  onDepartureMinuteChange,
  tokyoAirports 
}) => {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 공항 선택 */}
      <Box sx={{ mb: 4, width: '100%',marginTop:"20px" }}>
        <Box sx={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: '600px'
        }}>
          {tokyoAirports.map((airport) => (
            <Box
              key={airport.id}
              onClick={() => setAirport(airport.id)}
              sx={{
                width: '100%',
                height: '45px',
                border: '2px solid #00a4bb',
                borderRadius: '16px',
                backgroundColor: selectedAirport === airport.id ? '#00a4bb' : 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'Pretendard, sans-serif',
                fontSize: '20px',
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                color: selectedAirport === airport.id ? '#ffffff' : '#333'
              }}
            >
              {airport.name} ({airport.code})
            </Box>
          ))}
        </Box>
      </Box>

      {/* 시간 선택 */}
      <Box sx={{ width: '100%', maxWidth: '450px' }}>
              <Typography variant="subtitle1" sx={{ mb: 3, textAlign: 'center', fontSize: '24px', fontWeight: 600 }}>
                출발 시간 (마지막날)
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                justifyContent: 'center', 
                mb: 2,
                p: 3,
                backgroundColor: 'rgba(0, 183, 208, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(0, 183, 208, 0.2)'
              }}>
                <FormControl sx={{ 
                  minWidth: 140,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    '&:hover': {
                      borderColor: '#00a4bb',
                    },
                    '&.Mui-focused': {
                      borderColor: '#00a4bb',
                      boxShadow: '0 0 0 2px rgba(0, 183, 208, 0.2)',
                    },
                  }
                }}>
                  <InputLabel sx={{ fontSize: '16px', fontWeight: 500 }}>시간</InputLabel>
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
                <FormControl sx={{ 
                  minWidth: 140,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    '&:hover': {
                      borderColor: '#00a4bb',
                    },
                    '&.Mui-focused': {
                      borderColor: '#00a4bb',
                      boxShadow: '0 0 0 2px rgba(0, 183, 208, 0.2)',
                    },
                  }
                }}>
                  <InputLabel sx={{ fontSize: '16px', fontWeight: 500 }}>분</InputLabel>
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
            </Box>
          </Box>
  );
};

export default DepartureAirportSelector;
