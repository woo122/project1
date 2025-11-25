import React, { useState } from 'react';
import { Paper, Alert, CircularProgress, Backdrop, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TravelForm from '../components/TravelForm';
import { generateItinerary } from '../utils/itineraryGenerator';
import { enrichItineraryWithRestaurants } from '../utils/restaurantRecommender';
import { enrichItineraryWithAttractions } from '../utils/attractionRecommender';
import { enrichItineraryWithTravelTime } from '../utils/travelTimeCalculator';

const PlanPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (travelInfo) => {
    setLoading(true);
    setError(null);
    
    let itineraryId = null;

    try {
      console.log('📝 Form submitted with:', travelInfo);
      
      // duration을 기반으로 tripDuration 계산
      const durationMap = {
        '1day': 1,
        '1night': 2,
        '2night': 3,
        '3night': 4,
        '4night': 5,
        '5night': 6
      };
      
      const tripDuration = durationMap[travelInfo.duration] || 1;
      
      // 스타일 매핑 (키워드 ID -> AI가 이해하는 형식)
      const styleMapping = {
        'active': 'activity',
        'food': 'food',
        'shopping': 'shopping',
        'culture': 'sightseeing'
      };
      
      const mappedStyles = (travelInfo.styles || []).map(style => styleMapping[style] || style);
      
      // 도쿄 구역 이름 매핑 (한글)
      const wardMapping = {
        'shinjuku': '신주쿠',
        'shibuya': '시부야',
        'harajuku': '하라주쿠',
        'ginza': '긴자'
      };
      
      // 선택된 구역들 (한글)
      const selectedWards = (travelInfo.destinations || []).map(dest => wardMapping[dest] || dest);
      
      // 도쿄 구역 선택은 모두 'tokyo'로 매핑하되, 구역 정보도 함께 전달
      const destinations = travelInfo.destinations && travelInfo.destinations.length > 0
        ? ['tokyo']
        : [];
      
      const formattedInfo = {
        ...travelInfo,
        tripDuration,
        travelStyles: mappedStyles,
        destinations: destinations,
        selectedWards: selectedWards, // 선택된 구역 정보 추가
        arrivalAirport: travelInfo.arrivalAirport, // 입국 공항 정보 추가
        departureAirport: travelInfo.departureAirport, // 출국 공항 정보 추가
        // 백엔드 호환성을 위해 날짜 추가
        startDate: new Date(),
        endDate: new Date(Date.now() + (tripDuration - 1) * 24 * 60 * 60 * 1000)
      };
      
      console.log('🚀 Sending to backend:', formattedInfo);
      console.log('📍 Selected wards:', selectedWards);
      console.log('🎨 Mapped styles:', mappedStyles);
      console.log('📅 Trip duration:', tripDuration, 'days');
      console.log('✈️ Arrival Airport:', travelInfo.arrivalAirport);
      console.log('✈️ Departure Airport:', travelInfo.departureAirport);
      console.log('🏨 Accommodation:', travelInfo.accommodation);
      
      // 숙소 정보를 일정에 추가하는 함수
      const addAccommodationToItinerary = (itinerary, accommodation) => {
        if (!accommodation || !accommodation.location) return itinerary;
        
        const totalDays = itinerary.dailySchedule.length;
        
        const updatedDailySchedule = itinerary.dailySchedule.map((day, index) => {
          const isFirstDay = index === 0;
          const isLastDay = index === totalDays - 1;
          const isMiddleDay = !isFirstDay && !isLastDay;
          
          const accommodationInfo = {
            type: 'accommodation',
            name: accommodation.location.name || accommodation.address,
            location: {
              lat: accommodation.location.lat,
              lng: accommodation.location.lng
            }
          };
          
          let newActivities = [...day.activities];
          
          // 중간 날짜: 시작(08:00)과 끝(22:00)에 숙소 추가
          if (isMiddleDay) {
            // 아침에 숙소에서 출발
            newActivities.unshift({
              ...accommodationInfo,
              time: '08:00',
              description: '숙소 출발'
            });
            // 저녁에 숙소로 복귀
            newActivities.push({
              ...accommodationInfo,
              time: '22:00',
              description: '숙소 복귀'
            });
          }
          // 1일차: 끝에만 숙소 추가
          else if (isFirstDay) {
            newActivities.push({
              ...accommodationInfo,
              time: '22:00',
              description: '숙소 체크인'
            });
          }
          // 마지막날: 시작에만 숙소 추가
          else if (isLastDay) {
            newActivities.unshift({
              ...accommodationInfo,
              time: '08:00',
              description: '숙소 체크아웃'
            });
          }
          
          return {
            ...day,
            activities: newActivities
          };
        });
        
        return {
          ...itinerary,
          dailySchedule: updatedDailySchedule,
          accommodation: accommodation
        };
      };
      
      // 규칙 기반 일정 생성 (AI 건너뜀)
      console.log('📋 규칙 기반 일정 생성 시작...');
      const basicItinerary = await generateItinerary(formattedInfo);
      console.log('📋 Basic itinerary generated:', basicItinerary);
      
      // Google API로 관광지 추천 추가
      console.log('🗺️ Google API로 관광지 검색 중...');
      const withAttractions = await enrichItineraryWithAttractions(basicItinerary);
      console.log('🏛️ With attractions:', withAttractions);
      
      // 음식점 추천 추가
      console.log('🍽️ Google API로 음식점 검색 중...');
      const withRestaurants = await enrichItineraryWithRestaurants(withAttractions);
      console.log('🍴 With restaurants:', withRestaurants);
      
      // 숙소 추가 (이동시간 계산 전에)
      let itineraryWithAccommodation = addAccommodationToItinerary(withRestaurants, travelInfo.accommodation);
      console.log('🏨 Accommodation added before travel time calculation');
      
      // 이동 시간 계산 추가 (숙소 추가 후)
      console.log('🚇 이동 시간 계산 중...');
      let enrichedItinerary = await enrichItineraryWithTravelTime(itineraryWithAccommodation);
      
      console.log('✅ 일정 생성 완료, 페이지 이동 중...', enrichedItinerary);

      try {
        const storedUser = localStorage.getItem('tp_user');
        let userId = null;
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            userId = parsed?.id || null;
          } catch (e) {
            console.error('사용자 정보 파싱 실패:', e);
          }
        }

        const res = await fetch('/api/itineraries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: travelInfo.tripTitle || '나의 도쿄 여행',
            itinerary: enrichedItinerary,
            userId
          })
        });
        const data = await res.json().catch(() => null);

        itineraryId = data && data.ok ? data.id : null;

      } catch (e) {
        console.error('일정 저장 실패 (무시하고 진행):', e);
      }
      
      // 일정 결과 페이지로 이동
      navigate('/itinerary', { state: { itinerary: enrichedItinerary, itineraryId } });
    } catch (error) {
      console.error('일정 생성 오류:', error);
      setError('일정 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ m: 0, p: 0 }}>
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
            일정을 생성중입니다
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
            잠시만 기다려주세요
          </Typography>
        </Box>
      </Backdrop>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 0, m: 0 }}>
        <TravelForm 
          onSubmit={handleFormSubmit} 
          loading={loading} 
          onBackToHome={() => navigate('/')} 
        />
      </Paper>
    </Box>
  );
};

export default PlanPage;
