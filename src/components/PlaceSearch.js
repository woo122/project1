import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Card,
  CardContent,
  CardMedia,
  Typography,
  Rating,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhoneIcon from '@mui/icons-material/Phone';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ClearIcon from '@mui/icons-material/Clear';

// 키워드 선택 컴포넌트
const KeywordSelector = ({ onKeywordSelect }) => {
  const [selectedKeyword, setSelectedKeyword] = useState('');

  const keywords = [
    { id: 1, text: '관광지' },
    { id: 2, text: '음식점' },
    { id: 3, text: '쇼핑' },
    { id: 4, text: '액티비티' }
  ];

  const handleKeywordClick = (keyword) => {
    setSelectedKeyword(keyword.text);
    if (onKeywordSelect) {
      onKeywordSelect(keyword.text);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: '20px', 
      mt: '20px', 
      justifyContent: 'center',
      mb: 2
    }}>
      {keywords.map((keyword) => (
        <Box
          key={keyword.id}
          onClick={() => handleKeywordClick(keyword)}
          sx={{
            width: '120px',
            height: '35px',
            border: '1px solid #00a4bb',
            borderRadius: '16px',
            backgroundColor: selectedKeyword === keyword.text ? '#00a4bb' : 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: selectedKeyword === keyword.text ? '#ffffff' : '#333'
          }}
        >
          {keyword.text}
        </Box>
      ))}
    </Box>
  );
};

const PlaceSearch = ({ center, onPlaceSelect, onPlacesFound, selectedPlace, onBackToList, onAddToItinerary, days = [], defaultDayIndex = 0 }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [detailPlace, setDetailPlace] = useState(null);
  const detailViewRef = useRef(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(defaultDayIndex || 0);
  const [timeInput, setTimeInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');

  // center가 없을 경우 도쿄 중심 좌표를 기본값으로 사용
  const getEffectiveCenter = () => {
    if (center && center.lat && center.lng) return center;
    return { lat: 35.6762, lng: 139.6503 };
  };

  // 키워드 선택 처리
  const handleKeywordSelect = (keyword) => {
    setSearchQuery(keyword);
    // 키워드 선택 후 자동으로 검색 실행
    if (keyword.trim()) {
      searchPlaces(getEffectiveCenter(), keyword);
    }
  };

  // 장소 검색
  const searchPlaces = (location, keyword = '') => {
    if (!keyword.trim()) {
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps Places API가 아직 로드되지 않았습니다.');
      return;
    }

    console.log('📍 장소 검색 시작:', { location, keyword });
    // 로딩은 표시하되, 기존 결과는 유지해서 깜빡임 방지
    setLoading(true);

    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: 10000, // 10km 반경
      keyword: keyword
    };

    const processResults = (allResults) => {
      // 평점이 있는 것 우선 정렬
      const sortedResults = allResults
        .sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });

      // 상세 정보 가져오기
      const detailPromises = sortedResults.map(place => 
        new Promise((resolve) => {
          service.getDetails(
            { 
              placeId: place.place_id,
              fields: ['name', 'rating', 'user_ratings_total', 'vicinity', 'price_level', 
                      'photos', 'geometry', 'opening_hours', 'reviews', 'types', 
                      'formatted_phone_number', 'website', 'url', 'formatted_address']
            },
            (placeDetails, detailStatus) => {
              if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                resolve({
                  id: place.place_id,
                  name: placeDetails.name,
                  rating: placeDetails.rating,
                  userRatingsTotal: placeDetails.user_ratings_total,
                  vicinity: placeDetails.vicinity || placeDetails.formatted_address,
                  priceLevel: placeDetails.price_level,
                  photos: placeDetails.photos || [],
                  location: {
                    lat: placeDetails.geometry.location.lat(),
                    lng: placeDetails.geometry.location.lng()
                  },
                  openingHours: placeDetails?.opening_hours?.weekday_text || [],
                  reviews: placeDetails?.reviews || [],
                  types: placeDetails.types,
                  phoneNumber: placeDetails?.formatted_phone_number,
                  website: placeDetails?.website,
                  googleMapsUrl: placeDetails?.url
                });
              } else {
                resolve(null);
              }
            }
          );
        })
      );

      Promise.all(detailPromises).then(details => {
        const filteredPlaces = details.filter(d => d !== null);
        setPlaces(filteredPlaces);
        if (onPlacesFound) {
          onPlacesFound(filteredPlaces);
        }
        setLoading(false);
      });
    };
    
    // 한 번만 검색 실행 (페이지네이션 없이 단일 호출)
    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        processResults(results);
      } else {
        // 오류 시에도 기존 결과는 그대로 두고 로딩만 해제
        setLoading(false);
      }
    });
  };

  // 타이핑하면서 자동으로 결과 미리 보기 (디바운스)
  useEffect(() => {
    const query = searchQuery.trim();

    // 검색어가 없으면 검색하지 않음 (수동 초기화는 handleClearSearch 사용)
    if (!query) {
      return;
    }

    // 너무 짧은 검색어는 API 호출 생략
    if (query.length < 2) {
      return;
    }

    const timer = setTimeout(() => {
      searchPlaces(getEffectiveCenter(), query);
    }, 400); // 마지막 입력 후 0.4초 뒤에 한 번만 검색

    return () => clearTimeout(timer);
  }, [searchQuery, center]);

  // 선택된 장소로 상세 뷰 전환
  useEffect(() => {
    if (selectedPlace && selectedPlace.id) {
      // 이미 같은 장소가 선택되어 있어도 다시 상세 뷰로 전환
      setDetailPlace(selectedPlace);
      setViewMode('detail');
    }
  }, [selectedPlace]);

  useEffect(() => {
    setSelectedDayIndex(defaultDayIndex || 0);
  }, [defaultDayIndex]);

  // 상세 뷰로 전환 시 맨 위로 스크롤
  useEffect(() => {
    if (viewMode === 'detail' && detailViewRef.current) {
      detailViewRef.current.scrollTop = 0;
    }
  }, [viewMode, detailPlace]);

  // 검색 실행
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchPlaces(getEffectiveCenter(), searchQuery);
    }
  };

  // 검색 결과 초기화
  const handleClearSearch = () => {
    setSearchQuery('');
    setPlaces([]);
    if (onPlacesFound) {
      onPlacesFound([]);
    }
    setViewMode('list');
    setDetailPlace(null);
    if (onBackToList) {
      onBackToList();
    }
  };

  // 가격 레벨 표시
  const getPriceLevelText = (level) => {
    if (!level) return '정보 없음';
    return '¥'.repeat(level);
  };

  // 사진 URL 가져오기
  const getPhotoUrl = (photos) => {
    if (photos && photos.length > 0) {
      return photos[0].getUrl({ maxWidth: 400, maxHeight: 300 });
    }
    return null;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 리스트 뷰 */}
      {viewMode === 'list' && (
        <>
          {/* 검색 바 (고정) */}
          <Box sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'white', p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="장소, 음식점, 액티비티 등 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            {/* 키워드 선택 UI */}
            <KeywordSelector onKeywordSelect={handleKeywordSelect} />
            
            {(places.length > 0 || searchQuery) && (
              <Button 
                fullWidth 
                variant="outlined" 
                color="primary" 
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearSearch}
                sx={{ mt: 1 }}
              >
                검색 결과 초기화
              </Button>
            )}
          </Box>

          {/* 장소 리스트 */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, position: 'relative' }}>
            {/* 로딩 상태일 때는 리스트는 그대로 두고 상단에 작은 로딩 아이콘만 표시 */}
            {loading && (
              <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 5 }}>
                <CircularProgress size={20} thickness={4} />
              </Box>
            )}

            {places.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                  {searchQuery ? '검색 결과가 없습니다' : '장소를 검색해보세요'}
                </Typography>
              </Box>
            ) : (
              places.map((place) => (
                <Card 
                  key={place.id}
                  sx={{ 
                    mb: 2, 
                    cursor: 'pointer',
                    border: selectedPlace?.id === place.id ? 2 : 0,
                    borderColor: 'primary.main',
                    '&:hover': { boxShadow: 3 }
                  }}
                  onClick={() => {
                    setDetailPlace(place);
                    setViewMode('detail');
                    // 부모 컴포넌트에도 알림 (지도 이동 등을 위해)
                    if (onPlaceSelect) onPlaceSelect(place);
                  }}
                >
                  {getPhotoUrl(place.photos) && (
                    <CardMedia
                      component="img"
                      height="180"
                      image={getPhotoUrl(place.photos)}
                      alt={place.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {place.name}
                    </Typography>
                    
                    {place.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={place.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {place.rating} {place.userRatingsTotal && `(${place.userRatingsTotal})`}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {place.vicinity}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </>
      )}

      {/* 상세 뷰 - 구글 지도 스타일 */}
      {viewMode === 'detail' && detailPlace && (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* 헤더 - 뒤로가기 버튼 */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={() => {
                setViewMode('list');
                setDetailPlace(null);
                // 부모 컴포넌트에도 알려서 selectedPlace를 초기화
                if (onBackToList) onBackToList();
              }}
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {detailPlace.name}
            </Typography>
          </Box>

          {/* 스크롤 가능한 콘텐츠 영역 */}
          <Box ref={detailViewRef} sx={{ flex: 1, overflow: 'auto' }}>
            {/* 메인 사진 */}
            {getPhotoUrl(detailPlace.photos) && (
              <Box
                component="img"
                src={getPhotoUrl(detailPlace.photos)}
                alt={detailPlace.name}
                sx={{ 
                  width: '100%', 
                  height: 250, 
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(detailPlace.photos[0].getUrl({ maxWidth: 1200 }), '_blank')}
              />
            )}

            <Box sx={{ p: 2 }}>
              {/* 평점 */}
              {detailPlace.rating && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Rating value={detailPlace.rating} precision={0.1} readOnly />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {detailPlace.rating}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {detailPlace.userRatingsTotal}개의 리뷰
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* 주소 */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <LocationOnIcon color="action" />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>주소</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detailPlace.vicinity}
                  </Typography>
                </Box>
              </Box>

              {/* 전화번호 */}
              {detailPlace.phoneNumber && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <PhoneIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>전화번호</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detailPlace.phoneNumber}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* 가격대 */}
              {detailPlace.priceLevel && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>가격대</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getPriceLevelText(detailPlace.priceLevel)}
                  </Typography>
                </Box>
              )}

              {/* 영업시간 */}
              {detailPlace.openingHours && detailPlace.openingHours.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <ScheduleIcon color="action" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>영업시간</Typography>
                    {detailPlace.openingHours.map((hours, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary">
                        {hours}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* 액션 버튼들 */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {detailPlace.googleMapsUrl && (
                  <Button 
                    variant="outlined"
                    fullWidth
                    href={detailPlace.googleMapsUrl} 
                    target="_blank"
                    startIcon={<OpenInNewIcon />}
                  >
                    Google Maps
                  </Button>
                )}
                {detailPlace.website && (
                  <Button 
                    variant="outlined"
                    fullWidth
                    href={detailPlace.website} 
                    target="_blank"
                    startIcon={<OpenInNewIcon />}
                  >
                    웹사이트
                  </Button>
                )}
              </Box>

              {onAddToItinerary && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          날짜 선택
                        </Typography>
                        <select
                          value={selectedDayIndex}
                          onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
                          style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ccc', fontSize: 14 }}
                        >
                          {days && days.length > 0 ? (
                            days.map((day, idx) => (
                              <option key={idx} value={idx}>{`${idx + 1}일차${day.date ? ` (${day.date})` : ''}`}</option>
                            ))
                          ) : (
                            <option value={0}>1일차</option>
                          )}
                        </select>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          시간
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="예: 10:00"
                          value={timeInput}
                          onChange={(e) => setTimeInput(e.target.value)}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        설명 (선택)
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="간단한 설명을 입력하세요."
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                      />
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => {
                      if (!timeInput.trim()) return;
                      const targetIndex = selectedDayIndex >= 0 && selectedDayIndex < days.length
                        ? selectedDayIndex
                        : 0;
                      onAddToItinerary(detailPlace, targetIndex, timeInput.trim(), descriptionInput.trim());
                    }}
                  >
                    이 일정에 추가
                  </Button>
                </Box>
              )}

              {/* 사진 갤러리 */}
              {detailPlace.photos && detailPlace.photos.length > 1 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    사진 ({detailPlace.photos.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                    {detailPlace.photos.map((photo, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={photo.getUrl({ maxWidth: 200, maxHeight: 150 })}
                        alt={`${detailPlace.name} ${idx + 1}`}
                        sx={{ 
                          width: 120,
                          height: 90,
                          objectFit: 'cover', 
                          borderRadius: 1,
                          cursor: 'pointer',
                          flexShrink: 0,
                          '&:hover': { opacity: 0.8 }
                        }}
                        onClick={() => window.open(photo.getUrl({ maxWidth: 1200 }), '_blank')}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* 리뷰 섹션 */}
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  리뷰
                </Typography>
                {detailPlace.reviews && detailPlace.reviews.length > 0 ? (
                  <Box>
                    {detailPlace.reviews.map((review, idx) => (
                      <Box key={idx} sx={{ mb: 3, pb: 3, borderBottom: idx < detailPlace.reviews.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ flex: 1 }}>
                            {review.author_name}
                          </Typography>
                          {review.relative_time_description && (
                            <Typography variant="caption" color="text.secondary">
                              {review.relative_time_description}
                            </Typography>
                          )}
                        </Box>
                        <Rating value={review.rating} size="small" readOnly sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {review.text}
                        </Typography>
                      </Box>
                    ))}
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      더 많은 리뷰를 보려면 Google Maps를 확인하세요.
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    리뷰가 없습니다.
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PlaceSearch;
