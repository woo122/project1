import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Divider, 
  Paper, 
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TravelMap from './TravelMap';
import PlaceSearch from './PlaceSearch';
import AttractionDetail from './AttractionDetail';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const TravelItinerary = ({ itinerary, onRegenerateClick, onReplan, loading, isEditMode, onToggleEdit, onRemoveActivity, onAddActivity, onSave, onOpenMyItineraries }) => {
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showMyMenu, setShowMyMenu] = useState(false);
  const [showMyMenuVisible, setShowMyMenuVisible] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [showToggle, setShowToggle] = useState(false);
  const [viewMode, setViewMode] = useState('schedule'); // 'schedule' or 'search'
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [mapFocus, setMapFocus] = useState(null);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [showAttractionDetail, setShowAttractionDetail] = useState(false);
  const [selectedActivityMarker, setSelectedActivityMarker] = useState(null);
  const [pendingAddDayIndex, setPendingAddDayIndex] = useState(null);
  const handleChangeDay = (event, newValue) => setActiveDay(newValue);

  const handleMyClick = () => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('tp_user') : null;
      if (stored) {
        // 로그인 상태: 로그인 안내 숨기고 메뉴 토글 (슬라이드 인/아웃)
        setShowLoginPrompt(false);

        if (!showMyMenu) {
          // 열기: 먼저 보이게 하고, transition으로 내려오게
          setShowMyMenuVisible(true);
          setTimeout(() => setShowMyMenu(true), 0);
        } else {
          // 닫기: transition으로 올렸다가 DOM에서 제거 (조금 더 빨리감)
          setShowMyMenu(false);
          setTimeout(() => setShowMyMenuVisible(false), 150);
        }
      } else {
        // 로그아웃 상태: 메뉴 숨기고 로그인 안내 토글
        setShowMyMenu(false);
        setShowMyMenuVisible(false);
        setShowLoginPrompt(prev => !prev);
      }
    } catch (e) {
      setShowMyMenu(false);
      setShowMyMenuVisible(false);
      setShowLoginPrompt(prev => !prev);
    }
  };

  // Google Places API에서 사진/주소 등 상세 정보 가져오기 (안정적인 방식)
  const fetchPlaceWithNewAPI = async (activity) => {
    if (!window.google || !activity.location) return activity;
    
    try {
      // 기존의 안정적인 PlacesService 사용
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      return new Promise((resolve) => {
        const request = {
          location: new window.google.maps.LatLng(activity.location.lat, activity.location.lng),
          radius: 500,
          query: activity.name,
          language: 'ko'
        };

        service.textSearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const placeId = results[0].place_id;

            service.getDetails({
              placeId: placeId,
              fields: ['name', 'photos', 'formatted_address', 'vicinity'],
              language: 'ko'
            }, (placeDetails, detailStatus) => {
              if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK && placeDetails) {
                const placeWithPhotos = {
                  ...activity,
                  id: placeId,
                  name: activity.name, // 원래 한글 이름 유지
                  photos: placeDetails.photos || [],
                  formatted_address: placeDetails.formatted_address || activity.formatted_address,
                  vicinity: placeDetails.vicinity || activity.vicinity
                };
                console.log('Photos loaded:', placeWithPhotos.photos?.length);
                resolve(placeWithPhotos);
              } else {
                resolve(activity);
              }
            });
          } else {
            resolve(activity);
          }
        });
      });
    } catch (error) {
      console.error('Photo loading error:', error);
      return activity;
    }
  };

  // 지도 POI 클릭 시 기본 정보만 표시
  const handleMapPoiClick = async (placeId) => {
    // 간단하게 기본 정보만 표시
    console.log('POI 클릭:', placeId);
  };

  // 일차가 바뀌거나 뷰 모드를 schedule로 전환할 때 선택 초기화
  useEffect(() => {
    if (viewMode === 'schedule') {
      setSelectedPlace(null);
    } else {
      setShowAttractionDetail(false);
      setSelectedAttraction(null);
    }
  }, [viewMode]);

  useEffect(() => {
    setSelectedPlace(null);
    setShowAttractionDetail(false);
    setSelectedAttraction(null);
  }, [activeDay]);

  console.log('TravelItinerary received:', itinerary);
  console.log('destinations:', itinerary?.destinations);
  console.log('dailySchedule:', itinerary?.dailySchedule);

  if (!itinerary) {
    console.error('No itinerary provided');
    return <Box sx={{ p: 3 }}><Typography>일정 데이터가 없습니다.</Typography></Box>;
  }

  if (!itinerary.destinations || itinerary.destinations.length === 0) {
    console.error('No destinations in itinerary:', itinerary);
    return <Box sx={{ p: 3 }}><Typography>여행지 정보가 없습니다.</Typography></Box>;
  }

  if (!itinerary.dailySchedule || itinerary.dailySchedule.length === 0) {
    console.error('No dailySchedule in itinerary:', itinerary);
    return <Box sx={{ p: 3 }}><Typography>일정 정보가 없습니다.</Typography></Box>;
  }

  // 현재 일정의 중심 좌표 계산
  const getMapCenter = () => {
    const activities = itinerary?.dailySchedule?.[activeDay]?.activities || [];
    const locationsWithCoords = [];
    
    activities.forEach(activity => {
      if (activity.type === 'attraction' && activity.name) {
        itinerary.destinations.forEach(dest => {
          if (dest.attractions) {
            const attraction = dest.attractions.find(a => a.name === activity.name);
            if (attraction?.location) {
              locationsWithCoords.push(attraction.location);
            }
          }
        });
      }
    });

    if (locationsWithCoords.length > 0) {
      const avgLat = locationsWithCoords.reduce((sum, loc) => sum + loc.lat, 0) / locationsWithCoords.length;
      const avgLng = locationsWithCoords.reduce((sum, loc) => sum + loc.lng, 0) / locationsWithCoords.length;
      return { lat: avgLat, lng: avgLng };
    }
    
    // 기본값: 도쿄 중심
    return { lat: 35.6762, lng: 139.6503 };
  };

  const handleAddPlaceToItinerary = (place, targetDayIndex, time, description) => {
    if (!onAddActivity || !place || !time) return;

    const newActivity = {
      type: 'custom',
      name: place.name,
      time,
      description: description || '',
      location: place.location || null
    };

    onAddActivity(targetDayIndex, newActivity);

    // 일정 뷰로 돌아가고 선택 상태 초기화
    setViewMode('schedule');
    setPendingAddDayIndex(null);
    setSelectedPlace(null);
    setShowAttractionDetail(false);
    setSelectedAttraction(null);
  };

  const handleSelectPlace = (place) => {
    if (!place || !place.location) {
      setSelectedPlace(place || null);
      return;
    }

    setSelectedPlace(place);
    setMapFocus({
      lat: place.location.lat,
      lng: place.location.lng,
      zoom: 18
    });
    setTimeout(() => setMapFocus(null), 500);
  };

  const formatItineraryToText = () => {
    if (!itinerary || !itinerary.dailySchedule) return '';

    const lines = [];
    const title = itinerary.title || '나의 도쿄 여행 일정';
    lines.push(title);

    if (itinerary.startDate && itinerary.endDate) {
      lines.push(`${itinerary.startDate} ~ ${itinerary.endDate}`);
    }

    lines.push('');

    itinerary.dailySchedule.forEach((day, dayIndex) => {
      lines.push(`Day ${dayIndex + 1}`);
      if (Array.isArray(day.activities)) {
        day.activities.forEach((activity) => {
          const time = activity.time ? `${activity.time} ` : '';
          const name = activity.name || '';
          const desc = activity.description
            ? ' - ' + activity.description.replace(/\r?\n/g, ' ').trim()
            : '';
          lines.push(`${time}${name}${desc}`.trim());
        });
      }
      lines.push('');
    });

    return lines.join('\n');
  };

  const handleExportText = () => {
    if (!itinerary) return;

    const text = formatItineraryToText();
    if (!text) return;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(itinerary.title || 'itinerary').replace(/[^a-zA-Z0-9가-힣_\- ]/g, '') || 'itinerary'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (typeof window !== 'undefined' && window.print) {
      window.print();
    }
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0 }}>
      {/* Background map fills the screen; show markers only for active day attractions */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <TravelMap 
          key={`map-${activeDay}-${viewMode}`}
          destinations={viewMode === 'schedule' ? itinerary.destinations : []}
          dailySchedule={viewMode === 'schedule' ? [itinerary?.dailySchedule?.[activeDay]] : []}
          activityNames={viewMode === 'schedule' ? itinerary?.dailySchedule?.[activeDay]?.activities || []
            .filter(a => a.type === 'attraction' && a.name)
            .map(a => a.name) : []}
          places={viewMode === 'search' ? places : null}
          selectedPlace={selectedPlace}
          onPlaceClick={(place) => {
            setSelectedPlace(place);
            setMapFocus({
              lat: place.location.lat,
              lng: place.location.lng,
              zoom: 18
            });
            // 이동 후 focus 초기화 (계속 이동하지 않도록)
            setTimeout(() => setMapFocus(null), 500);
          }}
          selectedPlaceId={selectedPlace?.id}
          focus={mapFocus}
          selectedAttraction={selectedAttraction}
          onAttractionClick={async (attraction) => {
            console.log('마커 클릭:', attraction);
            const place = await fetchPlaceWithNewAPI(attraction);
            if (place) {
              setSelectedAttraction(place);
              setShowAttractionDetail(true);
            }
          }}
          onMapPoiClick={handleMapPoiClick}
          selectedActivityMarker={selectedActivityMarker}
          onMarkerNameClick={async (activity) => {
            // InfoWindow의 이름을 클릭하면 상세 정보 표시
            console.log('마커 이름 클릭:', activity);
            const place = await fetchPlaceWithNewAPI(activity);
            if (place) {
              setSelectedAttraction(place);
              setShowAttractionDetail(true);
              
              // 지도 확대
              setMapFocus({
                lat: activity.location.lat,
                lng: activity.location.lng,
                zoom: activity.type === 'airport' ? 15 : 18
              });
              setTimeout(() => setMapFocus(null), 500);
            }
          }}
        />
      </Box>

      {/* Top-right global action: 일정 다시짜기 + 내보내기 */}
      <Box sx={{ position: 'absolute', right: 16, top: 16, zIndex: 1300, display: 'flex', gap: 1 }}>
        <Button 
          variant="contained" 
          color="secondary" 
          size="small"
          onClick={() => (onRegenerateClick ? onRegenerateClick() : onReplan && onReplan())}
          disabled={!!loading}
        >
          일정 다시짜기
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={handleExportText}
          disabled={!!loading}
        >
          텍스트 출력
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={handleExportPdf}
          disabled={!!loading}
        >
          PDF 출력
        </Button>
      </Box>

      {/* Left overlay schedule panel (collapsible) */}
      <Paper 
        elevation={3}
        className="custom-itinerary-panel" 
        sx={{ 
          position: 'absolute', 
          top: 16, 
          height: 'calc(100% - 32px)', 
          overflow: 'hidden', 
          zIndex: 1200, 
          width: 400, 
          left: panelOpen ? 16 : -400, 
          transition: 'left 0.25s ease', 
          display: 'flex', 
          flexDirection: 'column'
        }}
        onMouseEnter={() => setShowToggle(true)}
        onMouseLeave={() => setShowToggle(false)}
      >
        {/* 로고 - 맨 위에 위치 */}
        <Box sx={{ 
          p: 2,
          pt: '75px',
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          caretColor: 'transparent',
          alignItems: 'flex-end'
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Box 
              component="img" 
              src="/images/logo2.png" 
              alt="로고"
              sx={{ 
                height: 55,
                cursor: 'pointer',
              }}
            />
          </Link>
          <Button
            variant="text"
            sx={{
              fontWeight: 700,
              fontSize: '16px',
              textTransform: 'none',
              padding: 0,
              color: 'black'
            }}
            onClick={handleMyClick}
          >
            내 일정
          </Button>
        </Box>

        {/* 로그아웃 상태에서 내 일정 클릭 시 보여줄 로그인 안내 */}
        {showLoginPrompt && (
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 2,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              내 일정을 보려면 로그인이 필요합니다.
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ textTransform: 'none', color: 'white' }}
              onClick={() => navigate('/login')}
            >
              로그인 하러 가기
            </Button>
          </Box>
        )}

        {/* 로그인 상태에서 내 일정 클릭 시 보여줄 마이페이지/로그아웃 메뉴 (가로 배치 + 슬라이드 인/아웃) */}
        {showMyMenuVisible && (
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 2,
              py: 1,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              overflow: 'hidden',
              opacity: showMyMenu ? 1 : 0,
              transform: showMyMenu ? 'translateY(0)' : 'translateY(-6px)',
              transition: 'transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.35s ease-out'
            }}
          >
            {onSave && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<SaveIcon />}
                sx={{
                  textTransform: 'none',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    borderColor: 'primary.dark',
                    color: 'primary.dark'
                  }
                }}
                onClick={() => {
                  setShowMyMenu(false);
                  setTimeout(() => setShowMyMenuVisible(false), 200);
                  onSave();
                }}
              >
                저장
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
              onClick={() => {
                setShowMyMenu(false);
                setTimeout(() => setShowMyMenuVisible(false), 200);
                if (onOpenMyItineraries) {
                  onOpenMyItineraries();
                } else {
                  navigate('/my-itineraries');
                }
              }}
            >
              마이페이지
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              sx={{ textTransform: 'none' }}
              onClick={() => {
                localStorage.removeItem('tp_user');
                setShowMyMenu(false);
                setTimeout(() => setShowMyMenuVisible(false), 200);
                navigate('/');
              }}
            >
              로그아웃
            </Button>
          </Box>
        )}

        {/* 뷰 모드 전환 탭 (고정) - 상세 뷰가 아닐 때만 표시 */}
        {!showAttractionDetail && (
          <Box sx={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <Tabs
              value={viewMode}
              onChange={(e, newValue) => setViewMode(newValue)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab value="schedule" label="일정" />
              <Tab value="search" label="검색" />
            </Tabs>
          </Box>
        )}

        {/* 일정 뷰 */}
        {viewMode === 'schedule' && (
          <Box
            sx={{
              flex: 1,
              overflowX: 'hidden',
              overflowY: 'auto',
              p: 2
            }}
          >
            <Tabs
              value={activeDay}
              onChange={handleChangeDay}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="일차 선택"
              sx={{ 
                mb: 2,
                position: 'sticky',
                top: 0,
                backgroundColor: 'white',
                zIndex: 100,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {itinerary.dailySchedule.map((_, idx) => (
                <Tab key={idx} label={`${idx + 1}일차`} />
              ))}
            </Tabs>
            <Divider sx={{ mb: 2 }} />
            
            {/* AI 생성 표시 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box>
                {itinerary.isAIGenerated && (
                  <Box sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    bgcolor: 'success.light', 
                    color: 'success.dark',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    mb: 1,
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    ✨ AI 맞춤 일정
                  </Box>
                )}
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 24 }}>
                  Day {activeDay + 1}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {onToggleEdit && (
                  <Button
                    variant="outlined"
                    color={isEditMode ? 'secondary' : 'inherit'}
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={onToggleEdit}
                    disabled={!!loading}
                  >
                    수정
                  </Button>
                )}
              </Box>
            </Box>
            <List>
              {(() => {
                let sequenceNumber = 1; // 각 날짜마다 1번부터 시작
                return itinerary?.dailySchedule?.[activeDay]?.activities?.map((activity, actIndex) => {
                  // location이 있는 활동만 sequenceNumber 증가 (custom 타입 포함)
                  const showMarker = activity.location && (activity.type === 'airport' || activity.type === 'attraction' || activity.type === 'meal' || activity.type === 'accommodation' || activity.type === 'custom');
                  const currentSequenceNumber = showMarker ? sequenceNumber++ : null;
                  
                  return (
                <ListItem 
                  key={actIndex} 
                  alignItems="center" 
                  sx={{ 
                    py: activity.type === 'transit' ? 0.5 : 1,
                    cursor: (activity.type === 'attraction' || activity.type === 'meal' || activity.type === 'airport' || activity.type === 'accommodation' || activity.type === 'custom') && activity.location ? 'pointer' : 'default',
                    '&:hover': (activity.type === 'attraction' || activity.type === 'meal' || activity.type === 'airport' || activity.type === 'accommodation' || activity.type === 'custom') && activity.location ? {
                      bgcolor: 'action.hover'
                    } : {},
                    bgcolor: activity.type === 'transit' ? 'grey.50' : 'transparent',
                    borderLeft: activity.type === 'transit' ? '3px solid' : 'none',
                    borderColor: activity.type === 'transit' ? 'info.main' : 'transparent',
                    ml: activity.type === 'transit' ? '28px' : 0,
                    pl: 0,
                    gap: 2
                  }}
                  onClick={() => {
                    if ((activity.type === 'attraction' || activity.type === 'meal' || activity.type === 'airport' || activity.type === 'accommodation' || activity.type === 'custom') && activity.location) {
                      setMapFocus({
                        lat: activity.location.lat,
                        lng: activity.location.lng,
                        zoom: activity.type === 'airport' ? 15 : 18
                      });
                      // 마커를 선택 상태로 만들기 위해 TravelMap에 전달
                      setSelectedActivityMarker(activity);
                      setTimeout(() => setMapFocus(null), 500);

                      // 왼쪽 레이어에서 배너를 클릭했을 때도 상세 이미지가 뜨도록 AttractionDetail 패널 열기
                      (async () => {
                        try {
                          const place = await fetchPlaceWithNewAPI(activity);
                          if (place) {
                            setSelectedAttraction(place);
                            setShowAttractionDetail(true);
                          }
                        } catch (e) {
                          console.error('상세 정보 로딩 중 오류:', e);
                        }
                      })();
                    }
                  }}
                >
                  <ListItemIcon sx={{ justifyContent: 'center' }}>
                    {showMarker && (
                      <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: '#00a4bb',
                        border: '2px solid #00a4bb',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        fontFamily: 'Arial, sans-serif'
                      }}>
                        {currentSequenceNumber}
                      </Box>
                    )}
                  </ListItemIcon>
                  <ListItemText
                    sx={{ 
                      maxWidth: 260,
                      ...(activity.type === 'transit' ? { ml: '-15px' } : {})
                    }}
                    primary={
                      activity.type === 'transit' ? (
                        // 이동 시간 특별 표시
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            {activity.mode || '🚇 이동'}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            bgcolor: 'info.light', 
                            color: 'info.dark',
                            px: 1,
                            py: 0.3,
                            borderRadius: 1,
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}>
                            {activity.durationText || `${activity.duration}시간`}
                          </Typography>
                          {activity.distanceText && (
                            <Typography variant="body2" color="text.secondary">
                              ({activity.distanceText})
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            {activity.type === 'meal' && '식사'}
                            {activity.type === 'attraction' && '관광지'}
                            {activity.type === 'airport' && '공항'}
                            {activity.type === 'accommodation' && '숙소'}
                            {activity.type === 'custom' && '사용자 추가'}
                            {activity.type !== 'meal' && activity.type !== 'attraction' && activity.type !== 'airport' && activity.type !== 'accommodation' && activity.type !== 'custom' && ''}
                          </Typography>
                          <Box sx={{ display: 'flex', width: '100%', mt: 0.25, alignItems: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                minWidth: 52,
                                maxWidth: 52,
                                mr: 1,
                                flexShrink: 0,
                                fontSize: '16px',
                                color: '#000000',
                                position: 'relative'
                              }}
                            >
                              {activity.time}
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                flex: 1,
                                wordBreak: 'break-word',
                                whiteSpace: 'normal'
                              }}
                            >
                              {activity.name}
                            </Typography>
                          </Box>
                          {activity.description && (
                            <Typography
                              variant="body2"
                              sx={{ fontSize: '14px', color: 'text.secondary', mt: 0.25 }}
                            >
                              {activity.description
                                .split('\n')[0]
                                .replace(/★.*$/g, '')
                                .replace(/⭐.*$/g, '')
                                .replace(/평점.*$/g, '')
                                .replace(/rating.*$/gi, '')
                                .trim()}
                            </Typography>
                          )}
                          {activity.duration && (
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', mt: 0.25, fontSize: '13px' }}
                            >
                              예상 {activity.duration}시간
                            </Typography>
                          )}
                        </Box>
                      )
                    }
                    secondary={
                      activity.type === 'transit'
                        ? activity.description
                        : ''
                    }
                  />
                  {isEditMode && onRemoveActivity && activity.type !== 'accommodation' && activity.type !== 'airport' && activity.type !== 'transit' && (
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveActivity(activeDay, actIndex);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItem>
                  );
                });
              })()}
            </List>
            {isEditMode && onAddActivity && (
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setPendingAddDayIndex(activeDay);
                    setViewMode('search');
                  }}
                >
                  활동 추가
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* 검색 뷰 */}
        {viewMode === 'search' && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <PlaceSearch 
              center={getMapCenter()}
              selectedPlace={selectedPlace}
              onPlaceSelect={handleSelectPlace}
              onPlacesFound={setPlaces}
              onAddToItinerary={handleAddPlaceToItinerary}
              days={itinerary.dailySchedule}
              defaultDayIndex={pendingAddDayIndex ?? activeDay}
            />
          </Box>
        )}
      </Paper>

      {/* 별도의 상세 레이어 - 왼쪽 패널 우측 위에 표시 */}
      {showAttractionDetail && selectedAttraction && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            top: 16,
            left: panelOpen ? 440 : 16, // 왼쪽 패널 우측
            width: 350,
            maxHeight: 'calc(100vh - 32px)',
            zIndex: 1250,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <AttractionDetail 
            attraction={selectedAttraction}
            onBack={() => {
              setShowAttractionDetail(false);
              setSelectedAttraction(null);
            }}
          />
        </Paper>
      )}

      {/* Hover reveal zone at the extreme left */}
      <Box 
        sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 16, zIndex: 1100 }}
        onMouseEnter={() => setShowToggle(true)}
        onMouseLeave={() => setShowToggle(false)}
      />

      {/* Toggle button (revealed on hover) */}
      <Box 
        sx={{ 
          position: 'absolute', 
          left: panelOpen ? 416 : 16, 
          top: '50%', 
          transform: 'translateY(-50%)', 
          zIndex: 1300, 
          transition: 'left 0.25s ease, opacity 0.15s ease',
          opacity: showToggle ? 1 : 0,
          pointerEvents: showToggle ? 'auto' : 'none'
        }}
        onMouseEnter={() => setShowToggle(true)}
        onMouseLeave={() => setShowToggle(false)}
      >
        <IconButton size="small" color="primary" onClick={() => setPanelOpen(o => !o)} sx={{ bgcolor: 'background.paper', boxShadow: 2 }}>
          {panelOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default TravelItinerary;