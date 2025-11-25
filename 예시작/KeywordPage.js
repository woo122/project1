import React from 'react';
import { Box, Typography } from '@mui/material';

const KeywordPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, rgba(0, 183, 208, 0.5) 0%, #ffffff 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}
    >
      {/* 가로 800px, 세로 850px 투명 레이어 */}
      <Box
        sx={{
          width: '800px',
          height: '850px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          boxShadow: '-9px 12px 76px 120px rgba(0, 183, 208, 0.2)',
          mixBlendMode: 'multiply',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* 패딩 28px 26px 내부 레이어 */}
        <Box
          sx={{
            width: 'calc(100% - 52px)',
            height: 'calc(100% - 56px)',
            padding: '28px 26px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 183, 208, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Pretendard',
              fontWeight: 700,
              color: '#00b7d0',
              marginBottom: '24px'
            }}
          >
            키워드 페이지
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Pretendard',
              fontWeight: 400,
              color: '#333',
              marginBottom: '16px'
            }}
          >
            예시용 디자인
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Pretendard',
              color: '#666',
              lineHeight: 1.6
            }}
          >
            흰색 배경에 #00b7d0 그라데이션을 적용한<br />
            800x850px 크기의 투명 레이어와<br />
            28px 26px 패딩을 가진 내부 레이어입니다.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default KeywordPage;
