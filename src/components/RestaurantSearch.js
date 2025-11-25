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
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhoneIcon from '@mui/icons-material/Phone';
import ScheduleIcon from '@mui/icons-material/Schedule';

const RestaurantSearch = ({ center, onRestaurantSelect, onRestaurantsFound, selectedRestaurant }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [detailRestaurant, setDetailRestaurant] = useState(null);
  const restaurantRefs = useRef({});

  // 주변 음식점 검색
  const searchNearbyRestaurants = (location, keyword = '') => {
    if (!window.google) return;

    setLoading(true);
    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: 2000, // 2km 반경
      type: 'restaurant',
      keyword: keyword || undefined
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        // 평점 높은 순으로 정렬하고 상위 20개만
        const sortedResults = results
          .filter(place => place.rating && place.rating >= 3.5)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 20);

        // 상세 정보 가져오기
        const detailPromises = sortedResults.map(place => 
          new Promise((resolve) => {
            service.getDetails(
              { 
                placeId: place.place_id,
                fields: ['name', 'rating', 'user_ratings_total', 'vicinity', 'price_level', 
                        'photos', 'geometry', 'opening_hours', 'reviews', 'types', 
                        'formatted_phone_number', 'website', 'url']
              },
              (placeDetails, detailStatus) => {
                if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                  resolve({
                    id: place.place_id,
                    name: placeDetails.name,
                    rating: placeDetails.rating,
                    userRatingsTotal: placeDetails.user_ratings_total,
                    vicinity: placeDetails.vicinity,
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
          const filteredRestaurants = details.filter(d => d !== null);
          setRestaurants(filteredRestaurants);
          if (onRestaurantsFound) {
            onRestaurantsFound(filteredRestaurants);
          }
          setLoading(false);
          setHasSearched(true);
        });
      } else {
        setLoading(false);
      }
    });
  };

  // 컴포넌트 마운트 시 주변 음식점 검색 (한 번만)
  useEffect(() => {
    if (center && window.google && !hasSearched) {
      searchNearbyRestaurants(center);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.lat, center?.lng, hasSearched]);

  // 선택된 음식점으로 스크롤 또는 상세 뷰로 전환
  useEffect(() => {
    if (selectedRestaurant) {
      setDetailRestaurant(selectedRestaurant);
      setViewMode('detail');
    }
  }, [selectedRestaurant]);

  // 검색 실행
  const handleSearch = () => {
    if (center) {
      searchNearbyRestaurants(center, searchQuery);
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
              placeholder="음식 종류나 음식점 이름 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <RestaurantIcon />
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
          </Box>

          {/* 음식점 리스트 */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : restaurants.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                검색 결과가 없습니다
              </Typography>
            ) : (
              restaurants.map((restaurant) => (
                <Card 
                  key={restaurant.id}
                  ref={(el) => restaurantRefs.current[restaurant.id] = el}
                  sx={{ 
                    mb: 2, 
                    cursor: 'pointer',
                    border: selectedRestaurant?.id === restaurant.id ? 2 : 0,
                    borderColor: 'primary.main',
                    '&:hover': { boxShadow: 3 }
                  }}
                  onClick={() => {
                    setDetailRestaurant(restaurant);
                    setViewMode('detail');
                    if (onRestaurantSelect) onRestaurantSelect(restaurant);
                  }}
                >
                  {getPhotoUrl(restaurant.photos) && (
                    <CardMedia
                      component="img"
                      height="180"
                      image={getPhotoUrl(restaurant.photos)}
                      alt={restaurant.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {restaurant.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={restaurant.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {restaurant.rating} ({restaurant.userRatingsTotal})
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {restaurant.vicinity}
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
      {viewMode === 'detail' && detailRestaurant && (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* 헤더 - 뒤로가기 버튼 */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={() => {
                setViewMode('list');
                setDetailRestaurant(null);
              }}
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {detailRestaurant.name}
            </Typography>
          </Box>

          {/* 스크롤 가능한 콘텐츠 영역 */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {/* 메인 사진 */}
            {getPhotoUrl(detailRestaurant.photos) && (
              <Box
                component="img"
                src={getPhotoUrl(detailRestaurant.photos)}
                alt={detailRestaurant.name}
                sx={{ 
                  width: '100%', 
                  height: 250, 
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(detailRestaurant.photos[0].getUrl({ maxWidth: 1200 }), '_blank')}
              />
            )}

            <Box sx={{ p: 2 }}>
              {/* 평점 */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Rating value={detailRestaurant.rating} precision={0.1} readOnly />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {detailRestaurant.rating}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {detailRestaurant.userRatingsTotal}개의 리뷰
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* 주소 */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <LocationOnIcon color="action" />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>주소</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detailRestaurant.vicinity}
                  </Typography>
                </Box>
              </Box>

              {/* 전화번호 */}
              {detailRestaurant.phoneNumber && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <PhoneIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>전화번호</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detailRestaurant.phoneNumber}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* 가격대 */}
              {detailRestaurant.priceLevel && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>가격대</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getPriceLevelText(detailRestaurant.priceLevel)}
                  </Typography>
                </Box>
              )}

              {/* 영업시간 */}
              {detailRestaurant.openingHours && detailRestaurant.openingHours.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <ScheduleIcon color="action" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>영업시간</Typography>
                    {detailRestaurant.openingHours.map((hours, idx) => (
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
                {detailRestaurant.googleMapsUrl && (
                  <Button 
                    variant="outlined"
                    fullWidth
                    href={detailRestaurant.googleMapsUrl} 
                    target="_blank"
                    startIcon={<OpenInNewIcon />}
                  >
                    Google Maps
                  </Button>
                )}
                {detailRestaurant.website && (
                  <Button 
                    variant="outlined"
                    fullWidth
                    href={detailRestaurant.website} 
                    target="_blank"
                    startIcon={<OpenInNewIcon />}
                  >
                    웹사이트
                  </Button>
                )}
              </Box>

              {/* 사진 갤러리 */}
              {detailRestaurant.photos && detailRestaurant.photos.length > 1 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    사진 ({detailRestaurant.photos.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                    {detailRestaurant.photos.map((photo, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={photo.getUrl({ maxWidth: 200, maxHeight: 150 })}
                        alt={`${detailRestaurant.name} ${idx + 1}`}
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
                {detailRestaurant.reviews && detailRestaurant.reviews.length > 0 ? (
                  <Box>
                    {detailRestaurant.reviews.map((review, idx) => (
                      <Box key={idx} sx={{ mb: 3, pb: 3, borderBottom: idx < detailRestaurant.reviews.length - 1 ? 1 : 0, borderColor: 'divider' }}>
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

export default RestaurantSearch;
