import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useJsApiLoader } from '@react-google-maps/api';
import { CircularProgress, Box } from '@mui/material';
import './App.css';
import './custom.css';
import LandingPage from './pages/LandingPage';
import PlanPage from './pages/PlanPage';
import ItineraryPage from './pages/ItineraryPage';

const libraries = ['places', 'geometry'];

// 테마 설정
const theme = createTheme({
  palette: {
    primary: {
      main: '#00b7d0',
    },
    secondary: {
      main: '#2196f3',
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans KR',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

function App() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
    language: 'ko',
    region: 'KR'
  });

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/itinerary" element={<ItineraryPage />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
