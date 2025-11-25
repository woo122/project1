import React, { useState } from 'react';
import { Container, Box, Typography, Button, Paper, Alert, CircularProgress, Backdrop } from '@mui/material';
import { Link } from 'react-router-dom';
import TravelForm from '../components/TravelForm';
import TravelItinerary from '../components/TravelItinerary';
import { generateItinerary, regenerateItinerary } from '../utils/itineraryGenerator';
import { enrichItineraryWithRestaurants } from '../utils/restaurantRecommender';
import { enrichItineraryWithAttractions } from '../utils/attractionRecommender';
import { enrichItineraryWithTravelTime } from '../utils/travelTimeCalculator';

const HomePage = () => {
  const [itinerary, setItinerary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (travelInfo) => {
    setLoading(true);
    setError(null);
    
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
      
      console.log('✅ 일정 생성 완료, 상태 업데이트 중...', enrichedItinerary);
      setItinerary(enrichedItinerary);
      setShowForm(false); // 폼 숨기기
      console.log('✅ showForm을 false로 설정 완료');
    } catch (error) {
      console.error('일정 생성 오류:', error);
      setError('일정 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <>
      {/* 로딩 오버레이 - 항상 렌더링 */}
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

      {/* 일정이 있으면 전체 화면으로 표시 */}
      {itinerary ? (
        <TravelItinerary 
          itinerary={itinerary} 
          onReplan={handleReplan} 
          loading={loading} 
        />
      ) : (
      <>

      {!showForm && (
        <Box 
          sx={{
            position: 'relative',
            minHeight: '100vh',
            color: '#fff',
            backgroundImage: `url(/images/tokyo.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              msUserSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              outline: 'none'
            }}
          />
          <Box sx={{ width: '100%', px: 2, pt: 2, position: 'relative', zIndex: 1, userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none', WebkitTapHighlightColor: 'transparent', outline: 'none' }}>
            <Box sx={{ maxWidth: '1440px', mx: 'auto' }}>
              <Box component={Link} to="/" sx={{ display: 'inline-block' }}>
                <Box component="img" src={'/images/logo.png'} alt="로고" sx={{ width: 100, height: 'auto', display: 'block' }} />
              </Box>

              <Box sx={{ mt: '350px', textAlign: 'left' }}>
                <Typography sx={{ fontFamily: 'Pretendard', fontWeight: 600, fontSize: '30px', lineHeight: 1.2 }}>
                  AI가 짜주는
                </Typography>
                <Typography sx={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: '90px', lineHeight: 1.2, mt: '6px' }}>
                  혼자 하는 여행
                </Typography>
                <Typography sx={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: '90px', lineHeight: 1.1, mt: '6px' }}>
                  해조
                </Typography>

                <Button
                  onClick={() => setShowForm(true)}
                  sx={{
                    mt: '30px',
                    width: '200px',
                    height: '60px',
                    border: '3px solid #fff',
                    borderRadius: '8px',
                    color: '#fff',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none',
                      backgroundColor: 'rgba(255,255,255,0.08)'
                    },
                    textTransform: 'none',
                    fontFamily: 'Pretendard',
                    fontWeight: 500,
                    fontSize: '32px',
                    letterSpacing: '5px'
                  }}
                >
                  시작하기
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {showForm && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <TravelForm onSubmit={handleFormSubmit} loading={loading} onBackToHome={() => setShowForm(false)} />
        </Paper>
      )}
      </>
      )}
    </>
  );
};

export default HomePage;