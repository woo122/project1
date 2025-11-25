import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Chip, 
  FormControl, 
  FormLabel, 
  InputLabel,
  MenuItem,
  Paper, 
  Select,
  Slider, 
  TextField, 
  Tooltip, 
  Typography 
} from '@mui/material';
import Divider from '@mui/material/Divider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { travelStyles, tokyoWards, tokyoAirports } from '../data/japanData';
import { Autocomplete } from '@react-google-maps/api';
import ArrivalAirportSelector from './ArrivalAirportSelector';
import DepartureAirportSelector from './DepartureAirportSelector';

// 키워드 선택 컴포넌트 - 공항 선택
const AirportSelector = ({ selectedAirport, setAirport, onAutoNext }) => {
  const keywords = [
    { id: 'haneda', text: '나리타 공항 (도쿄 외곽)' },
    { id: 'narita', text: '하네다 공항 (도심 근처)' }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: '20px', 
      mt: '20px', 
      justifyContent: 'center',
      flexWrap: 'wrap',
      maxWidth: '600px'
    }}>
      {keywords.map((keyword) => (
        <Box
          key={keyword.id}
          onClick={() => {
            setAirport(keyword.id);
            if (onAutoNext) onAutoNext();
          }}
          sx={{
            width: '100%',
            height: '45px',
            border: '2px solid #00a4bb',
            borderRadius: '16px',
            backgroundColor: selectedAirport === keyword.id ? '#00a4bb' : 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '20px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: selectedAirport === keyword.id ? '#ffffff' : '#333'
          }}
        >
          {keyword.text}
        </Box>
      ))}
    </Box>
  );
};

// 키워드 선택 컴포넌트 - 여행지
// eslint-disable-next-line no-unused-vars
const DestinationSelector = ({ selectedDestinations, onDestinationToggle }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: '15px', 
      mt: '20px', 
      justifyContent: 'center',
      flexWrap: 'wrap',
      maxWidth: '700px'
    }}>
      {tokyoWards.map((ward) => (
        <Box
          key={ward.id}
          onClick={() => onDestinationToggle(ward.id)}
          sx={{
            width: '120px',
            height: '35px',
            border: '1px solid #00a4bb',
            borderRadius: '16px',
            backgroundColor: selectedDestinations.includes(ward.id) ? '#00a4bb' : 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: selectedDestinations.includes(ward.id) ? '#ffffff' : '#333'
          }}
        >
          {ward.name}
        </Box>
      ))}
    </Box>
  );
};

// 키워드 선택 컴포넌트 - 여행 기간
const DurationSelector = ({ selectedDuration, setDuration, onAutoNext }) => {
  const keywords = [
    { id: '1day', text: '당일치기' },
    { id: '1night', text: '1박 2일' },
    { id: '2night', text: '2박 3일' },
    { id: '3night', text: '3박 4일' },
    { id: '4night', text: '4박 5일' },
    { id: '5night', text: '5박 6일' }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: '20px', 
      mt: '20px', 
      justifyContent: 'center',
      flexWrap: 'wrap',
      maxWidth: '600px'
    }}>
      {keywords.map((keyword) => (
        <Box
          key={keyword.id}
          onClick={() => {
            setDuration(keyword.id);
            if (onAutoNext) onAutoNext();
          }}
          sx={{
            width: '120px',
            height: '35px',
            border: '1px solid #00a4bb',
            borderRadius: '16px',
            backgroundColor: selectedDuration === keyword.id ? '#00a4bb' : 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: selectedDuration === keyword.id ? '#ffffff' : '#333'
          }}
        >
          {keyword.text}
        </Box>
      ))}
    </Box>
  );
};

// 키워드 선택 컴포넌트 - 여행 스타일
const StyleSelector = ({ selectedStyles, onStyleToggle }) => {
  const keywords = [
    { id: 'active', text: '액티비티형(체험, 스포츠 등 활동 중심)' },
    { id: 'food', text: '맛집 탐방형(지역 음식, 전통 요리등 먹거리 중심)' },
    { id: 'shopping', text: '쇼핑형 (쇼핑몰, 브랜드 거리등 쇼핑 중심)' },
    { id: 'culture', text: '문화형 (미술관, 박물관 등 문화생활 중심)' }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: '20px', 
      mt: '20px', 
      justifyContent: 'center',
      flexWrap: 'wrap',
      maxWidth: '600px'
    }}>
      {keywords.map((keyword) => (
        <Box
          key={keyword.id}
          onClick={() => onStyleToggle(keyword.id)}
          sx={{
            width: '100%',
            height: '45px',
            border: '2px solid #00a4bb',
            borderRadius: '16px',
            backgroundColor: selectedStyles.includes(keyword.id) ? '#00a4bb' : 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: selectedStyles.includes(keyword.id) ? '#ffffff' : '#333'
          }}
        >
          {keyword.text}
        </Box>
      ))}
    </Box>
  );
};

// 키워드 선택 컴포넌트 - 일정 밀도
const DensitySelector = ({ scheduleDensity, setScheduleDensity, onAutoNext }) => {
  const keywords = [
    { id: 'tight', text: '타이트하게' },
    { id: 'relaxed', text: '널널하게' }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: '20px', 
      mt: '20px', 
      justifyContent: 'center',
      flexWrap: 'wrap',
      maxWidth: '600px'
    }}>
      {keywords.map((keyword) => (
        <Box
          key={keyword.id}
          onClick={() => {
            setScheduleDensity(keyword.id);
            if (onAutoNext) onAutoNext();
          }}
          sx={{
            width: '100%',
            height: '45px',
            border: '2px solid #00a4bb',
            borderRadius: '16px',
            backgroundColor: scheduleDensity === keyword.id ? '#00a4bb' : 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '20px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: scheduleDensity === keyword.id ? '#ffffff' : '#333'
          }}
        >
          {keyword.text}
        </Box>
      ))}
    </Box>
  );
};

const TravelForm = ({ onSubmit, onBackToHome }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedArrivalAirport, setSelectedArrivalAirport] = useState('');
  const [selectedDepartureAirport, setSelectedDepartureAirport] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [people, setPeople] = useState(2);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [scheduleDensity, setScheduleDensity] = useState('');
  const [accommodationAddress, setAccommodationAddress] = useState('');
  const [accommodationLocation, setAccommodationLocation] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const addressInputRef = useRef(null);
  
  // 시간 관련 상태 변수
  const [arrivalTime, setArrivalTime] = useState('12:00');
  const [departureTime, setDepartureTime] = useState('18:00');
  const [arrivalHour, setArrivalHour] = useState(12);
  const [arrivalMinute, setArrivalMinute] = useState(0);
  const [departureHour, setDepartureHour] = useState(18);
  const [departureMinute, setDepartureMinute] = useState(0);

  // 시간을 HH:MM 형식으로 변환
  const formatTime = (hour, minute) => {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // 도착 시간 변경 핸들러
  const handleArrivalHourChange = (newHour) => {
    const hour = Math.max(1, Math.min(24, newHour));
    setArrivalHour(hour);
    setArrivalTime(formatTime(hour, arrivalMinute));
  };

  const handleArrivalMinuteChange = (newMinute) => {
    const minute = Math.max(0, Math.min(59, newMinute));
    setArrivalMinute(minute);
    setArrivalTime(formatTime(arrivalHour, minute));
  };

  // 출발 시간 변경 핸들러
  const handleDepartureHourChange = (newHour) => {
    const hour = Math.max(1, Math.min(24, newHour));
    setDepartureHour(hour);
    setDepartureTime(formatTime(hour, departureMinute));
  };

  const handleDepartureMinuteChange = (newMinute) => {
    const minute = Math.max(0, Math.min(59, newMinute));
    setDepartureMinute(minute);
    setDepartureTime(formatTime(departureHour, minute));
  };

  const handleStyleToggle = (styleId) => {
    if (selectedStyles.includes(styleId)) {
      setSelectedStyles(selectedStyles.filter(id => id !== styleId));
    } else {
      setSelectedStyles([...selectedStyles, styleId]);
    }
  };

  const handleDestinationToggle = (destinationId) => {
    if (selectedDestinations.includes(destinationId)) {
      setSelectedDestinations(selectedDestinations.filter(id => id !== destinationId));
    } else {
      setSelectedDestinations([...selectedDestinations, destinationId]);
    }
  };

  const validateStep = (step) => {
    if (step === 0) {
      if (!selectedArrivalAirport) {
        alert('입국 공항을 선택해주세요.');
        return false;
      }
    }
    if (step === 1) {
      if (!selectedDepartureAirport) {
        alert('출국 공항을 선택해주세요.');
        return false;
      }
    }
    if (step === 2) {
      if (selectedDestinations.length === 0) {
        alert('최소 하나의 여행지를 선택해주세요.');
        return false;
      }
    }
    if (step === 3) {
      if (!selectedDuration) {
        alert('여행 기간을 선택해주세요.');
        return false;
      }
    }
    if (step === 4) {
      if (selectedStyles.length === 0) {
        alert('최소 하나의 여행 스타일을 선택해주세요.');
        return false;
      }
    }
    if (step === 5) {
      if (!scheduleDensity) {
        alert('일정 밀도를 선택해주세요.');
        return false;
      }
    }
    // step 6은 숙소 주소 입력 (필수 사항으로 변경)
    if (step === 6) {
      if (!accommodationAddress) {
        alert('숙소 주소를 입력해주세요.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) return;
    setActiveStep(prev => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (!validateStep(6)) return;
    onSubmit({
      arrivalAirport: selectedArrivalAirport,
      departureAirport: selectedDepartureAirport,
      arrivalTime,
      departureTime,
      duration: selectedDuration,
      people,
      styles: selectedStyles,
      destinations: selectedDestinations,
      scheduleDensity,
      accommodation: {
        address: accommodationAddress,
        location: accommodationLocation
      }
    });
  };

  const onLoadAutocomplete = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setAccommodationAddress(place.formatted_address || place.name);
        setAccommodationLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          name: place.name,
          placeId: place.place_id
        });
      }
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, rgba(0, 183, 208, 0.5) 0%, #ffffff 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Pretendard, sans-serif',
      p: 2
    }}>
      <Box sx={{
        width: { xs: '95vw', sm: '900px' },
        height: { xs: 'auto', sm: '1000px' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        boxShadow: '-9px 12px 76px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        border: '1px solid #dddddd',
        p: { xs: 2, sm: 0 }
      }}>
        <Box sx={{
          width: { xs: 'calc(100% - 40px)', sm: 'calc(100% - 80px)' },
          height: { xs: 'auto', sm: 'calc(100% - 80px)' },
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          p: { xs: 2, sm: '40px' }
        }}>
          {/* 1/6 텍스트 */}
          <Typography sx={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 700,
            fontSize: '24px',
            color: '#333'
          }}>
            {`${activeStep + 1}/7`}
          </Typography>

          {/* 화살표 이미지들 */}
          <Box 
            component="img" 
            src="/images/arrow.png" 
            alt="왼쪽 화살표"
            onClick={() => activeStep > 0 && handleBack()}
            sx={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              width: '40px',
              height: 'auto',
              transform: 'scaleX(-1)',
              cursor: activeStep > 0 ? 'pointer' : 'not-allowed',
              opacity: activeStep > 0 ? 1 : 0.3,
              transition: 'all 0.3s ease'
            }}
          />
          {activeStep < 6 && (
            <Box 
              component="img" 
              src="/images/arrow.png" 
              alt="오른쪽 화살표"
              onClick={() => {
                if (validateStep(activeStep)) {
                  handleNext();
                }
              }}
              sx={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                width: '40px',
                height: 'auto',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)'
                }
              }}
            />
          )}

          {/* 마지막 단계 일정 생성 버튼 */}
          {activeStep === 6 && (
            <Button
              onClick={handleSubmit}
              sx={{
                position: 'absolute',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '200px',
                height: '50px',
                backgroundColor: '#00a4bb',
                color: '#ffffff',
                borderRadius: '8px',
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                '&:hover': {
                  backgroundColor: '#008a9e'
                }
              }}
            >
              일정 생성
            </Button>
          )}

          {/* 콘텐츠 레이어 */}
          <Box sx={{
            width: { xs: '100%', sm: '600px' },
            height: { xs: 'auto', sm: '730px' },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: { xs: 2, sm: 3 }
          }}>
            {/* 새 레이어 내용 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <Box component="img" src={'/images/step-' + (activeStep + 1) + '.png'} alt={'단계 ' + (activeStep + 1)} sx={{ width: 122, height: 'auto' }} />
            </Box>
            
            <Typography variant="h5" sx={{ mb: 1.5, textAlign: 'center', fontWeight: 700, fontSize: '30px' }}>
              {activeStep === 0 && '입국 공항과 도착 시간을 입력해 주세요'}
              {activeStep === 1 && '출국 공항과 출발 시간을 입력해 주세요'}
              {activeStep === 2 && '어디로 가실건가요?'}
              {activeStep === 3 && '여행 기간을 선택해 주세요'}
              {activeStep === 4 && '선호하는 여행 스타일을 선택해 주세요'}
              {activeStep === 5 && '일정 강도를 선택해 주세요'}
              {activeStep === 6 && '숙소 주소를 입력해 주세요'}
            </Typography>
            
            {/* 회색 구분선 */}
            <Box sx={{
              width: '600px',
              height: '3px',
              backgroundColor: '#dddddd',
            }} />

            {/* 단계별 콘텐츠 */}
            {activeStep === 0 && (
              <Box sx={{ mb: 0.5, width: '100%' }}>
                <ArrivalAirportSelector 
                  selectedAirport={selectedArrivalAirport}
                  setAirport={setSelectedArrivalAirport}
                  arrivalHour={arrivalHour}
                  arrivalMinute={arrivalMinute}
                  onArrivalHourChange={handleArrivalHourChange}
                  onArrivalMinuteChange={handleArrivalMinuteChange}
                  tokyoAirports={tokyoAirports}
                />
              </Box>
            )}

            {activeStep === 1 && (
              <Box sx={{ mb: 0.5, width: '100%' }}>
                <DepartureAirportSelector 
                  selectedAirport={selectedDepartureAirport}
                  setAirport={setSelectedDepartureAirport}
                  departureHour={departureHour}
                  departureMinute={departureMinute}
                  onDepartureHourChange={handleDepartureHourChange}
                  onDepartureMinuteChange={handleDepartureMinuteChange}
                  tokyoAirports={tokyoAirports}
                />
              </Box>
            )}

            {activeStep === 2 && (
              <Box sx={{ mb: 0.5, width: '100%' }}>
                <DestinationSelector 
                  selectedDestinations={selectedDestinations} 
                  onDestinationToggle={handleDestinationToggle} 
                />
              </Box>
            )}

            {activeStep === 3 && (
              <Box sx={{ width: '100%' }}>
                <DurationSelector 
                  selectedDuration={selectedDuration} 
                  setDuration={setSelectedDuration}
                  onAutoNext={() => {
                    setTimeout(() => setActiveStep(prev => Math.min(prev + 1, 6)), 300);
                  }}
                />
              </Box>
            )}

            {activeStep === 4 && (
              <Box sx={{ mb: 3, width: '100%' }}>
                <StyleSelector 
                  selectedStyles={selectedStyles} 
                  onStyleToggle={handleStyleToggle} 
                />
              </Box>
            )}

            {activeStep === 5 && (
              <Box sx={{ mb: 3, width: '100%' }}>
                <DensitySelector 
                  scheduleDensity={scheduleDensity} 
                  setScheduleDensity={setScheduleDensity}
                  onAutoNext={() => {
                    setTimeout(() => setActiveStep(prev => Math.min(prev + 1, 6)), 300);
                  }}
                />
              </Box>
            )}

            {activeStep === 6 && (
              <Box sx={{ mt: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Autocomplete
                  onLoad={onLoadAutocomplete}
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    componentRestrictions: { country: 'jp' },
                    types: ['lodging']
                  }}
                >
                  <TextField
                    inputRef={addressInputRef}
                    fullWidth
                    variant="outlined"
                    placeholder="숙소 이름 또는 주소 입력"
                    value={accommodationAddress}
                    onChange={(e) => setAccommodationAddress(e.target.value)}
                    sx={{
                      maxWidth: '500px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  />
                </Autocomplete>
                {accommodationLocation && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0, 183, 208, 0.1)', borderRadius: '8px', maxWidth: '500px', width: '100%' }}>
                    <Typography variant="body2" sx={{ color: '#00a4bb', fontWeight: 600 }}>
                      ✓ 선택됨: {accommodationAddress}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* 첫 화면으로 버튼 */}
          <Box sx={{ position: 'absolute', top: '40px', left: '40px' }}>
            <Button 
              size="small" 
              variant="text" 
              onClick={onBackToHome}
              sx={{
                fontSize: '18px',
                color: '#00a4bb',
                fontFamily: 'Pretendard, sans-serif',
                '&:hover': {
                  color: '#008a9e',
                  backgroundColor: 'rgba(0, 183, 208, 0.08)'
                }
              }}
            >
              첫 화면으로
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TravelForm;