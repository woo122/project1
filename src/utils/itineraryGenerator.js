import { japanDestinations, durationBasedTrips, tokyoWards, tokyoWardAttractions } from '../data/japanData';
import { enrichItineraryWithTravelTime } from './travelTimeCalculator';
import { addDays, format } from 'date-fns';

// 배열에서 랜덤으로 요소 선택 (일반 리스트용)
const getRandomFromArray = (list, count, isBusy) => {
  if (!Array.isArray(list) || list.length === 0) return [];
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  const actualCount = isBusy ? count + 1 : count;
  return shuffled.slice(0, Math.min(actualCount, shuffled.length));
};

// 메인 일정 생성 함수 (비동기)
export const generateItinerary = async (travelInfo) => {
  const { 
    startDate, 
    endDate, 
    tripDuration, 
    people, 
    travelStyles, 
    destinations, 
    scheduleDensity, 
    arrivalAirport,
    departureAirport 
  } = travelInfo;
  
  // 1. 여행 기간에 따른 추천 여행지 조합 선택
  let recommendedDestinationIds = [];
  
  // 사용자가 선택한 여행지가 있으면 해당 여행지 사용
  if (destinations && destinations.length > 0) {
    // 선택된 여행지 ID를 숫자로 변환 (도쿄 -> 1, 교토 -> 2 등)
    const destinationMapping = {
      'tokyo': 1,
      'osaka': 3,
      'kyoto': 2,
      'fukuoka': 4,
      'sapporo': 5,
      'nara': 6,
      'hiroshima': 7,
      'nagoya': 8
    };
    
    recommendedDestinationIds = destinations.map(dest => destinationMapping[dest] || 1);
  } else {
    // 기존 로직 사용
    if (tripDuration <= 5) {
      // 짧은 여행
      const randomIndex = Math.floor(Math.random() * durationBasedTrips.short.length);
      recommendedDestinationIds = durationBasedTrips.short[randomIndex];
    } else if (tripDuration <= 9) {
      // 중간 길이 여행
      const randomIndex = Math.floor(Math.random() * durationBasedTrips.medium.length);
      recommendedDestinationIds = durationBasedTrips.medium[randomIndex];
    } else {
      // 긴 여행
      const randomIndex = Math.floor(Math.random() * durationBasedTrips.long.length);
      recommendedDestinationIds = durationBasedTrips.long[randomIndex];
    }
  }
  
  // 사용자가 선택한 도쿄 자치구 목록을 별도로 저장 (이미지 표시용)
  const selectedWards = Array.isArray(destinations)
    ? destinations
        .filter(id => tokyoWards.some(w => w.id === id))
        .map(id => {
          const ward = tokyoWards.find(w => w.id === id);
          return {
            id,
            name: ward ? ward.name : id,
            image: `/image/wards/${id}.jpg` // 추후 실제 이미지를 추가하면 이 경로를 사용
          };
        })
    : [];
  
  // 2. 여행 스타일에 맞는 여행지 필터링
  const isSightseeing = travelStyles.includes('sightseeing');
  
  // 여행 스타일에 맞는 여행지 추가
  let styleMatchedDestinations = japanDestinations.filter(dest => {
    // 여행 스타일 매칭 점수 계산
    let matchScore = 0;
    
    travelStyles.forEach(style => {
      if (dest.bestFor.includes(
        style === 'sightseeing' ? '촘촘한 일정' : 
        style === 'food' ? '음식 탐방' : 
        style === 'shopping' ? '쇼핑' : 
        style === 'relaxation' ? '널널한 일정' : 
        style === 'activity' ? '현대적인' : '')) {
        matchScore++;
      }
    });
    
    return matchScore > 0;
  });
  
  // 3. 최종 여행지 선택
  let finalDestinations = [];
  
  // 기본 추천 여행지 추가
  recommendedDestinationIds.forEach(id => {
    const destination = japanDestinations.find(dest => dest.id === id);
    if (destination) {
      finalDestinations.push(destination);
    }
  });
  
  // 여행 스타일에 맞는 여행지 추가 (중복 제거)
  styleMatchedDestinations.forEach(dest => {
    if (!finalDestinations.some(d => d.id === dest.id)) {
      // 여행 일수에 맞게 여행지 수 제한
      if (finalDestinations.length < Math.min(tripDuration, 5)) {
        finalDestinations.push(dest);
      }
    }
  });
  
  // 4. 일별 일정 생성
  const dailySchedule = [];
  let currentDate = new Date(startDate);

  // 일정 밀도 오버라이드: 사용자 선택이 있으면 우선 적용
  const isBusySchedule = scheduleDensity === 'tight' ? true : scheduleDensity === 'relaxed' ? false : (isSightseeing || people > 4);
  const isRelaxedSchedule = !isBusySchedule;

  if (selectedWards.length > 0) {
    // 자치구 기반 일정: 선택한 자치구를 순환하며 해당 구의 POI를 추천
    const wardsCycle = selectedWards.map(w => w.id);
    for (let day = 1; day <= tripDuration; day++) {
      const wardId = wardsCycle[(day - 1) % wardsCycle.length];
      const wardInfo = tokyoWards.find(w => w.id === wardId);
      const wardName = wardInfo ? wardInfo.name : wardId;

      // 자치구 POI 또는 도쿄 기본 POI로 폴백
      const wardAttractions = (tokyoWardAttractions && tokyoWardAttractions[wardId]) || [];
      const tokyoDestination = japanDestinations.find(d => d.id === 1);

      const daySchedule = {
        date: format(currentDate, 'yyyy-MM-dd'),
        location: `${wardName} (도쿄)`,
        activities: []
      };

      // 아침 식사
      daySchedule.activities.push({
        time: '08:00',
        name: '아침 식사',
        description: `${wardName} 주변`,
        type: 'meal',
        duration: 1
      });

      // 오전 활동: 자치구 POI 우선
      const morning = wardAttractions.length > 0
        ? getRandomFromArray(wardAttractions, 1, isBusySchedule)
        : getRandomAttractions(tokyoDestination, 1, isBusySchedule);
      morning.forEach(attraction => {
        daySchedule.activities.push({
          time: '09:30',
          name: attraction.name,
          description: `${wardName}의 명소`,
          type: 'attraction',
          duration: attraction.duration,
          location: attraction.location, // 위치 정보 추가
          image: attraction.image // 이미지 추가
        });
      });

      // 점심
      daySchedule.activities.push({
        time: '12:30',
        name: '점심 식사',
        description: `${wardName} 맛집`,
        type: 'meal',
        duration: 1
      });

      // 오후 활동
      const afternoon = wardAttractions.length > 0
        ? getRandomFromArray(wardAttractions, isBusySchedule ? 2 : 1, isBusySchedule)
        : getRandomAttractions(tokyoDestination, isBusySchedule ? 2 : 1, isBusySchedule);
      let startTime = 14;
      afternoon.forEach(attraction => {
        daySchedule.activities.push({
          time: `${startTime}:00`,
          name: attraction.name,
          description: `${wardName}의 명소`,
          type: 'attraction',
          duration: attraction.duration,
          location: attraction.location, // 위치 정보 추가
          image: attraction.image // 이미지 추가
        });
        startTime += 3; // 3시간 간격
      });

      // 선택한 자치구가 일정에 반드시 한 번 이상 등장하도록 보장
      const hasWardAttraction = daySchedule.activities.some(
        activity => activity.type === 'attraction'
      );

      if (!hasWardAttraction) {
        daySchedule.activities.push({
          time: '10:30',
          name: `${wardName} 산책`,
          description: `${wardName}의 거리와 분위기를 느껴보는 시간`,
          type: 'attraction',
          duration: 2
        });
      }

      // 저녁
      daySchedule.activities.push({
        time: '18:30',
        name: '저녁 식사',
        description: `${wardName} 주변`,
        type: 'meal',
        duration: 1.5
      });

      // 숙소 복귀
      daySchedule.activities.push({
        time: '20:30',
        name: '숙소 복귀 및 휴식',
        description: '다음 날을 위한 휴식',
        type: 'hotel',
        duration: 0
      });

      dailySchedule.push(daySchedule);
      currentDate = addDays(currentDate, 1);
    }
  } else {
    // 기존 도시 기반 로직 유지
    let currentDestIndex = 0;
    for (let day = 1; day <= tripDuration; day++) {
      const destination = finalDestinations[currentDestIndex];

      const daySchedule = {
        date: format(currentDate, 'yyyy-MM-dd'),
        location: destination.name,
        activities: []
      };

      daySchedule.activities.push({
        time: '08:00',
        name: '아침 식사',
        description: '호텔 조식 또는 현지 음식점',
        type: 'meal',
        duration: 1
      });

      const morningAttractions = getRandomAttractions(destination, 1, isBusySchedule);
      morningAttractions.forEach(attraction => {
        daySchedule.activities.push({
          time: '09:30',
          name: attraction.name,
          description: `${destination.name}의 유명 관광지`,
          type: 'attraction',
          duration: attraction.duration,
          location: attraction.location, // 위치 정보 추가
          image: destination.image // 도시 이미지 추가
        });
      });

      daySchedule.activities.push({
        time: '12:30',
        name: '점심 식사',
        description: '현지 맛집에서 일본 요리 체험',
        type: 'meal',
        duration: 1
      });

      const afternoonAttractions = getRandomAttractions(destination, isBusySchedule ? 2 : 1, isBusySchedule);
      let startTime = 14;
      afternoonAttractions.forEach(attraction => {
        daySchedule.activities.push({
          time: `${startTime}:00`,
          name: attraction.name,
          description: `${destination.name}의 유명 관광지`,
          type: 'attraction',
          duration: attraction.duration,
          location: attraction.location, // 위치 정보 추가
          image: destination.image // 도시 이미지 추가
        });
        startTime += attraction.duration;
      });

      daySchedule.activities.push({
        time: '18:30',
        name: '저녁 식사',
        description: '현지 맛집에서 일본 요리 체험',
        type: 'meal',
        duration: 1.5
      });

      daySchedule.activities.push({
        time: '20:30',
        name: '숙소 복귀 및 휴식',
        description: '다음 날을 위한 휴식',
        type: 'hotel',
        duration: 0
      });

      dailySchedule.push(daySchedule);
      currentDate = addDays(currentDate, 1);

      if (day % (isRelaxedSchedule ? 3 : 2) === 0) {
        currentDestIndex = (currentDestIndex + 1) % finalDestinations.length;
      }
    }
  }
  
  // 5. 공항 정보 추가
  console.log('✈️ Airports received - Arrival:', arrivalAirport, 'Departure:', departureAirport);
  const airportMapping = {
    'haneda': '하네다 공항 (도쿄)',
    'narita': '나리타 공항 (도쿄)'
  };
  const departureAirportName = airportMapping[departureAirport] || '공항';
  const arrivalAirportName = airportMapping[arrivalAirport] || '공항';
  
  // 공항 위치 정보
  const airportLocations = {
    haneda: { lat: 35.5494, lng: 139.7798 },
    narita: { lat: 35.7647, lng: 140.3864 }
  };

  // 공항 주소 (사람이 읽기 좋은 형태)
  const airportAddresses = {
    narita: '1-1 Furugome, Narita, Chiba 282-0004 일본',
    haneda: 'Hanedakuko, Ota City, Tokyo 144-0041 일본'
  };

  console.log('🛫 Adding airports to schedule. Departure:', departureAirport, 'Arrival:', arrivalAirport);
  console.log('📅 Daily schedule length:', dailySchedule.length);
  console.log('📋 Daily schedule:', dailySchedule);
  
  // 첫날 첫 활동에 출국 공항 추가
  if (dailySchedule.length > 0 && departureAirport) {
    const firstDay = dailySchedule[0];
    const airportDeparture = {
      time: '07:00',
      name: departureAirportName,
      description: `${departureAirportName}에서 출발`,
      type: 'airport',
      duration: 1,
      location: airportLocations[departureAirport],
      address: airportAddresses[departureAirport]
    };
    firstDay.activities.unshift(airportDeparture);
    console.log('✅ Departure airport added to first day:', airportDeparture);
  } else {
    console.log('⚠️ Departure airport NOT added. dailySchedule length:', dailySchedule.length, 'departureAirport:', departureAirport);
  }

  // 마지막날 마지막 활동에 입국 공항 추가
  if (dailySchedule.length > 0 && arrivalAirport) {
    const lastDay = dailySchedule[dailySchedule.length - 1];
    const airportArrival = {
      time: '21:00',
      name: arrivalAirportName,
      description: `${arrivalAirportName}로 입국`,
      type: 'airport',
      duration: 1,
      location: airportLocations[arrivalAirport],
      address: airportAddresses[arrivalAirport]
    };
    lastDay.activities.push(airportArrival);
    console.log('✅ Arrival airport added to last day:', airportArrival);
  } else {
    console.log('⚠️ Arrival airport NOT added. dailySchedule length:', dailySchedule.length, 'arrivalAirport:', arrivalAirport);
  }

  // 6. 최종 여행 일정 반환
  // 기본 일정 생성
  const baseItinerary = {
    startDate,
    endDate,
    tripDuration,
    people,
    travelStyles,
    destinations: finalDestinations,
    selectedWards,
    dailySchedule,
    scheduleDensity: scheduleDensity || (isBusySchedule ? 'tight' : 'relaxed'),
    arrivalAirport: arrivalAirport, // 입국 공항 ID 저장
    departureAirport: departureAirport, // 출국 공항 ID 저장
    arrivalAirportName: arrivalAirportName, // 입국 공항 표시 이름 저장
    departureAirportName: departureAirportName // 출국 공항 표시 이름 저장
  };

  // 이동 시간 계산 추가
  console.log('🚇 이동 시간 계산 시작...');
  const enrichedItinerary = await enrichItineraryWithTravelTime(baseItinerary);
  
  return enrichedItinerary;
};

// 여행지에서 랜덤 명소 선택 함수
const getRandomAttractions = (destination, count, isBusy) => {
  if (!destination || !destination.attractions) {
    return [];
  }
  
  // 명소 복사 및 섞기
  const shuffled = [...destination.attractions].sort(() => 0.5 - Math.random());
  
  // 촘촘한 일정이면 더 많은 명소 선택
  const actualCount = isBusy ? count + 1 : count;
  
  // 선택된 명소 반환
  return shuffled.slice(0, Math.min(actualCount, shuffled.length));
};

// 일정 재생성 함수
export const regenerateItinerary = (travelInfo) => {
  return generateItinerary(travelInfo);
};