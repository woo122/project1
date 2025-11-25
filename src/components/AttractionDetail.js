import React from 'react';
import { 
  Box, 
  Typography,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';

const AttractionDetail = ({ attraction, onBack }) => {
  if (!attraction) return null;

  const isAirport = attraction.type === 'airport';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 - 닫기 버튼 */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          {attraction.name}
        </Typography>
        <IconButton 
          onClick={onBack}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {/* 사진 */}
        {(attraction.photos && attraction.photos.length > 0) ? (
          <Box sx={{ mb: 3, width: '100%' }}>
            <Box 
              component="img" 
              src={attraction.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 })}
              alt={attraction.name}
              sx={{ 
                width: '100%', 
                height: 200,
                objectFit: 'cover',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
          </Box>
        ) : attraction.image ? (
          <Box sx={{ mb: 3, width: '100%' }}>
            <Box 
              component="img" 
              src={attraction.image} 
              alt={attraction.name}
              sx={{ 
                width: '100%', 
                height: 200,
                objectFit: 'cover',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
          </Box>
        ) : (
          <Box sx={{ mb: 3, width: '100%' }}>
            <Box 
              component="img" 
              src={`https://source.unsplash.com/800x600/?${encodeURIComponent(attraction.name + ',japan')}`} 
              alt={attraction.name}
              sx={{ 
                width: '100%', 
                height: 200,
                objectFit: 'cover',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
          </Box>
        )}

        {/* 장소 타입 */}
        <Box sx={{ mb: 3 }}>
          <Chip 
            label={attraction.type || '관광지'} 
            color="primary" 
            size="small"
            sx={{ mb: 2 }}
          />
          
          <Typography variant="h5" gutterBottom fontWeight="bold">
            {attraction.name}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 소요 시간 */}
        {attraction.duration && (
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <AccessTimeIcon color="action" />
            <Box>
              <Typography variant="subtitle2" gutterBottom>예상 소요 시간</Typography>
              <Typography variant="body2" color="text.secondary">
                약 {attraction.duration}시간
              </Typography>
            </Box>
          </Box>
        )}

        {/* 위치 정보 */}
        {attraction.location && (
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <LocationOnIcon color="action" />
            <Box>
              <Typography variant="subtitle2" gutterBottom>위치</Typography>
              {attraction.destinationName && (
                <Typography variant="body2" color="text.secondary">
                  {attraction.destinationName}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {(attraction.address
                  || attraction.formatted_address
                  || attraction.vicinity
                  || (attraction.description
                        ? attraction.description
                            .split('\n')[0]
                            .replace(/★.*$/g, '')
                            .replace(/⭐.*$/g, '')
                            .replace(/평점.*$/g, '')
                            .replace(/rating.*$/gi, '')
                            .trim()
                        : ''))}
              </Typography>
            </Box>
          </Box>
        )}

        {/* 설명 */}
        {(attraction.description || isAirport) && (
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <InfoIcon color="action" />
            <Box>
              <Typography variant="subtitle2" gutterBottom>정보</Typography>
              <Typography variant="body2" color="text.secondary">
                {isAirport ? attraction.name : attraction.description}
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* 추가 정보 */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            💡 더 자세한 정보는 Google Maps에서 검색하거나, 검색 탭에서 장소 이름을 검색해보세요.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AttractionDetail;
