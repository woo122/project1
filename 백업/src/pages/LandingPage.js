import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
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
              onClick={() => navigate('/plan')}
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
  );
};

export default LandingPage;
