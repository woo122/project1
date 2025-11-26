import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, Polyline } from '@react-google-maps/api';

// 단순 RGB 기준으로 명도를 줄이는 헬퍼 (step 0: 원본, step 1: 10% 어둡게, step 2: 20% 어둡게 ...)
const darkenColor = (hex, step) => {
  const factor = Math.max(0, 1 - 0.1 * step);
  const normalizedHex = hex.replace('#', '');
  const r = parseInt(normalizedHex.substring(0, 2), 16);
  const g = parseInt(normalizedHex.substring(2, 4), 16);
  const b = parseInt(normalizedHex.substring(4, 6), 16);

  const nr = Math.max(0, Math.min(255, Math.round(r * factor)));
  const ng = Math.max(0, Math.min(255, Math.round(g * factor)));
  const nb = Math.max(0, Math.min(255, Math.round(b * factor)));

  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`.toUpperCase();
};

// Props:
// - destinations: 전체 목적지 데이터
// - dailySchedule: 일별 일정 데이터 (음식점 마커 표시용)
// - activityNames?: 지도에 표시할 활동 이름 배열 (없으면 전체 표시)
// - focus?: { lat, lng, zoom? } 특정 좌표로 이동
// - focusName?: 강조할 마커의 명칭
// - places?: 장소 데이터 배열 (검색 결과)
// - onPlaceClick?: 장소 마커 클릭 핸들러
// - selectedPlaceId?: 선택된 장소 ID
// - onAttractionClick?: 일정 관광지 마커 클릭 핸들러
// - onMapPoiClick?: 지도의 POI 클릭 핸들러
// - selectedActivityMarker?: 일정 목록에서 선택한 활동
// - onMarkerNameClick?: InfoWindow의 이름 클릭 핸들러
// - segmentColors?: 마커 사이 각 구간(세그먼트)의 색상을 순번대로 지정하는 배열
const TravelMap = ({ destinations, dailySchedule = [], activityNames = null, focus = null, focusName = null, places = null, onPlaceClick = null, selectedPlaceId = null, onAttractionClick = null, onMapPoiClick = null, selectedActivityMarker = null, onMarkerNameClick = null, selectedAttraction = null, segmentColors = null }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  
  // selectedActivityMarker가 변경되면 해당 마커를 선택 상태로 설정
  useEffect(() => {
    if (selectedActivityMarker) {
      setSelectedMarker(selectedActivityMarker);
    }
  }, [selectedActivityMarker]);

  // selectedAttraction이 변경되면 해당 마커를 선택 상태로 설정 (Google Places 데이터 우선)
  useEffect(() => {
    if (selectedAttraction) {
      setSelectedMarker(selectedAttraction);
    }
  }, [selectedAttraction]);
  
  // 지도의 중심 좌표 계산 (주어진 place 배열 기준)
  const calculateCenter = (placeList) => {
    if (!placeList || placeList.length === 0) return { lat: 35.6762, lng: 139.6503 };
    let totalLat = 0;
    let totalLng = 0;
    placeList.forEach(p => {
      totalLat += p.location.lat;
      totalLng += p.location.lng;
    });
    return { lat: totalLat / placeList.length, lng: totalLng / placeList.length };
  };

  // 지도에 표시할 모든 장소 수집
  const getAllPlaces = () => {
    const attractionList = [];
    if (destinations) {
      destinations.forEach(destination => {
        if (destination.attractions) {
          destination.attractions.forEach(attraction => {
            if (attraction?.location) {
              attractionList.push({ ...attraction, destinationName: destination.name });
            }
          });
        }
      });
    }
    return attractionList;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allPlaces = useMemo(() => getAllPlaces(), [destinations]);
  const attractionPlaces = useMemo(() => {
    // activityNames가 null이면 모든 장소 표시, 빈 배열이면 아무것도 표시 안함
    if (activityNames === null) return allPlaces;
    if (activityNames.length === 0) return [];
    return allPlaces.filter(p => activityNames.includes(p.name));
  }, [allPlaces, activityNames]);
  
  // 일정의 모든 활동을 순서대로 추출하여 번호 부여
  const markerList = useMemo(() => {
    if (!dailySchedule || dailySchedule.length === 0) return [];
    
    const markers = [];
    
    dailySchedule.forEach(day => {
      if (day?.activities) {
        let sequenceNumber = 1; // 각 날짜마다 1번부터 시작
        day.activities.forEach(activity => {
          // location이 있는 모든 활동(공항, 관광지, 음식점, 숙소, 사용자 추가 활동 등)
          if (activity.location && (activity.type === 'airport' || activity.type === 'attraction' || activity.type === 'meal' || activity.type === 'accommodation' || activity.type === 'custom')) {
            markers.push({
              ...activity,
              dayLocation: day.location,
              sequenceNumber: sequenceNumber++
            });
          }
        });
      }
    });
    return markers;
  }, [dailySchedule]);
  
  // 같은 위치에 있는 마커들을 하나로 그룹화 (라벨은 '1,8'처럼 묶어서 표시)
  const groupedMarkerList = useMemo(() => {
    if (!markerList || markerList.length === 0) return [];

    const map = new Map();

    markerList.forEach((marker) => {
      const { lat, lng } = marker.location || {};
      if (typeof lat !== 'number' || typeof lng !== 'number') return;

      const key = `${lat.toFixed(6)}-${lng.toFixed(6)}`;
      if (!map.has(key)) {
        map.set(key, {
          location: { lat, lng },
          markers: [],
          sequenceNumbers: [],
        });
      }
      const group = map.get(key);
      group.markers.push(marker);
      if (marker.sequenceNumber != null) {
        group.sequenceNumbers.push(marker.sequenceNumber);
      }
    });

    // sequenceNumber 기준 오름차순 정렬
    const groups = Array.from(map.values()).map((group) => ({
      ...group,
      sequenceNumbers: group.sequenceNumbers.sort((a, b) => a - b),
      // 대표 마커는 가장 작은 sequenceNumber를 가진 마커로 사용
      representative: group.markers.sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0))[0],
    }));

    return groups;
  }, [markerList]);
  
  // 일정 경로 생성 (각 날짜별로 경로 분리)
  const routePaths = useMemo(() => {
    if (!dailySchedule || dailySchedule.length === 0) return [];
    
    const paths = [];
    dailySchedule.forEach(day => {
      if (day?.activities) {
        const dayPath = [];
        day.activities.forEach(activity => {
          // attraction, meal, airport, accommodation, custom 타입만 경로에 포함
          if ((activity.type === 'attraction' || activity.type === 'meal' || activity.type === 'airport' || activity.type === 'accommodation' || activity.type === 'custom') && activity.location) {
            dayPath.push({
              lat: activity.location.lat,
              lng: activity.location.lng
            });
          }
        });
        // 해당 날짜에 2개 이상의 위치가 있을 때만 경로 추가
        if (dayPath.length > 1) {
          paths.push(dayPath);
        }
      }
    });
    return paths;
  }, [dailySchedule]);
  
  const center = useMemo(() => calculateCenter(attractionPlaces), [attractionPlaces]);

  const mapRef = useRef(null);
  const initialCenterRef = useRef(null);

  // 초기 center 저장
  if (!initialCenterRef.current) {
    initialCenterRef.current = { lat: center.lat, lng: center.lng };
  }

  useEffect(() => {
    if (mapRef.current && focus && typeof focus.lat === 'number' && typeof focus.lng === 'number') {
      // 약간의 지연을 두고 이동 (부드러운 전환)
      const timer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.panTo({ lat: focus.lat, lng: focus.lng });
          if (focus.zoom) mapRef.current.setZoom(focus.zoom);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [focus]);

  // 지도 POI 클릭 이벤트 핸들러
  const handleMapClick = (event) => {
    // POI(Point of Interest) 클릭인지 확인
    if (event.placeId) {
      // 기본 InfoWindow가 뜨는 것을 방지
      event.stop();
      
      if (onMapPoiClick) {
        onMapPoiClick(event.placeId);
      }
    }
  };

  return (
    <GoogleMap
      center={initialCenterRef.current}
      zoom={11}
      mapContainerStyle={{ width: '100%', height: '100%' }}
      onLoad={(map) => { mapRef.current = map; }}
      onClick={handleMapClick}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
    >
      {/* 일정 경로 라인 */}
      {routePaths.map((dayPath, dayIndex) => {
        return dayPath.map((point, idx) => {
          if (idx === dayPath.length - 1) return null;
          const segmentIndex = idx; // 0: 1-2, 1: 2-3, 2: 3-4 ...

          const defaultSegmentColors = [
            '#00AFDB', // 1-2
            '#1A98B7', // 2-3
            '#2A7E92', // 3-4
            '#2F616E', // 4-5
            '#2A434A', // 5-6
          ];

          let color = '#000000';
          if (Array.isArray(segmentColors) && segmentColors[segmentIndex]) {
            color = segmentColors[segmentIndex];
          } else if (segmentIndex < defaultSegmentColors.length) {
            color = defaultSegmentColors[segmentIndex];
          }

          return (
            <Polyline
              key={`route-${dayIndex}-${idx}`}
              path={[dayPath[idx], dayPath[idx + 1]]}
              options={{
                strokeColor: color,
                strokeOpacity: 0.9,
                strokeWeight: 3,
                geodesic: true,
                zIndex: 1
              }}
            />
          );
        });
      })}

      {/* 순서대로 번호가 표시된 마커들 (같은 위치는 1,8처럼 하나로 합침) */}
      {groupedMarkerList.map((group, index) => {
        const isHovered = hoveredMarkerId === `marker-${index}`;
        const labelText = group.sequenceNumbers.length > 0
          ? group.sequenceNumbers.join(',')
          : '';
        const representative = group.representative;

        return (
          <Marker
            key={`marker-${index}`}
            position={{ lat: group.location.lat, lng: group.location.lng }}
            label={{
              text: labelText,
              color: '#ffffff',
              fontSize: isHovered ? '18px' : '16px',
              fontWeight: 'bold'
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: isHovered ? 20 : 16,
              fillColor: '#00a4bb',
              fillOpacity: 1,
              strokeColor: '#00a4bb',
              strokeWeight: isHovered ? 3 : 2,
              labelOrigin: new window.google.maps.Point(0, 0)
            }}
            onClick={() => {
              // 대표 마커 기준으로 동작 (InfoWindow 및 상세 동작)
              setSelectedMarker(representative);
              if (onAttractionClick) onAttractionClick(representative);
            }}
            onMouseOver={() => setHoveredMarkerId(`marker-${index}`)}
            onMouseOut={() => setHoveredMarkerId(null)}
            zIndex={isHovered ? 200 : 100}
          />
        );
      })}

      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.location.lat, lng: selectedMarker.location.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div style={{ padding: 0, maxWidth: 250 }}>
            {/* 이미지 */}
            {(selectedMarker.photos && selectedMarker.photos.length > 0) ? (
              <img 
                src={selectedMarker.photos[0].getUrl({ maxWidth: 250, maxHeight: 120 })}
                alt={selectedMarker.name}
                style={{ 
                  width: '100%', 
                  height: 120, 
                  objectFit: 'cover',
                  borderRadius: '4px 4px 0 0',
                  marginBottom: 8
                }}
              />
            ) : selectedMarker.image ? (
              <img 
                src={selectedMarker.image} 
                alt={selectedMarker.name}
                style={{ 
                  width: '100%', 
                  height: 120, 
                  objectFit: 'cover',
                  borderRadius: '4px 4px 0 0',
                  marginBottom: 8
                }}
              />
            ) : (
              <img 
                src={`https://source.unsplash.com/800x600/?${encodeURIComponent(selectedMarker.name + ',japan')}`} 
                alt={selectedMarker.name}
                style={{ 
                  width: '100%', 
                  height: 120, 
                  objectFit: 'cover',
                  borderRadius: '4px 4px 0 0',
                  marginBottom: 8
                }}
              />
            )}
            <div style={{ padding: '0 8px 8px 8px' }}>
              <div 
                style={{ 
                  fontWeight: 600, 
                  marginBottom: 4, 
                  cursor: 'pointer',
                  color: '#1976d2',
                  textDecoration: 'underline'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('InfoWindow 이름 클릭됨:', selectedMarker.name);
                  console.log('selectedMarker 전체:', selectedMarker);
                  if (onMarkerNameClick) {
                    console.log('onMarkerNameClick 호출');
                    onMarkerNameClick(selectedMarker);
                  } else {
                    console.warn('onMarkerNameClick 핸들러가 없습니다');
                  }
                }}
              >
                {selectedMarker.name}
              </div>
              {selectedMarker.type === 'meal' ? (
                // 음식점 정보
                <>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>
                    🍽️ {selectedMarker.time}
                  </div>
                  {selectedMarker.rating && (
                    <div style={{ fontSize: 12, marginBottom: 4 }}>
                      ⭐ {selectedMarker.rating}
                    </div>
                  )}
                  {selectedMarker.description && (
                    <div style={{ fontSize: 11, opacity: 0.8 }}>
                      {selectedMarker.description}
                    </div>
                  )}
                </>
              ) : selectedMarker.type === 'airport' ? (
                // 공항 정보
                <>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>
                    ✈️ {selectedMarker.time}
                  </div>
                  {selectedMarker.description && (
                    <div style={{ fontSize: 11, opacity: 0.8 }}>
                      {selectedMarker.description}
                    </div>
                  )}
                  <div style={{ fontSize: 12, marginTop: 4, color: '#f44336', fontWeight: 600 }}>
                    공항
                  </div>
                </>
              ) : selectedMarker.type === 'accommodation' ? (
                // 숙소 정보
                <>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>
                    🏨 {selectedMarker.time}
                  </div>
                  {selectedMarker.description && (
                    <div style={{ fontSize: 11, opacity: 0.8 }}>
                      {selectedMarker.description}
                    </div>
                  )}
                  <div style={{ fontSize: 12, marginTop: 4, color: '#4caf50', fontWeight: 600 }}>
                    숙소
                  </div>
                </>
              ) : selectedMarker.type === 'custom' ? (
                // 사용자 추가 활동 정보
                <>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>
                    📍 {selectedMarker.time}
                  </div>
                  {selectedMarker.description && (
                    <div style={{ fontSize: 11, opacity: 0.8 }}>
                      {selectedMarker.description}
                    </div>
                  )}
                  <div style={{ fontSize: 12, marginTop: 4, color: '#9c27b0', fontWeight: 600 }}>
                    사용자 추가
                  </div>
                </>
              ) : (
                // 관광지 정보
                <>
                  {selectedMarker.rating && (
                    <div style={{ fontSize: 12, marginBottom: 4 }}>
                      ⭐ {selectedMarker.rating}
                    </div>
                  )}
                  {selectedMarker.description && (
                    <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>
                      {selectedMarker.description}
                    </div>
                  )}
                  {selectedMarker.destinationName && (
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {selectedMarker.destinationName} • {selectedMarker.type}
                    </div>
                  )}
                  {selectedMarker.duration && (
                    <div style={{ fontSize: 12 }}>소요 시간: 약 {selectedMarker.duration}시간</div>
                  )}
                </>
              )}
            </div>
          </div>
        </InfoWindow>
      )}

      {/* 검색된 장소 마커 */}
      {places && places.map((place, index) => {
        const isSelected = selectedPlaceId === place.id;
        const isHovered = hoveredMarkerId === `place-${index}`;
        return (
          <Marker
            key={`place-${index}`}
            position={{ lat: place.location.lat, lng: place.location.lng }}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
              fillColor: isSelected ? '#4caf50' : '#00a4bb',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: isHovered ? 3 : 2,
              scale: isSelected ? 2.5 : (isHovered ? 2.8 : 2),
              anchor: new window.google.maps.Point(12, 22)
            }}
            onClick={() => {
              setSelectedPlace(place);
              if (onPlaceClick) onPlaceClick(place);
            }}
            onMouseOver={() => setHoveredMarkerId(`place-${index}`)}
            onMouseOut={() => setHoveredMarkerId(null)}
            zIndex={isSelected ? 1000 : (isHovered ? 500 : 1)}
          />
        );
      })}

      {/* 장소 정보창 */}
      {selectedPlace && (
        <InfoWindow
          position={{ lat: selectedPlace.location.lat, lng: selectedPlace.location.lng }}
          onCloseClick={() => setSelectedPlace(null)}
        >
          <div style={{ padding: 0, maxWidth: 250 }}>
            {/* 이미지 */}
            {selectedPlace.photos && selectedPlace.photos.length > 0 && (
              <img 
                src={selectedPlace.photos[0].getUrl({ maxWidth: 250, maxHeight: 120 })}
                alt={selectedPlace.name}
                style={{ 
                  width: '100%', 
                  height: 120, 
                  objectFit: 'cover',
                  borderRadius: '4px 4px 0 0',
                  marginBottom: 8
                }}
              />
            )}
            <div style={{ padding: '0 8px 8px 8px' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{selectedPlace.name}</div>
              {selectedPlace.rating && (
                <div style={{ fontSize: 12, marginBottom: 4 }}>
                  ⭐ {selectedPlace.rating} {selectedPlace.userRatingsTotal && `(${selectedPlace.userRatingsTotal}개 리뷰)`}
                </div>
              )}
              <div style={{ fontSize: 11, opacity: 0.8 }}>
                {selectedPlace.vicinity}
              </div>
              {selectedPlace.priceLevel && (
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {'¥'.repeat(selectedPlace.priceLevel)}
                </div>
              )}
            </div>
          </div>
        </InfoWindow>
      )}

    </GoogleMap>
  );
};

export default TravelMap;