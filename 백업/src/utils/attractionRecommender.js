// Google Places API를 사용하여 근처 관광지 추천

// 도쿄 각 구별 대표 관광 지점 좌표 (구 중심보다 관광지가 많은 곳)
const wardHotspots = {
  '주오구': { lat: 35.6719, lng: 139.7650, name: '긴자' },        // 긴자
  '치요다구': { lat: 35.6812, lng: 139.7671, name: '도쿄역' },      // 도쿄역
  '미나토구': { lat: 35.6586, lng: 139.7454, name: '롯폰기' },     // 롯폰기
  '신주쿠구': { lat: 35.6896, lng: 139.7006, name: '신주쿠' },     // 신주쿠역
  '시부야구': { lat: 35.6595, lng: 139.7004, name: '시부야' },     // 시부야 스크램블
  '다이토구': { lat: 35.7148, lng: 139.7967, name: '아사쿠사' },   // 센소지
  '스미다구': { lat: 35.7101, lng: 139.8107, name: '스카이트리' }, // 스카이트리
  '고토구': { lat: 35.6270, lng: 139.7789, name: '오다이바' },     // 오다이바
  '시나가와구': { lat: 35.6284, lng: 139.7387, name: '시나가와' }, // 시나가와역
  '메구로구': { lat: 35.6438, lng: 139.7156, name: '나카메구로' }, // 나카메구로
  '세타가야구': { lat: 35.6464, lng: 139.6533, name: '시모키타자와' }, // 시모키타자와
  '토시마구': { lat: 35.7295, lng: 139.7109, name: '이케부쿠로' },  // 이케부쿠로
  '분쿄구': { lat: 35.7071, lng: 139.7514, name: '혼고' }          // 도쿄대학
};

// 여행 스타일에 따른 장소 타입 및 키워드
const styleToTypes = {
  sightseeing: {
    types: ['tourist_attraction', 'museum', 'art_gallery', 'park'],
    keywords: ['tourist attraction', 'museum', 'temple', 'shrine', 'park', 'tower']
  },
  food: {
    types: ['restaurant', 'cafe', 'bakery'],
    keywords: ['restaurant', 'cafe', 'ramen', 'sushi', 'izakaya']
  },
  shopping: {
    types: ['shopping_mall', 'department_store', 'store'],
    keywords: ['shopping mall', 'department store', 'market', 'store']
  },
  relaxation: {
    types: ['spa', 'park', 'cafe'],
    keywords: ['spa', 'onsen', 'park', 'garden', 'cafe']
  },
  activity: {
    types: ['amusement_park', 'aquarium', 'zoo'],
    keywords: ['amusement park', 'aquarium', 'zoo', 'theme park']
  }
};

// 특정 위치 근처에서 관광지 검색
export const findNearbyAttractions = async (location, travelStyles, excludeIds = [], forceAttraction = false) => {
  if (!window.google || !location) {
    return [];
  }

  return new Promise((resolve) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    // 여행 스타일에 맞는 타입 선택
    const primaryStyle = travelStyles[0] || 'sightseeing';
    const styleConfig = styleToTypes[primaryStyle] || styleToTypes.sightseeing;
    
    // 첫 관광지만 강제로 관광명소, 나머지는 선택한 스타일에 따라 검색
    let randomType, randomKeyword;
    
    if (forceAttraction) {
      // 첫 번째 관광지: 무조건 관광 명소 검색 (박물관, 공원, 랜드마크 등)
      const attractionTypes = ['tourist_attraction', 'museum', 'art_gallery', 'park', 'landmark'];
      randomType = attractionTypes[Math.floor(Math.random() * attractionTypes.length)];
      randomKeyword = 'tourist attraction';
      console.log(`  🏛️ 첫 관광지 (관광 명소): ${randomType}`);
    } else {
      // 나머지 관광지: 사용자가 선택한 스타일에 맞게 검색
      randomType = styleConfig.types[Math.floor(Math.random() * styleConfig.types.length)];
      randomKeyword = styleConfig.keywords[Math.floor(Math.random() * styleConfig.keywords.length)];
      
      const styleNames = {
        sightseeing: '관광',
        food: '맛집',
        shopping: '쇼핑',
        relaxation: '휴양',
        activity: '액티비티'
      };
      console.log(`  🎯 ${styleNames[primaryStyle]} 스타일: ${randomType}`);
    }

    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: 4000, // 4km 반경 (더 다양한 장소 검색)
      keyword: randomKeyword
      // type 제거: Google Places API에서 establishment와 충돌 방지
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        // 이미 선택된 장소 제외하고 평점 높은 순으로 정렬
        const filteredResults = results
          .filter(place => !excludeIds.includes(place.place_id))
          .filter(place => place.rating && place.rating >= 3.8)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 10);

        if (filteredResults.length > 0) {
          // 상위 결과 중 랜덤 선택
          const selectedPlace = filteredResults[Math.floor(Math.random() * Math.min(3, filteredResults.length))];
          
          // 상세 정보 가져오기
          service.getDetails(
            {
              placeId: selectedPlace.place_id,
              language: 'ko', // 한국어 결과
              fields: ['name', 'rating', 'vicinity', 'geometry', 'photos', 'types', 'user_ratings_total']
            },
            (details, detailStatus) => {
              if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                // 사진 URL 생성
                let photoUrl = null;
                if (details.photos && details.photos.length > 0) {
                  photoUrl = details.photos[0].getUrl({ maxWidth: 250, maxHeight: 120 });
                }
                
                resolve({
                  id: selectedPlace.place_id,
                  name: details.name,
                  rating: details.rating,
                  vicinity: details.vicinity,
                  location: {
                    lat: details.geometry.location.lat(),
                    lng: details.geometry.location.lng()
                  },
                  types: details.types,
                  userRatingsTotal: details.user_ratings_total,
                  photo: photoUrl
                });
              } else {
                resolve(null);
              }
            }
          );
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

// 도쿄의 주요 지역 시작점
const tokyoStartPoints = {
  '신주쿠': { lat: 35.6938, lng: 139.7036, name: '신주쿠' },
  '시부야': { lat: 35.6595, lng: 139.7004, name: '시부야' },
  '아사쿠사': { lat: 35.7148, lng: 139.7967, name: '아사쿠사' },
  '긴자': { lat: 35.6720, lng: 139.7650, name: '긴자' },
  '우에노': { lat: 35.7141, lng: 139.7774, name: '우에노' },
  '하라주쿠': { lat: 35.6702, lng: 139.7027, name: '하라주쿠' },
  '아키하바라': { lat: 35.6984, lng: 139.7731, name: '아키하바라' },
  '롯폰기': { lat: 35.6627, lng: 139.7300, name: '롯폰기' }
};

// 시간 계산 헬퍼 함수
const addHoursToTime = (timeStr, hours) => {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMinutes = h * 60 + m + (hours * 60);
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = Math.floor(totalMinutes % 60);
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

// 하루 일정에 관광지 추가 (연쇄 검색)
export const generateDailyAttractions = async (date, travelStyles, scheduleDensity, selectedWards) => {
  console.log(`\n🎯 ${date} 관광지 생성 시작...`);
  
  // 일정 밀도에 따른 활동 수
  const activityCounts = {
    tight: 5,      // 빡빡: 5개 관광지
    moderate: 4,   // 보통: 4개 관광지
    relaxed: 3     // 여유: 3개 관광지
  };
  
  const targetCount = activityCounts[scheduleDensity] || 3;
  console.log(`  📊 목표 관광지 수: ${targetCount}개`);
  
  // 사용자가 선택한 구가 있으면 해당 구의 대표 관광지 좌표를 시작 지점으로 사용
  let startPoint;
  if (selectedWards && selectedWards.length > 0) {
    // 선택한 구 중 랜덤으로 하나 선택
    const selectedWard = selectedWards[Math.floor(Math.random() * selectedWards.length)];
    
    // 구별 대표 관광 지점이 있으면 사용, 없으면 구의 원래 좌표 사용
    const hotspot = wardHotspots[selectedWard.name];
    if (hotspot) {
      startPoint = {
        lat: hotspot.lat,
        lng: hotspot.lng,
        name: `${selectedWard.name} (${hotspot.name})`
      };
      console.log(`  📍 선택한 구: ${selectedWard.name} → ${hotspot.name} 지역에서 검색`);
    } else {
      startPoint = {
        lat: selectedWard.lat,
        lng: selectedWard.lng,
        name: selectedWard.name
      };
      console.log(`  📍 선택한 구: ${startPoint.name}`);
    }
  } else {
    // 선택한 구가 없으면 기존처럼 랜덤 시작 지점 선택
    const startPointKeys = Object.keys(tokyoStartPoints);
    const randomStartKey = startPointKeys[Math.floor(Math.random() * startPointKeys.length)];
    startPoint = tokyoStartPoints[randomStartKey];
    console.log(`  📍 시작 지점: ${startPoint.name}`);
  }
  
  const activities = [];
  const usedIds = [];
  let currentLocation = startPoint;
  
  let currentTime = '09:30';
  
  // 첫 번째 관광지 (시작 지점 근처) - 실패 시 인기 지역으로 폴백
  // 첫 관광지는 실제 관광 명소로 강제 검색
  let firstAttraction = null;
  try {
    firstAttraction = await findNearbyAttractions(currentLocation, travelStyles, usedIds, true);
    
    // 검색 실패 시 인기 지역으로 폴백
    if (!firstAttraction) {
      console.log('  ⚠️ 해당 지역에서 검색 실패, 인기 관광 지역으로 폴백...');
      const fallbackPoints = ['신주쿠', '시부야', '긴자', '아사쿠사'];
      
      for (const pointName of fallbackPoints) {
        const fallbackPoint = tokyoStartPoints[pointName];
        console.log(`    🔄 ${pointName}에서 재시도...`);
        firstAttraction = await findNearbyAttractions(fallbackPoint, travelStyles, usedIds, true);
        if (firstAttraction) {
          currentLocation = fallbackPoint;
          console.log(`    ✅ ${pointName}에서 검색 성공! (폴백 사용됨)`);
          break;
        }
      }
    }
    
    if (firstAttraction) {
      const attractionDuration = 1.5; // 관광지별 체류 시간
      
      activities.push({
        time: currentTime,
        name: firstAttraction.name,
        description: `${firstAttraction.vicinity} · ⭐ ${firstAttraction.rating} (${firstAttraction.userRatingsTotal}개 리뷰)`,
        type: 'attraction',
        duration: attractionDuration,
        location: firstAttraction.location,
        rating: firstAttraction.rating,
        photo: firstAttraction.photo,
        id: firstAttraction.id
      });
      usedIds.push(firstAttraction.id);
      currentLocation = firstAttraction.location;
      console.log(`  ✅ 오전: ${firstAttraction.name}`);
      
      // 다음 활동 시간 계산 (관광 시간 + 이동 여유 0.5시간)
      currentTime = addHoursToTime(currentTime, attractionDuration + 0.5);
    } else {
      console.error('  ❌ 모든 지역에서 관광지 검색 실패');
    }
  } catch (error) {
    console.warn('  ⚠️ 첫 번째 관광지 검색 실패:', error);
  }
  
  // 점심 식사 (첫 번째 관광지 근처)
  activities.push({
    time: currentTime,
    name: '점심 식사',
    description: '근처 맛집에서 점심',
    type: 'meal',
    duration: 1
  });
  
  // 점심 후 다음 활동 시간 (점심 1시간 + 이동 0.5시간)
  currentTime = addHoursToTime(currentTime, 1.5);
  
  // 오후 관광지들 (이전 관광지 근처에서 연쇄 검색)
  let addedCount = 1; // 이미 오전에 1개 추가됨
  
  // 최소 2개 이상의 오후 관광지 추가 시도
  const maxAttempts = targetCount * 3; // 실패를 대비해 더 많이 시도
  let attempts = 0;
  
  // 저녁 식사 시간을 넘지 않도록 제한 (조금 더 여유있게)
  const dinnerTime = '18:30';
  
  while (addedCount < targetCount && attempts < maxAttempts && currentTime < dinnerTime) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400)); // API 속도 제한 방지
      
      console.log(`  🔍 오후 관광지 검색 시도 ${attempts + 1}... (현재 시간: ${currentTime})`);
      const attraction = await findNearbyAttractions(currentLocation, travelStyles, usedIds);
      
      if (attraction) {
        const attractionDuration = 1.5; // 관광지별 체류 시간
        
        activities.push({
          time: currentTime,
          name: attraction.name,
          description: `${attraction.vicinity} · ⭐ ${attraction.rating} (${attraction.userRatingsTotal}개 리뷰)`,
          type: 'attraction',
          duration: attractionDuration,
          location: attraction.location,
          rating: attraction.rating,
          photo: attraction.photo,
          id: attraction.id
        });
        usedIds.push(attraction.id);
        currentLocation = attraction.location;
        addedCount++;
        console.log(`  ✅ 오후 ${addedCount - 1}: ${attraction.name} (${currentTime})`);
        
        // 다음 활동 시간 계산 (관광 시간 + 이동/여유 0.5시간)
        currentTime = addHoursToTime(currentTime, attractionDuration + 0.5);
      } else {
        console.log(`  ⚠️ 검색 결과 없음, 재시도...`);
      }
    } catch (error) {
      console.warn(`  ⚠️ 관광지 검색 실패:`, error);
    }
    attempts++;
  }
  
  console.log(`  📊 최종 관광지 수: ${addedCount}개 (목표: ${targetCount}개)`);
  
  // 저녁 식사 시간 계산 (최소 18:30, 최대 19:30)
  let dinnerTimeActual = currentTime;
  if (dinnerTimeActual < '18:30') {
    dinnerTimeActual = '18:30';
  } else if (dinnerTimeActual > '19:30') {
    dinnerTimeActual = '19:30';
  }
  
  // 저녁 식사
  activities.push({
    time: dinnerTimeActual,
    name: '저녁 식사',
    description: '근처 맛집에서 저녁',
    type: 'meal',
    duration: 1.5
  });
  
  // 숙소 복귀 시간 계산 (저녁 식사 + 1.5시간 + 이동 0.5시간)
  const hotelTime = addHoursToTime(dinnerTimeActual, 2);
  
  // 숙소 복귀
  activities.push({
    time: hotelTime,
    name: '숙소 복귀',
    description: '호텔로 돌아가기',
    type: 'hotel',
    duration: 0
  });
  
  // 시간 순서대로 정렬
  activities.sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });
  
  console.log(`  🎉 ${date} 관광지 생성 완료! (총 ${activities.filter(a => a.type === 'attraction').length}개)`);
  
  return {
    date,
    location: startPoint.name,
    activities
  };
};

// 전체 일정에 관광지 추가
export const enrichItineraryWithAttractions = async (itinerary) => {
  if (!itinerary || !itinerary.dailySchedule) {
    console.log('❌ 일정 데이터가 없습니다');
    return itinerary;
  }

  console.log('🗺️ 관광지 추천 시작...');
  const enrichedSchedule = [];

  for (let i = 0; i < itinerary.dailySchedule.length; i++) {
    const day = itinerary.dailySchedule[i];
    try {
      // 기존 activities에서 공항, 숙소 정보 추출 (보존용)
      const airportActivities = day.activities?.filter(a => a.type === 'airport') || [];
      const accommodationActivities = day.activities?.filter(a => a.type === 'accommodation') || [];
      
      const newDay = await generateDailyAttractions(
        day.date,
        itinerary.travelStyles,
        itinerary.scheduleDensity,
        itinerary.selectedWards // 사용자가 선택한 구 정보 전달
      );
      
      const isFirstDay = i === 0;
      const isLastDay = i === itinerary.dailySchedule.length - 1;
      
      // 첫날: 공항 -> ... -> 숙소
      if (isFirstDay && airportActivities.length > 0) {
        const arrivalAirport = airportActivities.find(a => a.time === '07:00');
        if (arrivalAirport) {
          newDay.activities.unshift(arrivalAirport);
          console.log(`  ✈️ 첫날 공항 도착 보존: ${arrivalAirport.name}`);
        }
      }
      
      // 중간 날: 숙소 출발 -> ... -> 숙소 복귀
      // 마지막날: 숙소 체크아웃 -> ... -> 공항
      if (accommodationActivities.length > 0) {
        // 아침 숙소 (08:00) - 맨 앞에
        const morningAccommodation = accommodationActivities.find(a => a.time === '08:00');
        if (morningAccommodation) {
          newDay.activities.unshift(morningAccommodation);
          console.log(`  🏨 숙소 출발 보존: ${morningAccommodation.name} (${morningAccommodation.time})`);
        }
        
        // 저녁 숙소 (22:00) - 맨 뒤에
        const eveningAccommodation = accommodationActivities.find(a => a.time === '22:00');
        if (eveningAccommodation) {
          newDay.activities.push(eveningAccommodation);
          console.log(`  🏨 숙소 복귀 보존: ${eveningAccommodation.name} (${eveningAccommodation.time})`);
        }
      }
      
      // 마지막날: 맨 마지막에 공항 추가
      if (isLastDay && airportActivities.length > 0) {
        const departureAirport = airportActivities.find(a => a.time === '21:00' || a.time >= '20:00');
        if (departureAirport) {
          newDay.activities.push(departureAirport);
          console.log(`  ✈️ 마지막날 공항 출발 보존: ${departureAirport.name}`);
        }
      }
      
      enrichedSchedule.push(newDay);
    } catch (error) {
      console.error(`❌ ${day.date} 일정 생성 실패:`, error);
      enrichedSchedule.push(day); // 실패 시 원본 유지
    }
  }

  console.log('✅ 관광지 추천 완료!');
  return {
    ...itinerary,
    dailySchedule: enrichedSchedule
  };
};
