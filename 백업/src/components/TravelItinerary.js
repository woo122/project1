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
  IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HotelIcon from '@mui/icons-material/Hotel';
import FlightIcon from '@mui/icons-material/Flight';
import { format } from 'date-fns';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TravelMap from './TravelMap';
import PlaceSearch from './PlaceSearch';
import AttractionDetail from './AttractionDetail';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const TravelItinerary = ({ itinerary, onRegenerateClick, onReplan, loading }) => {
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
  const handleChangeDay = (event, newValue) => setActiveDay(newValue);

  // 이름으로 장소 검색
  // Google Places API에서 사진만 가져오기 (안정적인 방식)
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
              fields: ['name', 'photos'],
              language: 'ko'
            }, (placeDetails, detailStatus) => {
              if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK && placeDetails) {
                const placeWithPhotos = {
                  ...activity,
                  id: placeId,
                  name: activity.name, // 원래 한글 이름 유지
                  photos: placeDetails.photos || []
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

  const handleSearchByName = async (activity) => {
    if (!window.google || !activity.location) return;
    
    const place = await fetchPlaceWithNewAPI(activity);
    console.log('검색으로 찾은 장소:', place);
    if (place) {
      // 검색 뷰로 전환하고 선택
      setViewMode('search');
      setSelectedPlace(place);
      setMapFocus({
        lat: place.location.lat,
        lng: place.location.lng,
        zoom: 18
      });
      setTimeout(() => setMapFocus(null), 500);
    } else {
      console.error('장소를 찾을 수 없습니다:', activity.name);
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

      {/* Top-right action button */}
      <Box sx={{ position: 'absolute', right: 16, top: 16, zIndex: 1300 }}>
        <Button 
          variant="contained" 
          color="secondary" 
          size="small"
          onClick={() => (onRegenerateClick ? onRegenerateClick() : onReplan && onReplan())}
          disabled={!!loading}
        >
          일정 다시짜기
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
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          caretColor: 'transparent',
          alignItems: 'center'
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Box 
              component="img" 
              src="/images/logo2.png" 
              alt="로고"
              sx={{ 
                height: 40,
                cursor: 'pointer',
              }}
            />
          </Link>
        </Box>

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
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
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
            {itinerary.isAIGenerated && (
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                bgcolor: 'success.light', 
                color: 'success.dark',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                mb: 1.5,
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}>
                ✨ AI 맞춤 일정
              </Box>
            )}
            
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
              Day {activeDay + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {itinerary?.dailySchedule?.[activeDay]?.location || ''}
            </Typography>
            <List>
              {(() => {
                let sequenceNumber = 1; // 각 날짜마다 1번부터 시작
                return itinerary?.dailySchedule?.[activeDay]?.activities?.map((activity, actIndex) => {
                  // location이 있는 활동만 sequenceNumber 증가
                  const showMarker = activity.location && (activity.type === 'airport' || activity.type === 'attraction' || activity.type === 'meal' || activity.type === 'accommodation');
                  const currentSequenceNumber = showMarker ? sequenceNumber++ : null;
                  
                  return (
                <ListItem 
                  key={actIndex} 
                  alignItems="center" 
                  sx={{ 
                    py: activity.type === 'transit' ? 0.5 : 1,
                    cursor: (activity.type === 'attraction' || activity.type === 'meal' || activity.type === 'airport' || activity.type === 'accommodation') && activity.location ? 'pointer' : 'default',
                    '&:hover': (activity.type === 'attraction' || activity.type === 'meal' || activity.type === 'airport' || activity.type === 'accommodation') && activity.location ? {
                      bgcolor: 'action.hover'
                    } : {},
                    bgcolor: activity.type === 'transit' ? 'grey.50' : 'transparent',
                    borderLeft: activity.type === 'transit' ? '3px solid' : 'none',
                    borderColor: activity.type === 'transit' ? 'info.main' : 'transparent',
                    ml: activity.type === 'transit' ? 2 : 0
                  }}
                  onClick={() => {
                    if ((activity.type === 'attraction' || activity.type === 'meal' || activity.type === 'airport' || activity.type === 'accommodation') && activity.location) {
                      setMapFocus({
                        lat: activity.location.lat,
                        lng: activity.location.lng,
                        zoom: activity.type === 'airport' ? 15 : 18
                      });
                      // 마커를 선택 상태로 만들기 위해 TravelMap에 전달
                      setSelectedActivityMarker(activity);
                      setTimeout(() => setMapFocus(null), 500);
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">{activity.time} - {activity.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {activity.duration ? `${activity.duration}시간` : ''}
                          </Typography>
                        </Box>
                      )
                    }
                    secondary={activity.type !== 'transit' ? activity.description : activity.description}
                  />
                </ListItem>
                  );
                });
              })()}
            </List>
          </Box>
        )}

        {/* 검색 뷰 */}
        {viewMode === 'search' && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <PlaceSearch 
              places={places}
              selectedPlace={selectedPlace}
              onPlaceSelect={setSelectedPlace}
              onMapFocus={setMapFocus}
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