import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircularProgress, Backdrop, Box, Typography } from '@mui/material';
import TravelItinerary from '../components/TravelItinerary';
import { regenerateItinerary } from '../utils/itineraryGenerator';
import { enrichItineraryWithRestaurants } from '../utils/restaurantRecommender';
import { enrichItineraryWithAttractions } from '../utils/attractionRecommender';
import { enrichItineraryWithTravelTime } from '../utils/travelTimeCalculator';

const ItineraryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 페이지 로드 시 전달된 일정 데이터 확인
    if (location.state?.itinerary) {
      setItinerary(location.state.itinerary);
    } else {
      // 일정 데이터가 없으면 홈으로 리다이렉트
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleReplan = async () => {
    if (!itinerary) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const replanInfo = {
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        tripDuration: itinerary.tripDuration,
        people: itinerary.people,
        travelStyles: itinerary.travelStyles,
        destinations: itinerary.destinations.map(d => d.name.toLowerCase()),
        scheduleDensity: itinerary.scheduleDensity,
        airport: itinerary.airport // 공항 정보 추가
      };

      // 기본 일정 틀 재생성
      const newItinerary = regenerateItinerary(replanInfo);
      
      // Google API로 관광지 재추천
      console.log('🗺️ Google API로 관광지 재검색 중...');
      const withAttractions = await enrichItineraryWithAttractions(newItinerary);
      
      // 음식점 재추천
      console.log('🍽️ Google API로 음식점 재검색 중...');
      const withRestaurants = await enrichItineraryWithRestaurants(withAttractions);
      
      // 이동 시간 재계산
      console.log('🚇 이동 시간 재계산 중...');
      const enrichedItinerary = await enrichItineraryWithTravelTime(withRestaurants);
      
      setItinerary(enrichedItinerary);
    } catch (error) {
      console.error('일정 재생성 오류:', error);
      setError('일정 재생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!itinerary) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* 로딩 오버레이 */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: 9999,
          flexDirection: 'column',
          gap: 3
        }}
        open={loading}
      >
        <CircularProgress size={60} color="inherit" />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            일정을 재생성중입니다
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
            잠시만 기다려주세요
          </Typography>
        </Box>
      </Backdrop>

      <TravelItinerary 
        itinerary={itinerary} 
        onReplan={handleReplan} 
        loading={loading} 
      />
    </>
  );
};

export default ItineraryPage;
