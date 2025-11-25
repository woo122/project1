import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircularProgress, Backdrop, Box, Typography, Button } from '@mui/material';
import TravelItinerary from '../components/TravelItinerary';
import { regenerateItinerary } from '../utils/itineraryGenerator';
import { enrichItineraryWithRestaurants } from '../utils/restaurantRecommender';
import { enrichItineraryWithAttractions } from '../utils/attractionRecommender';
import { enrichItineraryWithTravelTime, recalculateItineraryTravelTime } from '../utils/travelTimeCalculator';

const ItineraryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editModeLoading, setEditModeLoading] = useState(false); // 수정모드 종료 로딩
  const [error, setError] = useState(null);
  const [itineraryId, setItineraryId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveErrorVisible, setSaveErrorVisible] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 전달된 일정 데이터 확인
    if (location.state?.itinerary) {
      setItinerary(location.state.itinerary);
      if (location.state.itineraryId) {
        setItineraryId(location.state.itineraryId);
      }
    } else {
      // 일정 데이터가 없으면 홈으로 리다이렉트
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleToggleEditMode = async () => {
    // 수정 모드를 끌 때 이동수단 재계산
    if (editMode && itinerary) {
      try {
        setEditModeLoading(true); // 수정모드 종료 로딩
        const recalculated = await recalculateItineraryTravelTime(itinerary);
        setItinerary(recalculated);
      } catch (e) {
        console.error('이동수단 재계산 중 오류:', e);
      } finally {
        setEditModeLoading(false);
      }
    }

    setEditMode(prev => !prev);
  };

  // 저장 관련 에러 메시지: 2초 동안 표시하고, 마지막 0.3초는 페이드아웃
  useEffect(() => {
    if (!saveError) return;

    // 바로 보이게
    setSaveErrorVisible(true);

    // 1.7초 뒤에 페이드아웃 시작 (opacity 0)
    const hideTimer = setTimeout(() => {
      setSaveErrorVisible(false);
    }, 1700);

    // 2초 뒤에 실제 에러 메시지 제거
    const clearTimer = setTimeout(() => {
      setSaveError(null);
    }, 2000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [saveError]);

  const handleRemoveActivity = (dayIndex, activityIndex) => {
    if (!itinerary) return;
    const updated = {
      ...itinerary,
      dailySchedule: itinerary.dailySchedule.map((day, idx) => {
        if (idx !== dayIndex) return day;
        return {
          ...day,
          activities: day.activities.filter((_, aIdx) => aIdx !== activityIndex)
        };
      })
    };
    setItinerary(updated);
  };

  const handleAddActivity = (dayIndex, activity) => {
    if (!itinerary || !activity) return;

    const updated = {
      ...itinerary,
      dailySchedule: itinerary.dailySchedule.map((day, idx) => {
        if (idx !== dayIndex) return day;
        
        // 새 활동 추가
        const updatedActivities = [...day.activities, activity];
        
        // 시간순으로 정렬 (transit 활동은 제외하고 정렬)
        updatedActivities.sort((a, b) => {
          // transit 타입은 원래 순서 유지
          const aIsTransit = a.type === 'transit';
          const bIsTransit = b.type === 'transit';
          
          if (aIsTransit && bIsTransit) return 0;
          if (aIsTransit) return 1; // transit을 뒤로
          if (bIsTransit) return -1; // transit을 뒤로
          
          // 시간이 없는 경우 뒤로
          if (!a.time) return 1;
          if (!b.time) return -1;
          
          // 시간 문자열 비교 (HH:MM 형식)
          return a.time.localeCompare(b.time);
        });
        
        return {
          ...day,
          activities: updatedActivities
        };
      })
    };

    setItinerary(updated);
  };

  const handleSave = async () => {
    if (!itinerary) return;

    const stored = localStorage.getItem('tp_user');
    if (!stored) {
      setSaveError('일정을 저장하려면 로그인이 필요합니다.');
      return;
    }

    let user;
    try {
      user = JSON.parse(stored);
    } catch (e) {
      setSaveError('사용자 정보를 불러오지 못했습니다. 다시 로그인해주세요.');
      return;
    }

    const userId = user?.id;
    if (!userId) {
      setSaveError('사용자 정보에 id가 없습니다.');
      return;
    }

    setSaving(true);
    setSaveError(null);

    const title = itinerary.title || '나의 도쿄 여행';

    try {
      if (itineraryId) {
        // 업데이트
        const res = await fetch('/api/itineraries', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: itineraryId,
            userId,
            title,
            itinerary
          })
        });
        const data = await res.json().catch(() => null);
        if (!data || !data.ok) {
          setSaveError(data?.error || '일정 저장에 실패했습니다.');
        }
      } else {
        // 새로 저장
        const res = await fetch('/api/itineraries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            title,
            itinerary
          })
        });
        const data = await res.json().catch(() => null);
        if (!data || !data.ok) {
          setSaveError(data?.error || '일정 저장에 실패했습니다.');
        } else {
          setItineraryId(data.id);
        }
      }
    } catch (e) {
      setSaveError('일정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenMyItineraries = () => {
    navigate('/my-itineraries');
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

  const handleOptimizeTransport = async () => {
    if (!itinerary) return;

    try {
      setLoading(true);
      const recalculated = await recalculateItineraryTravelTime(itinerary);
      setItinerary(recalculated);
    } catch (e) {
      console.error('이동수단 최적화 중 오류:', e);
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
      {/* 수정모드 종료 로딩 오버레이 */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: 9999,
          flexDirection: 'column',
          gap: 3
        }}
        open={editModeLoading}
      >
        <CircularProgress size={60} color="inherit" />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            정보를 수정하는 중입니다
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
            잠시만 기다려주세요
          </Typography>
        </Box>
      </Backdrop>

      {/* 일정 재생성 로딩 오버레이 */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: 9999,
          flexDirection: 'column',
          gap: 3
        }}
        open={loading || saving}
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

      {error && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1500,
            bgcolor: 'rgba(0, 0, 0, 0.75)',
            color: '#fff',
            px: 2,
            py: 1,
            borderRadius: 1
          }}
        >
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      {(saveError || saveErrorVisible) && (
        <Box
          sx={{
            position: 'fixed',
            bottom: error ? 48 : 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1500,
            bgcolor: 'rgba(139, 0, 0, 0.85)',
            color: '#fff',
            px: 2,
            py: 1,
            borderRadius: 1,
            opacity: saveErrorVisible ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        >
          <Typography variant="body2">{saveError}</Typography>
        </Box>
      )}

      <Box sx={{ position: 'relative', height: '100vh' }}>
        <TravelItinerary 
          itinerary={itinerary} 
          onReplan={handleReplan} 
          loading={loading || saving} 
          isEditMode={editMode}
          onToggleEdit={handleToggleEditMode}
          onRemoveActivity={handleRemoveActivity}
          onAddActivity={handleAddActivity}
          onSave={handleSave}
          onOpenMyItineraries={handleOpenMyItineraries}
        />
      </Box>
    </>
  );
};

export default ItineraryPage;
