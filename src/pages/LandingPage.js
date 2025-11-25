import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import { keyframes } from '@mui/system';
import { Link, useNavigate } from 'react-router-dom';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('tp_user');
    if (!stored) {
      setUser(null);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } catch (e) {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('tp_user');
    setUser(null);
    navigate('/');
  };

  const containerRef = useRef(null);
  const sectionsRef = useRef([]);
  const [currentSection, setCurrentSection] = useState(0);
  const isScrollingRef = useRef(false);

  // 섹션 진입 시 애니메이션 트리거용
  const heroContentRef = useRef(null);
  const secondContentRef = useRef(null);
  const [heroInView, setHeroInView] = useState(false);
  const [secondInView, setSecondInView] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event) => {
      event.preventDefault();

      if (isScrollingRef.current) return;

      const deltaY = event.deltaY;
      const totalSections = sectionsRef.current.length;
      let nextIndex = currentSection;

      if (deltaY > 0 && currentSection < totalSections - 1) {
        nextIndex = currentSection + 1;
      } else if (deltaY < 0 && currentSection > 0) {
        nextIndex = currentSection - 1;
      }

      if (nextIndex === currentSection) return;

      const targetSection = sectionsRef.current[nextIndex];
      if (!targetSection) return;

      isScrollingRef.current = true;
      setCurrentSection(nextIndex);

      container.scrollTo({
        top: targetSection.offsetTop,
        behavior: 'smooth'
      });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 700);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [currentSection]);

  // 스크롤 시 섹션 진입 여부 감지 (애니메이션 트리거)
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.target) return;

          if (entry.target === heroContentRef.current) {
            setHeroInView(entry.isIntersecting);
          } else if (entry.target === secondContentRef.current) {
            setSecondInView(entry.isIntersecting);
          }
        });
      },
      {
        root,
        threshold: 0.4
      }
    );

    if (heroContentRef.current) observer.observe(heroContentRef.current);
    if (secondContentRef.current) observer.observe(secondContentRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100vh',
        bgcolor: '#000',
        overflowX: 'hidden',
        overflowY: 'auto'
      }}
    >
      {/* 첫 번째 섹션: 기존 히어로 화면 */}
      <Box 
        ref={(el) => (sectionsRef.current[0] = el)}
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
            bgcolor: 'rgba(0, 0, 0, 0.4)',
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            msUserSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
            outline: 'none'
          }}
        >
        </Box>
        <Box ref={heroContentRef} sx={{ width: '100%', px: 2, pt: 2, pb: 4, position: 'relative', zIndex: 1, userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none', WebkitTapHighlightColor: 'transparent', outline: 'none' }}>
          <Box sx={{ maxWidth: '1440px', mx: 'auto' }}>
            <Box
              component="header"
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1100,
                width: '100%'
              }}
            >
              <Box
                sx={{
                  maxWidth: '1440px',
                  mx: 'auto',
                  
                  pt: 2,
                  pb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box component={Link} to="/" sx={{ display: 'inline-block' }}>
                  <Box
                    component="img"
                    src={currentSection === 0 ? '/images/logo.png' : '/images/logo2.png'}
                    alt="로고"
                    sx={{ width: 100, height: 'auto', display: 'block' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  {user ? (
                    <>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: '2px solid #fff'
                        }}
                        onClick={(e) => setMenuAnchor(e.currentTarget)}
                      >
                        <Box
                          component="img"
                          src={'/images/profile.png'}
                          alt="프로필"
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </Box>
                      <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() => setMenuAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem disabled>
                          <Typography sx={{ fontWeight: 700 }}>
                            {(user.nickname || user.email) + '님'}
                          </Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            navigate('/my-itineraries');
                            setMenuAnchor(null);
                          }}
                        >
                          마이페이지
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setMenuAnchor(null);
                            handleLogout();
                          }}
                        >
                          로그아웃
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <>
                      <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        sx={{
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)'
                          },
                          textTransform: 'none'
                        }}
                      >
                        로그인
                      </Button>
                      <Button
                        component={Link}
                        to="/register"
                        variant={currentSection === 0 ? 'outlined' : 'contained'}
                        sx={
                          currentSection === 0
                            ? {
                                borderColor: '#fff',
                                color: '#fff',
                                '&:hover': {
                                  borderColor: '#fff',
                                  backgroundColor: 'rgba(255, 255, 255, 0.12)'
                                },
                                textTransform: 'none'
                              }
                            : {
                                backgroundColor: '#000',
                                color: '#fff',
                                '&:hover': {
                                  backgroundColor: '#111'
                                },
                                textTransform: 'none'
                              }
                        }
                      >
                        회원가입
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          <Box
            sx={{
              mt: '320px',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 600,
                  fontSize: '30px',
                  lineHeight: 1.2,
                  opacity: 0,
                  animation: heroInView ? `${fadeInUp} 0.7s ease-out forwards` : 'none',
                  animationDelay: heroInView ? '0s' : '0s'
                }}
              >
               생각보다 쉬운 도쿄 여행
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '80px',
                  lineHeight: 1.2,
                  mt: '6px',
                  opacity: 0,
                  animation: heroInView ? `${fadeInUp} 0.8s ease-out forwards` : 'none',
                  animationDelay: heroInView ? '0.15s' : '0s'
                }}
              >
                혼자 하는 여행,
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '80px',
                  lineHeight: 1.2,
                  mt: '6px',
                  opacity: 0,
                  animation: heroInView ? `${fadeInUp} 0.8s ease-out forwards` : 'none',
                  animationDelay: heroInView ? '0.3s' : '0s'
                }}
              >
                나를 위한 여행
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '70px',
                  lineHeight: 1.1,
                  mt: '6px',
                  opacity: 0,
                  animation: heroInView ? `${fadeInUp} 0.8s ease-out forwards` : 'none',
                  animationDelay: heroInView ? '0.3s' : '0s'
                }}
              >
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
                  opacity: 0,
                  animation: heroInView ? `${fadeInUp} 0.7s ease-out forwards` : 'none',
                  animationDelay: heroInView ? '0.5s' : '0s',
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
      </Box>
      <Box
        ref={(el) => (sectionsRef.current[1] = el)}
        sx={{
          minHeight: '100vh',
          bgcolor: '#fff',
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2
        }}
      >
        <Box sx={{ maxWidth: '1440px', mx: 'auto', width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 6
            }}
          >
            {/* 왼쪽 텍스트 영역 */}
            <Box ref={secondContentRef} sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '48px',
                  mb: 3,
                  opacity: 0,
                  animation: secondInView ? `${fadeInUp} 0.7s ease-out forwards` : 'none',
                  animationDelay: secondInView ? '0.1s' : '0s'
                }}
              >
                도쿄 여행, 이렇게 도와줄게요
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 400,
                  fontSize: '24px',
                  color: 'rgba(0,0,0,0.72)',
                  opacity: 0,
                  animation: secondInView ? `${fadeInUp} 0.7s ease-out forwards` : 'none',
                  animationDelay: secondInView ? '0.2s' : '0s'
                }}
              >
               해조는 일정짜기부터 이동 동선, 관광지 추천까지 한 번에 정리해서 <br /> 보여주는 나만의 여행 플래너입니다.
               일정부터 동선, 추천 장소까지 <br /> 한 번에 확인할 수 있어요.
              </Typography>

              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  flexWrap: 'wrap',
                  columnGap: 0,
                  rowGap: 1,
                  opacity: 0,
                  animation: secondInView ? `${fadeInUp} 0.7s ease-out forwards` : 'none',
                  animationDelay: secondInView ? '0.3s' : '0s'
                }}
              >
                <Typography
                  sx={{
                    flex: '0 0 50%',
                    fontFamily: 'Pretendard',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: 'rgba(0,0,0,0.85)'
                  }}
                >
                  • 맞춤 일정 생성
                </Typography>
                <Typography
                  sx={{
                    flex: '0 0 50%',
                    fontFamily: 'Pretendard',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: 'rgba(0,0,0,0.85)'
                  }}
                >
                  • 장소 추천 + 이동 동선 계산
                </Typography>
                <Typography
                  sx={{
                    flex: '0 0 50%',
                    fontFamily: 'Pretendard',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: 'rgba(0,0,0,0.85)'
                  }}
                >
                  • 구글 지도 기반 일정 시각화
                </Typography>
                <Typography
                  sx={{
                    flex: '0 0 50%',
                    fontFamily: 'Pretendard',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: 'rgba(0,0,0,0.85)'
                  }}
                >
                  • 일정 저장 및 관리
                </Typography>
                <Button
                onClick={() => navigate('/plan')}
                sx={{
                  mt: '30px',
                  width: '200px',
                  height: '60px',
                  border: '3px solid #000',
                  borderRadius: '8px',
                  color: '#000',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  opacity: 0,
                  animation: `${fadeInUp} 0.7s ease-out forwards`,
                  animationDelay: '0.5s',
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
              
            {/* 오른쪽 화면 캡처 영역 */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                height: 'auto',
                mt: { xs: 4, md: 0 }
              }}
            >
              <Box
                sx={{
                  width: { xs: '85%', md: 600 }
                }}
              >
                <Box
                  component="img"
                  src="/images/screen1.png"
                  alt="해조 일정 화면"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    ml: '-100px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
                    opacity: 0,
                    animation: secondInView ? `${fadeInUp} 0.8s ease-out forwards` : 'none',
                    animationDelay: secondInView ? '0.4s' : '0s'
                  }}
                />
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  right: { xs: '4%', md: '4%' },
                  bottom: { xs: '-6%', md: '-8%' },
                  width: { xs: '58%', md: 500 }
                }}
              >
                <Box
                  component="img"
                  src="/images/screen2.png"
                  alt="해조 지도 화면"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    mb: '-100px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
                    opacity: 0,
                    animation: secondInView ? `${fadeInUp} 0.8s ease-out forwards` : 'none',
                    animationDelay: secondInView ? '0.5s' : '0s'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;
